import { GameState, ResourceDelta } from '../types/game';
import { RESOURCE_ORDER } from '../engine/resourceEngine';

export interface DecisionFeedbackData {
  id: string;
  title: string;
  summary: string;
  delta: ResourceDelta;
  adjustment: string | null;
}

// Compare the displayed totals, including caps, delayed effects and recovery.
export function getDecisionFeedback(before: GameState, after: GameState): DecisionFeedbackData | null {
  const decision = after.decisionHistory[0];
  if (!decision || decision.id === before.decisionHistory[0]?.id) return null;
  const delta: ResourceDelta = {};
  for (const key of RESOURCE_ORDER) {
    const change = after.resources[key] - before.resources[key];
    if (change !== 0) delta[key] = change;
  }
  const replacement = after.supervisorNumber !== before.supervisorNumber;
  return {
    id: decision.id,
    title: decision.cardTitle,
    summary: decision.consequenceSummary,
    delta,
    adjustment: replacement
      ? '감독관 교체에 따른 지표 회복을 포함한 변화입니다.'
      : decision.delayedEffectApplied || decision.delayedEffectsApplied?.length
      ? '이전 결정의 후속 효과를 포함한 변화입니다.'
      : null,
  };
}
