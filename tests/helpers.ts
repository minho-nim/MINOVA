import { CARD_MAP } from '../src/data/cards';
import { createInitialGameState } from '../src/engine/gameEngine';
import { SessionAction, transitionSession } from '../src/engine/gameSession';
import { GameState } from '../src/types/game';
export function score(state: GameState): number {
  return (
    -Object.values(state.resources).reduce((s, v) => s + (v - 50) ** 2, 0) -
    state.supervisorHistory.length * 1000
  );
}
export function choose(state: GameState): 'left' | 'right' {
  const l = transitionSession(state, { type: 'decision', direction: 'left' }).nextState;
  const r = transitionSession(state, { type: 'decision', direction: 'right' }).nextState;
  return score(l) >= score(r) ? 'left' : 'right';
}
export function playUntil(
  predicate: (s: GameState) => boolean,
  initial = createInitialGameState(),
  limit = 800,
): GameState {
  let state = initial;
  for (let i = 0; i < limit; i++) {
    if (predicate(state)) return state;
    let action: SessionAction;
    if (state.flowPhase === 'act1Complete') action = { type: 'requestAct2' };
    else if (state.flowPhase === 'act2Intro') action = { type: 'confirmAct2' };
    else if (state.flowPhase === 'act2Complete') action = { type: 'enterFreePlay' };
    else if (state.waitingUntilDay) action = { type: 'wait' };
    else action = { type: 'decision', direction: choose(state) };
    const next = transitionSession(state, action).nextState;
    if (next === state || JSON.stringify(next) === JSON.stringify(state))
      throw new Error(
        `No progress ${state.currentCardId} ${JSON.stringify(state.selectionDiagnostics)}`,
      );
    state = next;
  }
  throw new Error(
    `limit ${limit}: ${state.currentCardId} ${state.flowPhase} completed=${state.completedCardIds.length}`,
  );
}
export function decide(state: GameState, direction: 'left' | 'right' = 'left') {
  return transitionSession(state, { type: 'decision', direction }).nextState;
}
