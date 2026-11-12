import test from 'node:test';
import assert from 'node:assert/strict';
import {compactDialogue} from '../src/data/compactDialogue';
import {readableDialogue} from '../src/data/readableDialogue';
import {resolveCardDialogue} from '../src/engine/gameEngine';
import {CARD_MAP} from '../src/data/cards';
const resources={citizenTrust:50,fairness:50,personalFreedom:50,publicSafety:50};
test('opening condensed dialogue follows the actual ORACLE branch',()=>{
  const card=CARD_MAP.get('act1_02_oracle_intro')!;
  const rights=compactDialogue(card.id,readableDialogue(card.id,resolveCardDialogue(card,{supervisor_bias:'human_rights'},resources)));
  const safety=compactDialogue(card.id,readableDialogue(card.id,resolveCardDialogue(card,{supervisor_bias:'public_safety'},resources)));
  assert.match(rights.text,/공정성/);assert.doesNotMatch(rights.text,/23\.4/);
  assert.match(safety.text,/안전/);assert.match(safety.text,/23\.4%/);
});
test('unreviewed dynamic branches are labelled excerpts of resolved source, never fabricated summaries',()=>{
  const card=CARD_MAP.get('act1_13_unintended_consequence')!;
  for(const surveillance_level of ['total','restricted']) {
    const original=resolveCardDialogue(card,{surveillance_level},resources);
    const preview=compactDialogue(card.id,original);
    const plain=original.replace(/\s+/g,' ').trim();
    assert.equal(preview.excerpt,Array.from(plain).length>110);
    assert.ok(plain.startsWith(preview.excerpt ? preview.text.slice(0,-1) : preview.text));
  }
});
