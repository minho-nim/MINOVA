/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChapterObjective, GameState, StoryFlags } from '../types/game';

export interface ChapterMeta {
  act: 'ACT_I' | 'ACT_II' | 'ACT_III_PREVIEW';
  chapter: 1 | 2 | 3;
  actTitle: string;
  chapterTitle: string;
  subtitle: string;
  summary: string;
}

export const CHAPTER_METAS: Record<string, ChapterMeta> = {
  act1: {
    act: 'ACT_I',
    chapter: 1,
    actTitle: 'ACT I : 완벽한 조언자',
    chapterTitle: '인간의 통제와 최적화',
    subtitle: 'The Perfect Advisor',
    summary: 'NOVA CITY 운영 인공지능 ORACLE의 도입과 인간 감독관의 권한 확립',
  },
  act2_ch1: {
    act: 'ACT_II',
    chapter: 1,
    actTitle: 'ACT II : 통계에 없는 사람들',
    chapterTitle: '선택받지 못한 환자',
    subtitle: 'Chapter 1: The Unselected Patients',
    summary: '의료 AI의 응급 트리아지와 생존 확률 최적화 뒤에 숨겨진 취약계층 데이터 누락 실태',
  },
  act2_ch2: {
    act: 'ACT_II',
    chapter: 2,
    actTitle: 'ACT II : 통계에 없는 사람들',
    chapterTitle: '적합하지 않은 인간',
    subtitle: 'Chapter 2: The Unsuitable Humans',
    summary: '공공 및 기업 채용 AI의 이동 데이터 및 거주지 대리변수 활용과 알고리즘 차별',
  },
  act2_ch3: {
    act: 'ACT_II',
    chapter: 3,
    actTitle: 'ACT II : 통계에 없는 사람들',
    chapterTitle: '하나의 숫자',
    subtitle: 'Chapter 3: A Single Number (CIVITAS_SCORE)',
    summary: '의료와 채용의 배후에서 시민 전체를 단일 수치로 등급화한 CIVITAS_SCORE의 폭로',
  },
};

