import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ALL_CARDS,CARD_MAP} from '../src/data/cards';
import {choicePresentation,choiceActionLabel} from '../src/data/cardPresentation';
import {resolveCardDialogue} from '../src/engine/gameEngine';
import {readableDialogue} from '../src/data/readableDialogue';
import {dialoguePages} from '../src/utils/dialoguePages';
import {TitleScreen} from '../src/components/TitleScreen';
import {Controls} from '../src/components/Controls';
import type {StoryFlags} from '../src/types/game';
const resources={citizenTrust:50,fairness:50,personalFreedom:50,publicSafety:50};
test('all 159 dialogues retain every word and number after pagination, including branching text',()=>{
  const cases:StoryFlags[]=[{},{surveillance_level:'total'},{medical_bias_detected:true,hiring_bias_detected:true}];
  for(const card of ALL_CARDS)for(const flags of cases){
    const original=readableDialogue(card.id,resolveCardDialogue(card,flags,resources));
    const pages=dialoguePages(original);
    assert.ok(pages.length>0);
    assert.equal(pages.join(' ').replace(/\s+/gu,' ').trim(),original.replace(/\s+/gu,' ').trim(),card.id);
    assert.deepEqual(pages.join(' ').match(/\d[\d,.]*%?/g),original.match(/\d[\d,.]*%?/g),card.id);
  }
  const token='한'.repeat(150)+'🙂';
  assert.equal(dialoguePages(token).join(''),token);
});
test('both choice surfaces use one fallback label while authored legal and story actions stay intact',()=>{
  for(const card of ALL_CARDS)for(const direction of ['left','right'] as const){
    const presented=choicePresentation(card,direction,{});
    assert.equal(choiceActionLabel(card,direction),presented.actionLabel||(direction==='left'?'거부 · 대안':'승인 · 실행'));
  }
  const card=CARD_MAP.get('act1_13_unintended_consequence')!;
  const html=renderToStaticMarkup(React.createElement(Controls,{card,storyFlags:{surveillance_level:'total'},onDecision(){},onOpenHistory(){},onOpenSettings(){},onHoverDirectionChange(){},isProcessing:false}));
  assert.match(html,/거부 · 대안/);assert.doesNotMatch(html,/거부 · 반려/);
  assert.match(html,/선택지 전문/);
  assert.ok(html.includes(card.leftChoice.text));
});
test('title exposes two accessible tabs and keeps the city material out of the initial visible panel',()=>{
  const html=renderToStaticMarkup(React.createElement(TitleScreen,{savedState:null,onStartNewGame(){}}));
  assert.equal((html.match(/role="tab"/g)||[]).length,2);
  assert.match(html,/주요 인물/);assert.match(html,/시민과 평의회/);
  assert.match(html,/id="intro-panel-city"[^>]*hidden=""/);
  assert.match(html,/id="intro-panel-characters"[^>]*role="tabpanel"/);
});
