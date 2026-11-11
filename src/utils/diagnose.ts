import { ALL_CARDS, ACT1_CARDS, ACT2_CARDS, CARD_MAP } from '../data/cards';
import { createInitialGameState } from '../engine/gameEngine';
import { transitionSession, sessionScreen, SessionAction } from '../engine/gameSession';
import { validateStoryContent } from '../engine/contentValidator';

export function runCardDiagnosis() {
  const report = validateStoryContent();
  let state = createInitialGameState();
  const visited = new Set<string>();
  const screens = new Set<string>();
  for (let turn = 0; turn < 1200; turn++) {
    screens.add(sessionScreen(state));
    let action: SessionAction;
    if (state.flowPhase === 'act1Complete') action = { type: 'requestAct2' };
    else if (state.flowPhase === 'act2Intro') action = { type: 'confirmAct2' };
    else if (state.flowPhase === 'act2Complete') action = { type: 'enterFreePlay' };
    else if (state.waitingUntilDay) action = { type: 'wait' };
    else {
      visited.add(state.currentCardId);
      const card = CARD_MAP.get(state.currentCardId)!;
      const score = (s: typeof state) =>
        -Object.values(s.resources).reduce((sum, v) => sum + (v - 50) ** 2, 0) -
        s.supervisorHistory.length * 1000;
      const left = transitionSession(state, { type: 'decision', direction: 'left' }).nextState;
      const right = transitionSession(state, { type: 'decision', direction: 'right' }).nextState;
      action = {
        type: 'decision',
        direction: card.id.startsWith('free_policy_')
          ? 'right'
          : score(left) >= score(right)
            ? 'left'
            : 'right',
      };
    }
    const next = transitionSession(state, action).nextState;
    if (next === state) throw new Error('No progress: ' + state.currentCardId);
    state = next;
  }
  const summary = {
    valid: report.valid,
    errors: report.errors,
    registeredCards: ALL_CARDS.length,
    originalStoryCards: ACT1_CARDS.length + ACT2_CARDS.length,
    storyReached: [...ACT1_CARDS, ...ACT2_CARDS].filter((c) => visited.has(c.id)).length,
    visited: visited.size,
    screenProtocol: [...screens],
    mode: state.gameMode,
    unvisited: ALL_CARDS.filter((c) => !visited.has(c.id)).map((c) => c.id),
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}
runCardDiagnosis();
