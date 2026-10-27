/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCard } from '../../types/game';
import { ACT1_CARDS } from './act1';
import { ACT2_CARDS } from './act2';
import { CONDITIONAL_CARDS } from './conditional';
import { CRISIS_CARDS } from './crisis';
import { DAILY_CARDS } from './daily';
import { SUPERVISOR_REPLACEMENT_CARDS } from './supervisorReplacement';

export const ALL_CARDS: GameCard[] = [
  ...ACT1_CARDS,
  ...ACT2_CARDS,
  ...CONDITIONAL_CARDS,
  ...CRISIS_CARDS,
  ...DAILY_CARDS,
  ...SUPERVISOR_REPLACEMENT_CARDS,
];

export const CARD_MAP = new Map<string, GameCard>(
  ALL_CARDS.map((card) => [card.id, card])
);

export {
  ACT1_CARDS,
  ACT2_CARDS,
  CONDITIONAL_CARDS,
  CRISIS_CARDS,
  DAILY_CARDS,
  SUPERVISOR_REPLACEMENT_CARDS,
};
