import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ALL_CARDS, CARD_MAP } from '../src/data/cards';
import { choicePresentation } from '../src/data/cardPresentation';
import { DECISION_CONSISTENCY_CARD_IDS, summarizeOracleMemory } from '../src/data/decisionConsistency';
import { resolveCardDialogue } from '../src/engine/gameEngine';
import { transitionSession } from '../src/engine/gameSession';
import { ALL_OBJECTIVES, checkObjectiveCompleted } from '../src/engine/storyEngine';
import { migrateGameState, SAVE_KEY } from '../src/services/saveManager';
import { Controls } from '../src/components/Controls';
import { GameCard } from '../src/components/GameCard';
import { DecisionRecord, GameState, StoryFlags } from '../src/types/game';
import { playUntil } from './helpers';

const resources = { citizenTrust: 60, fairness: 60, personalFreedom: 60, publicSafety: 60 };
const school = playUntil(s => s.currentCardId === 'act1_11_education_tracking');
const leak = playUntil(s => s.currentCardId === 'act1_13_unintended_consequence');
const hearing = playUntil(s => s.currentCardId === 'act2_ch3_05_oracle_interrogation');
const chapter = playUntil(s => s.currentCardId === 'act2_ch2_08_chapter2_resolution');
const verdict = playUntil(s => s.currentCardId === 'act2_ch3_07_final_civitas_verdict');
const audit = playUntil(s => s.currentCardId === 'act2_ch2_06_independent_audit_warrant');
const decide = (s: GameState, direction: 'left' | 'right') => transitionSession(s, { type: 'decision', direction });
const controlHtml = (s: GameState) => renderToStaticMarkup(React.createElement(Controls, {
  card: CARD_MAP.get(s.currentCardId)!, storyFlags: s.storyFlags,
  onDecision() {}, onOpenHistory() {}, onOpenSettings() {}, onHoverDirectionChange() {}, isProcessing: false,
}));
const dialogue = (s: GameState) => resolveCardDialogue(CARD_MAP.get(s.currentCardId)!, s.storyFlags, s.resources, s);
// Explicit memory fixtures: source text is deliberately unreliable. Classification
// must use actual card IDs/directions, never text substitution or old counter flags.
const record = (cardId: string, direction: 'left' | 'right', day: number): DecisionRecord => ({
  id: 'fixture_' + day, day, cardId, direction, timestamp: day,
  cardTitle: 'legacy', characterId: 'oracle', characterName: 'ORACLE', topic: 'fixture',
  choiceText: '예전 표시 문구', consequenceSummary: '원문 유지', resourceDelta: {}, resourcesAfter: resources,
});

test('159 IDs and mechanics stay intact; current wording outside the five approved cards is unchanged', () => {
  const old = JSON.parse(readFileSync(new URL('../docs/v0.3-ethics-evidence.json', import.meta.url), 'utf8'));
  const samples = JSON.parse(readFileSync(new URL('./character-consistency-baseline.json', import.meta.url), 'utf8'));
  assert.equal(ALL_CARDS.length, 159);
  assert.deepEqual(ALL_CARDS.map(c => c.id), old.cards.map((c: any) => c.id));
  let retained = 0;
  for (const previous of old.cards) {
    const card = CARD_MAP.get(previous.id)!;
    assert.deepEqual(JSON.parse(JSON.stringify(card.leftChoice)), previous.leftChoice, card.id);
    assert.deepEqual(JSON.parse(JSON.stringify(card.rightChoice)), previous.rightChoice, card.id);
    if ((DECISION_CONSISTENCY_CARD_IDS as readonly string[]).includes(card.id)) continue;
    retained++;
    assert.equal(card.title, previous.title, card.id);
    assert.deepEqual([...new Set(samples.cases.map((f: StoryFlags) => resolveCardDialogue(card, f, resources)))], previous.dialogueVariants, card.id);
    for (const direction of ['left', 'right'] as const)
      assert.deepEqual(JSON.parse(JSON.stringify(choicePresentation(card, direction))), previous.choices[direction].presentation, card.id);
  }
  assert.equal(retained, 154);
});

