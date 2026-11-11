import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState, executeDecision, startAct2 } from '../src/engine/gameEngine';
import { CARD_MAP } from '../src/data/cards';
import { validateStoryContent } from '../src/engine/contentValidator';
import { loadGameState, saveGameState } from '../src/services/saveManager';

test('all content links resolve', () => {
  assert.deepEqual(validateStoryContent().errors, []);
});

for (const direction of ['left', 'right'] as const) {
  test(`full story reaches both epilogues: ${direction}`, () => {
    let state = createInitialGameState();
    for (const act of ['ACT_I', 'ACT_II'] as const) {
      let reached = false;
      for (let step = 0; step < 220; step++) {
        assert.ok(CARD_MAP.has(state.currentCardId));
        state = executeDecision(state, direction).nextState;
        if (state.storyFlags[act === 'ACT_I' ? 'act1_viewed_epilogue' : 'act2_viewed_epilogue']) {
          assert.equal(state.isActCompleted, true);
          reached = true;
          break;
        }
      }
      assert.ok(reached, `stalled in ${act} on ${state.currentCardId}`);
      if (act === 'ACT_I') {
        state = startAct2(state);
        assert.equal(state.isActCompleted, false);
      }
    }
  });
}

test('final verdict replacement preserves the pending epilogue', () => {
  let state = startAct2(createInitialGameState());
  state.currentCardId = 'act2_ch3_07_final_civitas_verdict';
  state.resources.fairness = 1;
  const result = executeDecision(state, 'right');
  assert.equal(result.replaced, true);
  assert.equal(result.nextState.scheduledCardQueue[0], 'act2_ch3_08_act2_epilogue');
  state = executeDecision(result.nextState, 'left').nextState;
  assert.equal(state.currentCardId, 'act2_ch3_08_act2_epilogue');
});

test('save roundtrip preserves progress; legacy missing arrays recover; invalid card rejected', () => {
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  }});
  const state = executeDecision(createInitialGameState(), 'left').nextState;
  assert.ok(saveGameState(state));
  assert.deepEqual(loadGameState().state?.decisionHistory, state.decisionHistory);
  const legacy = { ...state, schemaVersion: 1, decisionHistory: undefined };
  storage.set('crossroads_ai_verdict_save_v1', JSON.stringify(legacy));
  assert.deepEqual(loadGameState().state?.decisionHistory, []);
  storage.set('crossroads_ai_verdict_save_v1', JSON.stringify({ ...state, currentCardId: 'missing' }));
  assert.equal(loadGameState().success, false);
});

test('ACT II followups cannot skip the ACT I ending', () => {
  let state = createInitialGameState();
  for (let step = 0; step < 160 && !state.storyFlags.act1_viewed_epilogue; step++) {
    state = executeDecision(state, step % 2 ? 'left' : 'right').nextState;
    assert.equal(state.currentAct, 'ACT_I');
  }
  assert.ok(state.storyFlags.act1_viewed_epilogue);
});

test('twenty deterministic mixed playthroughs reach the ending without replaying story cards', () => {
  for (let seed = 1; seed <= 20; seed++) {
    let state = createInitialGameState();
    let rng = seed;
    for (const act of ['ACT_I', 'ACT_II'] as const) {
      const seen = new Set<string>();
      for (let step = 0; step < 220; step++) {
        const card = CARD_MAP.get(state.currentCardId)!;
        if (!card.repeatable) {
          assert.ok(!seen.has(card.id), `replayed ${card.id}, seed ${seed}`);
          seen.add(card.id);
        }
        rng = (rng * 16807) % 2147483647;
        state = executeDecision(state, rng % 2 ? 'left' : 'right').nextState;
        if (state.storyFlags[act === 'ACT_I' ? 'act1_viewed_epilogue' : 'act2_viewed_epilogue']) break;
      }
      assert.ok(state.isActCompleted, `stalled in ${act}, seed ${seed}`);
      if (act === 'ACT_I') state = startAct2(state);
    }
  }
});
