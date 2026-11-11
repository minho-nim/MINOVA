import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {APPROVED_SHEETS, CHARACTER_ART, FACTIONS} from '../src/data/characterArt';
import {CharacterPortrait} from '../src/components/CharacterPortrait';
import {TitleScreen} from '../src/components/TitleScreen';
import {CharacterId} from '../src/types/game';
import {ALL_CARDS, CARD_MAP} from '../src/data/cards';
import {getCardSpeaker} from '../src/data/cardSpeakers';
import {GameCard} from '../src/components/GameCard';

const accepted:Record<string,string> = {
  citizen:'7974bb8c4e273231b5f0220ee14fe2f6a661c4bc34800bd35296acce0c261153',
  council:'9c94bfc0b2e983d27ebbef54f74f8aa5615420d96119f0d3b6e19ad16d3463bd',
  baekSion:'7bfe2565382acb4491781451869e406fdf7ed3f8cc1db04fe8962140bd5e5d88',
  kangDohyun:'1f9023f1209147c91d0b7bb784350436549a7ec1be4c0fc5ab13d2a39147943a',
  ohHyejin:'3ad811f6e9e6e4128e640f57c3e170a5bb27314f14983ef7d312798ac178e5ca',
  hanJiwoo:'8d2f16053f8d7d0cb23b43f40496ac11b13f0971a64cd3b13f305c157862d4ef',
  oracle:'7b8b65265c3da8c799dc83621ec48582a84e2680f920343a6d03077411db5189',
  seoYoonha:'3c8e2505cba23cd05f3cc03ef35a1a3fb95b055bae150894a23f1bb90c6be06e',
};
test('all eight approved sheets match the user attachments byte for byte',()=>{
  assert.equal(Object.keys(APPROVED_SHEETS).length,8);
  for(const [id,sha] of Object.entries(accepted)) {
    const bytes=readFileSync('public'+APPROVED_SHEETS[id as CharacterId]);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),sha,id);
  }
});
test('all character emotion and ORACLE state paths resolve approved assets',()=>{
  for(const id of Object.keys(accepted) as CharacterId[]) {
    const art=CHARACTER_ART[id]!;
    for(const image of [art.rasterPortrait,...art.rasterExpressions!]) assert.ok(readFileSync('public'+image).length>100);
    for(const emotion of ['neutral','worried','uncertain','confident','angry','glitch'] as const) {
      const markup=renderToStaticMarkup(React.createElement(CharacterPortrait,{characterId:id,emotion}));
      assert.match(markup,/approved-20261028/); assert.doesNotMatch(markup,/portraits-v3-resampled|character-sheet-v3/);
    }
  }
  for(const state of ['normal','uncertain','confident','glitch'] as const) {
    assert.match(renderToStaticMarkup(React.createElement(CharacterPortrait,{characterId:'oracle',oracleState:state})),/approved-20261028/);
  }
});
test('citizens and council keep all approved members visible as collective portraits',()=>{
  const manifest=JSON.parse(readFileSync('public/assets/approved-20261028/manifest.json','utf8'));
  for(const [id,count] of [['citizen',6],['council',5]] as const) {
    assert.equal(manifest.characters[id].members.length,count);
    const markup=renderToStaticMarkup(React.createElement(CharacterPortrait,{characterId:id}));
    assert.match(markup,/collective-portrait/);
    assert.equal(CHARACTER_ART[id]!.emotions.angry,0);
  }
});
test('title, faction scenes and full sheet controls only reference approved artwork',()=>{
  const html=renderToStaticMarkup(React.createElement(TitleScreen,{savedState:null,onStartNewGame:()=>{}}));
  assert.doesNotMatch(html,/character-sheet-v3|nova-citizens.png|nova-council.png|portraits-v3-resampled/);
  assert.match(html,/ORACLE 디자인 시트/);
  assert.match(html,/NOVA 시민 디자인 시트/);
  assert.match(html,/NOVA 최고평의회 디자인 시트/);
  for(const faction of FACTIONS) for(let i=0;i<4;i++) assert.ok(readFileSync(`public/assets/approved-20261028/${faction.id}-scene-${i}.png`).length>100);
});

test('every citizen testimony has a concrete voice without replacing the collective identity',()=>{
  const citizens=ALL_CARDS.filter(card=>card.characterId==='citizen');
  assert.equal(citizens.length,27);
  const manifest=JSON.parse(readFileSync('public/assets/approved-20261028/manifest.json','utf8'));
  for(const card of citizens) {
    const speaker=getCardSpeaker(card)!;
    assert.ok(speaker);
    assert.notEqual(speaker.role,'시민 의견 전달자',card.id+' must have an explicit reviewed voice');
    assert.match(speaker.portrait.src,/citizen-speaker-[0-5]\.png$/);
    assert.ok(readFileSync('public'+speaker.portrait.src).length>100);
    assert.ok(manifest.characters.citizen.crops[speaker.portrait.src.split('/').pop()!]);
    assert.equal(card.characterId,'citizen');
  }
  assert.match(getCardSpeaker(CARD_MAP.get('act2_ch2_03_district4_screening')!)!.name,/이민우/);
  assert.equal(getCardSpeaker(CARD_MAP.get('act1_14_labor_dispute')!)!.role,'항만 노동자');
  assert.equal(getCardSpeaker(CARD_MAP.get('act2_ch1_05_family_appeal')!)!.role,'환자 가족 대표');
});

test('actual dialogue cards show one reviewed speaker; the title still shows full groups',()=>{
  for(const card of ALL_CARDS.filter(c=>c.characterId==='citizen'||c.characterId==='council')) {
    const speaker=getCardSpeaker(card)!;
    const html=renderToStaticMarkup(React.createElement(GameCard,{
      card,storyFlags:{},resources:{citizenTrust:50,fairness:50,personalFreedom:50,publicSafety:50},
      onDecision(){},onHoverDirectionChange(){},isProcessing:false,
    }));
    assert.ok(html.includes(speaker.name),card.id);
    assert.ok(html.includes(speaker.portrait.src),card.id);
    assert.doesNotMatch(html,/collective-portrait|(?:citizen|council)-portrait\.png/);
    if(card.characterId==='council') {
      assert.equal(speaker.name,'최고평의회 의장');
      assert.match(speaker.role,/의결사항 전달/);
    }
  }
  assert.equal(CHARACTER_ART.citizen!.collective,true);
  assert.equal(CHARACTER_ART.council!.collective,true);
});

test('ORACLE uses a complete ring state panel rather than the clipped narrow hero crop',()=>{
  const manifest=JSON.parse(readFileSync('public/assets/approved-20261028/manifest.json','utf8'));
  const spec=manifest.characters.oracle;
  const portrait=spec.crops['oracle-portrait.png'];
  assert.deepEqual(portrait.rect,spec.expressions[0]);
  assert.ok(portrait.width>=portrait.height,'complete ring frame is landscape');
  const html=renderToStaticMarkup(React.createElement(CharacterPortrait,{characterId:'oracle',frame:'natural'}));
  assert.match(html,/natural-portrait/);
  assert.match(html,/height:auto/);
});
