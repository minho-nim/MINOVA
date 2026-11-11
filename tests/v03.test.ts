import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,existsSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { ALL_CARDS, CARD_MAP, DAILY_CARDS, ACT1_CARDS, ACT2_CARDS, CONDITIONAL_CARDS } from '../src/data/cards';
import { ACT1_CARDS as RAW_ACT1 } from '../src/data/cards/act1';
import { ACT2_CARDS as RAW_ACT2 } from '../src/data/cards/act2';
import { CONDITIONAL_CARDS as RAW_COND } from '../src/data/cards/conditional';
import { CRISIS_CARDS as RAW_CRISIS } from '../src/data/cards/crisis';
import { DAILY_CARDS as RAW_DAILY } from '../src/data/cards/daily';
import { SUPERVISOR_REPLACEMENT_CARDS as RAW_REPLACEMENT } from '../src/data/cards/supervisorReplacement';
import { FREE_PLAY_PROPOSALS } from '../src/data/cards/freePlay';
import { BALANCE_ADJUSTMENTS } from '../src/data/balanceAdjustments';
import { CHARACTER_REVISIONS } from '../src/data/characterRevisions';
import { createInitialGameState,resolveCardDialogue } from '../src/engine/gameEngine';
import { transitionSession } from '../src/engine/gameSession';
import { detectResourceCrisis, RESOURCE_ORDER } from '../src/engine/resourceEngine';
import { entryFailure,selectNextCard,municipalWeight } from '../src/engine/cardSelector';
import { migrateGameState } from '../src/services/saveManager';
import { CharacterPortrait } from '../src/components/CharacterPortrait';
import { CHARACTER_ART,MAIN_CAST } from '../src/data/characterArt';
import { STRATEGIES,simulate } from '../scripts/simulate';
import { playUntil } from './helpers';

