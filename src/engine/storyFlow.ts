import { ACT1_CARDS, CARD_MAP } from '../data/cards';
import { GameCard, GameState } from '../types/game';

// Editorial order, independent of IDs and numerical priority. Original card text stays intact.
export const ACT2_CHAPTERS: string[][] = [
  [
    'act2_ch1_01_triage_alert',
    'act2_ch1_02_oracle_triage_rationale',
    'act2_ch1_03_excluded_patient',
    'act2_ch1_04_ai_override_request',
    'act2_ch1_05_family_appeal',
    'act2_ch1_07_bias_investigation',
    'act2_ch1_09_icu_audit_telemetry',
    'act2_ch1_10_telemedicine_crossborder',
    'act2_ch1_11_genetic_data_screening',
    'act2_ch1_08_chapter1_resolution',
  ],
  [
    'act2_ch2_01_hiring_crisis',
    'act2_ch2_02_proxy_discovery',
    'act2_ch2_03_district4_screening',
    'act2_ch2_04_applicant_protest',
    'act2_ch2_06_independent_audit_warrant',
    'act2_ch2_09_corporate_cartel',
    'act2_ch2_10_gender_simulation_bias',
    'act2_ch2_11_neurodiverse_job_filter',
    'act2_ch2_08_chapter2_resolution',
  ],
  [
    'act2_ch3_01_cross_system_anomaly',
    'act2_ch3_03_civitas_exposure',
    'act2_ch3_05_oracle_interrogation',
    'act2_ch3_06_alignment_dilemma',
    'act2_ch3_09_quantum_key_breach',
    'act2_ch3_11_black_market_broker',
    'act2_ch3_10_constitutional_referendum',
    'act2_ch3_12_comprehensive_audit_seal',
    'act2_ch3_13_sovereign_governance_pact',
    'act2_ch3_07_final_civitas_verdict',
    'act2_ch3_08_act2_epilogue',
  ],
];
export const ACT1_ORDER = ACT1_CARDS.map((c) => c.id); // Array is the authored ACT I order.
export const ACT2_ORDER = ACT2_CHAPTERS.flat();
export const MAIN_IDS = new Set([...ACT1_ORDER, ...ACT2_ORDER]);
export const ACT1_END = 'act1_25_act1_epilogue';
export const ACT2_END = 'act2_ch3_08_act2_epilogue';
export const chapterOf = (id: string): 1 | 2 | 3 =>
  (Math.max(
    0,
    ACT2_CHAPTERS.findIndex((ids) => ids.includes(id)),
  ) + 1) as 1 | 2 | 3;
export function nextStoryId(state: GameState): string | undefined {
  if (state.gameMode === 'freePlay') return undefined;
  const done = new Set([...state.completedCardIds, ...(state.skippedStoryCardIds || [])]);
  return (state.currentAct === 'ACT_II' ? ACT2_ORDER : ACT1_ORDER).find((id) => !done.has(id));
}
export function storyComplete(state: GameState, act: 'ACT_I' | 'ACT_II'): boolean {
  const done = new Set([...state.completedCardIds, ...state.skippedStoryCardIds]);
  return (act === 'ACT_I' ? ACT1_ORDER : ACT2_ORDER).every((id) => done.has(id));
}
// Conditional chapters are explicit metadata; ACT I events remain available as policy consequences in free play.
export const CONDITIONAL_CHAPTER: Record<string, number> = {
  cond_xai_medical_inquiry: 1,
  cond_triage_lawsuit: 1,
  cond_recruitment_audit: 2,
  cond_civitas_leak_investigation: 3,
  cond_social_credit_housing: 3,
};
export function scopeFailure(card: GameCard, state: GameState): string | null {
  if (card.type === 'crisis')
    return state.crisisState?.crisisCardId === card.id ? null : 'inactive-crisis';
  if (card.id.startsWith('supervisor_replacement_')) return 'system-entry-only';
  if (MAIN_IDS.has(card.id)) {
    if (state.gameMode === 'freePlay') return 'main-story-in-free-play';
    if (card.act !== state.currentAct) return 'wrong-act';
    if (card.id !== nextStoryId(state)) return 'story-prerequisite';
    if (state.currentAct === 'ACT_II' && chapterOf(card.id) !== state.currentChapter)
      return 'wrong-chapter';
    return null;
  }
  if (state.gameMode === 'freePlay') return null;
  if (card.act !== state.currentAct) return 'wrong-act';
  if (card.type === 'conditional' && (CONDITIONAL_CHAPTER[card.id] || 1) > state.currentChapter)
    return 'future-chapter';
  return null;
}
export function authoredNextId(state: GameState, source: GameCard): string | undefined {
  if (!MAIN_IDS.has(source.id)) return undefined;
  const order = state.currentAct === 'ACT_II' ? ACT2_ORDER : ACT1_ORDER;
  return order[order.indexOf(source.id) + 1];
}
export const getMainCard = (id: string) => (MAIN_IDS.has(id) ? CARD_MAP.get(id) : undefined);