test('education approval explicitly authorizes compulsory assignment; rejection and all effects are preserved', () => {
  assert.match(controlHtml(school), /14세 학생의 진학·직업 트랙을 영구 강제 배정/);
  for (const direction of ['left', 'right'] as const) {
    const result = decide(school, direction).nextState;
    assert.equal(result.storyFlags.education_tracking_banned, direction === 'left');
    assert.equal(result.decisionHistory[0].choiceText, choicePresentation(CARD_MAP.get(school.currentCardId)!, direction, school.storyFlags).text);
    if (direction === 'right') assert.match(result.decisionHistory[0].consequenceSummary, /단순 진로 추천을 승인한 것이 아닙니다/);
  }
});

for (const level of ['total', 'restricted', undefined] as const) {
  test(`leak ${level ?? 'unknown'}: dialogue, both buttons and both new records agree about confirmed harm`, () => {
    const state = { ...leak, resources, storyFlags: { ...leak.storyFlags } };
    if (level) state.storyFlags.surveillance_level = level;
    else delete state.storyFlags.surveillance_level;
    const text = dialogue(state), html = controlHtml(state);
    if (level === 'total') {
      assert.match(text, /50만 명/); assert.match(html, /피해 보상금/);
    } else {
      assert.match(text, level === 'restricted' ? /유출은 확인되지 않았습니다/ : /유출 피해는 아직 확인되지 않았습니다/);
      assert.doesNotMatch(html, /전원에게 피해 보상금을 지급/);
      assert.match(html, /예방 보안/);
    }
    for (const direction of ['left', 'right'] as const) {
      const next = decide(state, direction).nextState;
      const display = choicePresentation(CARD_MAP.get(state.currentCardId)!, direction, state.storyFlags);
      assert.equal(next.decisionHistory[0].choiceText, display.text);
      assert.equal(next.decisionHistory[0].consequenceSummary, display.consequence);
      assert.equal(next.storyFlags.data_leak_remedied, direction === 'left');
    }
  });
}

test('real surveillance approval and rejection reach the corresponding leak branch through session decisions', () => {
  const start = playUntil(s => s.currentCardId === 'act1_04_movement_surveillance');
  for (const direction of ['left', 'right'] as const) {
    const reached = playUntil(s => s.currentCardId === leak.currentCardId, decide(start, direction).nextState);
    assert.match(dialogue(reached), direction === 'left' ? /유출은 확인되지/ : /50만 명/);
    assert.equal(reached.appliedDelayedEffectIds.includes('delayed_surveillance_leak'), direction === 'right');
  }
});

test('ORACLE counts explanation requests separately from consecutive policy approvals in chronological records', () => {
  const history = [record('act1_05_complaint_automation', 'right', 5), record('act1_04_movement_surveillance', 'right', 4),
    record('act1_07_explainability_dilemma', 'left', 3), record('act1_03_traffic_optimization', 'right', 2), record('act1_02_oracle_intro', 'left', 1)];
  const state = { ...hearing, decisionHistory: history, completedCardIds: history.map(r => r.cardId), skippedStoryCardIds: [],
    storyFlags: { ...hearing.storyFlags, asked_explanation_count: 99, oracle_approval_streak: 99 } };
  const memory = summarizeOracleMemory(state);
  assert.deepEqual(memory, { available: true, complete: true, explanationRequests: 2, approvals: 3, consecutiveApprovals: 2 });
  assert.match(dialogue(state), /설명 요구는 2회, 승인은 3회/);
  assert.match(dialogue(state), /현재 연속 승인은 2회/);
  assert.doesNotMatch(dialogue(state), /99회/);
  const rejected = { ...state, decisionHistory: [record('act1_06_medical_triage', 'left', 6), ...history] };
  assert.equal(summarizeOracleMemory(rejected).consecutiveApprovals, 0);
});

test('ORACLE recognizes both bias findings alongside recorded approval, without blaming an unrecorded choice', () => {
  const state = { ...hearing, storyFlags: { ...hearing.storyFlags, medical_bias_detected: true, hiring_bias_detected: true, oracle_approval_streak: 2 } };
  assert.match(dialogue(state), /승인은 \d+회/);
  assert.match(dialogue(state), /의료와 채용 모두에서 편향/);
  assert.match(dialogue(state), /정책 승인이 이 결함을 정당화하지는 않습니다/);
  assert.doesNotMatch(dialogue(state), /스스로 승인한 번영을 부정/);
});

