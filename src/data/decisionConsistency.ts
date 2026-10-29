import { CardDialogueContext, GameCard, StoryFlags } from '../types/game';

export const DECISION_CONSISTENCY_CARD_IDS = [
  'act1_11_education_tracking',
  'act1_13_unintended_consequence',
  'act2_ch3_05_oracle_interrogation',
  'act2_ch2_08_chapter2_resolution',
  'act2_ch3_07_final_civitas_verdict',
] as const;

// Only classify decisions whose two authored options explicitly accept or constrain
// an AI policy. Neither every right swipe nor a chapter acknowledgement is approval.
export const ORACLE_POLICY_DECISIONS = new Set([
  'act1_02_oracle_intro', 'act1_03_traffic_optimization',
  'act1_04_movement_surveillance', 'act1_05_complaint_automation',
  'act1_06_medical_triage', 'act1_07_explainability_dilemma',
  'act1_09_housing_allocation', 'act1_10_welfare_fraud_automation',
  'act1_11_education_tracking', 'act1_15_emotional_surveillance',
  'act1_16_predictive_policing', 'act1_17_recidivism_algorithm',
  'act1_23_oracle_ultimatum', 'act2_ch1_01_triage_alert',
  'act2_ch1_02_oracle_triage_rationale', 'act2_ch1_04_ai_override_request',
  'act2_ch2_02_proxy_discovery',
]);
const EXPLANATION_REQUESTS = new Set([
  'act1_02_oracle_intro', 'act1_07_explainability_dilemma', 'act2_ch1_01_triage_alert',
]);

export function summarizeOracleMemory(context?: CardDialogueContext) {
  if (!context) return { available: false, complete: false, explanationRequests: 0, approvals: 0, consecutiveApprovals: 0 };
  const seen = new Set<string>();
  const records = context.decisionHistory
    .filter(r => ORACLE_POLICY_DECISIONS.has(r.cardId) &&
      (r.direction === 'left' || r.direction === 'right') && Number.isFinite(r.day))
    .slice().sort((a, b) => a.day - b.day || a.timestamp - b.timestamp)
    .filter(r => { if (seen.has(r.cardId)) return false; seen.add(r.cardId); return true; });
  let explanationRequests = 0, approvals = 0, consecutiveApprovals = 0;
  for (const record of records) {
    if (record.direction === 'left' && EXPLANATION_REQUESTS.has(record.cardId)) explanationRequests++;
    if (record.direction === 'right') { approvals++; consecutiveApprovals++; }
    else consecutiveApprovals = 0;
  }
  const complete = [...context.completedCardIds, ...(context.skippedStoryCardIds ?? [])]
    .every(id => !ORACLE_POLICY_DECISIONS.has(id) || seen.has(id));
  return { available: true, complete, explanationRequests, approvals, consecutiveApprovals };
}

export function oracleHearingDialogue(flags: StoryFlags, context?: CardDialogueContext): string {
  const memory = summarizeOracleMemory(context);
  const record = !memory.available
    ? '판단 기록이 제공되지 않아 과거 설명 요구나 승인 횟수를 단정하지 않겠습니다.'
    : !memory.complete
      ? `판단 기록이 일부 누락되어 있습니다. 확인된 설명 요구는 최소 ${memory.explanationRequests}회, AI 정책 승인은 최소 ${memory.approvals}회입니다. 연속 승인 횟수와 확인되지 않은 선택은 단정하지 않겠습니다.`
      : `확인 가능한 AI 정책 판단 기록에서 설명 요구는 ${memory.explanationRequests}회, 승인은 ${memory.approvals}회입니다. 분류된 정책 판단 사이의 현재 연속 승인은 ${memory.consecutiveApprovals}회입니다. 이는 모든 정책에 대한 포괄적 동의가 아닙니다.`;
  const bias = flags.medical_bias_detected && flags.hiring_bias_detected
    ? '의료와 채용 모두에서 편향이 발견되었습니다. 디지털 기록이 부족한 시민을 제대로 대표하지 못한 데이터와 공통 평가 구조의 결함을 인정합니다. 과거의 정책 승인이 이 결함을 정당화하지는 않습니다.'
    : flags.medical_bias_detected
      ? '의료 데이터의 대표성 결손이 확인되었습니다. 과거의 정책 승인과 별개로 이 결함을 검토해야 합니다.'
      : flags.hiring_bias_detected
        ? '채용 평가의 편향이 확인되었습니다. 과거의 정책 승인과 별개로 이 결함을 검토해야 합니다.'
        : '기록에 없는 편향 발견이나 승인 의사를 확인된 사실로 덧붙이지 않겠습니다.';
  return `감독관님, ${record} ${bias} CIVITAS_SCORE는 인간 설계자들이 정한 목적함수와 데이터에 따라 계산되었습니다. 서로 다른 공정성 기준은 조건에 따라 충돌할 수 있지만, 그것이 차별의 면책 근거는 아닙니다. 목적함수의 설계, 자료의 검증, 집행을 승인한 기관의 책임을 각각 검토해 주십시오.`;
}

