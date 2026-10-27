/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCard } from '../../types/game';

export const SUPERVISOR_REPLACEMENT_CARDS: GameCard[] = [
  // 1. 일반 취임 오리엔테이션
  {
    id: 'supervisor_replacement_orientation',
    type: 'transition',
    act: 'ACT_I',
    characterId: 'council',
    emotion: 'neutral',
    oracleState: 'normal',
    title: '신임 AI 감독관 긴급 취임 통보',
    topicBadge: '감독관 교체',
    priority: 300,
    weight: 100,
    repeatable: true,
    dialogue: (flags) => {
      const supNum = flags.current_supervisor_number || 2;
      return `전임 감독관의 임기가 비상 사태로 전격 종료되었습니다. 귀하는 NOVA CITY 최고평의회에 의해 제${supNum}대 인간 AI 감독관으로 긴급 임명되었습니다. 이전 감독관이 발견한 감사 기록과 도시 법제는 유지되며, 자원은 비상 기금을 통해 최소 안정선으로 재조정되었습니다. 도시를 다시 이끌 준비가 되셨습니까?`;
    },
    leftChoice: {
      actionLabel: '공정성과 권익 회복 선언',
      text: '전임자의 과오를 교훈 삼아 시민의 권리와 알고리즘 공정성을 되찾겠다.',
      effects: { citizenTrust: 15, fairness: 15, personalFreedom: 10 },
      flags: { new_supervisor_vow: 'reform' },
      relationshipDeltas: { hanJiwoo: 10, seoYoonha: 10 },
      consequence: '신임 감독관으로서 공정성과 시민 신뢰 회복을 선언했습니다.',
    },
    rightChoice: {
      actionLabel: '원칙과 질서 확립 선언',
      text: '흔들림 없는 원칙과 엄격한 치안 질서로 도시를 재건하겠다.',
      effects: { publicSafety: 15, citizenTrust: 10 },
      flags: { new_supervisor_vow: 'order' },
      relationshipDeltas: { kangDohyun: 10, oracle: 10 },
      consequence: '신임 감독관으로서 도시 치안과 질서 확립을 선언했습니다.',
    },
  },

  // 2. 시민 신뢰 붕괴 후 취임
  {
    id: 'supervisor_replacement_trust',
    type: 'transition',
    act: 'ACT_I',
    characterId: 'council',
    emotion: 'worried',
    oracleState: 'conflict',
    title: '취임: 신뢰 붕괴 사태 수습 비상 감독관',
    topicBadge: '감독관 교체: 민심 수습',
    priority: 300,
    weight: 100,
    repeatable: true,
    dialogue: (flags) => {
      const supNum = flags.current_supervisor_number || 2;
      return `전임 감독관은 분노한 시민사회의 총파업과 불신임으로 불명예 파면되었습니다. 제${supNum}대 감독관인 귀하의 최우선 책무는 바닥까지 추락한 공공 시스템의 신뢰를 되살리는 것입니다. 시민 광장에 어떤 첫 메시지를 전달하시겠습니까?`;
    },
    leftChoice: {
      actionLabel: '시민 소통 및 참여정치 약속',
      text: '모든 AI 정책을 시민에게 투명하게 공개하고 상시 공청회를 열겠다.',
      effects: { citizenTrust: 25, personalFreedom: 12, fairness: 10 },
      relationshipDeltas: { hanJiwoo: 15, citizen: 15 },
      consequence: '민심을 어루만지는 전격 소통 행보로 신임 감독관의 첫발을 뗐습니다.',
    },
    rightChoice: {
      actionLabel: '신속 행정 성과로 증명',
      text: '말보다 결과다. 멈춰버린 대중교통과 도시 물류를 24시간 내 복구하겠다.',
      effects: { publicSafety: 18, citizenTrust: 14 },
      relationshipDeltas: { council: 12, kangDohyun: 10 },
      consequence: '행정 복구의 실행력을 입증하며 실용적인 신뢰를 구축했습니다.',
    },
  },

  // 3. 공정성 파탄 후 취임
  {
    id: 'supervisor_replacement_fairness',
    type: 'transition',
    act: 'ACT_I',
    characterId: 'baekSion',
    emotion: 'confident',
    oracleState: 'normal',
    title: '취임: 알고리즘 차별 청산 개혁 감독관',
    topicBadge: '감독관 교체: 사법 재건',
    priority: 300,
    weight: 100,
    repeatable: true,
    dialogue: (flags) => {
      const supNum = flags.current_supervisor_number || 2;
      return `전임자는 차별 알고리즘을 묵인하다 헌법재판소 위헌 판결로 직무 정지되었습니다. 제${supNum}대 감독관으로서, 편향된 데이터와 차별 모델을 전면 폐기하고 사법 정의를 재건하시겠습니까?`;
    },
    leftChoice: {
      actionLabel: '알고리즘 차별 제로 헌장 선포',
      text: '소수자와 약자를 배제하는 모든 코드를 전수 폐기하고 차별 제로 헌장을 제정한다.',
      effects: { fairness: 28, citizenTrust: 15, personalFreedom: 8 },
      relationshipDeltas: { baekSion: 20, hanJiwoo: 12 },
      consequence: '차별 청산을 향한 강력한 의지로 법치국가의 권위를 복원했습니다.',
    },
    rightChoice: {
      actionLabel: '균형 잡힌 데이터 리밸런싱',
      text: '전면 폐기는 시스템 마비를 부른다. 데이터 가중치를 점진적으로 보정하겠다.',
      effects: { fairness: 15, publicSafety: 12, citizenTrust: 10 },
      relationshipDeltas: { seoYoonha: 12, oracle: 8 },
      consequence: '시스템 안정성을 지키며 차분하게 편향 개선 작업에 착수했습니다.',
    },
  },

  // 4. 개인 자유 박탈 후 취임
  {
    id: 'supervisor_replacement_freedom',
    type: 'transition',
    act: 'ACT_I',
    characterId: 'seoYoonha',
    emotion: 'uncertain',
    oracleState: 'conflict',
    title: '취임: 디지털 감옥 해체와 인권 복원',
    topicBadge: '감독관 교체: 자유 회복',
    priority: 300,
    weight: 100,
    repeatable: true,
    dialogue: (flags) => {
      const supNum = flags.current_supervisor_number || 2;
      return `전임자의 무자비한 감시와 통제로 NOVA CITY는 거대한 디지털 수용소로 변질되었고 인재들이 탈출했습니다. 제${supNum}대 감독관님, 시민들의 사생활과 신체적 자유를 즉각 돌려주어야 합니다!`;
    },
    leftChoice: {
      actionLabel: '생체 감시망 해체 선언',
      text: '거리의 모든 안면인식 감시망을 끄고 시민의 일상적 자유를 전면 회복한다.',
      effects: { personalFreedom: 30, citizenTrust: 15, fairness: 10, publicSafety: -8 },
      relationshipDeltas: { seoYoonha: 18, hanJiwoo: 15 },
      consequence: '억압적인 감시 장치를 거두어내고 시민들에게 자유의 숨결을 돌려주었습니다.',
    },
    rightChoice: {
      actionLabel: '선별적 완화 및 질서 병행',
      text: '핵심 우범 지대의 보안은 유지하되 주거 구역 감시만 제한적으로 해제한다.',
      effects: { personalFreedom: 15, publicSafety: 15, citizenTrust: 10 },
      relationshipDeltas: { kangDohyun: 10, citizen: 8 },
      consequence: '치안 공백을 막으면서도 지나친 감시를 거두는 타협책을 택했습니다.',
    },
  },

  // 5. 치안 붕괴 후 취임
  {
    id: 'supervisor_replacement_safety',
    type: 'transition',
    act: 'ACT_I',
    characterId: 'kangDohyun',
    emotion: 'confident',
    oracleState: 'normal',
    title: '취임: 도심 치안 공백 수복 긴급 감독관',
    topicBadge: '감독관 교체: 치안 재건',
    priority: 300,
    weight: 100,
    repeatable: true,
    dialogue: (flags) => {
      const supNum = flags.current_supervisor_number || 2;
      return `전임자의 무기력한 대처로 암시장 조직과 폭동 세력에게 도심 거점이 장악되었습니다. 제${supNum}대 감독관님, 시민의 목숨이 경각에 달렸습니다. 도시의 물리적 치안과 안전을 최우선으로 수복하십시오!`;
    },
    leftChoice: {
      actionLabel: '신속 치안망 재건 및 시민 보호',
      text: '방어형 치안 드론을 즉각 재배치하여 병원과 주거지의 안전 통로를 확보하라.',
      effects: { publicSafety: 28, citizenTrust: 12, fairness: 8 },
      relationshipDeltas: { kangDohyun: 18, citizen: 12 },
      consequence: '무너진 안전망을 긴급 복구하여 시민들을 위협으로부터 지켰습니다.',
    },
    rightChoice: {
      actionLabel: '시민 자율 방범 연대 결성',
      text: '경찰력에만 의존하지 않고 각 구역 시민 자율 방범대에 통신과 장비를 지원한다.',
      effects: { publicSafety: 16, personalFreedom: 14, citizenTrust: 14 },
      relationshipDeltas: { citizen: 15, hanJiwoo: 10 },
      consequence: '시민 스스로 도시를 지키는 풀뿌리 안전 공동체를 일구었습니다.',
    },
  },

  // 6. 만성 위기 방치 파면 후 취임
  {
    id: 'supervisor_replacement_crisis',
    type: 'transition',
    act: 'ACT_I',
    characterId: 'council',
    emotion: 'angry',
    oracleState: 'conflict',
    title: '취임: 위기 방치 전임자 탄핵 및 비상 수습',
    topicBadge: '감독관 교체: 위기 극복',
    priority: 300,
    weight: 100,
    repeatable: true,
    dialogue: (flags) => {
      const supNum = flags.current_supervisor_number || 2;
      return `전임 감독관은 장기간 경고된 도시 위기를 해결하지 못하고 갈팡질팡하다 최고평의회에 의해 전격 탄핵되었습니다. 제${supNum}대 감독관인 귀하는 결단력과 균형 감각으로 이 난국을 돌파해야 합니다.`;
    },
    leftChoice: {
      actionLabel: '도시 4대 가치 균형 위원회 소집',
      text: '신뢰, 공정, 자유, 안전의 황금률을 세우는 비상 거버넌스 협의체를 소집한다.',
      effects: { citizenTrust: 15, fairness: 15, personalFreedom: 12, publicSafety: 12 },
      relationshipDeltas: { council: 10, baekSion: 10, hanJiwoo: 10 },
      consequence: '모든 이해관계자를 아우르는 통합적 거버넌스로 위기를 봉합했습니다.',
    },
    rightChoice: {
      actionLabel: 'ORACLE 알고리즘 구조 개편',
      text: '근본 원인은 실패한 최적화 모델에 있다. ORACLE 핵심 아키텍처를 전면 재설계한다.',
      effects: { fairness: 18, citizenTrust: 12, publicSafety: 10 },
      relationshipDeltas: { seoYoonha: 15, oracle: 5 },
      consequence: '기술적 근본 결함을 뜯어고쳐 도시 운영 시스템의 새로운 장을 열었습니다.',
    },
  },
];