test('missing, invalid and skipped legacy history yields only confirmed lower bounds, never legacy counter accusations', () => {
  const base = { ...hearing, storyFlags: { medical_bias_detected: true, hiring_bias_detected: true, asked_explanation_count: 9, oracle_approval_streak: 9 } };
  for (const state of [
    { ...base, decisionHistory: [] },
    { ...base, decisionHistory: [{ ...record('act1_02_oracle_intro', 'right', 1), direction: 'invalid' } as unknown as DecisionRecord] },
    { ...base, decisionHistory: [], completedCardIds: [], skippedStoryCardIds: ['act1_02_oracle_intro'] },
  ]) {
    assert.equal(summarizeOracleMemory(state).complete, false);
    assert.match(dialogue(state), /기록이 일부 누락/);
    assert.match(dialogue(state), /연속 승인 횟수.*단정하지/);
    assert.doesNotMatch(dialogue(state), /9회|승인해 오셨/);
    assert.match(dialogue(state), /의료와 채용 모두/);
  }
  const withoutContext = resolveCardDialogue(CARD_MAP.get(hearing.currentCardId)!, base.storyFlags, resources);
  assert.match(withoutContext, /판단 기록이 제공되지 않아/);
});

test('non-policy acknowledgements and duplicate legacy entries cannot inflate ORACLE approvals', () => {
  const policy = record('act1_02_oracle_intro', 'right', 1);
  const context = { decisionHistory: [record('act2_ch2_08_chapter2_resolution', 'right', 4), { ...policy, day: 3 }, policy], completedCardIds: [policy.cardId] };
  assert.equal(summarizeOracleMemory(context).approvals, 1);
  assert.equal(summarizeOracleMemory(context).consecutiveApprovals, 1);
});

test('the game card renders ORACLE from the supplied decision history rather than stale counter flags', () => {
  const state = { ...hearing, storyFlags: { medical_bias_detected: true, hiring_bias_detected: true }, decisionHistory: [], completedCardIds: hearing.completedCardIds };
  const html = renderToStaticMarkup(React.createElement(GameCard, {
    card: CARD_MAP.get(state.currentCardId)!, storyFlags: state.storyFlags, resources,
    dialogueContext: state, onDecision() {}, onHoverDirectionChange() {}, isProcessing: false,
  }));
  assert.match(html, /판단 기록이 일부 누락/);
  assert.match(html, /의료와 채용 모두/);
});

for (const reformed of [false, true]) {
  test(`chapter resolution with reform=${reformed}: investigation never fabricates implementation`, () => {
    const state = { ...chapter, resources, completedObjectiveIds: [...chapter.completedObjectiveIds, 'act2_obj_hiring_reform'],
      storyFlags: { ...chapter.storyFlags, proxy_features_banned: reformed, hiring_fairness_reformed: false } };
    assert.equal(checkObjectiveCompleted('act2_obj_hiring_reform', state.storyFlags, [chapter.currentCardId]), reformed);
    assert.match(dialogue(state), reformed ? /시정하는 조치가 의결된 사실/ : /완료한 것은 공통 지표에 대한 조사/);
    for (const direction of ['left', 'right'] as const) {
      const next = decide(state, direction).nextState;
      assert.equal(next.completedObjectiveIds.includes('act2_obj_hiring_reform'), reformed);
      assert.equal(next.storyFlags.chapter2_completed, true);
      assert.equal(next.currentChapter, 3);
    }
  });
}

test('actual proxy deletion and retention decisions drive the reform goal before and after chapter completion', () => {
  const start = playUntil(s => s.currentCardId === 'act2_ch2_02_proxy_discovery');
  for (const direction of ['left', 'right'] as const) {
    const after = decide(start, direction).nextState;
    assert.equal(after.completedObjectiveIds.includes('act2_obj_hiring_reform'), direction === 'left');
    const resolved = playUntil(s => s.currentCardId === chapter.currentCardId, after);
    assert.equal(decide(resolved, 'right').nextState.completedObjectiveIds.includes('act2_obj_hiring_reform'), direction === 'left');
  }
});