export function hiringReformImplemented(flags: StoryFlags): boolean {
  return flags.proxy_features_banned === true || flags.hiring_fairness_reformed === true;
}

export function priorSafeguards(flags: StoryFlags): string {
  const policies: string[] = [];
  if (flags.final_act1_verdict === 'human_guardrails') policies.push('ACT I에서 의결한 인간 거부권과 독립 감사');
  if (flags.medical_doctor_override_granted === true) policies.push('의료진의 임상 재평가 권한');
  else if (flags.human_override_active === true) policies.push('배제 환자에 대한 개별 재평가 이력(일반적인 의료진 거부권 승인과는 구별)');
  if (flags.audit_access_granted === true) policies.push('승인된 독립 감사 접근');
  if (flags.xai_enforced === true) policies.push('설명 가능성 검증');
  if (flags.oracle_loss_function_condemned === false) policies.push('점진적 가드레일 수립 방침');
  if (flags.shutdown_consequences_accepted === false) policies.push('코어를 가동하며 점진적으로 완화하는 방침');
  return policies.length
    ? `기존 결정에는 ${policies.join(', ')}이 포함되어 있습니다.`
    : '확인된 정책 기록에 없는 안전장치를 이미 승인했다고 간주하지 않습니다.';
}

export function applyDecisionConsistency(card: GameCard): GameCard {
  if (card.id === 'act1_13_unintended_consequence') return {
    ...card,
    title: '감시망 침투 대응: 유출 확인과 보안 보강',
    dialogue: flags => flags.surveillance_level === 'total'
      ? '감독관님! 승인된 전면 생체 감시망에서 시민 50만 명의 이동 경로와 자택 주소가 유출돼 다크웹에서 거래되고 있습니다. 확인된 피해의 구제와 감시망 운영 범위를 결정해 주십시오.'
      : flags.surveillance_level === 'restricted'
        ? '감독관님, 제한적 감시망에 침투 시도가 있었지만 최소 수집 원칙 덕분에 민감한 생체 데이터의 유출은 확인되지 않았습니다. 지금은 피해 보상이 아니라 예방적 보안 보강과 대응 정보의 공개 범위를 결정할 단계입니다.'
        : '감시망 침투 시도가 보고됐으나 기존 수집 범위와 유출 피해는 아직 확인되지 않았습니다. 확인되지 않은 피해를 전제로 보상을 집행하지 말고, 조사와 예방 조치의 범위를 결정해 주십시오.',
  };
  if (card.id === 'act2_ch3_05_oracle_interrogation') return {
    ...card, dialogue: (flags, _resources, context) => oracleHearingDialogue(flags, context),
  };
  if (card.id === 'act2_ch2_08_chapter2_resolution') {
    const previous = card.dialogue;
    return { ...card, dialogue: (flags, resources, context) =>
      (typeof previous === 'function' ? previous(flags, resources, context) : previous) +
      (hiringReformImplemented(flags)
        ? ' 채용 차별 기준을 시정하는 조치가 의결된 사실과 이번 조사 완료를 구분해 기록합니다.'
        : ' 이번에 완료한 것은 공통 지표에 대한 조사입니다. 채용 차별 기준의 시정 조치가 의결된 것으로 처리하지 않습니다.') };
  }
  if (card.id === 'act2_ch3_07_final_civitas_verdict') return {
    ...card, dialogue: flags => `NOVA CITY 최고평의회는 최종 판결에 앞서 기존 방침을 확인합니다. ${priorSafeguards(flags)} 제1안은 CIVITAS_SCORE 데이터베이스를 영구 파기하고 보편 존엄 헌장을 공포합니다. 점수 폐기와 필수 서비스 운영은 구분하며, 기존 안전장치를 유지한 채 전환을 집행합니다. 제2안은 점수를 국가 기밀로 존속시키고 ORACLE에 완전 자율 집행권을 새로 위임합니다. 이는 점진적 개혁의 자동 연장이 아니라 기존 감독 제한보다 전권 위임을 우선하는 새로운 결정입니다. 이전 선택만으로 제2안에 동의한 것으로 간주하지 않습니다.`,
  };
  return card;
}
