/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCard } from '../../types/game';
import { ACT1_CARDS as SOURCE_ACT1 } from './act1';
import { ACT2_CARDS as SOURCE_ACT2 } from './act2';
import { CONDITIONAL_CARDS as SOURCE_CONDITIONAL } from './conditional';
import { CRISIS_CARDS as SOURCE_CRISIS } from './crisis';
import { DAILY_CARDS as AUTHORED_DAILY_CARDS } from './daily';
import { applyBalanceAdjustment } from '../balanceAdjustments';
import { applyCharacterRevision } from '../characterRevisions';
import { applyCharacterConsistency } from '../characterConsistency';
import { applyDecisionConsistency } from '../decisionConsistency';
import { SUPERVISOR_REPLACEMENT_CARDS } from './supervisorReplacement';
import { FREE_PLAY_PROPOSALS } from './freePlay';

const ACT1_CARDS = SOURCE_ACT1.map(applyCharacterRevision).map(applyCharacterConsistency).map(applyDecisionConsistency);
const ACT2_CARDS = SOURCE_ACT2.map(applyCharacterRevision).map(applyCharacterConsistency).map(applyDecisionConsistency);
const CONDITIONAL_CARDS = SOURCE_CONDITIONAL.map(applyCharacterRevision);
const CRISIS_CARDS = SOURCE_CRISIS.map(applyCharacterRevision);
const DAILY_CARDS = AUTHORED_DAILY_CARDS.map(applyBalanceAdjustment).map(applyCharacterRevision);
export const ALL_CARDS: GameCard[] = [
  ...ACT1_CARDS,
  ...ACT2_CARDS,
  ...CONDITIONAL_CARDS,
  ...CRISIS_CARDS,
  ...DAILY_CARDS,
  ...SUPERVISOR_REPLACEMENT_CARDS,
  ...FREE_PLAY_PROPOSALS,
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
