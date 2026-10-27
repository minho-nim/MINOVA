/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CrisisState, ResourceDelta, ResourceId, Resources } from '../types/game';

export const RESOURCE_BOUNDS = {
  MIN: 0,
  MAX: 100,
  INITIAL: 50,
  CRISIS_LOW: 10,   // 자원 10 이하: 위기 카드 등장
  WARNING_LOW: 20,  // 자원 20 이하: 경고 상태
};

export const RESOURCE_ORDER: ResourceId[] = [
  'citizenTrust',
  'fairness',
  'personalFreedom',
  'publicSafety',
];

export const RESOURCE_META: Record<
  ResourceId,
  { label: string; icon: string; description: string; unit: string }
> = {
  citizenTrust: {
    label: '시민 신뢰',
    icon: 'Users',
    description: '시민들이 ORACLE과 인간 감독 체계의 판단을 얼마나 신뢰하는지 나타냅니다.',
    unit: '%',
  },
  fairness: {
    label: '공정성',
    icon: 'Scale',
    description: 'AI의 판단과 정책이 시민들에게 얼마나 공정하게 적용되는지 나타냅니다.',
    unit: '%',
  },
  personalFreedom: {
    label: '개인 자유',
    icon: 'Key',
    description: '시민들의 개인정보 보호, 자율성, 선택권이 얼마나 보장되는지 나타냅니다.',
    unit: '%',
  },
  publicSafety: {
    label: '사회 안전',
    icon: 'Shield',
    description: '도시의 치안, 의료, 교통 등 시민의 생명과 안전이 얼마나 보호되는지 나타냅니다.',
    unit: '%',
  },
};

export function clampResource(val: number): number {
  return Math.max(RESOURCE_BOUNDS.MIN, Math.min(RESOURCE_BOUNDS.MAX, Math.round(val)));
}

export function applyResourceDelta(current: Resources, delta: ResourceDelta): Resources {
  return {
    citizenTrust: clampResource(current.citizenTrust + (delta.citizenTrust || 0)),
    fairness: clampResource(current.fairness + (delta.fairness || 0)),
    personalFreedom: clampResource(current.personalFreedom + (delta.personalFreedom || 0)),
    publicSafety: clampResource(current.publicSafety + (delta.publicSafety || 0)),
  };
}

export function getResourceStatus(value: number): {
  level: 'critical-low' | 'warning-low' | 'stable' | 'optimal';
  text: string;
} {
  if (value <= RESOURCE_BOUNDS.CRISIS_LOW) return { level: 'critical-low', text: '위기 상태 (10 이하)' };
  if (value <= RESOURCE_BOUNDS.WARNING_LOW) return { level: 'warning-low', text: '경고 상태 (20 이하)' };
  if (value < 80) return { level: 'stable', text: '안정 구간' };
  return { level: 'optimal', text: '모범적 보장' };
}

export function detectResourceCrisis(
  resources: Resources,
  currentCrisis: CrisisState | null,
  day: number
): CrisisState | null {
  // Check for critical resources (<= 10)
  const criticalResources = RESOURCE_ORDER.filter(
    (key) => resources[key] <= RESOURCE_BOUNDS.CRISIS_LOW
  );

  // 1. Compound Crisis: If 2 or more resources are <= 10 simultaneously
  if (criticalResources.length >= 2) {
    return {
      resourceId: 'compound',
      crisisType: 'low',
      crisisCardId: 'crisis_compound_collapse',
      triggeredDay: currentCrisis?.triggeredDay || day,
      strikeCount: (currentCrisis?.strikeCount || 0) + 1,
    };
  }

  // 2. Single Resource Crisis
  if (criticalResources.length === 1) {
    const key = criticalResources[0];
    let cardId = 'crisis_trust_low';
    if (key === 'fairness') cardId = 'crisis_fairness_low';
    else if (key === 'personalFreedom') cardId = 'crisis_freedom_low';
    else if (key === 'publicSafety') cardId = 'crisis_safety_low';

    return {
      resourceId: key,
      crisisType: 'low',
      crisisCardId: cardId,
      triggeredDay: currentCrisis?.triggeredDay || day,
      strikeCount: (currentCrisis?.strikeCount || 0) + 1,
    };
  }

  return null;
}