test('v5 restoration corrects only the derived false reform cache, preserving historical choices and city data', () => {
  for (const reformed of [false, true]) {
    const saved = JSON.parse(JSON.stringify({ ...verdict, storyFlags: { ...verdict.storyFlags, proxy_features_banned: reformed, hiring_fairness_reformed: false }, completedObjectiveIds: [...verdict.completedObjectiveIds, 'act2_obj_hiring_reform'],
      supervisorHistory: [{ supervisorNumber: 1, tenureDays: 3, dismissalReason: 'legacy', endDay: 3, keyVerdict: '영장 발부. 예전 법적 행위의 기록' }] }));
    saved.decisionHistory[0].choiceText = 'AI 진로 추천을 공식 도입하라. 과거 원문';
    const restored = migrateGameState(saved);
    assert.equal(restored.schemaVersion, 5); assert.equal(SAVE_KEY, 'crossroads_ai_verdict_save_v1');
    assert.equal(restored.completedObjectiveIds.includes('act2_obj_hiring_reform'), reformed);
    for (const key of ['decisionHistory', 'supervisorHistory', 'resources', 'relationshipValues', 'discoveredSecrets', 'storyFlags', 'currentAct', 'currentChapter', 'gameMode'] as const)
      assert.deepEqual(restored[key], saved[key], key);
    for (const id of saved.completedObjectiveIds.filter((id: string) => id !== 'act2_obj_hiring_reform')) assert.ok(restored.completedObjectiveIds.includes(id));
  }
});

test('final verdict recalls real safeguards and gradual reform while explicitly offering a new reversal, not assumed consent', () => {
  const state = { ...verdict, storyFlags: { ...verdict.storyFlags, final_act1_verdict: 'human_guardrails', medical_doctor_override_granted: true,
    audit_access_granted: true, xai_enforced: true, oracle_loss_function_condemned: false, shutdown_consequences_accepted: false } };
  const text = dialogue(state);
  for (const expected of [/인간 거부권과 독립 감사/, /의료진의 임상 재평가 권한/, /승인된 독립 감사 접근/, /점진적 가드레일/, /점진적으로 완화/, /이전 선택만으로 제2안에 동의한 것으로 간주하지/]) assert.match(text, expected);
  assert.match(controlHtml(state), /감독 제한 철회·전권 위임/);
  for (const direction of ['left', 'right'] as const) {
    const next = decide(state, direction).nextState;
    assert.equal(next.storyFlags.final_act2_verdict, direction === 'left' ? 'human_dignity' : 'oracle_technocracy');
    assert.equal(next.storyFlags.civitas_destroyed, direction === 'left');
    assert.equal(next.storyFlags.medical_doctor_override_granted, true); // Historical decision is retained.
    assert.equal(next.storyFlags.shutdown_consequences_accepted, false);
    assert.match(next.decisionHistory[0].choiceText, direction === 'left' ? /기존 안전장치를 유지/ : /감독 제한보다.*완전 자율/);
  }
});

test('unknown prior policy does not invent safeguards; individual reassessment does not imply general override approval', () => {
  assert.match(resolveCardDialogue(CARD_MAP.get(verdict.currentCardId)!, {}, resources), /기록에 없는 안전장치를 이미 승인했다고 간주하지/);
  const text = resolveCardDialogue(CARD_MAP.get(verdict.currentCardId)!, { human_override_active: true, medical_doctor_override_granted: false }, resources);
  assert.match(text, /개별 재평가 이력/); assert.doesNotMatch(text, /의료진의 임상 재평가 권한/);
});

for (const direction of ['left', 'right'] as const) {
  test(`audit ${direction} followed by dismissal stores the displayed act; old legal-action history stays untouched`, () => {
    // Explicit resource boundary, not a claim that every audit decision dismisses.
    const old = { supervisorNumber: 1, tenureDays: 2, dismissalReason: 'old', endDay: 2, keyVerdict: '영장 기각. 옛 판단 원문' };
    const state = { ...audit, pendingDelayedEffects: [], resources: { ...resources, citizenTrust: 0, publicSafety: 0 }, supervisorHistory: [old] };
    const result = decide(state, direction);
    assert.equal(result.replaced, true);
    const next = result.nextState;
    assert.equal(next.supervisorHistory[0].keyVerdict, next.decisionHistory[0].choiceText);
    assert.doesNotMatch(next.supervisorHistory[0].keyVerdict, /영장/);
    assert.match(next.supervisorHistory[0].keyVerdict, direction === 'left' ? /감사 접근을 승인/ : /접근 요청을 거부/);
    assert.deepEqual(next.supervisorHistory[1], old);
    const restored = migrateGameState(JSON.parse(JSON.stringify(next)));
    assert.deepEqual(restored.supervisorHistory, next.supervisorHistory);
  });
}

test('medical testimony objective uses the official clinical role', () => {
  const description = ALL_OBJECTIVES.find(o => o.id === 'act2_obj_patient_testimony')!.description;
  assert.match(description, /공공의료 AI 운영 책임자이자 의사인 오혜진/);
  assert.doesNotMatch(description, /원장/);
});
