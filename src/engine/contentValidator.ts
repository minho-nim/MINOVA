/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALL_CARDS, CARD_MAP } from '../data/cards';
import { ACT1_ORDER, ACT2_ORDER, ACT1_END, ACT2_END } from './storyFlow';
import { ACT1_CARDS, ACT2_CARDS } from '../data/cards';
import { CHARACTERS } from '../data/characters';
import { GameCard } from '../types/game';

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalCards: number;
    storyCards: number;
    crisisCards: number;
    dailyCards: number;
    transitionCards: number;
    totalCharacters: number;
    conditionalCards: number;
  };
}

export function validateStoryContent(): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();

  let storyCards = 0;
  let crisisCards = 0;
  let dailyCards = 0;
  let transitionCards = 0;

  for (const card of ALL_CARDS) {
    // 1. Check ID uniqueness
    if (seenIds.has(card.id)) {
      errors.push(`Duplicate card ID detected: "${card.id}"`);
    }
    seenIds.add(card.id);

    // 2. Count types
    if (card.type === 'story') storyCards++;
    else if (card.type === 'crisis') crisisCards++;
    else if (card.type === 'daily') dailyCards++;
    else if (card.type === 'transition') transitionCards++;

    // 3. Check character validity
    if (!CHARACTERS[card.characterId]) {
      errors.push(`Card "${card.id}" references unknown character: "${card.characterId}"`);
    }

    // 4. Check choices exist
    if (!card.leftChoice || !card.rightChoice) {
      errors.push(`Card "${card.id}" is missing leftChoice or rightChoice`);
    }

    // 5. Check nextCardId targets
    if (card.leftChoice?.nextCardId && !CARD_MAP.has(card.leftChoice.nextCardId)) {
      errors.push(
        `Card "${card.id}" leftChoice references nonexistent card: "${card.leftChoice.nextCardId}"`,
      );
    }
    if (card.rightChoice?.nextCardId && !CARD_MAP.has(card.rightChoice.nextCardId)) {
      errors.push(
        `Card "${card.id}" rightChoice references nonexistent card: "${card.rightChoice.nextCardId}"`,
      );
    }

    // 6. Check consequence summary exists for decision history
    if (!card.leftChoice?.consequence) {
      warnings.push(`Card "${card.id}" leftChoice lacks consequence explanation text.`);
    }
    if (!card.rightChoice?.consequence) {
      warnings.push(`Card "${card.id}" rightChoice lacks consequence explanation text.`);
    }
  }

  const producerFlags = new Set(
    ALL_CARDS.flatMap((card) => [card.leftChoice, card.rightChoice]).flatMap((choice) =>
      Object.keys(choice.flags || {}),
    ),
  );
  for (const card of ALL_CARDS) {
    for (const flag of Object.keys(card.requiredFlags || {})) {
      if (!producerFlags.has(flag))
        errors.push('No choice produces required flag: ' + card.id + ':' + flag);
    }
    for (const choice of [card.leftChoice, card.rightChoice]) {
      for (const id of [choice.scheduleCardId, choice.delayedEffect?.triggerCardId].filter(Boolean))
        if (!CARD_MAP.has(id!)) errors.push('Missing follow-up: ' + card.id + ':' + id);
    }
  }
  const configured = [...ACT1_ORDER, ...ACT2_ORDER];
  if (new Set(configured).size !== configured.length) errors.push('Duplicate story ordering entry');
  for (const id of configured)
    if (!CARD_MAP.has(id)) errors.push('Missing ordered story card: ' + id);
  for (const card of [...ACT1_CARDS, ...ACT2_CARDS])
    if (!configured.includes(card.id)) errors.push('Unordered story card: ' + card.id);
  if (ACT1_ORDER.at(-1) !== ACT1_END || ACT2_ORDER.at(-1) !== ACT2_END)
    errors.push('Invalid authored epilogue boundary');

  // Verify ACT I start card exists
  if (!CARD_MAP.has('act1_01_inauguration')) {
    errors.push('Initial story card "act1_01_inauguration" is missing from CARD_MAP');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalCards: ALL_CARDS.length,
      storyCards,
      crisisCards,
      dailyCards,
      transitionCards,
      totalCharacters: Object.keys(CHARACTERS).length,
      conditionalCards: ALL_CARDS.filter((c) => c.type === 'conditional').length,
    },
  };
}
