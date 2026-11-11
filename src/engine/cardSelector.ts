import { CARD_MAP, CONDITIONAL_CARDS, DAILY_CARDS } from '../data/cards';
import { FREE_PLAY_PROPOSALS } from '../data/cards/freePlay';
import { GameCard, GameState } from '../types/game';
import { checkCardCondition } from './conditionEvaluator';
import { MAIN_IDS, nextStoryId, scopeFailure } from './storyFlow';
import { RESOURCE_ORDER } from './resourceEngine';

export function municipalWeight(card: GameCard, state: GameState): number {
  // Prefer an agenda with a useful option for an endangered value, without choosing for the player.
  const relevance = Math.max(...[card.leftChoice, card.rightChoice].map(choice =>
    RESOURCE_ORDER.reduce((sum, key) => sum + Math.max(0, 40-state.resources[key])/40 * (choice.effects[key] || 0), 0)));
  const previousSpeaker = CARD_MAP.get(state.recentCardIds[1])?.characterId;
  const diversity = card.characterId === previousSpeaker ? .55 : 1;
  return Math.max(1, card.weight) * (1 + Math.min(2, Math.max(0,relevance)/5)) * diversity;
}

export function seededRandom(seed: number) {
  const nextSeed = (seed * 9301 + 49297) % 233280;
  return { nextVal: nextSeed / 233280, nextSeed };
}
export interface SelectionResult {
  card: GameCard | null;
  nextSeed: number;
  remainingScheduledQueue: string[];
  diagnostics: string[];
  waitUntilDay?: number;
}
export function entryFailure(id: string, state: GameState): string | null {
  const card = CARD_MAP.get(id);
  if (!card) return 'missing-card';
  if (!card.repeatable && state.completedCardIds.includes(id)) return 'one-time-already-completed';
  const scope = scopeFailure(card, state);
  if (scope) return scope;
  if (!checkCardCondition(card, state.storyFlags, state.currentDay, state.completedCardIds))
    return 'flags-or-min-day';
  const last = state.lastCardDays?.[id];
  if (
    card.type === 'daily' &&
    last !== undefined &&
    state.currentDay - last <= (card.cooldown ?? 20)
  )
    return 'cooldown';
  return null;
}
export function selectNextCard(state: GameState, explicitNextCardId?: string): SelectionResult {
  const diagnostics: string[] = [];
  const queue = [...(state.scheduledCardQueue || [])];
  const result = (card: GameCard | null, nextSeed = state.rngSeed): SelectionResult => ({
    card,
    nextSeed,
    remainingScheduledQueue: queue,
    diagnostics,
  });
  // An active occurrence always gets a response before story links. Lifetime resolution history is not a gate.
  if (state.crisisState) {
    const crisis = CARD_MAP.get(state.crisisState.crisisCardId);
    if (crisis) return result(crisis);
    diagnostics.push(`crisis:${state.crisisState.crisisCardId}:missing-card`);
  }
  // Explicit links are validated even when a bounded reactive event will be interleaved.
  let explicit: GameCard | undefined;
  if (explicitNextCardId) {
    const failure = entryFailure(explicitNextCardId, state);
    if (failure) diagnostics.push(`next:${explicitNextCardId}:${failure}`);
    else explicit = CARD_MAP.get(explicitNextCardId);
  }
  // Never discard a valid but not-yet-eligible event. Invalid/completed references are diagnosed and removed.
  let queued: GameCard | undefined;
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i],
      failure = entryFailure(id, state);
    if (!failure) {
      queued = CARD_MAP.get(id);
      queue.splice(i, 1);
      break;
    }
    if (
      ['missing-card', 'one-time-already-completed', 'main-story-in-free-play'].includes(failure)
    ) {
      diagnostics.push(`queue:${id}:${failure}`);
      queue.splice(i--, 1);
    }
  }
  const conditionals = CONDITIONAL_CARDS.filter((c) => !entryFailure(c.id, state)).sort(
    (a, b) => b.priority - a.priority,
  );
  const storyId = nextStoryId(state);
  const main = storyId && !entryFailure(storyId, state) ? CARD_MAP.get(storyId) : undefined;
  // At most two reactive events between story cards; dailies never displace an available story card.
  if (state.gameMode === 'freePlay' || !main || state.consecutiveSideEvents < 2) {
    if (queued) return result(queued);
    if (conditionals.length) return result(conditionals[0]);
  } else if (queued) {
    queue.unshift(queued.id);
  }
  if (explicit) return result(explicit);
  if (main) return result(main);
  if (state.gameMode === 'story' && storyId) {
    diagnostics.push(`story:${storyId}:${entryFailure(storyId, state)}`);
    return result(null);
  }
  const pool =
    state.gameMode === 'freePlay' ? [...DAILY_CARDS, ...FREE_PLAY_PROPOSALS] : DAILY_CARDS;
  const eligible = pool.filter((c) => !entryFailure(c.id, state));
  const current = CARD_MAP.get(state.currentCardId);
  let candidates = eligible.filter((c) => c.characterId !== current?.characterId);
  if (!candidates.length) candidates = eligible;
  if (candidates.length) {
    const random = seededRandom(state.rngSeed);
    // Actual weighted draw, rather than ignoring the declared weights.
    let ticket = random.nextVal * candidates.reduce((sum, c) => sum + municipalWeight(c,state), 0);
    const chosen =
      candidates.find((c) => (ticket -= municipalWeight(c,state)) < 0) || candidates[candidates.length - 1];
    return result(chosen, random.nextSeed);
  }
  // Preserve cooldown. The UI can advance to the next municipal review day instead of replaying a card.
  const deadlines = pool
    .filter(
      (c) =>
        scopeFailure(c, state) === null &&
        checkCardCondition(c, state.storyFlags, Math.max(state.currentDay,c.minDay??0), state.completedCardIds),
    )
    .map((c) => Math.max(state.currentDay+1,c.minDay??0,(state.lastCardDays[c.id] ?? state.currentDay) + (c.cooldown ?? 20) + 1));
  return { ...result(null), waitUntilDay: deadlines.length ? Math.min(...deadlines) : undefined };
}
