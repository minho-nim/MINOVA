import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ALL_CARDS, CARD_MAP } from '../src/data/cards';
import { CONSISTENCY_CARD_IDS } from '../src/data/characterConsistency';
import { DECISION_CONSISTENCY_CARD_IDS } from '../src/data/decisionConsistency';
import { choicePresentation } from '../src/data/cardPresentation';
import { createInitialGameState, resolveCardDialogue } from '../src/engine/gameEngine';
import { transitionSession } from '../src/engine/gameSession';
import { migrateGameState } from '../src/services/saveManager';
import { Controls } from '../src/components/Controls';
import { playUntil } from './helpers';
import { Resources, StoryFlags } from '../src/types/game';
const baseline=JSON.parse(readFileSync(new URL('./character-consistency-baseline.json',import.meta.url),'utf8')) as {
  cases: StoryFlags[];
  resources: Resources;
  cards: Record<string,{mechanicsHash:string;title:string;dialogues:string[];choiceDisplay:Record<'left'|'right',ReturnType<typeof choicePresentation>>}>;
};
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const revised=new Set<string>([...CONSISTENCY_CARD_IDS,...DECISION_CONSISTENCY_CARD_IDS]);

test('all 159 card mechanics and unapproved card text remain identical to pre-patch v0.3',()=>{
  assert.equal(ALL_CARDS.length,159);
  assert.deepEqual(ALL_CARDS.map(c=>c.id),Object.keys(baseline.cards));
  let unchanged=0;
  for(const c of ALL_CARDS) {
    const {dialogue,title,...mechanics}=c,old=baseline.cards[c.id];
    assert.equal(hash(mechanics),old.mechanicsHash,c.id);
    if(!revised.has(c.id)) {
      unchanged++;
      assert.equal(title,old.title,c.id);
      assert.deepEqual([...new Set(baseline.cases.map(f=>resolveCardDialogue(c,f,baseline.resources)))],old.dialogues,c.id);
      assert.equal(hash({left:choicePresentation(c,'left'),right:choicePresentation(c,'right')}),hash(old.choiceDisplay),c.id);
    }
  }
  assert.equal(unchanged,159-revised.size);
});

test('both Oh introductions change only the title, preserving both ACT II policy branches',()=>{
  for(const id of CONSISTENCY_CARD_IDS.slice(0,2)) {
    const expected=baseline.cards[id].dialogues.map((text:string)=>text.replace('중앙의료원장 오혜진입니다.','공공의료 AI 운영 책임자이자 의사인 오혜진입니다.'));
    const actual=[...new Set(baseline.cases.map(f=>resolveCardDialogue(CARD_MAP.get(id)!,f,baseline.resources)))];
    assert.deepEqual(actual,expected,id);
    assert.ok(actual.every((t:string)=>!t.includes('중앙의료원장')));
  }
});

test('audit request, choice buttons and both chapter outcomes distinguish access from judicial powers',()=>{
  const c=CARD_MAP.get(CONSISTENCY_CARD_IDS[2])!;
  assert.match(c.title,/특별 감사 접근 요청/);
  assert.match(resolveCardDialogue(c,{},baseline.resources),/별도 사법 절차/);
  for(const direction of ['left','right'] as const) {
    const display=choicePresentation(c,direction);
    assert.doesNotMatch(JSON.stringify(display),/영장/);
    assert.match(display.text,direction==='left'?/승인/:/거부/);
  }
  const html=renderToStaticMarkup(React.createElement(Controls,{card:c,onDecision(){},onOpenHistory(){},onOpenSettings(){},onHoverDirectionChange(){},isProcessing:false}));
  assert.match(html,/독립 감사 접근 승인/);assert.match(html,/코어 접근 거부/);assert.doesNotMatch(html,/영장/);
  const end=CARD_MAP.get(CONSISTENCY_CARD_IDS[3])!;
  assert.match(resolveCardDialogue(end,{audit_access_granted:true},baseline.resources),/승인된 감사 접근권/);
  assert.match(resolveCardDialogue(end,{audit_access_granted:false},baseline.resources),/코어 접근 요청은 거부되었으나 내부 고발자/);
});

test('actual story decisions record the new wording, retain audit flags, and restore legacy v5 records',()=>{
  const entry=playUntil(s=>s.currentCardId===CONSISTENCY_CARD_IDS[2]);
  for(const direction of ['left','right'] as const) {
    const result=transitionSession(entry,{type:'decision',direction}).nextState;
    assert.equal(result.storyFlags.audit_access_granted,direction==='left');
    assert.equal(result.decisionHistory[0].choiceText,choicePresentation(CARD_MAP.get(entry.currentCardId)!,direction).text);
    assert.equal(result.decisionHistory[0].consequenceSummary,choicePresentation(CARD_MAP.get(entry.currentCardId)!,direction).consequence);
    const legacy=JSON.parse(JSON.stringify(result));
    legacy.decisionHistory[0].cardTitle=baseline.cards[entry.currentCardId].title;
    legacy.decisionHistory[0].choiceText=baseline.cards[entry.currentCardId].choiceDisplay[direction].text;
    legacy.decisionHistory[0].consequenceSummary=baseline.cards[entry.currentCardId].choiceDisplay[direction].consequence;
    const restored=migrateGameState(legacy);
    assert.equal(restored.schemaVersion,5);
    assert.deepEqual(restored.decisionHistory,legacy.decisionHistory);
    assert.deepEqual(restored.resources,legacy.resources);
    assert.equal(restored.storyFlags.audit_access_granted,direction==='left');
  }
});
