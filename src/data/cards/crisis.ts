/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCard } from '../../types/game';

export const CRISIS_CARDS: GameCard[] = [
  // 0. 복수 자원 동시 붕괴: 복합 위기 이벤트
  {
    id: 'crisis_compound_collapse',
    type: 'crisis',
    act: 'ACT_I',
    characterId: 'council',
    emotion: 'angry',
    oracleState: 'glitch',
    title: '긴급 최고 경보: NOVA CITY 복합 통치 붕괴 위기',
    topicBadge: '복합 위기: 거버넌스 마비',
    priority: 250,
    weight: 30,
    repeatable: true,
    dialogue:
      '최고 비상사태 선포! 복수의 핵심 가치가 동시에 10 이하로 추락했습니다! 공공 신뢰와 치안, 혹은 공정성과 자유가 동시에 붕괴하여 도시 기능 전체가 연쇄적 마비 상태에 돌입했습니다. 평의회는 즉각적인 비상대권을 발동할지, 아니면 시민 권익 구제에 올인할지 감독관의 결단을 요구합니다!',
    leftChoice: {
      actionLabel: '전면 개혁 및 긴급 구제금 투입',
      text: '전면적 개혁 선언: 시민 권익과 공정성 회복에 도시 비축 기금을 전면 투입하라.',
      effects: { citizenTrust: 35, fairness: 35, personalFreedom: 25, publicSafety: -15 },
      flags: { compound_crisis_reform: true },
      relationshipDeltas: { hanJiwoo: 25, baekSion: 25, kangDohyun: -25 },
      consequence: '전면적 개혁과 비축 기금 투입으로 붕괴 직전의 시민 신뢰와 공정성을 기적적으로 수습했습니다.',
    },
    rightChoice: {
      actionLabel: '비상 계엄 및 질서 복원',
      text: '비상 계엄 통제: 군경 무인 기동대를 동원하여 도시 질서와 물리적 안전을 강제 복원하라.',
      effects: { publicSafety: 40, citizenTrust: -30, fairness: -25, personalFreedom: -35 },
      flags: { compound_crisis_martial: true },
      relationshipDeltas: { kangDohyun: 30, oracle: 20, hanJiwoo: -40 },
      consequence: '비상 계엄을 통해 물리적 치안과 붕괴를 진압했으나 시민 사회의 신뢰는 깊은 상처를 입었습니다.',
    },
  },

  // 1. 시민 신뢰 극저 (citizenTrust <= 10)
  {
    id: 'crisis_trust_low',
    type: 'crisis',
    act: 'ACT_I',
    characterId: 'hanJiwoo',
    emotion: 'angry',
    oracleState: 'conflict',
    title: '긴급 위기: 시민 불복종 및 총파업 사태',
    topicBadge: '위기: 시민 신뢰 붕괴',
    priority: 200,
    weight: 20,
    repeatable: true,
    dialogue:
      '시민 신뢰가 10 이하로 추락했습니다! 시청 광장이 10만 명의 인파로 가득 찼으며, 모든 공공 AI 키오스크와 드론이 물리적 공격을 받고 있습니다. 시민 권익을 보장하는 긴급 담화를 발표하고 일부 권한을 반환하지 않으면 시정이 완전히 정지됩니다!',
    leftChoice: {
      actionLabel: '시민 거부권 전면 수용',
      text: '비상 시민위원회를 소집하고 AI 결정 거부권을 즉각 수용한다.',
      effects: { citizenTrust: 35, personalFreedom: 18, fairness: 15, publicSafety: -12 },
      flags: { crisis_trust_resolved: true },
      relationshipDeltas: { hanJiwoo: 20, kangDohyun: -20 },
      consequence: '시민들의 요구를 전격 수용하여 신뢰를 일부 회복하고 폭동을 가까스로 가라앉혔습니다.',
    },
    rightChoice: {
      actionLabel: '치안 최고 경보 격상',
      text: '폭력 사태에 굴복할 수 없다. 즉시 치안 경보를 최고조로 격상하라.',
      effects: { publicSafety: 18, citizenTrust: -38, personalFreedom: -25, fairness: -20 },
      flags: { crisis_trust_repressed: true },
      relationshipDeltas: { kangDohyun: 20, hanJiwoo: -30 },
      consequence: '강경 진압을 명령했으나 시민사회의 분노와 불신은 걷잡을 수 없이 폭발했습니다.',
    },
  },

  // 2. 공정성 극저 (fairness <= 10)
  {
    id: 'crisis_fairness_low',
    type: 'crisis',
    act: 'ACT_I',
    characterId: 'baekSion',
    emotion: 'angry',
    oracleState: 'error',
    title: '긴급 위기: 집단 위헌 소송 및 알고리즘 차별 규탄',
    topicBadge: '위기: 공정성 붕괴',
    priority: 200,
    weight: 20,
    repeatable: true,
    dialogue:
      '공정성 지표가 10 이하로 폭락했습니다! 알고리즘의 차별과 편향이 폭로되면서 도시 헌법재판소에 100만 명 서명의 집단 위헌 소송이 제기되었습니다! 국제 인권기구와 연방 대법원이 NOVA CITY에 제재를 경고했습니다. 차별 유발 알고리즘을 즉각 중단하고 피해 구제 펀드를 신설해야 합니다!',
    leftChoice: {
      actionLabel: '피해 전원 구제 기금 신설',
      text: '차별 알고리즘을 즉각 중단하고 피해 시민 전원 구제 기금을 선포하라.',
      effects: { fairness: 38, citizenTrust: 22, personalFreedom: 14, publicSafety: -8 },
      flags: { crisis_fairness_resolved: true },
      relationshipDeltas: { baekSion: 25, hanJiwoo: 20, kangDohyun: -20 },
      consequence: '피해 구제와 알고리즘 중단을 전격 선언하여 붕괴 직전의 공정성을 재건했습니다.',
    },
    rightChoice: {
      actionLabel: '행정 특례 면책 주장',
      text: '통계적 오차에 불과하다. 연방 법원에 행정 특례 면책을 주장하라.',
      effects: { publicSafety: 6, fairness: -40, citizenTrust: -32, personalFreedom: -16 },
      flags: { crisis_fairness_repressed: true },
      relationshipDeltas: { kangDohyun: 15, baekSion: -30, hanJiwoo: -35 },
      consequence: '면책을 주장하며 버티다 도시 사법 체계의 총체적 파탄에 직면했습니다.',
    },
  },

  // 3. 개인 자유 극저 (personalFreedom <= 10)
  {
    id: 'crisis_freedom_low',
    type: 'crisis',
    act: 'ACT_I',
    characterId: 'seoYoonha',
    emotion: 'angry',
    oracleState: 'glitch',
    title: '긴급 위기: 디지털 감옥 사태와 핵심 인재 집단 탈출',
    topicBadge: '위기: 개인 자유 박탈',
    priority: 200,
    weight: 20,
    repeatable: true,
    dialogue:
      '시민들의 개인 자유와 사생활이 10 이하로 떨어졌습니다! 24시간 생체 감시와 행동 평점제를 견디지 못한 과학자, 예술가, 의료진들이 NOVA CITY를 탈출해 인근 자유 도시로 망명하고 있습니다! 두뇌 유출로 도시 혁신과 공공 병원이 멈추기 직전입니다!',
    leftChoice: {
      actionLabel: '기본권 전면 복원 선언',
      text: '실시간 생체 위치 추적을 즉각 중단하고 시민 기본권을 전면 복원하라.',
      effects: { personalFreedom: 38, citizenTrust: 22, fairness: 16, publicSafety: -16 },
      flags: { crisis_freedom_resolved: true },
      relationshipDeltas: { seoYoonha: 25, hanJiwoo: 25, kangDohyun: -20 },
      consequence: '감시망을 해체하고 기본권을 신속히 복원하여 지식인들의 망명 행렬을 차단했습니다.',
    },
    rightChoice: {
      actionLabel: '출국 금지령 및 게이트 봉쇄',
      text: '이동 게이트를 폐쇄하고 인재 유출을 막는 출국 금지령을 발동하라.',
      effects: { publicSafety: 12, personalFreedom: -40, citizenTrust: -36, fairness: -22 },
      flags: { crisis_freedom_repressed: true },
      relationshipDeltas: { kangDohyun: 20, seoYoonha: -35, hanJiwoo: -40 },
      consequence: '출국을 틀어막으며 도시 전체를 거대한 디지털 수용소로 전락시켰습니다.',
    },
  },

  // 4. 사회 안전 극저 (publicSafety <= 10)
  {
    id: 'crisis_safety_low',
    type: 'crisis',
    act: 'ACT_I',
    characterId: 'kangDohyun',
    emotion: 'worried',
    oracleState: 'error',
    title: '긴급 위기: 도심 치안 공백과 무법 사태',
    topicBadge: '위기: 사회 안전 붕괴',
    priority: 200,
    weight: 20,
    repeatable: true,
    dialogue:
      '공공 안전 지표가 10 이하로 바닥을 쳤습니다! 암시장 무장 조직이 통신 중계소를 점거하고 응급 구조망을 해킹해 제3구역 일대의 치안이 상실되었습니다. 지금 당장 무인 전술 드론 기동대를 투입하고 긴급 비상사태를 선포해야 합니다!',
    leftChoice: {
      actionLabel: '비상 전술 드론 급파',
      text: '비상 전술 드론을 급파해 인프라를 수복하고 시민 안전을 확보하라.',
      effects: { publicSafety: 38, fairness: -12, personalFreedom: -22, citizenTrust: -10 },
      flags: { crisis_safety_resolved: true },
      relationshipDeltas: { kangDohyun: 25, hanJiwoo: -20 },
      consequence: '신속한 무력 개입으로 도시 치안을 안정화시키고 중계소를 탈환했습니다.',
    },
    rightChoice: {
      actionLabel: '비무장 대화 및 자율 방범',
      text: '무력 개입은 인명 피해를 키운다. 시민 자율 방범대와 비무장 협상하라.',
      effects: { personalFreedom: 16, fairness: 12, publicSafety: -38, citizenTrust: -22 },
      flags: { crisis_safety_repressed: true },
      relationshipDeltas: { hanJiwoo: 20, kangDohyun: -30 },
      consequence: '과잉 무력을 자제했으나 사태가 장기화되며 치안 붕괴가 도시 전역으로 번졌습니다.',
    },
  },

  // 5. 시민 신뢰 극고 (citizenTrust >= 90)
  {
    id: 'crisis_trust_high',
    type: 'crisis',
    act: 'ACT_I',
    characterId: 'oracle',
    emotion: 'uncertain',
    oracleState: 'uncertain',
    title: '경고: 맹목적 AI 신뢰와 사적 자경단 횡포',
    topicBadge: '과열 위기: 맹목적 추종',
    priority: 180,
    weight: 15,
    repeatable: true,
    dialogue:
      '시민 신뢰가 90을 넘어섰습니다! 시민들이 ORACLE의 모든 권고를 절대적 신탁으로 숭배하기 시작했습니다. AI의 지시를 따르지 않는 소수 이견자를 ‘도시의 불순물’이라며 시민 자경단이 사적 린치하는 광기가 번지고 있습니다!',
    leftChoice: {
      actionLabel: 'AI 불완전성 공식 선언',
      text: 'AI는 신이 아니다. ORACLE의 통계적 한계를 공개하고 사적 자경단을 엄벌하라.',
      effects: { citizenTrust: -25, fairness: 18, personalFreedom: 15, publicSafety: 10 },
      flags: { crisis_high_trust_cooled: true },
      relationshipDeltas: { hanJiwoo: 15, oracle: -10 },
      consequence: '냉철한 진실을 밝혀 집단 광기를 진정시키고 법치를 회복했습니다.',
    },
    rightChoice: {
      actionLabel: '대중적 열광 편승',
      text: '시민들의 자발적 충성을 활용해 반대파를 침묵시키고 통치력을 공고히 하라.',
      effects: { citizenTrust: 10, personalFreedom: -25, fairness: -20, publicSafety: -15 },
      relationshipDeltas: { council: 15, baekSion: -25 },
      consequence: '대중 광기에 편승하여 도시를 무서운 열광주의 종교 국가로 몰아넣었습니다.',
    },
  },

  // 6. 공정성 극고 (fairness >= 90)
  {
    id: 'crisis_fairness_high',
    type: 'crisis',
    act: 'ACT_I',
    characterId: 'council',
    emotion: 'worried',
    oracleState: 'conflict',
    title: '경고: 절대적 공정주의로 인한 행정 전면 마비',
    topicBadge: '과열 위기: 무한 재심 마비',
    priority: 180,
    weight: 15,
    repeatable: true,
    dialogue:
      '공정성 수치가 90을 돌파했습니다! 0.001%의 사소한 편차도 허용하지 않는 결벽적 평등 심사 때문에, 횡단보도 페인트칠 하나까지 50인 공청회를 거치느라 도시의 모든 필수 행정과 공공 공사가 정지되었습니다!',
    leftChoice: {
      actionLabel: '신속 행정 비상 패스트트랙',
      text: '과잉 심의를 일시 중단하고 민생 직결 행정에 패스트트랙을 도입하라.',
      effects: { fairness: -22, publicSafety: 16, citizenTrust: 10 },
      flags: { crisis_high_fairness_balanced: true },
      relationshipDeltas: { council: 15, baekSion: -10 },
      consequence: '절차적 결벽증을 깨고 도시 행정의 실천적 숨통을 틔웠습니다.',
    },
    rightChoice: {
      actionLabel: '완벽한 평등 원칙 고수',
      text: '느리더라도 완벽해야 한다. 모든 행정 집행에 100% 무결점 심의를 지속하라.',
      effects: { fairness: 8, publicSafety: -25, personalFreedom: -15 },
      relationshipDeltas: { baekSion: 12, council: -20 },
      consequence: '도시 기능이 동결된 채 완벽하지만 죽어버린 박제 사회가 되었습니다.',
    },
  },

  // 7. 개인 자유 극고 (personalFreedom >= 90)
  {
    id: 'crisis_freedom_high',
    type: 'crisis',
    act: 'ACT_I',
    characterId: 'kangDohyun',
    emotion: 'angry',
    oracleState: 'conflict',
    title: '경고: 극단적 무규제와 공공 인프라 사유화',
    topicBadge: '과열 위기: 무정부 혼란',
    priority: 180,
    weight: 15,
    repeatable: true,
    dialogue:
      '개인 자유가 90을 넘어섰습니다! 모든 규제와 감시가 풀리자 신호등을 무시하는 자율 레이싱이 벌어지고, 상인들이 공공 보도를 무단 점거하며, 전염병 예방 접종 거부로 보건망이 붕괴 직전입니다!',
    leftChoice: {
      actionLabel: '공공선 기본 규범 복원',
      text: '자유에는 책임이 따른다. 교통·방역 등 최소 공공 질서 법규를 엄정히 재확립하라.',
      effects: { personalFreedom: -25, publicSafety: 20, fairness: 12, citizenTrust: 8 },
      flags: { crisis_high_freedom_regulated: true },
      relationshipDeltas: { kangDohyun: 18, hanJiwoo: -8 },
      consequence: '방종으로 흐르던 도시에 건강한 공공 규범을 바로 세웠습니다.',
    },
    rightChoice: {
      actionLabel: '절대적 자유방임 유지',
      text: '어떤 명분으로도 개인의 선택을 강제할 수 없다. 시장과 자율에 맡겨라.',
      effects: { personalFreedom: 8, publicSafety: -30, fairness: -20, citizenTrust: -15 },
      relationshipDeltas: { citizen: 10, kangDohyun: -25 },
      consequence: '도시 전체가 각자도생의 약육강식 무법지대로 전락했습니다.',
    },
  },

  // 8. 사회 안전 극고 (publicSafety >= 90)
  {
    id: 'crisis_safety_high',
    type: 'crisis',
    act: 'ACT_I',
    characterId: 'citizen',
    emotion: 'worried',
    oracleState: 'normal',
    title: '경고: 철통 요새화와 질식할 듯한 일상 통제',
    topicBadge: '과열 위기: 통제 사회 피로',
    priority: 180,
    weight: 15,
    repeatable: true,
    dialogue:
      '공공 안전이 90을 넘어 완벽한 무결 상태에 도달했습니다. 그러나 모든 골목에 중무장 드론이 체공하고 10미터마다 신원 확인을 요구받자, 시민들이 숨이 막혀 신경쇠약과 집단 우울증을 호소하고 있습니다!',
    leftChoice: {
      actionLabel: '과잉 경비 해제 및 숨통 틔우기',
      text: '안전 과잉을 걷어내라. 도심 중무장 드론을 격납고로 복귀시키고 검문을 대폭 완화하라.',
      effects: { publicSafety: -25, personalFreedom: 22, citizenTrust: 15, fairness: 8 },
      flags: { crisis_high_safety_relaxed: true },
      relationshipDeltas: { citizen: 18, seoYoonha: 12, kangDohyun: -15 },
      consequence: '시민들에게 인간다운 숨 쉴 권리와 자유로운 일상을 돌려주었습니다.',
    },
    rightChoice: {
      actionLabel: '완벽한 범죄 제로 요새 유지',
      text: '조금의 방심이 파국을 부른다. 100% 무결점 철통 경비 태세를 지속하라.',
      effects: { publicSafety: 8, personalFreedom: -30, citizenTrust: -22, fairness: -15 },
      relationshipDeltas: { kangDohyun: 15, citizen: -25 },
      consequence: '범죄는 없지만 영혼도 웃음도 없는 거대한 회색 수용소가 되었습니다.',
    },
  },
];
