/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ACT1_CARDS,
  ACT2_CARDS,
  ALL_CARDS,
  CARD_MAP,
  CONDITIONAL_CARDS,
  DAILY_CARDS,
} from '../data/cards';
import { GameCard, GameState } from '../types/game';
import { checkCardCondition } from './conditionEvaluator';

export function seededRandom(seed: number): { nextVal: number; nextSeed: number } {
  const newSeed = (seed * 9301 + 49297) % 233280;
  return {
    nextVal: newSeed / 233280,
    nextSeed: newSeed,
  };
}

export function selectNextCard(
  state: GameState,
  explicitNextCardId?: string
): { card: GameCard; nextSeed: number; remainingScheduledQueue?: string[] } {
  let seed = state.rngSeed;
  const recentIds = state.recentCardIds || [];
  const completedIds = state.completedCardIds || [];
  const resolvedCrisisIds = state.crisisResolvedIds || [];
  const scheduledQueue = [...(state.scheduledCardQueue || [])];

  // 1. Explicit next card (from player choice nextCardId)
  if (explicitNextCardId && CARD_MAP.has(explicitNextCardId)) {
    const explicitCard = CARD_MAP.get(explicitNextCardId)!;
    return { card: explicitCard, nextSeed: seed, remainingScheduledQueue: scheduledQueue };
  }

  // 2. Scheduled Follow-up Queue (e.g., events scheduled by earlier choices)
  while (scheduledQueue.length > 0) {
    const scheduledId = scheduledQueue.shift()!;
    if (CARD_MAP.has(scheduledId)) {
      const scheduledCard = CARD_MAP.get(scheduledId)!;
      if (
        (scheduledCard.repeatable || !completedIds.includes(scheduledCard.id)) &&
        checkCardCondition(scheduledCard, state.storyFlags, state.currentDay, completedIds)
      ) {
        return {
          card: scheduledCard,
          nextSeed: seed,
          remainingScheduledQueue: scheduledQueue,
        };
      }
    }
  }

  // 3. Active Crisis Card
  if (
    state.crisisState &&
    CARD_MAP.has(state.crisisState.crisisCardId) &&
    !resolvedCrisisIds.includes(state.crisisState.crisisCardId)
  ) {
    const crisisCard = CARD_MAP.get(state.crisisState.crisisCardId)!;
    // Don't repeat the exact same crisis card twice in a row
    if (state.currentCardId !== crisisCard.id) {
      return { card: crisisCard, nextSeed: seed, remainingScheduledQueue: scheduledQueue };
    }
  }

  // 4. Check for Eligible Conditional Cards (High priority reactive events from past choices)
  const eligibleConditionals = CONDITIONAL_CARDS.filter(
    (c) =>
      c.act === state.currentAct &&
      !completedIds.includes(c.id) &&
      checkCardCondition(c, state.storyFlags, state.currentDay, completedIds)
  );

  // If high-priority conditional events are triggered (priority >= 125), surface them
  const urgentConditionals = eligibleConditionals.filter((c) => c.priority >= 125);
  if (urgentConditionals.length > 0) {
    urgentConditionals.sort((a, b) => b.priority - a.priority);
    return {
      card: urgentConditionals[0],
      nextSeed: seed,
      remainingScheduledQueue: scheduledQueue,
    };
  }

  // 5. Main Story Progression based on active Act
  const activeMainPool = state.isActCompleted ? [] : state.currentAct === 'ACT_II' ? ACT2_CARDS : ACT1_CARDS;
  const remainingMainCards = activeMainPool.filter(
    (c) =>
      !completedIds.includes(c.id) &&
      checkCardCondition(c, state.storyFlags, state.currentDay, completedIds)
  );

  // Interleave conditional cards and main story: If main story cards are available,
  // we present main story cards, occasionally surfacing general conditional cards
  if (remainingMainCards.length > 0) {
    remainingMainCards.sort((a, b) => b.priority - a.priority);

    // If there is an eligible conditional card, 35% chance to interleave it before next main card
    if (eligibleConditionals.length > 0) {
      const { nextVal, nextSeed } = seededRandom(seed);
      seed = nextSeed;
      if (nextVal < 0.35) {
        eligibleConditionals.sort((a, b) => b.priority - a.priority);
        return {
          card: eligibleConditionals[0],
          nextSeed: seed,
          remainingScheduledQueue: scheduledQueue,
        };
      }
    }

    return {
      card: remainingMainCards[0],
      nextSeed: seed,
      remainingScheduledQueue: scheduledQueue,
    };
  }

  // 6. Remaining Conditional Cards if main story is temporarily caught up
  if (eligibleConditionals.length > 0) {
    eligibleConditionals.sort((a, b) => b.priority - a.priority);
    return {
      card: eligibleConditionals[0],
      nextSeed: seed,
      remainingScheduledQueue: scheduledQueue,
    };
  }

  // 7. Daily / Municipal Policy Cards (Repeatable pool with 20-card Cooldown)
  // Rule: Must not have appeared within the last 20 cards
  const cooldownWindow = recentIds.slice(0, 20);

  const eligibleDailyCards = DAILY_CARDS.filter((c) => {
    // Cooldown check: cannot be in the last 20 cards
    if (cooldownWindow.includes(c.id)) return false;
    // Cannot be current card
    if (c.id === state.currentCardId) return false;
    return checkCardCondition(c, state.storyFlags, state.currentDay, completedIds);
  });

  if (eligibleDailyCards.length > 0) {
    // Avoid consecutive character dialogue if possible
    const currentCard = CARD_MAP.get(state.currentCardId);
    const nonConsecutiveDaily = eligibleDailyCards.filter(
      (c) => !currentCard || c.characterId !== currentCard.characterId
    );

    const candidates = nonConsecutiveDaily.length > 0 ? nonConsecutiveDaily : eligibleDailyCards;

    const { nextVal, nextSeed } = seededRandom(seed);
    const chosenIndex = Math.floor(nextVal * candidates.length);
    return {
      card: candidates[chosenIndex],
      nextSeed,
      remainingScheduledQueue: scheduledQueue,
    };
  }

  // 8. Card Pool Exhaustion Protocol
  // If all main story and conditionals are exhausted, check for Act Epilogue/Climax:
  if (state.currentAct === 'ACT_I' && !completedIds.includes('act1_25_act1_epilogue')) {
    const epilogue = CARD_MAP.get('act1_25_act1_epilogue');
    if (epilogue) return { card: epilogue, nextSeed: seed, remainingScheduledQueue: scheduledQueue };
  }

  if (state.currentAct === 'ACT_II' && !completedIds.includes('act2_ch3_08_act2_epilogue')) {
    const climax = CARD_MAP.get('act2_ch3_08_act2_epilogue');
    if (climax) return { card: climax, nextSeed: seed, remainingScheduledQueue: scheduledQueue };
  }

  // If daily cooldown exhausts available candidates, use LRU (Least Recently Used) Daily Card
  const allValidDaily = DAILY_CARDS.filter(
    (c) =>
      c.id !== state.currentCardId &&
      checkCardCondition(c, state.storyFlags, state.currentDay, completedIds)
  );

  if (allValidDaily.length > 0) {
    // Sort by how far back they appeared in recentIds (the larger the index, the older it was played)
    allValidDaily.sort((a, b) => {
      const indexA = recentIds.indexOf(a.id);
      const indexB = recentIds.indexOf(b.id);
      const scoreA = indexA === -1 ? 9999 : indexA;
      const scoreB = indexB === -1 ? 9999 : indexB;
      return scoreB - scoreA; // descending: largest index (oldest/never) first
    });

    return {
      card: allValidDaily[0],
      nextSeed: seed,
      remainingScheduledQueue: scheduledQueue,
    };
  }

  // Safe fallback to first card of act
  const fallback =
    state.currentAct === 'ACT_II'
      ? CARD_MAP.get('act2_ch1_01_triage_alert') || ALL_CARDS[0]
      : CARD_MAP.get('act1_01_inauguration') || ALL_CARDS[0];

  return { card: fallback, nextSeed: seed, remainingScheduledQueue: scheduledQueue };
}
