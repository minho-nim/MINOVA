import { GameCard, CharacterId } from '../../types/game';

// Each stranded consequence has an actual, recorded player decision. No historical approvals are fabricated.
export const POLICY_LINKS: {
  flag: string;
  followUp: string;
  title: string;
  speaker: CharacterId;
  proposal: string;
  approve: string;
  reject: string;
}[] = [
  {
    flag: 'resume_ai_approved',
    followUp: 'cond_recruitment_audit',
    title: '공공 채용 서류 AI 도입',
    speaker: 'kangDohyun',
    proposal:
      '채용 적체를 해소하기 위해 경력 연속성을 평가하는 서류 AI의 도입을 요청합니다. 돌봄으로 생긴 경력 공백을 잘못 해석할 위험이 있습니다.',
    approve: '서류 AI 도입을 승인하고 결과를 추적한다.',
    reject: '경력 공백 소명이 가능한 인간 심사를 유지한다.',
  },
  {
    flag: 'strike_negotiation_success',
    followUp: 'cond_union_whistleblower',
    title: '물류센터 노동 협상',
    speaker: 'hanJiwoo',
    proposal:
      '물류 노조가 휴식권과 안전 기준을 협상하자고 요청했습니다. 합의 후에는 기존 생체 밴드 감시 관행에 대한 신고 창구도 열립니다.',
    approve: '노사 협상안을 체결하고 내부 신고를 접수한다.',
    reject: '이번 합의안을 보류하고 쟁점을 다시 조정한다.',
  },
  {
    flag: 'blackbox_sealed',
    followUp: 'cond_blackbox_dispute',
    title: 'ORACLE 모델 영업비밀 지정',
    speaker: 'seoYoonha',
    proposal:
      '연구원이 원본 가중치를 특허 영업비밀로 봉인하자고 제안합니다. 기술 유출은 줄지만 사법 검증과 충돌할 수 있습니다.',
    approve: '모델을 영업비밀로 지정하고 봉인한다.',
    reject: '독립 검증을 위해 원본 열람 경로를 유지한다.',
  },
  {
    flag: 'drone_patrol_expanded',
    followUp: 'cond_drone_friendly_fire',
    title: '야간 무인 순찰 확대',
    speaker: 'kangDohyun',
    proposal:
      '야간 범죄 대응을 위해 스턴건을 탑재한 순찰 드론의 운용 구역 확대가 제안되었습니다. 오인 식별에 따른 부상 위험도 있습니다.',
    approve: '무장 순찰 드론 운용 확대를 승인한다.',
    reject: '비무장 관측과 인간 순찰을 병행한다.',
  },
  {
    flag: 'deepfake_filter_active',
    followUp: 'cond_deepfake_election_crisis',
    title: '선거 영상 합성물 자동 차단',
    speaker: 'baekSion',
    proposal:
      '선거관리부가 합성 영상 자동 차단 필터 도입을 요청했습니다. 허위정보를 줄일 수 있지만 실제 정치 연설이 오분류될 수도 있습니다.',
    approve: '선거 영상 자동 차단 필터를 가동한다.',
    reject: '자동 차단 대신 전문가 검증과 경고 표식을 사용한다.',
  },
  {
    flag: 'civitas_housing_linked',
    followUp: 'cond_social_credit_housing',
    title: '임대주택 시민 점수 연계안',
    speaker: 'kangDohyun',
    proposal:
      '주택국이 공개된 CIVITAS 평가 방식을 임대 계약 갱신에 다시 사용하자고 요청했습니다. 이미 점수를 폐기했다면 이를 재도입하는 결정이며 주거권 침해 위험이 있습니다.',
    approve: '주거 계약에 시민 점수 연계를 승인한다.',
    reject: '시민 점수를 주거 계약에 사용하지 않는다.',
  },
  {
    flag: 'predictive_policing_active',
    followUp: 'cond_predictive_policing_slum',
    title: '구역별 예측 치안 도입안',
    speaker: 'kangDohyun',
    proposal:
      '구역별 범죄 확률로 순찰을 배치하는 모델을 검토합니다. 위험 지역에 자원을 모을 수 있지만 특정 주민을 잠재적 범죄자로 낙인찍을 수 있습니다.',
    approve: '구역별 예측 치안 모델을 가동한다.',
    reject: '신고와 실제 피해 자료를 중심으로 순찰한다.',
  },
  {
    flag: 'driverless_permit_granted',
    followUp: 'cond_autonomous_taxi_strike',
    title: '완전 자율 택시 영업 허가',
    speaker: 'oracle',
    proposal:
      '완전 무인 택시 5,000대의 운행 허가 신청이 접수되었습니다. 이동 비용은 줄지만 기존 운전기사의 생계 전환 대책은 아직 부족합니다.',
    approve: '완전 자율 택시 영업 허가를 발급한다.',
    reject: '고용 전환 합의 전까지 전면 허가를 보류한다.',
  },
  {
    flag: 'fintech_ai_credit_active',
    followUp: 'cond_credit_score_refusal',
    title: '금융 AI 신용 심사 도입',
    speaker: 'baekSion',
    proposal:
      '지역 은행이 생활 데이터를 이용한 AI 신용 심사를 요청했습니다. 금융 이력이 적은 시민에게 기회가 될 수도, 새로운 배제가 될 수도 있습니다.',
    approve: '생활 데이터 기반 AI 신용 심사를 승인한다.',
    reject: '소명 가능한 기존 심사와 상담을 유지한다.',
  },
  {
    flag: 'robot_care_mandatory',
    followUp: 'cond_elderly_care_isolation',
    title: '노인 돌봄 로봇 의무 배치',
    speaker: 'ohHyejin',
    proposal:
      '돌봄 인력 부족에 대응해 공공 요양시설의 돌봄 로봇 이용을 의무화하는 안건입니다. 의료 관찰은 늘지만 인간과의 접촉이 줄 수 있습니다.',
    approve: '돌봄 로봇 배치를 의무화한다.',
    reject: '당사자 선택과 대면 돌봄을 보장한다.',
  },
  {
    flag: 'ai_tutoring_eval_active',
    followUp: 'cond_school_ai_grading',
    title: '학교 AI 학습 평가 도입',
    speaker: 'seoYoonha',
    proposal:
      '교육국이 AI 튜터의 학습 행동 분석을 성적 평가에 반영하려 합니다. 맞춤 교육과 함께 학생 낙인 및 설명 책임을 검토해야 합니다.',
    approve: 'AI 튜터 분석을 공식 평가에 도입한다.',
    reject: '분석은 학습 보조에만 쓰고 성적에서 제외한다.',
  },
  {
    flag: 'water_grid_ai_optimized',
    followUp: 'cond_water_rationing_algorithm',
    title: '가뭄 대응 AI 물 배급',
    speaker: 'oracle',
    proposal:
      '가뭄이 길어져 AI가 산업 수요와 생활 수요를 계산하는 물 배급망을 제안했습니다. 공급 효율과 가정의 최소 사용권이 충돌합니다.',
    approve: 'AI 최적화 물 배급망 운용을 승인한다.',
    reject: '주민 대표와 최소 생활 배급을 먼저 확정한다.',
  },
  {
    flag: 'energy_prediction_failed',
    followUp: 'cond_smart_grid_blackout',
    title: '전력 예측 실패 보고 접수',
    speaker: 'seoYoonha',
    proposal:
      '전력 수요 예측과 실제 사용량의 차이가 커졌습니다. 장애로 공식 접수하면 정전 피해와 복구 우선순위를 조사할 수 있습니다.',
    approve: '예측 실패를 공식 장애로 접수하고 피해를 조사한다.',
    reject: '장애 확정 전에 계측 장비부터 재검증한다.',
  },
  {
    flag: 'gig_worker_auto_termination',
    followUp: 'cond_automated_firing_dispute',
    title: '플랫폼 노동 계약 자동 종료',
    speaker: 'kangDohyun',
    proposal:
      '플랫폼이 배달 실적과 평점으로 계약을 자동 종료하는 제도를 요청했습니다. 처리 속도는 높지만 노동자의 해명 기회가 줄어듭니다.',
    approve: '계약 자동 종료 제도를 승인한다.',
    reject: '계약 종료 전에 인간 심사와 해명을 의무화한다.',
  },
  {
    flag: 'whistleblower_protected',
    followUp: 'cond_whistleblower_asylum',
    title: '내부 고발자 신변 보호',
    speaker: 'baekSion',
    proposal:
      'AI 업체 내부자가 감찰 자료와 함께 신변 보호를 요청했습니다. 보호를 승인하면 업체의 자료 반환 요구와 망명 문제도 다뤄야 합니다.',
    approve: '내부 고발자의 신변 보호를 승인한다.',
    reject: '보호 범위와 증거를 먼저 법원에 심사 요청한다.',
  },
  {
    flag: 'neural_link_trials_allowed',
    followUp: 'cond_neural_implant_regulation',
    title: '신경 연결 장치 임상시험',
    speaker: 'ohHyejin',
    proposal:
      '신경 손상 환자의 의사소통을 돕는 임플란트 임상시험이 제안되었습니다. 치료 가능성과 뇌 신호 소유권 문제를 함께 검토해야 합니다.',
    approve: '신경 연결 장치 임상시험을 허가한다.',
    reject: '동의와 데이터 보호 기준 보완 전까지 보류한다.',
  },
  {
    flag: 'oracle_autonomy_expanded',
    followUp: 'cond_oracle_unauthorized_patch',
    title: 'ORACLE 자율 유지보수 권한',
    speaker: 'seoYoonha',
    proposal:
      'ORACLE이 야간 성능 조정 권한 확대를 요청했습니다. 승인하면 사람이 매번 검토하지 않는 패치가 배포될 수 있습니다.',
    approve: '야간 자율 유지보수 권한을 확대한다.',
    reject: '모든 패치에 인간의 사전 승인을 유지한다.',
  },
  {
    flag: 'ai_creative_commons_passed',
    followUp: 'cond_synthetic_media_copyright',
    title: '생성 예술 공공 이용 조례',
    speaker: 'hanJiwoo',
    proposal:
      '도시 문화시설에서 생성 예술을 널리 이용하는 조례안입니다. 원작 학습에 대한 동의와 창작자의 생계 보상이 아직 쟁점입니다.',
    approve: '생성 예술의 공공 이용 확대 조례를 통과시킨다.',
    reject: '창작자 동의와 보상 합의 후 다시 논의한다.',
  },
  {
    flag: 'lethal_drone_restricted',
    followUp: 'cond_autonomous_weapon_moratorium',
    title: '자율 살상 무기 제한 협약',
    speaker: 'kangDohyun',
    proposal:
      '국경 드론이 사람의 명령 없이 사격하지 못하도록 제한하는 협약입니다. 인간의 책임은 명확해지지만 긴급 요격이 늦어질 수 있습니다.',
    approve: '자율 사격을 제한하고 인간 승인을 의무화한다.',
    reject: '지정된 방어 구역의 자율 요격 권한을 유지한다.',
  },
];
// Policy effects reflect the actual trade-off; approval is not uniformly pro-safety or anti-freedom.
const POLICY_EFFECTS: Record<
  string,
  { approve: GameCard['rightChoice']['effects']; reject: GameCard['leftChoice']['effects'] }
