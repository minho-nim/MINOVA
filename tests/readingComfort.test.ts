import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import {ALL_CARDS} from '../src/data/cards';
import {glossaryFor,dialogueParagraphs} from '../src/data/ethicsGlossary';
import {CardGlossary} from '../src/components/CardGlossary';
import {applyResourceDelta,RESOURCE_ORDER} from '../src/engine/resourceEngine';
import {GameCard} from '../src/components/GameCard';
import {choicePresentation} from '../src/data/cardPresentation';
test('stationary choice preview shows the full actual left or right policy before the moving card',()=>{
  const card=ALL_CARDS.find(card=>card.id==='act1_13_unintended_consequence')!;
  for(const direction of ['left','right'] as const){
    const flags={surveillance_level:'total'};
    const html=renderToStaticMarkup(React.createElement(GameCard,{card,storyFlags:flags,resources:{citizenTrust:50,fairness:50,personalFreedom:50,publicSafety:50},previewDirection:direction,onDecision(){},onHoverDirectionChange(){},isProcessing:false}));
    const preview=html.slice(html.indexOf('<aside'),html.indexOf('</aside>'));
    assert.ok(preview.includes(choicePresentation(card,direction,flags).text));
    assert.ok(html.indexOf('<aside')<html.indexOf('verdict-stack'));
  }
});
test('NLP and medical role explanations are optional, specific and do not appear for unrelated text',()=>{
  const html=renderToStaticMarkup(React.createElement(CardGlossary,{text:'NLP 언어 모델 · 공공의료 AI 운영 책임자'}));
  assert.match(html,/<details>/);assert.match(html,/의도를 항상 정확히 아는 것은 아닙니다/);
  assert.match(html,/공공의료 책임자와 같은 역할/);assert.equal(glossaryFor('시민들의 일상입니다.').length,0);
});
test('compact paragraphs retain all original words, numbers and order',()=>{
  const text='첫 문단 12.5%입니다.\n\n다음 문단입니다.\n\n\n끝입니다.';
  assert.equal(dialogueParagraphs(text).length,3);
  assert.equal(dialogueParagraphs(text).join(' ').replace(/\s+/g,' '),text.replace(/\s+/g,' '));
});
test('resource effects omitted by actual choices remain unchanged; choices need not move all four resources',()=>{
  let partial=0;
  for(const card of ALL_CARDS)for(const choice of [card.leftChoice,card.rightChoice]){
    const before={citizenTrust:50,fairness:50,personalFreedom:50,publicSafety:50};
    const after=applyResourceDelta(before,choice.effects);
    const unchanged=RESOURCE_ORDER.filter(key=>!choice.effects[key]);
    if(unchanged.length)partial++;
    for(const key of unchanged)assert.equal(after[key],before[key],card.id+':'+key);
  }
  assert.ok(partial>0);
});