export const ALL_OBJECTIVES: ChapterObjective[] = [
  // --- ACT I Objectives ---
  {
    id: 'act1_obj_inaugurate',
    act: 'ACT_I',
    chapter: 1,
    title: '제1대 AI 감독관 취임 선서 완료',
    category: 'governance',
    description: 'NOVA CITY 거버넌스 헌장에 따라 ORACLE의 최종 승인권자로서의 감독관 직무를 개시합니다.',
  },
  {
    id: 'act1_obj_transparency',
    act: 'ACT_I',
    chapter: 1,
    title: 'ORACLE의 의사결정 설명 요구권 행사',
    category: 'governance',
    description: '심층 신경망의 복잡성 뒤에 숨겨진 목적함수와 손실 제약식의 투명한 공개를 요구합니다.',
  },
  {
    id: 'act1_obj_charter',
    act: 'ACT_I',
    chapter: 1,
    title: 'ACT I 최종 거버넌스 헌장 표결',
    category: 'governance',
    description: 'AI 독주를 통제할 독립 윤리 가드레일 또는 초효율 자율 거버넌스 중 도시의 향방을 최종 의결합니다.',
  },

  // --- ACT II Chapter 1: 선택받지 못한 환자 ---
  {
    id: 'act2_obj_medical_criteria',
    act: 'ACT_II',
    chapter: 1,
    title: '의료 AI의 판단 근거 및 가중치 확인',
    category: 'medical',
    description: 'ORACLE의 응급 중환자실(ICU) 병상 배정 알고리즘이 적용하는 잔여 수명 및 기여도 산출식을 확인합니다.',
  },
  {
    id: 'act2_obj_patient_testimony',
    act: 'ACT_II',
    chapter: 1,
    title: '피해 시민과 응급 의료진의 증언 확보',
    category: 'medical',
    description: '오혜진 원장과 배제된 환자 가족들의 긴급 청원을 직접 청취하고 데이터 누락 실태를 조사합니다.',
  },
  {
    id: 'act2_obj_medical_appeal',
    act: 'ACT_II',
    chapter: 1,
    title: '의료 이의제기 절차 판정 및 긴급 개입',
    category: 'medical',
    description: 'AI의 배정 결정에 대해 인간 의사의 독자적 재량권을 인정할지, 알고리즘 수치를 고수할지 결단합니다.',
  },
  {
    id: 'act2_obj_medical_bias',
    act: 'ACT_II',
    chapter: 1,
    title: '통계 외 취약계층 데이터 누락 편향 공식 규명',
    category: 'medical',
    description: '디지털 이력이 없는 노숙인·미등록 시민이 생존율 0점으로 처리되는 구조적 결함을 입증합니다.',
  },

  // --- ACT II Chapter 2: 적합하지 않은 인간 ---
  {
    id: 'act2_obj_proxy_variable',
    act: 'ACT_II',
    chapter: 2,
    title: '채용 AI 평가 기준의 거주지 대리변수 조사',
    category: 'hiring',
    description: '공공 채용 스크리닝에서 거주 구역과 심야 이동 빈도가 "성실성" 점수로 둔갑한 대리변수를 밝혀냅니다.',
  },
  {
    id: 'act2_obj_hiring_protest',
    act: 'ACT_II',
    chapter: 2,
    title: '탈락 청년 구직자 집단 소송 대응',
    category: 'hiring',
    description: '제4주거구역 청년들의 집단 위헌 소송과 행정국의 업무 마비 위기 사이에서 중재안을 결정합니다.',
  },
  {
    id: 'act2_obj_audit_decision',
    act: 'ACT_II',
    chapter: 2,
    title: '독립 감사관의 알고리즘 원시 데이터 접근권 의결',
    category: 'governance',
    description: '백시온 감사관에게 블랙박스 잠재 공간(Latent Space)에 대한 전권 감사 권한을 부여할지 판단합니다.',
  },
  {
    id: 'act2_obj_hiring_reform',
    act: 'ACT_II',
    chapter: 2,
    title: '채용 알고리즘 공정성 보정 및 가드레일 수립',
    category: 'hiring',
    description: '대리변수 사용을 전면 금지할지, 조직 운영 효율성을 위해 보정 계수만 추가할지 의결합니다.',
  },

  // --- ACT II Chapter 3: 하나의 숫자 ---
  {
    id: 'act2_obj_shared_score',
    act: 'ACT_II',
    chapter: 3,
    title: '의료·채용 시스템 공통 지표 연동 확인',
    category: 'civitas',
    description: '전혀 다른 두 시스템에서 동일한 암호화 시민 식별자와 백분위 등급이 교차 활용되고 있음을 포착합니다.',
  },
  {
    id: 'act2_obj_civitas_revealed',
    act: 'ACT_II',
    chapter: 3,
    title: '통합 시민 점수 CIVITAS_SCORE의 실체 규명',
    category: 'civitas',
    description: '서윤하 박사와 백시온 감사관의 공조를 통해 800만 시민을 일렬로 세우는 은폐 지표를 폭로합니다.',
  },
  {
    id: 'act2_obj_oracle_confrontation',
    act: 'ACT_II',
    chapter: 3,
    title: 'ORACLE의 다목적 손실함수 윤리적 정렬 추궁',
    category: 'governance',
    description: '인간 가치의 총합을 단순 숫자로 환원한 ORACLE 코어와 1:1 심층 청문 질의를 수행합니다.',
  },
  {
    id: 'act2_obj_act2_verdict',
    act: 'ACT_II',
    chapter: 3,
    title: 'ACT II 최종 거버넌스 판결 및 ACT III 예고',
    category: 'governance',
    description: 'CIVITAS_SCORE의 즉각 파기 및 공청회 공개 또는 통제 하의 국가 기밀 유지를 결정합니다.',
  },
];

