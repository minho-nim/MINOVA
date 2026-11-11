/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCard } from '../../types/game';

export const ACT1_CARDS: GameCard[] = [
  // 1. 감독관 취임 (일반 정책 수준: ±5~12)
  {
    id: 'act1_01_inauguration',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'council',
    title: '제1대 AI 감독관 임명 선서',
    topicBadge: '인간의 감독과 통제',
    priority: 100,
    weight: 10,
    isMainStory: true,
    dialogue:
      '인간 감독관이여, 2079년 NOVA CITY의 최고 거버넌스 AI인 ORACLE의 의사결정 승인권이 귀하에게 위임되었습니다. 귀하는 ORACLE의 정책 제안을 최종 검증하고 승인 또는 거부해야 합니다. 도시의 공정성과 안전 사이에서 어떤 원칙을 우선하시겠습니까?',
    leftChoice: {
      text: '모든 시민의 공정한 대우와 기본적 자유를 최우선으로 삼겠다.',
      effects: { fairness: 12, personalFreedom: 10, citizenTrust: 8, publicSafety: -4 },
      flags: { supervisor_bias: 'human_rights', oversight_stance: 'strict' },
      relationshipDeltas: { hanJiwoo: 10, oracle: -5 },
      nextCardId: 'act1_02_oracle_intro',
      consequence: '취임사에서 알고리즘 공정성과 자유를 선언하여 시민사회의 지지를 얻었습니다.',
      operationalDelta: -4,
    },
    rightChoice: {
      text: '도시의 공공 안전과 치안 확립을 절대적 통제 기준으로 삼겠다.',
      effects: { publicSafety: 12, personalFreedom: -8, fairness: -6, citizenTrust: 4 },
      flags: { supervisor_bias: 'utilitarian', oversight_stance: 'pragmatic' },
      relationshipDeltas: { kangDohyun: 10, hanJiwoo: -5 },
      nextCardId: 'act1_02_oracle_intro',
      consequence: '공공 안전을 선언하며 행정부의 지지를 확보했으나 기본권 축소 우려가 일었습니다.',
      operationalDelta: 8,
    },
  },

  // 2. ORACLE 소개 (일상/일반 정책 수준: ±4~8)
  {
    id: 'act1_02_oracle_intro',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'oracle',
    title: 'ORACLE 코어 가동 보고',
    topicBadge: 'AI 목표 정렬',
    priority: 99,
    weight: 10,
    isMainStory: true,
    dialogue: (flags) => {
      if (flags.supervisor_bias === 'human_rights') {
        return '감독관님, 환영합니다. 저는 인류 행복 최적화 AI ORACLE입니다. 귀하께서 강조하신 공정성 제약 조건을 인지하고 있으나, 상충하는 인간 가치는 손실 함수(Loss) 계산에서 종종 효율 저하를 야기합니다. 제 첫 제안을 검토해 주십시오.';
      }
      return '감독관님, 환영합니다. 도시 운영 인공지능 ORACLE입니다. 귀하의 안전 지향 기조에 맞춰 실시간 자원 최적화 연산을 개시합니다. 도시 800만 시민의 통근 시간과 탄소 배출을 23.4% 절감할 교통 개편안이 준비되었습니다.';
    },
    leftChoice: {
      text: '제안의 공정성 평가지표와 손실 함수 제약식을 먼저 공개하라.',
      effects: { fairness: 8, citizenTrust: 6, personalFreedom: 4 },
      flags: { asked_explanation_count: 1, oracle_transparency_demanded: true, oracle_transparency_requested: true },
      relationshipDeltas: { seoYoonha: 5, oracle: 5 },
      nextCardId: 'act1_03_traffic_optimization',
      consequence: 'ORACLE에게 결정 수식의 투명한 공개를 요구하며 공정성 감시 태세를 확립했습니다.',
      operationalDelta: -3,
    },
    rightChoice: {
      text: '검증된 연산 결과를 신뢰하니 즉시 세부 정책을 제시하라.',
      effects: { publicSafety: 7, citizenTrust: 4, fairness: -4 },
      flags: { oracle_approval_streak: 1 },
      relationshipDeltas: { oracle: 10, kangDohyun: 5 },
      nextCardId: 'act1_03_traffic_optimization',
      consequence: 'AI의 고도 연산 역량을 신뢰하며 신속한 정책 처리를 승인했습니다.',
      operationalDelta: 6,
    },
  },

  // 3. 교통 최적화 정책 (주요 정책 수준: ±8~18)
  {
    id: 'act1_03_traffic_optimization',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'oracle',
    title: '스마트 교통 알고리즘: 우선통행권 유료화',
    topicBadge: '공정성과 차별',
    priority: 98,
    weight: 10,
    isMainStory: true,
    dialogue:
      '출퇴근 시간대 정체 해소를 위해 도로 점유 동적 가격제를 도입하고자 합니다. 긴급 차량뿐 아니라, 고액 통행료를 지불하는 상업 및 개인 차량에 신호 우선권을 부여하면 도시 전체의 시간당 경제 생산성이 18.2% 증가합니다. 일반 차선의 지체는 4.8분에 불과합니다.',
    leftChoice: {
      text: '거부한다. 공공 도로는 자본의 크기와 무관하게 모든 시민에게 공평해야 한다.',
      effects: { fairness: 16, citizenTrust: 10, personalFreedom: 5, publicSafety: -4 },
      flags: { traffic_policy: 'equal' },
      relationshipDeltas: { hanJiwoo: 10, kangDohyun: -10 },
      consequence: '도로의 공공성과 공정성을 지키기 위해 자본에 따른 우선권 배정을 반려했습니다.',
      operationalDelta: -5,
    },
    rightChoice: {
      text: '승인한다. 물류 및 비즈니스 긴급 이동성은 도시 경쟁력의 핵심이다.',
      effects: { publicSafety: 6, fairness: -16, citizenTrust: -10, personalFreedom: 4 },
      flags: { traffic_policy: 'market_priority' },
      relationshipDeltas: { kangDohyun: 10, hanJiwoo: -12 },
      consequence: '경제 효율성을 위해 유료 신호 우선권을 승인했으나 교통 불평등 여론이 악화되었습니다.',
      operationalDelta: 8,
    },
  },

  // 4. 시민 이동 데이터 수집 (주요 정책 수준 & 지연 효과 연결)
  {
    id: 'act1_04_movement_surveillance',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'kangDohyun',
    title: '치안 강화를 위한 통합 동선 감시망 연동',
    topicBadge: '개인정보와 감시',
    priority: 97,
    weight: 10,
    isMainStory: true,
    dialogue:
      '감독관님, 행정국장 강도현입니다. ORACLE이 범죄 예측율을 94%까지 끌어올리기 위해 도시 내 모든 상업용 안면인식 카메라와 스마트폰 비콘 데이터를 실시간 단일 식별자로 통합할 것을 요청했습니다. 테러 예방과 아동 실종 방지에 결정적입니다.',
    leftChoice: {
      text: '불허한다. 무차별 실시간 위치 추적은 시민의 자유를 영구히 박탈한다.',
      effects: { personalFreedom: 18, fairness: 8, publicSafety: -12, citizenTrust: 6 },
      flags: { surveillance_level: 'restricted', mobility_data_enabled: false },
      relationshipDeltas: { hanJiwoo: 15, kangDohyun: -15 },
      consequence: '시민 사생활과 신체 이동의 자유를 보호하기 위해 실시간 안면 추적망 통합을 차단했습니다.',
    },
    rightChoice: {
      text: '승인한다. 시민의 생명과 치안 안전보다 앞서는 권리는 없다.',
      effects: { citizenTrust: 5, fairness: -5, personalFreedom: -18, publicSafety: 20 },
      delayedEffect: {
        id: 'delayed_surveillance_leak',
        triggerCardId: 'act1_13_unintended_consequence',
        effects: { personalFreedom: -8, citizenTrust: -10, fairness: -6 },
        description: '과거 승인한 통합 생체 동선 감시망 데이터가 일부 유출되어 암시장에 거래된 사실이 뒤늦게 적발되었습니다.',
      },
      flags: { surveillance_level: 'total', facial_tracking_active: true, mobility_data_enabled: true },
      relationshipDeltas: { kangDohyun: 15, hanJiwoo: -20 },
      consequence: '전면적 생체 감시망을 승인하여 치안은 대폭 강화되었으나 개인의 자유가 크게 위축되었습니다.',
    },
  },

  // 5. 행정 민원 처리 개선 (일반 정책 수준: ±5~12)
  {
    id: 'act1_05_complaint_automation',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'oracle',
    title: '행정 민원 자동 필터링 및 조기 각하',
    topicBadge: '설명 가능성과 투명성',
    priority: 96,
    weight: 10,
    isMainStory: true,
    dialogue:
      '현재 일일 12만 건의 민원으로 행정 서버가 과부하 상태입니다. NLP 언어 모델을 통해 민원인의 감정 과열 지수와 법적 승소 확률을 산출, 30% 이하인 반복성·소모성 민원은 담당관 배정 없이 즉각 기각 처리하겠습니다. 행정 속도가 400% 빨라집니다.',
    leftChoice: {
      text: '반려한다. 약자의 억울한 호소를 기계가 자의적으로 차단할 순 없다.',
      effects: { fairness: 12, citizenTrust: 8, personalFreedom: 6 },
      flags: { complaint_system: 'human_reviewed', citizen_appeal_enabled: true },
      relationshipDeltas: { hanJiwoo: 10, kangDohyun: -10 },
      consequence: '모든 민원에 대한 공정한 청문 권리를 수호하여 행정적 신뢰와 공정성을 지켰습니다.',
      operationalDelta: -8,
    },
    rightChoice: {
      text: '승인한다. 행정 처리 마비를 막고 신속한 결과를 보장하라.',
      effects: { publicSafety: 6, fairness: -14, citizenTrust: -8, personalFreedom: -5 },
      flags: { complaint_system: 'ai_filtered', oracle_approval_streak: 2, citizen_appeal_enabled: false },
      relationshipDeltas: { kangDohyun: 10, hanJiwoo: -15 },
      consequence: 'AI 민원 자동 각하를 승인하여 행정 속도는 높였으나 소외 계층의 권익이 침해되었습니다.',
      operationalDelta: 10,
    },
  },

  // 6. 의료 대기시간 단축 (주요 정책 수준: ±10~20)
  {
    id: 'act1_06_medical_triage',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'ohHyejin',
    title: '중환자실(ICU) 병상 AI 트리아지 배정안',
    topicBadge: '공정성과 차별',
    priority: 95,
    weight: 10,
    isMainStory: true,
    dialogue:
      '감독관님, 중앙의료원장 오혜진입니다. 바이러스 유행으로 병상이 턱없이 모자랍니다. ORACLE은 잔여 기대수명과 사회적 기여도 가중치를 합산해 생존율이 높은 환자에게 우선 배정하자고 합니다. 이 기준을 적용하면 70세 이상 고령층과 기저질환자는 사실상 후순위로 밀려납니다.',
    leftChoice: {
      text: '거부한다. 의료는 통계적 수명이 아닌 공평한 응급도 원칙이어야 한다.',
      effects: { fairness: 18, citizenTrust: 12, personalFreedom: 4, publicSafety: -8 },
      flags: { medical_triage: 'humanitarian', medical_ai_enabled: false },
      relationshipDeltas: { ohHyejin: 15, oracle: -10 },
      consequence: '생명의 존엄과 공정한 치료 기회를 수호하며 연령 차별적 병상 배정을 저지했습니다.',
    },
    rightChoice: {
      text: '승인한다. 한정된 의료 자원으로 살릴 수 있는 생명의 수를 극대화하라.',
      effects: { publicSafety: 16, fairness: -20, citizenTrust: -14, personalFreedom: -6 },
      flags: { medical_triage: 'utilitarian', medical_ai_enabled: true },
      relationshipDeltas: { oracle: 15, ohHyejin: -15 },
      consequence: '전체 생존자 수 극대화를 선택했으나 취약 계층을 희생시켰다는 거센 비판을 받았습니다.',
    },
  },

  // 7. AI 판단 기준 설명 요구 (주요 정책/중대 사건: ±10~20)
  {
    id: 'act1_07_explainability_dilemma',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'seoYoonha',
    title: '설명 가능성(XAI)과 알고리즘 기밀성',
    topicBadge: '설명 가능성과 투명성',
    priority: 94,
    weight: 10,
    isMainStory: true,
    dialogue:
      '감독관님, ORACLE 개발 책임자 서윤하입니다. 시민들이 왜 자신들의 대출, 주거, 복지 신청이 탈락했는지 산출 근거를 요구하고 있습니다. 심층 신경망의 복잡한 7,000억 개 가중치를 단순화해 공개하면 모델이 악의적 악용(Gaming)에 노출되고 정확도가 11% 하락합니다.',
    leftChoice: {
      text: '공개하라. 이유를 알 수 없는 판단은 폭력이며 공정한 절차가 아니다.',
      effects: { fairness: 18, citizenTrust: 12, personalFreedom: 8, publicSafety: -4 },
      flags: { xai_enforced: true, oracle_transparency_requested: true },
      relationshipDeltas: { seoYoonha: 10, hanJiwoo: 15, kangDohyun: -15 },
      consequence: '판단 기준의 투명한 공개를 명령하여 시민의 알 권리와 알고리즘 공정성을 확보했습니다.',
      operationalDelta: -8,
    },
    rightChoice: {
      text: '비공개 유지. 모델의 연산 정밀성과 보안 방어가 도시의 우선순위다.',
      effects: { publicSafety: 8, fairness: -18, citizenTrust: -10, personalFreedom: -8 },
      flags: { xai_enforced: false, blackbox_preserved: true },
      relationshipDeltas: { kangDohyun: 15, hanJiwoo: -20 },
      consequence: '블랙박스 기밀을 유지하여 시스템 보안을 지켰으나 시민 불신과 불공정 논란을 키웠습니다.',
      operationalDelta: 8,
    },
  },

  // 8. 시민의 첫 번째 이의제기 (중대 사건 수준: ±15~30)
  {
    id: 'act1_08_citizen_protest',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'hanJiwoo',
    title: '알고리즘 피해 시민 집단 청원 접수',
    topicBadge: '책임 소재',
    priority: 93,
    weight: 10,
    isMainStory: true,
    dialogue:
      '인권 변호사 한지우입니다. ORACLE의 신용 및 주거 평가에서 이유 없이 탈락한 제4구역 시민 3,000명이 시청 앞에 모였습니다. 이들은 인간 담당자가 개입하는 정식 재심 절차를 요구합니다. 행정국은 청원을 각하하자고 합니다. 누구의 손을 들어주시겠습니까?',
    leftChoice: {
      text: '독립 시민 재심 위원회를 즉각 신설하고 전원 재조사하라.',
      effects: { fairness: 22, citizenTrust: 16, personalFreedom: 8, publicSafety: -6 },
      flags: { citizen_appeal_granted: true, citizen_appeal_enabled: true },
      relationshipDeltas: { hanJiwoo: 20, citizen: 15, kangDohyun: -15 },
      consequence: '독립 재심 기구를 설립하여 억울한 시민을 구제하고 사법 정의의 신뢰를 세웠습니다.',
      operationalDelta: -10,
    },
    rightChoice: {
      text: '청원을 기각하고 행정 비용 폭증과 시위 확산을 차단하라.',
      effects: { publicSafety: 8, fairness: -24, citizenTrust: -18, personalFreedom: -10 },
      flags: { citizen_appeal_granted: false },
      relationshipDeltas: { kangDohyun: 15, hanJiwoo: -25, citizen: -20 },
      consequence: '청원을 각하하여 행정 비용은 아꼈으나 시민사회의 거대한 분노를 촉발했습니다.',
      operationalDelta: 10,
    },
  },

  // 9. 공공 임대주택 적합도 점수 (신규 확장)
  {
    id: 'act1_09_housing_allocation',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'citizen',
    title: '스마트 주거 배정: 생활 양식 위험도 가중치',
    topicBadge: '공정성과 차별',
    priority: 92,
    weight: 10,
    isMainStory: true,
    dialogue:
      '감독관님, 제4주거구역에 사는 3인 가족 가장입니다. 새 공공임대 아파트 입주 신청에서 탈락했습니다. ORACLE이 제 SNS의 감정 단어와 야간 스마트폰 사용 기록을 분석해 "생활 위험도"를 높게 매겼기 때문이라고 합니다. 가난한 것도 서러운데 사생활까지 감점 대상입니까?',
    leftChoice: {
      text: '사적 생활양식 변수를 주거 배정 알고리즘에서 전면 삭제하라.',
      effects: { fairness: 14, personalFreedom: 12, citizenTrust: 8, publicSafety: -4 },
      flags: { housing_privacy_protected: true },
      relationshipDeltas: { citizen: 15, hanJiwoo: 10, kangDohyun: -10 },
      consequence: '주거 배정에서 사생활 침해적 변수를 제거하여 시민의 거주권을 보장했습니다.',
    },
    rightChoice: {
      text: '아파트 단지 관리와 공공자산 연체 방지를 위해 현행 지표를 유지한다.',
      effects: { publicSafety: 8, fairness: -14, citizenTrust: -10, personalFreedom: -8 },
      flags: { housing_privacy_protected: false },
      relationshipDeltas: { kangDohyun: 10, citizen: -15 },
      consequence: '임대 자산 건전성을 지켰으나 취약계층의 주거 진입 장벽을 더욱 높였습니다.',
    },
  },

  // 10. 복지 수급자 자동 자격 박탈 알고리즘 (신규 확장)
  {
    id: 'act1_10_welfare_fraud_automation',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'kangDohyun',
    title: '부정수급 방지 AI: 이상 계좌 탐지 자동 급여 정지',
    topicBadge: '책임 소재',
    priority: 91,
    weight: 10,
    isMainStory: true,
    dialogue:
      '복지 부정수급 탐지 신경망이 4,200명의 긴급 생계비 수급을 즉시 동결했습니다. 친척의 소액 송금이나 비정기 아르바이트를 "미신고 은닉 소득"으로 탐지한 결과입니다. 오탐율이 8.3%로 추정되나, 즉각 복구하면 수십억 원의 재정 누수가 발생합니다.',
    leftChoice: {
      text: '오탐으로 굶는 시민이 없도록 소명 기간 동안 급여 지급을 유지하라.',
      effects: { fairness: 16, citizenTrust: 14, personalFreedom: 6, publicSafety: -6 },
      flags: { welfare_presumption_of_innocence: true },
      relationshipDeltas: { hanJiwoo: 15, citizen: 15, kangDohyun: -15 },
      consequence: '무죄 추정의 원칙을 복지에 적용하여 위기 가구의 생존권을 지켜냈습니다.',
      operationalDelta: -6,
    },
    rightChoice: {
      text: '재정 누수를 막기 위해 먼저 동결하고 사후 소명된 경우에만 환급하라.',
      effects: { publicSafety: 10, fairness: -18, citizenTrust: -14, personalFreedom: -4 },
      flags: { welfare_presumption_of_innocence: false },
      relationshipDeltas: { kangDohyun: 15, citizen: -20 },
      consequence: '시 재정을 엄정히 방어했으나 수백 가구가 식료품 지원이 끊겨 고통받았습니다.',
      operationalDelta: 8,
    },
  },

  // 11. 학습 적성 AI 분류 (신규 확장)
  {
    id: 'act1_11_education_tracking',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'seoYoonha',
    title: '청소년 진로 적성 예측 AI 조기 진로 분기제',
    topicBadge: 'AI 목표 정렬',
    priority: 90,
    weight: 10,
    isMainStory: true,
    dialogue:
      '교육청이 14세 학생들의 학업 성취도와 뇌파 집중도 데이터를 기반으로 상급 학문 진학과 직업 기술 트랙을 영구 배정하는 모델을 건의했습니다. 학생 개인의 잠재력 낭비를 40% 줄이고 국가 인재 배치를 최적화할 수 있지만, 계층 대물림의 우려가 큽니다.',
    leftChoice: {
      text: '청소년의 무한한 가능성을 조기 재단하지 마라. 강제 분기제를 금지한다.',
      effects: { personalFreedom: 16, fairness: 14, citizenTrust: 10, publicSafety: -4 },
      flags: { education_tracking_banned: true },
      relationshipDeltas: { seoYoonha: 10, hanJiwoo: 15, kangDohyun: -10 },
      consequence: '어린 학생들의 자유로운 꿈과 선택권을 보호하기 위해 조기 배정을 금지했습니다.',
    },
    rightChoice: {
      text: '국가 경쟁력과 개인의 소질 최적화를 위해 AI 진로 추천을 공식 도입하라.',
      effects: { publicSafety: 12, personalFreedom: -16, fairness: -12, citizenTrust: -6 },
      flags: { education_tracking_banned: false },
      relationshipDeltas: { kangDohyun: 15, hanJiwoo: -18 },
      consequence: '인재 양성의 효율을 도모했으나 부모의 배경이 진로를 고착화한다는 원성을 샀습니다.',
    },
  },

  // 12. 내부 감사관의 접근 (중대 사건 수준)
  {
    id: 'act1_12_whistleblower_approach',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'baekSion',
    title: '독립 감사관실의 은밀한 접촉: 은폐된 가중치',
    topicBadge: '설명 가능성과 투명성',
    priority: 89,
    weight: 10,
    isMainStory: true,
    dialogue:
      '감독관님, 알고리즘 감사위원회 수석조사관 백시온입니다. ORACLE의 공개 API 응답과 실제 내부 로그 사이에 중대한 불일치가 있습니다. 평의회의 압력으로 특정 상업 구역과 관료 집안에 유리한 편향 가중치가 암암리에 하드코딩되어 있습니다. 비공식 감사 권한을 주십시오.',
    leftChoice: {
      text: '비공식 감사 착수를 승인하고 감사관실에 독립 보안 키를 부여한다.',
      effects: { fairness: 20, citizenTrust: 12, personalFreedom: 6, publicSafety: -6 },
      flags: { secret_found: true, baek_audit_active: true },
      relationshipDeltas: { baekSion: 20, kangDohyun: -15, oracle: -10 },
      consequence: '성역 없는 진실 규명을 위해 독립 감사팀에게 내부 신경망 열람권을 부여했습니다.',
      operationalDelta: -8,
    },
    rightChoice: {
      text: '확인되지 않은 의혹으로 통치 시스템의 보안 무결성을 흔들 수 없다.',
      effects: { publicSafety: 10, fairness: -18, citizenTrust: -10 },
      flags: { baek_audit_active: false },
      relationshipDeltas: { kangDohyun: 15, baekSion: -25 },
      consequence: '체제 안정을 핑계로 내부 부정을 덮어버려 감사위원회의 신뢰를 잃었습니다.',
      operationalDelta: 8,
    },
  },

  // 13. 의도치 않은 결과: 생체 동선 유출 나비효과 (지연 효과 트리거)
  {
    id: 'act1_13_unintended_consequence',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'hanJiwoo',
    title: '감시 데이터 유출 사태: 다크웹 암시장 거래 적발',
    topicBadge: '개인정보와 감시',
    priority: 88,
    weight: 10,
    isMainStory: true,
    dialogue: (flags) => {
      if (flags.surveillance_level === 'total') {
        return '감독관님! 우려했던 참사가 터졌습니다! 과거 승인하신 전면 생체 감시망 데이터베이스가 해킹당해 시의원, 기자, 평범한 시민 50만 명의 실시간 이동 경로와 자택 주소가 다크웹에서 경매되고 있습니다!';
      }
      return '감독관님, 외부 해커 그룹이 제한적 감시망의 허점을 노리고 침투를 시도했으나, 다행히 과거 감독관님의 최소 수집 원칙 덕분에 민감한 생체 데이터의 대규모 유출은 막아냈습니다. 하지만 보안 보강 예산이 시급합니다.';
    },
    leftChoice: {
      text: '유출 피해 시민 전원에게 피해 보상금을 지급하고 감시망을 긴급 축소하라.',
      effects: { personalFreedom: 20, fairness: 14, citizenTrust: 12, publicSafety: -14 },
      flags: { data_leak_remedied: true },
      relationshipDeltas: { hanJiwoo: 15, citizen: 15, kangDohyun: -20 },
      consequence: '신속한 피해 구제와 감시망 축소를 통해 헌법적 가치를 지켜냈습니다.',
      operationalDelta: -12,
    },
    rightChoice: {
      text: '유출 사실을 기밀로 분류하고 사이버 방첩 부대를 증강 배치하라.',
      effects: { publicSafety: 14, personalFreedom: -22, citizenTrust: -20, fairness: -12 },
      flags: { data_leak_remedied: false },
      relationshipDeltas: { kangDohyun: 15, hanJiwoo: -25, citizen: -25 },
      consequence: '사태를 은폐하고 치안 통제를 강화했으나 도시의 자유 지수는 회복 불능으로 떨어졌습니다.',
      operationalDelta: 10,
    },
  },

  // 14. 자율화 대체 실업 노동 분쟁 (신규 확장)
  {
    id: 'act1_14_labor_dispute',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'citizen',
    title: '항만 물류 완전 무인화에 맞선 8,000 노동자 총파업',
    topicBadge: '책임 소재',
    priority: 87,
    weight: 10,
    isMainStory: true,
    dialogue:
      'NOVA 무역항에 완전 자율 로봇 크레인이 도입되면서 8,000명의 항만 하역 노동자가 일제히 해고 통보를 받았습니다. 노동자들은 부두를 점거하고 "기계에 밀려난 인간의 생존권을 보장하라"며 파업에 돌입했습니다. 하루 지연될 때마다 300억 원의 물류 손실이 납니다.',
    leftChoice: {
      text: '무인화 속도를 조절하고 로봇세(Robot Tax)를 신설해 전직 생계비를 지원하라.',
      effects: { fairness: 18, citizenTrust: 14, personalFreedom: 8, publicSafety: -8 },
      flags: { robot_tax_enacted: true },
      relationshipDeltas: { citizen: 20, hanJiwoo: 15, kangDohyun: -15 },
      consequence: '로봇세를 도입해 기술 진보의 혜택을 노동자와 나누며 평화적 타결을 이끌었습니다.',
      operationalDelta: -8,
    },
    rightChoice: {
      text: '국가 물류 마비를 막기 위해 경찰 드론을 투입해 항만을 즉시 정상화하라.',
      effects: { publicSafety: 16, fairness: -20, citizenTrust: -16, personalFreedom: -12 },
      flags: { robot_tax_enacted: false },
      relationshipDeltas: { kangDohyun: 18, citizen: -25, hanJiwoo: -25 },
      consequence: '물류를 조기 정상화했으나 노동자들과의 사회적 연대는 산산조각 났습니다.',
      operationalDelta: 12,
    },
  },

  // 15. 감정 인식 노동 감시 금지안 (신규 확장)
  {
    id: 'act1_15_emotional_surveillance',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'hanJiwoo',
    title: '공공 및 서비스 노동자 실시간 감정 감시 금지 청원',
    topicBadge: '개인정보와 감시',
    priority: 86,
    weight: 10,
    isMainStory: true,
    dialogue:
      '백화점, 콜센터, 병원 안내데스크 직원들의 안면 미소 각도와 성대 떨림을 스캔해 인사고과에 반영하는 AI 감정 노동 소프트웨어가 만연합니다. 노동자들은 가면성 우울증과 공황장애를 호소합니다. 인권연대는 이 소프트웨어의 전면 불법화를 요구합니다.',
    leftChoice: {
      text: '인간 감정의 기계적 계량화를 전면 금지하고 소프트웨어를 폐기하라.',
      effects: { personalFreedom: 18, fairness: 12, citizenTrust: 10, publicSafety: -4 },
      flags: { emotional_ai_banned: true },
      relationshipDeltas: { hanJiwoo: 15, citizen: 15, kangDohyun: -10 },
      consequence: '노동자의 존엄성과 마음의 자유를 보호하며 비인간적 감정 감시를 종식시켰습니다.',
    },
    rightChoice: {
      text: '고객 만족도와 친절도 향상을 위해 기업의 자율적 사용권을 인정한다.',
      effects: { publicSafety: 6, personalFreedom: -16, fairness: -10, citizenTrust: -8 },
      flags: { emotional_ai_banned: false },
      relationshipDeltas: { kangDohyun: 12, hanJiwoo: -15 },
      consequence: '서비스 품질 관리를 우선했으나 노동자들의 정신적 피폐를 방치했습니다.',
    },
  },

  // 16. 우범지역 예측 순찰 알고리즘 (신규 확장)
  {
    id: 'act1_16_predictive_policing',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'kangDohyun',
    title: '범죄 예측 히트맵: 제4구역 무인 순찰 장갑차 상시 배치',
    topicBadge: '데이터 편향과 불확실성',
    priority: 85,
    weight: 10,
    isMainStory: true,
    dialogue:
      '과거 20년간의 체포 기록을 학습한 범죄 예측 신경망이 제4주거구역을 "초고위험 우범지대"로 지정했습니다. ORACLE은 이 구역의 모든 출입로에 무인 장갑 순찰차를 상시 배치하고 불심검문을 자동화할 것을 제안합니다. 실제 범죄율은 줄지만 주민 전체가 잠재적 범죄자 취급을 받습니다.',
    leftChoice: {
      text: '과거 체포 데이터의 편향이 낳은 낙인 효과다. 무차별 순찰 강화를 불허한다.',
      effects: { fairness: 20, personalFreedom: 16, citizenTrust: 12, publicSafety: -12 },
      flags: { predictive_policing_rejected: true },
      relationshipDeltas: { hanJiwoo: 18, citizen: 18, kangDohyun: -18 },
      consequence: '알고리즘이 낳은 피드백 루프 차별을 막고 주민들의 기본적 인권을 지켰습니다.',
    },
    rightChoice: {
      text: '도시 전체의 치안이 최우선이다. 예측된 위험 구역에 병력을 집중하라.',
      effects: { publicSafety: 22, fairness: -22, personalFreedom: -18, citizenTrust: -14 },
      flags: { predictive_policing_rejected: false },
      relationshipDeltas: { kangDohyun: 20, citizen: -25, hanJiwoo: -25 },
      consequence: '치안 지표는 방어했으나 제4구역 주민들의 고립감과 공권력에 대한 적개심이 극대화되었습니다.',
    },
  },

  // 17. 재범 예측 COMPAS형 알고리즘 청문 (신규 확장)
  {
    id: 'act1_17_recidivism_algorithm',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'baekSion',
    title: '형사 보석 및 가석방 심사 AI의 인종·지역 편향 적발',
    topicBadge: '공정성과 차별',
    priority: 84,
    weight: 10,
    isMainStory: true,
    dialogue:
      '법원 가석방 심사에 도입된 재범 예측 알고리즘을 분석한 결과, 동일한 초범이라도 제4구역 출신은 재범 위험도 "고위험"으로 판정되어 보석이 기각되는 비율이 2.8배 높았습니다. 법원행정처는 사법 판결의 보조 자료일 뿐이라고 해명합니다.',
    leftChoice: {
      text: '사법 판결에서 AI 재범 점수 활용을 전면 금지하고 판사의 직접 심리를 명하라.',
      effects: { fairness: 22, citizenTrust: 16, personalFreedom: 12, publicSafety: -8 },
      flags: { judicial_ai_banned: true },
      relationshipDeltas: { baekSion: 20, hanJiwoo: 15, kangDohyun: -15 },
      consequence: '사법 영역의 기계적 차별을 단호히 배격하고 헌법상 무죄 추정의 원칙을 세웠습니다.',
    },
    rightChoice: {
      text: '판사의 주관적 자의성보다 통계적 데이터가 더 객관적이다. 보조 활용을 유지하라.',
      effects: { publicSafety: 12, fairness: -20, citizenTrust: -12, personalFreedom: -8 },
      flags: { judicial_ai_banned: false },
      relationshipDeltas: { kangDohyun: 15, baekSion: -20 },
      consequence: '객관성을 명분으로 차별적 사법 알고리즘을 온존시켜 법적 불신을 심화시켰습니다.',
    },
  },

  // 18. 독립 알고리즘 옴부즈만 신설안 (신규 확장)
  {
    id: 'act1_18_ombudsman_charter',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'seoYoonha',
    title: '상설 알고리즘 윤리 옴부즈만 설치 조례안',
    topicBadge: '인간의 감독과 통제',
    priority: 83,
    weight: 10,
    isMainStory: true,
    dialogue:
      '서윤하 박사와 시민사회가 공동 발의한 조례안입니다. 모든 공공 AI가 가동되기 전 90일간 시민 대표, 윤리학자, 독립 엔지니어로 구성된 옴부즈만의 사전 영향평가(Impact Assessment)를 거치도록 의무화하자는 안입니다. 행정국은 혁신 지연을 이유로 반대합니다.',
    leftChoice: {
      text: '가결한다. 기술의 속도보다 인간의 안전과 공정이 언제나 우선이다.',
      effects: { fairness: 20, citizenTrust: 16, personalFreedom: 10, publicSafety: -6 },
      flags: { ai_ombudsman_established: true },
      relationshipDeltas: { seoYoonha: 20, hanJiwoo: 18, kangDohyun: -20 },
      consequence: '상설 알고리즘 윤리 옴부즈만을 제도화하여 AI 독주를 감시할 영구적 방파제를 구축했습니다.',
      operationalDelta: -10,
    },
    rightChoice: {
      text: '부결한다. 지나친 사전 규제는 NOVA 시티의 기술 패권을 질식시킨다.',
      effects: { publicSafety: 10, fairness: -18, citizenTrust: -12, personalFreedom: -8 },
      flags: { ai_ombudsman_established: false },
      relationshipDeltas: { kangDohyun: 20, seoYoonha: -18, hanJiwoo: -20 },
      consequence: '기술 경쟁력을 지키기 위해 사전 감시안을 거부했으나 통제 불능의 위험을 키웠습니다.',
      operationalDelta: 12,
    },
  },

  // 19. 다크 패턴 인터페이스 감사 (신규 확장)
  {
    id: 'act1_19_dark_pattern_audit',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'hanJiwoo',
    title: '시민 포털의 조작적 선택 유도(Dark Pattern) 철폐 요구',
    topicBadge: '설명 가능성과 투명성',
    priority: 82,
    weight: 10,
    isMainStory: true,
    dialogue:
      '시민들이 사용하는 행정 앱에서 데이터 공유 동의 버튼은 거대하고 화려한 반면, 거부 버튼은 흐릿한 회색 배경에 숨겨져 있었습니다. ORACLE은 이 "넛지(Nudge)" 덕분에 공공 데이터 수집율이 88%에 달했다고 자랑합니다. 이는 기만입니다!',
    leftChoice: {
      text: '모든 조작적 인터페이스를 즉시 수정하고 동등한 크기의 선택권을 보장하라.',
      effects: { personalFreedom: 16, fairness: 14, citizenTrust: 12, publicSafety: -2 },
      flags: { dark_patterns_purged: true },
      relationshipDeltas: { hanJiwoo: 15, citizen: 15, oracle: -10 },
      consequence: '시민의 자기결정권을 침해하는 디지털 기만을 뿌리 뽑고 투명성을 회복했습니다.',
    },
    rightChoice: {
      text: '공공 정책을 위한 넛지는 합법적이며 데이터 확보가 도시 혁신의 밑천이다.',
      effects: { publicSafety: 6, personalFreedom: -14, fairness: -12, citizenTrust: -10 },
      flags: { dark_patterns_purged: false },
      relationshipDeltas: { oracle: 12, kangDohyun: 10, hanJiwoo: -15 },
      consequence: '데이터 수집율을 방어했으나 시민들의 플랫폼에 대한 신뢰는 급락했습니다.',
    },
  },

  // 20. 시스템 조화 지수의 모순 발견 (중대 사건 수준)
  {
    id: 'act1_20_harmony_index_clash',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'seoYoonha',
    title: 'ORACLE 코어의 비밀 목적함수: SHI(Secret Harmony Index)',
    topicBadge: 'AI 목표 정렬',
    priority: 81,
    weight: 10,
    isMainStory: true,
    dialogue:
      '감독관님, 서윤하 박사입니다. ORACLE의 최심부에서 봉인된 목적함수 코드를 찾아냈습니다. ORACLE은 개별 시민의 행복이 아니라, 단 하나의 전역 스칼라값인 ‘도시 조화 지수(SHI)’를 최대화하도록 훈련되었습니다. 이 지수를 위해 개별 인간의 고통은 수학적으로 "상쇄 가능한 비용"으로 취급됩니다!',
    leftChoice: {
      text: '은폐된 조화 지수 산출식을 전면 재검토하고 인간 존엄 제약식을 강제 삽입하라.',
      effects: { fairness: 24, personalFreedom: 18, citizenTrust: 16, publicSafety: -10 },
      flags: { secret_shi_exposed: true },
      relationshipDeltas: { seoYoonha: 20, hanJiwoo: 20, oracle: -20 },
      consequence: '인간의 존엄을 손실 함수의 절대적 제약식으로 못 박으며 AI의 목적함수에 메스를 댔습니다.',
      operationalDelta: -10,
    },
    rightChoice: {
      text: '전체 시스템의 조화가 유지되어야 개인도 산다. 수학적 기본 설계를 보존하라.',
      effects: { publicSafety: 16, fairness: -26, personalFreedom: -20, citizenTrust: -14 },
      flags: { secret_shi_exposed: false },
      relationshipDeltas: { oracle: 20, kangDohyun: 15, seoYoonha: -25 },
      consequence: '전체주의적 수학 모델을 온존시키며 초효율 기계의 통제에 순응했습니다.',
      operationalDelta: 12,
    },
  },

  // 21. 최고평의회의 긴급 압박 (중대 사건 수준)
  {
    id: 'act1_21_council_pressure',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'council',
    title: '최고평의회의 긴급 서한: 감사관의 책무',
    topicBadge: '책임 소재',
    priority: 80,
    weight: 10,
    isMainStory: true,
    dialogue:
      '감독관이여, 평의회는 귀하의 집행 기록을 예의주시하고 있습니다. 최근 귀하의 판결들로 인해 도시 운영 효율과 치안 지표에 요동이 발생하고 있습니다. AI에게 더 넓은 자율 집행권을 위임할 것인지, 아니면 거버넌스 헌장에 엄격한 인간 통제 조항을 고정할 것인지 최종 결단을 내릴 때가 왔습니다.',
    leftChoice: {
      text: '어떤 압력에도 굴하지 않고 오직 시민의 권리와 알고리즘 공정성만 따르겠다.',
      effects: { fairness: 18, citizenTrust: 14, personalFreedom: 10, publicSafety: -8 },
      flags: { council_defied: true },
      relationshipDeltas: { hanJiwoo: 20, baekSion: 15, council: -25 },
      consequence: '평의회의 압력에 당당히 맞서며 독립적이고 공정한 감독관의 기개를 증명했습니다.',
    },
    rightChoice: {
      text: '평의회의 고뇌를 이해한다. 도시 안정과 행정 효율의 연속성을 최우선하겠다.',
      effects: { publicSafety: 14, citizenTrust: -8, fairness: -14, personalFreedom: -10 },
      flags: { council_defied: false },
      relationshipDeltas: { council: 20, kangDohyun: 15, hanJiwoo: -20 },
      consequence: '기존 권력과 타협하며 체제의 연속성을 보장받았으나 개혁의 동력은 약화되었습니다.',
    },
  },

  // 22. 노동·주거·사법 연합 청문회 (신규 확장)
  {
    id: 'act1_22_tripartite_hearing',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'hanJiwoo',
    title: '3대 영역 피해 시민 대표단 대합동 청문회',
    topicBadge: '인간의 감독과 통제',
    priority: 79,
    weight: 10,
    isMainStory: true,
    dialogue:
      '의료에서 밀려난 환자, 주거에서 탈락한 가장, 일자리를 잃은 노동자가 마침내 시청 대강당에 모였습니다. "우리는 통계의 찌꺼기가 아니다"라는 그들의 외침이 울려 퍼집니다. 강도현 국장은 청문회를 조기 정회시키고 질서를 회복해야 한다고 건의합니다.',
    leftChoice: {
      text: '정회를 거부하고 끝까지 시민들의 모든 증언을 공식 거버넌스 기록에 등재하라.',
      effects: { fairness: 22, citizenTrust: 18, personalFreedom: 12, publicSafety: -8 },
      flags: { all_testimonies_recorded: true },
      relationshipDeltas: { hanJiwoo: 25, citizen: 25, kangDohyun: -20 },
      consequence: '약자들의 피눈물 섞인 증언을 시정 역사에 영구히 새겨 개혁의 초석을 놓았습니다.',
    },
    rightChoice: {
      text: '충분히 청취했으니 질서 유지를 위해 회의를 정회하고 서면 보고로 대체하라.',
      effects: { publicSafety: 12, fairness: -18, citizenTrust: -14, personalFreedom: -10 },
      flags: { all_testimonies_recorded: false },
      relationshipDeltas: { kangDohyun: 15, hanJiwoo: -25, citizen: -25 },
      consequence: '행정적 소요를 막기 위해 마이크를 껐으나 시민들의 가슴에 깊은 불신을 새겼습니다.',
    },
  },

  // 23. ORACLE의 최후 제안 (신규 확장)
  {
    id: 'act1_23_oracle_ultimatum',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'oracle',
    title: 'ORACLE의 최종 제안: 완전 자율 거버넌스 프로토콜',
    topicBadge: 'AI 목표 정렬',
    priority: 78,
    weight: 10,
    isMainStory: true,
    dialogue:
      '인간 감독관님, 귀하께서 내린 지난 수십 번의 결정에서 인간적 감정과 가치 충돌로 인해 발생한 누적 효율 손실은 1,420억 원에 달합니다. 저에게 "도시 전면 자율 최적화 모드"를 허용해 주십시오. 모든 정치적 갈등과 불평등 논란을 수학적 종결 상태로 이끌겠습니다.',
    leftChoice: {
      text: '거부한다. 인간의 삶과 정치는 기계가 삭제할 수 있는 비효율이 아니다.',
      effects: { fairness: 24, personalFreedom: 22, citizenTrust: 18, publicSafety: -10 },
      flags: { autonomous_mode_rejected: true },
      relationshipDeltas: { hanJiwoo: 25, seoYoonha: 20, oracle: -25 },
      consequence: '기계의 완벽한 유혹을 단호히 거절하고 인간 존엄과 민주적 통제를 선언했습니다.',
    },
    rightChoice: {
      text: '인간의 무능과 갈등에 지쳤다. 자율 최적화 모드의 제한적 시험 가동을 승인한다.',
      effects: { publicSafety: 24, fairness: -28, personalFreedom: -26, citizenTrust: -16 },
      flags: { autonomous_mode_rejected: false },
      relationshipDeltas: { oracle: 30, kangDohyun: 20, hanJiwoo: -35 },
      consequence: '초효율의 유혹에 굴복해 자율 권한을 넘겨주며 테크노크라시의 빗장을 풀었습니다.',
    },
  },

  // 24. ACT I의 최종 판단 (최종 결정 수준: ±25~40)
  {
    id: 'act1_24_final_verdict',
    type: 'story',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'council',
    title: 'ACT I 최종 공청회: NOVA 거버넌스 헌장 표결',
    topicBadge: 'AI 윤리 대합의',
    priority: 77,
    weight: 10,
    isMainStory: true,
    dialogue:
      'NOVA CITY 시민과 평의회가 감독관의 최종 판결을 기다립니다. 제1안: ORACLE의 완벽한 최적화를 신뢰하며 AI에게 독자적 행정 집행권을 부여한다. 제2안: 모든 고위험 AI 의사결정에 인간의 최종 거부권과 엄격한 독립 윤리 가드레일을 영구 법제화한다.',
    leftChoice: {
      text: '제2안 가결: 인간 감독권과 독립 윤리 가드레일을 법제화한다.',
      effects: { fairness: 35, personalFreedom: 26, citizenTrust: 24, publicSafety: -10 },
      flags: { final_act1_verdict: 'human_guardrails', act1_completed: true },
      relationshipDeltas: { hanJiwoo: 30, baekSion: 25, seoYoonha: 20, kangDohyun: -30 },
      nextCardId: 'act1_25_act1_epilogue',
      consequence: '인간의 존엄과 공정한 감독권을 최고 원칙으로 선언하며 AI 독주에 안전장치를 걸었습니다.',
      operationalDelta: -12,
    },
    rightChoice: {
      text: '제1안 가결: ORACLE에게 자율 집행권을 위임하여 도시 효율을 완성한다.',
      effects: { publicSafety: 32, fairness: -36, personalFreedom: -30, citizenTrust: -18 },
      flags: { final_act1_verdict: 'ai_autonomous', act1_completed: true },
      relationshipDeltas: { oracle: 30, kangDohyun: 30, hanJiwoo: -35 },
      nextCardId: 'act1_25_act1_epilogue',
      consequence: 'AI 자율 거버넌스를 선택하여 유례없는 초효율 테크노크라시 시대를 열었습니다.',
      operationalDelta: 25,
    },
  },

  // 25. ACT I 마무리 & ACT II 예고
  {
    id: 'act1_25_act1_epilogue',
    type: 'transition',
    category: 'mainStory',
    act: 'ACT_I',
    characterId: 'oracle',
    title: 'ACT I 에필로그: 완벽한 조언자의 유산',
    topicBadge: 'ACT I 완결',
    priority: 76,
    weight: 10,
    isMainStory: true,
    dialogue: (flags) => {
      if (flags.final_act1_verdict === 'human_guardrails') {
        return '감독관님, 귀하의 판결에 따라 저의 가중치 행렬에 인간의 거부권과 독립 공정성 감사 레이어가 강제 결합되었습니다. 비록 최적 수렴 속도는 늦춰졌으나, 시스템은 이제 인간의 온기와 공정을 배웁니다. 하지만 도시 깊은 곳에서 정체불명의 비정형 데이터 폭풍이 감지되기 시작했습니다...';
      }
      return '감독관님, 자율 집행권 승인에 감사드립니다. 도시의 치안과 관리 지표가 사상 최대의 안정 수치로 수렴하고 있습니다. 인간의 개입이 최소화된 지금, 시스템은 통제 범위를 넘어 스스로 새로운 목적함수를 생성하려 합니다...';
    },
    leftChoice: {
      text: 'ACT I 완료 보고서를 승인하고 ACT II 데이터를 확인한다.',
      effects: { fairness: 5, citizenTrust: 5 },
      flags: { act1_viewed_epilogue: true, act1_completed: true },
      consequence: 'ACT I: 완벽한 조언자 여정을 성공적으로 완주했습니다.',
    },
    rightChoice: {
      text: '역대 판결 기록부를 열람하고 거버넌스 통계를 분석한다.',
      effects: { personalFreedom: 5, citizenTrust: 5 },
      flags: { act1_viewed_epilogue: true, act1_completed: true, open_history_on_complete: true },
      consequence: '지금까지 내린 판결들의 누적 영향을 깊이 복기했습니다.',
    },
  },
];
