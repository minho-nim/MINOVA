import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState, executeDecision } from '../src/engine/gameEngine';
import { getDecisionFeedback } from '../src/utils/decisionFeedback';

test('decision receipt uses actual clamped totals rather than advertised effects', () => {
  const before = createInitialGameState();
  before.resources.fairness = 99;
  const after = executeDecision(before, 'left').nextState;
  const receipt = getDecisionFeedback(before, after)!;
  assert.equal(receipt.delta.fairness, 1);
  assert.equal(receipt.delta.publicSafety, -4);
  assert.equal(receipt.summary, after.decisionHistory[0].consequenceSummary);
  assert.equal(receipt.title, '감독관 임명장');
});

test('supervisor recovery is included and explained', () => {
  const before = createInitialGameState();
  before.resources.personalFreedom = 1;
  const result = executeDecision(before, 'right');
  assert.equal(result.replaced, true);
  const receipt = getDecisionFeedback(before, result.nextState)!;
  assert.equal(receipt.delta.personalFreedom, result.nextState.resources.personalFreedom - 1);
  assert.match(receipt.adjustment!, /감독관 교체/);
});

test('unchanged resources are omitted, and resuming does not create a new receipt', () => {
  const before = createInitialGameState();
  assert.equal(getDecisionFeedback(before, before), null);
  before.resources.fairness = 100;
  const after = executeDecision(before, 'left').nextState;
  assert.equal(getDecisionFeedback(before, after)!.delta.fairness, undefined);
  assert.equal(getDecisionFeedback(after, after), null);
});

test('delayed consequences are reflected in both totals and explanation', () => {
  const before = createInitialGameState();
  before.pendingDelayedEffects = [{
    id: 'test_followup', triggerCardId: 'act1_02_oracle_intro',
    effects: { fairness: -3 }, description: '이전 사건의 후속 영향',
  }];
  const after = executeDecision(before, 'left').nextState;
  const receipt = getDecisionFeedback(before, after)!;
  assert.equal(receipt.delta.fairness, 9);
  assert.match(receipt.adjustment!, /후속 효과/);
});
