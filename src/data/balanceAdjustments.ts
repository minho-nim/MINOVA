import { GameCard } from '../types/game';

// Small, reviewed v0.3 corrections. Original content remains recoverable verbatim.
export const BALANCE_ADJUSTMENTS = {
  daily_dynamic_taxi_surge: {
    direction:'left', effects:{fairness:6,citizenTrust:6,personalFreedom:-2,publicSafety:2},
    reason:'요금 상한은 이동 접근성을 높이지만 사업자의 가격 선택권은 제한한다.',
  },
  daily_workplace_monitoring: {
    direction:'left', effects:{personalFreedom:6,citizenTrust:5,fairness:3,publicSafety:-1},
    reason:'직원 감정 감시를 금지하면 프라이버시는 회복되지만 제안된 스트레스 조기 경보도 사용하지 않는다.',
  },
  daily_school_lunch_ai: {
    direction:'left', effects:{personalFreedom:6,citizenTrust:4,fairness:3,publicSafety:-2},
    reason:'식단 선택권을 돌려주되 강제 영양 관리의 예방 효과 일부를 포기하는 선택이다.',
  },
} as const;
export function applyBalanceAdjustment(card: GameCard): GameCard {
  const adjustment = BALANCE_ADJUSTMENTS[card.id as keyof typeof BALANCE_ADJUSTMENTS];
  if(!adjustment) return card;
  const key = adjustment.direction === 'left' ? 'leftChoice' : 'rightChoice';
  return {...card,[key]:{...card[key],effects:{...adjustment.effects}}};
}