const raw=[...RAW_ACT1,...RAW_ACT2,...RAW_COND,...RAW_CRISIS,...RAW_DAILY,...RAW_REPLACEMENT,...FREE_PLAY_PROPOSALS];
test('simulation is reproducible, including choices, resources, phases and save round trips',()=>{
  const a=simulate('random',970), b=simulate('random',970);
  assert.deepEqual(a.metrics,b.metrics);
  assert.deepEqual(a.state.decisionHistory.map(h=>[h.cardId,h.direction,h.resourcesAfter]),b.state.decisionHistory.map(h=>[h.cardId,h.direction,h.resourcesAfter]));
});
test('eight strategies finish both ACTs and 100 free-play days without invariants or starvation',()=>{
  for(const strategy of STRATEGIES) {
    const {metrics:m}=simulate(strategy,97);
    assert.equal(m.act1,1,strategy);assert.equal(m.act2,1,strategy);assert.equal(m.finished100,1,strategy);
    for(const key of ['stalls','limits','resourceViolations','saveViolations','ledgerViolations','oneTimeViolations','cooldownViolations','municipalAdjacentRepeat'] as const) assert.equal(m[key],0,`${strategy}:${key}`);
  }
});
test('high resources alone never trigger an emergency; actual competing harm is required',()=>{
  for(const key of RESOURCE_ORDER) assert.equal(detectResourceCrisis({...createInitialGameState().resources,[key]:100},null,1),null);
  assert.equal(detectResourceCrisis({citizenTrust:100,fairness:100,personalFreedom:100,publicSafety:100},null,1),null);
  assert.equal(detectResourceCrisis({citizenTrust:98,fairness:19,personalFreedom:50,publicSafety:50},null,1)!.crisisCardId,'crisis_trust_high');
});
test('first failed emergency response gets another real chance and recovery prevents replacement',()=>{
  const resources={citizenTrust:8,fairness:80,personalFreedom:80,publicSafety:80};
  const crisisState=detectResourceCrisis(resources,null,1)!;
  const state={...createInitialGameState(),resources,crisisState,currentCardId:crisisState.crisisCardId};
  const failed=transitionSession(state,{type:'decision',direction:'right'});
  assert.equal(failed.replaced,false);assert.equal(failed.nextState.crisisState!.strikeCount,1);
  assert.equal(failed.nextState.resources.citizenTrust,0);
  const rescued=transitionSession(failed.nextState,{type:'decision',direction:'left'});
  assert.equal(rescued.replaced,false);assert.equal(rescued.nextState.crisisState,null);
  const dismissed=transitionSession(failed.nextState,{type:'decision',direction:'right'});
  assert.equal(dismissed.replaced,true);assert.equal(dismissed.nextState.currentCardId,'supervisor_replacement_crisis');
});
test('legacy v5 high-only emergencies are safely cleared without changing city or history',()=>{
  const state=createInitialGameState();
  const old={...state,resources:{...state.resources,citizenTrust:98},currentCardId:'crisis_trust_high',crisisState:{resourceId:'citizenTrust',crisisType:'high',crisisCardId:'crisis_trust_high',triggeredDay:1,strikeCount:1}};
  const restored=migrateGameState(JSON.parse(JSON.stringify(old)));
  assert.equal(restored.schemaVersion,5);assert.equal(restored.crisisState,null);
  assert.deepEqual(restored.resources,old.resources);assert.deepEqual(restored.decisionHistory,old.decisionHistory);
  assert.equal(restored.currentAct,'ACT_I');assert.equal(restored.currentCardId,'act1_01_inauguration');
});
const ending=playUntil(s=>s.flowPhase==='act2Complete');
const free=transitionSession(ending,{type:'enterFreePlay'}).nextState;
test('exhausted municipal pool waits for cooldown instead of replaying or looping',()=>{
  const lastCardDays=Object.fromEntries(DAILY_CARDS.map(c=>[c.id,free.currentDay]));
  const completed=[...new Set([...free.completedCardIds,...ALL_CARDS.filter(c=>!c.repeatable).map(c=>c.id)])];
  const exhausted={...free,crisisState:null,scheduledCardQueue:[],completedCardIds:completed,lastCardDays,storyFlags:{...free.storyFlags}};
  const selection=selectNextCard(exhausted);
  assert.equal(selection.card,null); assert.ok(selection.waitUntilDay!>free.currentDay);
  const waited=transitionSession({...exhausted,waitingUntilDay:selection.waitUntilDay},{type:'wait'}).nextState;
  assert.equal(waited.waitingUntilDay,undefined);assert.equal(entryFailure(waited.currentCardId,waited),null);
  assert.equal(waited.decisionHistory.length,free.decisionHistory.length);
});
test('city-aware agenda weight responds to threatened resources without erasing variety',()=>{
  const c=CARD_MAP.get('daily_school_lunch_ai')!;
  const safe={...free,resources:{citizenTrust:70,fairness:70,personalFreedom:70,publicSafety:70}};
  const threatened={...safe,resources:{...safe.resources,personalFreedom:15}};
  assert.ok(municipalWeight(c,threatened)>municipalWeight(c,safe));
  const n=selectNextCard(threatened).card!;
  assert.notEqual(n.characterId,CARD_MAP.get(threatened.currentCardId)?.characterId);
});
test('role revisions preserve all 159 IDs, conditions, choices, flags and story order',()=>{
  assert.equal(ALL_CARDS.length,159);assert.equal(new Set(ALL_CARDS.map(c=>c.id)).size,159);
  for(const source of raw) {
    const live=CARD_MAP.get(source.id)!;
    for(const key of ['requiredFlags','excludedFlags','minDay','repeatable','cooldown','act','type','priority','weight'] as const) assert.deepEqual(live[key],source[key],source.id+key);
    for(const d of ['leftChoice','rightChoice'] as const) {
      const expected={...source[d]};
      const adj=BALANCE_ADJUSTMENTS[source.id as keyof typeof BALANCE_ADJUSTMENTS];
      if(adj && d===adj.direction+'Choice') expected.effects={...adj.effects};
      assert.deepEqual(live[d],expected,source.id+d);
    }
  }
  assert.deepEqual(ACT1_CARDS.map(c=>c.id),RAW_ACT1.map(c=>c.id));assert.deepEqual(ACT2_CARDS.map(c=>c.id),RAW_ACT2.map(c=>c.id));
});
test('dynamic family testimony and council outcomes preserve both real branches',()=>{
  const family=CARD_MAP.get('act2_ch1_05_family_appeal')!;
  assert.equal(family.characterId,'citizen');
  assert.match(resolveCardDialogue(family,{citizen_appeal_enabled:true},free.resources),/42명/);
  assert.match(resolveCardDialogue(family,{citizen_appeal_enabled:false},free.resources),/농성/);
  for(const source of RAW_ACT2.filter(c=>c.id.endsWith('chapter1_resolution'))) {
    for(const flags of [{affirmative_action_medical:false,audit_access_granted:false},{affirmative_action_medical:true,audit_access_granted:true}]) assert.ok(resolveCardDialogue(CARD_MAP.get(source.id)!,flags,free.resources).includes(resolveCardDialogue(source,flags,free.resources)));
  }
  // Chapter 2's approved access/court wording is checked in characterConsistency.test.ts.
  const chapter2=CARD_MAP.get('act2_ch2_08_chapter2_resolution')!;
  assert.match(resolveCardDialogue(chapter2,{audit_access_granted:true},free.resources),/승인된 감사 접근권/);
  assert.match(resolveCardDialogue(chapter2,{audit_access_granted:false},free.resources),/내부 고발자/);
});
test('all role revision targets exist, no erroneous job titles remain, and evidence stays uncertain',()=>{
  for(const id of Object.keys(CHARACTER_REVISIONS)) assert.ok(CARD_MAP.has(id),id);
  for(const c of ALL_CARDS) assert.doesNotMatch(resolveCardDialogue(c,{},free.resources),/한지우 기자|백시온 변호사|강도현 서장/);
  assert.equal(CARD_MAP.get('act2_ch3_11_black_market_broker')!.characterId,'baekSion');
  assert.match(resolveCardDialogue(CARD_MAP.get('act2_ch3_11_black_market_broker')!,{},free.resources),/검증하지 못/);
});
test('all 19 proposals remain selectable and their consequences enter through actual decisions',()=>{
  for(const p of FREE_PLAY_PROPOSALS) {
    const state={...free,currentCardId:p.id,currentDay:1000,resources:{citizenTrust:60,fairness:60,personalFreedom:60,publicSafety:60},completedCardIds:free.completedCardIds.filter(id=>id!==p.id),crisisState:null,lastCardDays:{},scheduledCardQueue:[]};
    assert.equal(entryFailure(p.id,state),null);
    const result=transitionSession(state,{type:'decision',direction:'right'}).nextState;
    assert.equal(result.currentCardId,p.rightChoice.scheduleCardId);
    assert.equal(result.decisionHistory[0].cardId,p.id);
  }
});
test('original faces and all expression mappings render individual source-derived assets',()=>{
  for(const id of MAIN_CAST) for(const i of [0,1,2] as const) {
    const markup=renderToStaticMarkup(React.createElement(CharacterPortrait,{characterId:id,expressionIndex:i}));
    assert.match(markup,new RegExp(`${id}-expression-${i}.png`));
    const path='public'+CHARACTER_ART[id]!.rasterExpressions![i];
    // Approved sheets provide native crops of different sizes; do not require
    // the old artificially enlarged 280x384 expression cells.
    const png=readFileSync(path);assert.ok(png.readUInt32BE(16)>=150);assert.ok(png.readUInt32BE(20)>=100);
    assert.ok(markup.includes(CHARACTER_ART[id]!.labels[i]));
  }
  assert.ok(existsSync('public/assets/nova-citizens.png'));
  assert.ok(!existsSync('public/assets/nova-factions.png'));
  assert.ok(!existsSync('public/assets/nova-faction-sheet.png'));
  assert.match(renderToStaticMarkup(React.createElement(CharacterPortrait,{characterId:'citizen'})),/approved-20261028\/citizen-portrait.png/);
  const base=renderToStaticMarkup(React.createElement(CharacterPortrait,{characterId:'oracle',oracleState:'confident'}));
  assert.match(base,/approved-20261028\/oracle-portrait.png/);assert.doesNotMatch(base,/expression-0.png/);
});
