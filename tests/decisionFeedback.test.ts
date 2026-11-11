import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialGameState} from '../src/engine/gameEngine';
import {transitionSession} from '../src/engine/gameSession';
import {getDecisionFeedback} from '../src/utils/decisionFeedback';
import {RESOURCE_ORDER} from '../src/engine/resourceEngine';

test('receipt reports v0.3 actual totals, including clamping, without altering history',()=>{
  const state=createInitialGameState();state.resources.fairness=99;
  const next=transitionSession(state,{type:'decision',direction:'left'}).nextState;
  const receipt=getDecisionFeedback(state,next)!;
  assert.ok(receipt);
  for(const key of RESOURCE_ORDER) assert.equal(receipt.delta[key]??0,next.resources[key]-state.resources[key]);
  assert.equal(receipt.summary,next.decisionHistory[0].consequenceSummary);
  assert.equal(getDecisionFeedback(next,next),null);
});
