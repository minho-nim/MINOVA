import { GameState } from '../types/game';
import { executeDecision, startAct2 } from './gameEngine';
import { storyComplete } from './storyFlow';
import { selectNextCard } from './cardSelector';

export type SessionAction =
  | { type: 'decision'; direction: 'left' | 'right' }
  | { type: 'requestAct2' }
  | { type: 'confirmAct2' }
  | { type: 'enterFreePlay' }
  | { type: 'wait' };
// The app, tests, and diagnosis use this same transition protocol, including the two ACT II screens.
export function transitionSession(
  state: GameState,
  action: SessionAction,
): { nextState: GameState; replaced: boolean; dismissalReason?: string } {
  if (action.type === 'decision') return executeDecision(state, action.direction);
  let next = state;
  if (
    action.type === 'requestAct2' &&
    state.flowPhase === 'act1Complete' &&
    state.currentAct === 'ACT_I' &&
    state.storyFlags.act1_completed &&
    storyComplete(state, 'ACT_I')
  )
    next = { ...state, flowPhase: 'act2Intro' };
  if (action.type === 'confirmAct2' && state.flowPhase === 'act2Intro') next = startAct2(state);
  if (
    action.type === 'enterFreePlay' &&
    state.flowPhase === 'act2Complete' &&
    state.storyFlags.act2_completed &&
    state.currentAct === 'ACT_II' &&
    storyComplete(state, 'ACT_II')
  ) {
    next = { ...state, gameMode: 'freePlay', flowPhase: 'playing', waitingUntilDay: undefined };
    const selection = selectNextCard(next);
    next = {
      ...next,
      currentCardId: selection.card?.id || next.currentCardId,
      rngSeed: selection.nextSeed,
      scheduledCardQueue: selection.remainingScheduledQueue,
      selectionDiagnostics: [...next.selectionDiagnostics, ...selection.diagnostics].slice(-50),
      waitingUntilDay: selection.card ? undefined : selection.waitUntilDay,
    };
  }
  if (action.type === 'wait' && state.waitingUntilDay) {
    next = {
      ...state,
      currentDay: Math.max(state.currentDay + 1, state.waitingUntilDay),
      waitingUntilDay: undefined,
    };
    const selection = selectNextCard(next);
    next = {
      ...next,
      currentCardId: selection.card?.id || next.currentCardId,
      rngSeed: selection.nextSeed,
      waitingUntilDay: selection.card ? undefined : selection.waitUntilDay,
      scheduledCardQueue: selection.remainingScheduledQueue,
      selectionDiagnostics:[...next.selectionDiagnostics,...selection.diagnostics].slice(-50),
    };
  }
  return {
    nextState: next === state ? state : { ...next, lastSavedAt: new Date().toISOString() },
    replaced: false,
  };
}
export function sessionScreen(state: GameState, inMenu = false): 'title' | GameState['flowPhase'] {
  return inMenu ? 'title' : state.flowPhase;
}