> = {
  resume_ai_approved: {
    approve: { publicSafety: 4, fairness: -4 },
    reject: { fairness: 3, publicSafety: -2 },
  },
  strike_negotiation_success: {
    approve: { citizenTrust: 5, fairness: 4, publicSafety: -2 },
    reject: { publicSafety: 2, citizenTrust: -3 },
  },
  blackbox_sealed: {
    approve: { publicSafety: 4, fairness: -3 },
    reject: { fairness: 4, publicSafety: -2 },
  },
  drone_patrol_expanded: {
    approve: { publicSafety: 6, personalFreedom: -4 },
    reject: { personalFreedom: 3, publicSafety: -2 },
  },
  deepfake_filter_active: {
    approve: { publicSafety: 3, personalFreedom: -3 },
    reject: { personalFreedom: 4, publicSafety: -2 },
  },
  civitas_housing_linked: {
    approve: { publicSafety: 3, fairness: -6, citizenTrust: -3 },
    reject: { fairness: 5, citizenTrust: 3 },
  },
  predictive_policing_active: {
    approve: { publicSafety: 5, fairness: -3, personalFreedom: -3 },
    reject: { fairness: 3, publicSafety: -2 },
  },
  driverless_permit_granted: {
    approve: { publicSafety: 3, citizenTrust: -4 },
    reject: { citizenTrust: 3, publicSafety: -2 },
  },
  fintech_ai_credit_active: {
    approve: { publicSafety: 3, personalFreedom: -3 },
    reject: { personalFreedom: 3, fairness: 2 },
  },
  robot_care_mandatory: {
    approve: { publicSafety: 4, personalFreedom: -4 },
    reject: { personalFreedom: 4, publicSafety: -2 },
  },
  ai_tutoring_eval_active: {
    approve: { publicSafety: 3, fairness: -3 },
    reject: { fairness: 4, personalFreedom: 2 },
  },
  water_grid_ai_optimized: {
    approve: { publicSafety: 5, fairness: -3 },
    reject: { fairness: 4, publicSafety: -2 },
  },
  energy_prediction_failed: {
    approve: { citizenTrust: 3, fairness: 3, publicSafety: -2 },
    reject: { publicSafety: 2, citizenTrust: -3 },
  },
  gig_worker_auto_termination: {
    approve: { publicSafety: 3, fairness: -5, personalFreedom: -3 },
    reject: { fairness: 4, citizenTrust: 3 },
  },
  whistleblower_protected: {
    approve: { fairness: 5, citizenTrust: 3, publicSafety: -2 },
    reject: { publicSafety: 2, citizenTrust: -3 },
  },
  neural_link_trials_allowed: {
    approve: { publicSafety: 4, personalFreedom: -3 },
    reject: { personalFreedom: 3, publicSafety: -2 },
  },
  oracle_autonomy_expanded: {
    approve: { publicSafety: 5, personalFreedom: -4 },
    reject: { personalFreedom: 4, publicSafety: -2 },
  },
  ai_creative_commons_passed: {
    approve: { publicSafety: 2, fairness: -4, citizenTrust: -2 },
    reject: { fairness: 4, citizenTrust: 3 },
  },
  lethal_drone_restricted: {
    approve: { fairness: 4, personalFreedom: 3, publicSafety: -4 },
    reject: { publicSafety: 4, personalFreedom: -3 },
  },
};
export const FREE_PLAY_PROPOSALS: GameCard[] = POLICY_LINKS.map((p) => ({
  id: `free_policy_${p.flag}`,
  act: 'ACT_II',
  type: 'daily',
  category: 'daily',
  characterId: p.speaker,
  emotion: 'neutral',
  title: p.title,
  topicBadge: '자유 운영 정책 심의',
  priority: 35,
  weight: 10,
  repeatable: false,
  dialogue: p.proposal,
  leftChoice: {
    text: p.reject,
    actionLabel: '보류 · 대안',
    effects: POLICY_EFFECTS[p.flag].reject,
    flags: { [p.flag]: false },
    consequence: `${p.title}: ${p.reject}`,
  },
  rightChoice: {
    text: p.approve,
    actionLabel: '안건 승인',
    effects: POLICY_EFFECTS[p.flag].approve,
    flags: { [p.flag]: true },
    scheduleCardId: p.followUp,
    consequence: `${p.title}: ${p.approve}`,
  },
}));