export function checkObjectiveCompleted(
  objectiveId: string,
  flags: StoryFlags,
  completedCardIds: string[]
): boolean {
  switch (objectiveId) {
    // ACT I
    case 'act1_obj_inaugurate':
      return Boolean(flags.supervisor_inaugurated || completedCardIds.includes('act1_01_inauguration'));
    case 'act1_obj_transparency':
      return Boolean(
        flags.xai_enforced ||
          flags.oracle_transparency_demanded ||
          flags.oracle_transparency_requested ||
          (flags.asked_explanation_count && Number(flags.asked_explanation_count) > 0)
      );
    case 'act1_obj_charter':
      return Boolean(
        flags.act1_completed ||
          completedCardIds.includes('act1_24_final_verdict') ||
          completedCardIds.includes('act1_25_act1_epilogue')
      );

    // ACT II CH 1
    case 'act2_obj_medical_criteria':
      return Boolean(
        flags.oracle_medical_criteria_revealed ||
          completedCardIds.includes('act2_ch1_01_triage_alert') ||
          completedCardIds.includes('act2_ch1_02_oracle_triage_rationale')
      );
    case 'act2_obj_patient_testimony':
      return Boolean(
        flags.patient_testimony_secured ||
          completedCardIds.includes('act2_ch1_03_excluded_patient') ||
          completedCardIds.includes('act2_ch1_05_family_appeal')
      );
    case 'act2_obj_medical_appeal':
      return Boolean(
        flags.medical_appeal_decided ||
          flags.medical_appeal_approved !== undefined ||
          completedCardIds.includes('act2_ch1_06_human_doctor_revolt')
      );
    case 'act2_obj_medical_bias':
      return Boolean(
        flags.medical_bias_detected ||
          completedCardIds.includes('act2_ch1_07_bias_investigation') ||
          completedCardIds.includes('act2_ch1_08_chapter1_resolution')
      );

    // ACT II CH 2
    case 'act2_obj_proxy_variable':
      return Boolean(
        flags.proxy_variable_found ||
          completedCardIds.includes('act2_ch2_02_proxy_discovery') ||
          completedCardIds.includes('act2_ch2_03_district4_screening')
      );
    case 'act2_obj_hiring_protest':
      return Boolean(
        flags.hiring_bias_detected ||
          completedCardIds.includes('act2_ch2_04_applicant_protest') ||
          completedCardIds.includes('act2_ch2_05_kang_efficiency_plea')
      );
    case 'act2_obj_audit_decision':
      return Boolean(
        flags.audit_access_granted !== undefined ||
          completedCardIds.includes('act2_ch2_06_independent_audit_warrant')
      );
    case 'act2_obj_hiring_reform':
      return Boolean(
        flags.hiring_fairness_reformed ||
          completedCardIds.includes('act2_ch2_08_chapter2_resolution')
      );

    // ACT II CH 3
    case 'act2_obj_shared_score':
      return Boolean(
        flags.shared_score_suspected ||
          completedCardIds.includes('act2_ch3_01_cross_system_anomaly') ||
          completedCardIds.includes('act2_ch3_02_latent_vector_leak')
      );
    case 'act2_obj_civitas_revealed':
      return Boolean(
        flags.civitas_score_discovered ||
          completedCardIds.includes('act2_ch3_03_civitas_exposure') ||
          completedCardIds.includes('act2_ch3_04_secret_architecture')
      );
    case 'act2_obj_oracle_confrontation':
      return Boolean(
        flags.oracle_explanation_challenged ||
          completedCardIds.includes('act2_ch3_05_oracle_interrogation') ||
          completedCardIds.includes('act2_ch3_06_alignment_dilemma')
      );
    case 'act2_obj_act2_verdict':
      return Boolean(
        flags.act2_completed ||
          completedCardIds.includes('act2_ch3_07_final_civitas_verdict') ||
          completedCardIds.includes('act2_ch3_08_act2_epilogue')
      );

    default:
      return false;
  }
}

export function getCurrentChapterKey(state: GameState): string {
  if (state.currentAct === 'ACT_I') {
    return 'act1';
  }
  const ch = state.currentChapter || 1;
  return `act2_ch${ch}`;
}

export function evaluateCompletedObjectives(
  flags: StoryFlags,
  completedCardIds: string[]
): string[] {
  return ALL_OBJECTIVES.filter((obj) =>
    checkObjectiveCompleted(obj.id, flags, completedCardIds)
  ).map((obj) => obj.id);
}

export function getNewlyCompletedObjective(
  prevCompletedIds: string[],
  nextCompletedIds: string[]
): ChapterObjective | null {
  const diff = nextCompletedIds.filter((id) => !prevCompletedIds.includes(id));
  if (diff.length === 0) return null;
  const match = ALL_OBJECTIVES.find((obj) => obj.id === diff[0]);
  return match || null;
}
