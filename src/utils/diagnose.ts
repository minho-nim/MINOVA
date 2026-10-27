/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALL_CARDS, CARD_MAP } from '../data/cards';
import { ACT1_CARDS } from '../data/cards/act1';
import { ACT2_CARDS } from '../data/cards/act2';
import { CONDITIONAL_CARDS } from '../data/cards/conditional';
import { DAILY_CARDS } from '../data/cards/daily';
import { CRISIS_CARDS } from '../data/cards/crisis';
import { SUPERVISOR_REPLACEMENT_CARDS } from '../data/cards/supervisorReplacement';
import { createInitialGameState, executeDecision, startAct2 } from '../engine/gameEngine';

export function runCardDiagnosis() {
  console.log('=== CARD DIAGNOSIS REPORT ===');
  console.log(`Total ALL_CARDS: ${ALL_CARDS.length}`);
  console.log(`- ACT1_CARDS: ${ACT1_CARDS.length}`);
  console.log(`- ACT2_CARDS: ${ACT2_CARDS.length}`);
  console.log(`- CONDITIONAL_CARDS: ${CONDITIONAL_CARDS.length}`);
  console.log(`- DAILY_CARDS: ${DAILY_CARDS.length}`);
  console.log(`- CRISIS_CARDS: ${CRISIS_CARDS.length}`);
  console.log(`- SUPERVISOR_REPLACEMENT_CARDS: ${SUPERVISOR_REPLACEMENT_CARDS.length}`);

  // 1. Check ID uniqueness
  const idCounts = new Map<string, number>();
  for (const c of ALL_CARDS) {
    idCounts.set(c.id, (idCounts.get(c.id) || 0) + 1);
  }
  const duplicates = Array.from(idCounts.entries()).filter(([_, count]) => count > 1);
  console.log(`Duplicate IDs: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.error('Duplicates found:', duplicates);
  }

  // 2. Check dialogue uniqueness
  const dialogueMap = new Map<string, string[]>();
  for (const c of ALL_CARDS) {
    const text = typeof c.dialogue === 'string' ? c.dialogue : 'DYNAMIC_FN';
    if (!dialogueMap.has(text)) dialogueMap.set(text, []);
    dialogueMap.get(text)!.push(c.id);
  }
  const duplicateDialogues = Array.from(dialogueMap.entries()).filter(([txt, list]) => txt !== 'DYNAMIC_FN' && list.length > 1);
  console.log(`Duplicate Dialogues: ${duplicateDialogues.length}`);
  if (duplicateDialogues.length > 0) {
    console.warn('Duplicate dialogues:', duplicateDialogues);
  }

  // 3. Check Repeatable Cards
  const repeatableCards = ALL_CARDS.filter((c) => c.repeatable);
  console.log(`Repeatable cards: ${repeatableCards.length}`);

  // 4. Test Simulation: Run 100 choices through gameEngine
  console.log('\n--- SIMULATING 100 TURNS ---');
  let state = createInitialGameState();
  const seenCards = new Set<string>();
  const cardSequence: string[] = [];
  let immediateRepetitions = 0;
  let cooldownViolations = 0; // Daily card appearing within 20 turns of previous appearance

  const dailyHistory: { cardId: string; turn: number }[] = [];

  for (let turn = 1; turn <= 100; turn++) {
    const card = CARD_MAP.get(state.currentCardId);
    if (!card) {
      console.error(`Turn ${turn}: Card not found: ${state.currentCardId}`);
      break;
    }

    if (cardSequence.length > 0 && cardSequence[cardSequence.length - 1] === card.id) {
      immediateRepetitions++;
      console.warn(`Turn ${turn}: Immediate repetition of card ${card.id}`);
    }

    if (card.type === 'daily') {
      const prev = dailyHistory.filter((h) => h.cardId === card.id);
      if (prev.length > 0) {
        const lastTurn = prev[prev.length - 1].turn;
        const diff = turn - lastTurn;
        if (diff < 20) {
          cooldownViolations++;
          console.warn(`Turn ${turn}: Daily card ${card.id} repeated after only ${diff} turns!`);
        }
      }
      dailyHistory.push({ cardId: card.id, turn });
    }

    seenCards.add(card.id);
    cardSequence.push(card.id);

    // If Act 1 is complete and not yet in Act 2, start Act 2
    if (state.currentAct === 'ACT_I' && (state.storyFlags.act1_completed || card.id === 'act1_20_act1_epilogue')) {
      state = startAct2(state);
      continue;
    }

    // Pick alternating left/right choices to simulate varied player decisions
    const direction = turn % 2 === 0 ? 'left' : 'right';
    const result = executeDecision(state, direction);
    state = result.nextState;
  }

  console.log(`Simulation finished. Total distinct cards encountered in 100 turns: ${seenCards.size}`);
  console.log(`Immediate repetitions: ${immediateRepetitions}`);
  console.log(`Daily cooldown violations (<20 turns): ${cooldownViolations}`);
  console.log('=== END DIAGNOSIS REPORT ===');
}

runCardDiagnosis();
