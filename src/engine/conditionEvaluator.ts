/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCard, StoryFlags } from '../types/game';

export function checkCardCondition(
  card: GameCard,
  flags: StoryFlags,
  currentDay: number,
  completedCardIds: string[]
): boolean {
  // If non-repeatable and already completed, reject
  if (!card.repeatable && completedCardIds.includes(card.id)) {
    return false;
  }

  // Min day requirement
  if (card.minDay !== undefined && currentDay < card.minDay) {
    return false;
  }

  // Excluded flags
  if (card.excludedFlags && card.excludedFlags.some((flag) => Boolean(flags[flag]))) {
    return false;
  }

  // Required flags
  if (card.requiredFlags) {
    for (const [key, expectedVal] of Object.entries(card.requiredFlags)) {
      if (flags[key] !== expectedVal) {
        return false;
      }
    }
  }

  return true;
}
