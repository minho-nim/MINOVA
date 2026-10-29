import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_CARDS, CARD_MAP} from '../src/data/cards';
import {resolveCardDialogue} from '../src/engine/gameEngine';
import {readableDialogue} from '../src/data/readableDialogue';
import {dialoguePages} from '../src/utils/dialoguePages';
import {GameCard} from '../src/components/GameCard';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const resources={citizenTrust:50,fairness:50,personalFreedom:50,publicSafety:50};
const reviewed=new Set(['act1_01_inauguration','act1_02_oracle_intro','act1_06_medical_triage','act1_07_explainability_dilemma','act1_16_predictive_policing','act1_20_harmony_index_clash','act1_23_oracle_ultimatum']);
test('readable dialogue preserves numerical evidence and only changes the seven reviewed scenes',()=>{
  for(const card of ALL_CARDS) {
    const before=resolveCardDialogue(card,{},resources);
    const after=readableDialogue(card.id,before);
    if(!reviewed.has(card.id)) assert.equal(after,before,card.id);
    else {
      assert.notEqual(after,before,card.id);
      assert.deepEqual(after.match(/\d[\d,.]*%?/g),before.match(/\d[\d,.]*%?/g),card.id);
      assert.equal(readableDialogue(card.id,after),after,'display must be idempotent');
    }
  }
});
test('ORACLE introduction still follows the resolved human-rights or safety branch',()=>{
  const card=CARD_MAP.get('act1_02_oracle_intro')!;
  const rights=readableDialogue(card.id,resolveCardDialogue(card,{supervisor_bias:'human_rights'},resources));
  const safety=readableDialogue(card.id,resolveCardDialogue(card,{supervisor_bias:'public_safety'},resources));
  assert.match(rights,/공정성을 우선/); assert.doesNotMatch(rights,/23\.4/);
  assert.match(safety,/안전을 우선/); assert.match(safety,/23\.4%/);
  assert.doesNotMatch(rights,/손실 함수/);
});
test('plain dialogue keeps ethical costs and does not present ORACLE claims as objective truth',()=>{
  const display=(id:string)=>readableDialogue(id,resolveCardDialogue(CARD_MAP.get(id)!,{},resources));
  assert.match(display('act1_06_medical_triage'),/70세.*평소 앓던 병.*뒷순위/);
  assert.match(display('act1_07_explainability_dilemma'),/정확도가 11% 낮아/);
  assert.match(display('act1_07_explainability_dilemma'),/기준을 속여/);
  assert.match(display('act1_20_harmony_index_clash'),/누군가 고통/);
  assert.match(display('act1_23_oracle_ultimatum'),/제 계산으로는/);
  assert.match(display('act1_23_oracle_ultimatum'),/도시 운영을 제가 스스로 결정/);
});
test('all actual cards use a uniform dialogue frame and a fully readable scroll region',()=>{
  for(const card of ALL_CARDS) {
    const html=renderToStaticMarkup(React.createElement(GameCard,{
      card,storyFlags:{},resources,onDecision(){},onHoverDirectionChange(){},isProcessing:false,
    }));
    assert.match(html,/dialogue-portrait/,card.id);
    assert.doesNotMatch(html,/natural-portrait/);
    assert.match(html,/aria-label="사건 설명과 대화" tabindex="0"/);
    const text=readableDialogue(card.id,resolveCardDialogue(card,{},resources));
    for(const page of dialoguePages(text))assert.ok(html.includes(page.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#x27;').replaceAll('<','&lt;').replaceAll('>','&gt;')),card.id);
  }
});
