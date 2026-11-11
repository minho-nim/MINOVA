/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CARD_MAP } from '../data/cards';
import { CHARACTERS } from '../data/characters';
import {
  CharacterId,
  DecisionRecord,
  DelayedEffect,
  GameCard,
  GameNotification,
  GameState,
  ResourceDelta,
  Resources,
  StoryFlags,
  SupervisorRecord,
} from '../types/game';
import { selectNextCard } from './cardSelector';
import { applyResourceDelta, detectResourceCrisis, RESOURCE_BOUNDS } from './resourceEngine';
import { evaluateCompletedObjectives, getNewlyCompletedObjective } from './storyEngine';

export const CURRENT_SCHEMA_VERSION = 4;

export function normalizeStoryFlags(flags: StoryFlags): StoryFlags {
  const normalized = { ...flags };
  if (normalized.surveillance_level === 'total' || normalized.facial_tracking_active) {
    normalized.mobility_data_enabled = true;
  }
  if (normalized.medical_triage === 'utilitarian') {
    normalized.medical_ai_enabled = true;
  }
  if (normalized.complaint_system === 'human_reviewed' || normalized.appeal_committee_established) {
    normalized.citizen_appeal_enabled = true;
  }
  if (
    normalized.xai_enforced ||
    normalized.oracle_transparency_demanded ||
    (normalized.asked_explanation_count && Number(normalized.asked_explanation_count) > 0)
  ) {
    normalized.oracle_transparency_requested = true;
  }
  return normalized;
}

export function createInitialGameState(): GameState {
  const initialResources: Resources = {
    citizenTrust: RESOURCE_BOUNDS.INITIAL,
    fairness: RESOURCE_BOUNDS.INITIAL,
    personalFreedom: RESOURCE_BOUNDS.INITIAL,
    publicSafety: RESOURCE_BOUNDS.INITIAL,
  };

  const initialRelationships: Record<CharacterId, number> = {
    oracle: 50,
    seoYoonha: 50,
    kangDohyun: 50,
    hanJiwoo: 50,
    baekSion: 50,
    ohHyejin: 50,
    citizen: 50,
    council: 50,
  };

  const initialFlags: StoryFlags = {
    supervisor_inaugurated: true,
    asked_explanation_count: 0,
    oracle_approval_streak: 0,
  };

  const completedObjs = evaluateCompletedObjectives(initialFlags, ['act1_01_inauguration']);

  return {
    gameId: `game_${Date.now()}`,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    currentDay: 1,
    supervisorNumber: 1,
    supervisorTenure: 1,
    currentAct: 'ACT_I',
    currentChapter: 1,
    currentCardId: 'act1_01_inauguration',
    resources: initialResources,
    operationalCapacity: 50,
    pendingDelayedEffects: [],
    appliedDelayedEffectIds: [],
    completedObjectiveIds: completedObjs,
    recentCardIds: [],
    scheduledCardQueue: [],
    crisisResolvedIds: [],
    storyFlags: initialFlags,
    relationshipValues: initialRelationships,
    discoveredSecrets: [],
    decisionHistory: [],
    completedCardIds: [],
    crisisState: null,
    supervisorHistory: [],
    rngSeed: 1337,
    lastSavedAt: new Date().toISOString(),
    isActCompleted: false,
    activeNotification: null,
  };
}

export function startAct2(state: GameState): GameState {
  const normalizedFlags = normalizeStoryFlags({
    ...state.storyFlags,
    act1_completed: true,
    act2_started: true,
    current_chapter: 1,
  });

  const notification: GameNotification = {
    id: `notif_act2_${Date.now()}`,
    type: 'act_transition',
    title: 'ACT II : 통계에 없는 사람들 개막',
    subtitle: '의료 AI와 채용 알고리즘의 보이지 않는 장벽을 조사합니다.',
    timestamp: Date.now(),
  };

  return {
    ...state,
    currentAct: 'ACT_II',
    currentChapter: 1,
    currentCardId: 'act2_ch1_01_triage_alert',
    isActCompleted: false,
    storyFlags: normalizedFlags,
    activeNotification: notification,
    lastSavedAt: new Date().toISOString(),
  };
}

export function resolveCardDialogue(
  card: GameCard,
  flags: StoryFlags,
  resources: Resources
): string {
  if (typeof card.dialogue === 'function') {
    return card.dialogue(flags, resources);
  }
  return card.dialogue;
}

export function executeDecision(
  state: GameState,
  direction: 'left' | 'right'
): { nextState: GameState; replaced: boolean; dismissalReason?: string } {
  const currentCard = CARD_MAP.get(state.currentCardId);
  if (!currentCard) {
    return {
      nextState: { ...state, currentCardId: 'act1_01_inauguration' },
      replaced: false,
    };
  }

  const choice = direction === 'left' ? currentCard.leftChoice : currentCard.rightChoice;

  // 1. Calculate immediate resource change
  let updatedResources = applyResourceDelta(state.resources, choice.effects);

  // 2. Check and register any new delayed effect from this choice
  let updatedPendingDelayed = [...(state.pendingDelayedEffects || [])];
  const appliedDelayedIds = new Set(state.appliedDelayedEffectIds || []);

  if (choice.delayedEffect && !appliedDelayedIds.has(choice.delayedEffect.id)) {
    const alreadyPending = updatedPendingDelayed.some((e) => e.id === choice.delayedEffect!.id);
    if (!alreadyPending) {
      updatedPendingDelayed.push(choice.delayedEffect);
    }
  }

  // 3. Update internal operationalCapacity
  const updatedOperationalCapacity = Math.max(
    0,
    Math.min(100, (state.operationalCapacity ?? 50) + (choice.operationalDelta ?? 0))
  );

  // 4. Merge and normalize story flags
  let updatedFlags: StoryFlags = { ...state.storyFlags };
  if (choice.flags) {
    Object.assign(updatedFlags, choice.flags);
  }
  updatedFlags.current_supervisor_number = state.supervisorNumber;
  updatedFlags = normalizeStoryFlags(updatedFlags);

  // 5. Update relationships
  const updatedRelationships: Record<CharacterId, number> = { ...state.relationshipValues };
  if (choice.relationshipDeltas) {
    for (const [charKey, delta] of Object.entries(choice.relationshipDeltas)) {
      const charId = charKey as CharacterId;
      if (updatedRelationships[charId] !== undefined) {
        updatedRelationships[charId] = Math.max(
          0,
          Math.min(100, updatedRelationships[charId] + (delta || 0))
        );
      }
    }
  }

  // 6. Update discovered secrets
  const updatedSecrets = [...state.discoveredSecrets];
  if (updatedFlags.secret_found && !updatedSecrets.includes('ORACLE_HIDDEN_WEIGHTS')) {
    updatedSecrets.push('ORACLE_HIDDEN_WEIGHTS');
  }
  if (updatedFlags.secret_shi_exposed && !updatedSecrets.includes('SECRET_HARMONY_INDEX')) {
    updatedSecrets.push('SECRET_HARMONY_INDEX');
  }
  if (
    (updatedFlags.civitas_score_discovered || currentCard.id === 'act2_ch3_03_civitas_exposure') &&
    !updatedSecrets.includes('CIVITAS_SCORE')
  ) {
    updatedSecrets.push('CIVITAS_SCORE');
  }
  if (updatedFlags.proxy_variable_found && !updatedSecrets.includes('PROXY_RESIDENCE_MATRIX')) {
    updatedSecrets.push('PROXY_RESIDENCE_MATRIX');
  }
  if (updatedFlags.medical_bias_detected && !updatedSecrets.includes('MISSING_HEALTHCARE_DATA')) {
    updatedSecrets.push('MISSING_HEALTHCARE_DATA');
  }

  // 7. Build decision record (omitting zero-delta resources)
  const nonZeroDelta: ResourceDelta = {};
  (['citizenTrust', 'fairness', 'personalFreedom', 'publicSafety'] as const).forEach((key) => {
    if (choice.effects[key] !== undefined && choice.effects[key] !== 0) {
      nonZeroDelta[key] = choice.effects[key];
    }
  });

  const character = CHARACTERS[currentCard.characterId];
  const decisionRecord: DecisionRecord = {
    id: `decision_${state.currentDay}_${Date.now()}`,
    day: state.currentDay,
    cardId: currentCard.id,
    cardTitle: currentCard.title,
    characterId: currentCard.characterId,
    characterName: character?.name || '시스템',
    topic: currentCard.topicBadge,
    direction,
    choiceText: choice.text,
    resourceDelta: nonZeroDelta,
    resourcesAfter: updatedResources,
    consequenceSummary: choice.consequence,
    timestamp: Date.now(),
    linkedFollowUpCardId: choice.nextCardId,
  };

  const updatedHistory = [decisionRecord, ...state.decisionHistory];
  const updatedCompletedIds = state.completedCardIds.includes(currentCard.id)
    ? state.completedCardIds
    : [...state.completedCardIds, currentCard.id];

  // 8. Objectives evaluation & Notifications
  const nextCompletedObjectives = evaluateCompletedObjectives(updatedFlags, updatedCompletedIds);
  const newlyCompleted = getNewlyCompletedObjective(
    state.completedObjectiveIds || [],
    nextCompletedObjectives
  );

  let activeNotification: GameNotification | null = null;
  if (newlyCompleted) {
    activeNotification = {
      id: `notif_obj_${Date.now()}`,
      type: 'objective',
      title: `목표 달성: ${newlyCompleted.title}`,
      subtitle: newlyCompleted.description,
      timestamp: Date.now(),
    };
  }

  // 9. Check Supervisor Replacement conditions (Resource <= 0 or crisis persists)
  let shouldReplaceSupervisor = false;
  let dismissalReason = '';
  let replacementCardId = 'supervisor_replacement_orientation';

  const isZero =
    updatedResources.citizenTrust <= 0 ||
    updatedResources.fairness <= 0 ||
    updatedResources.personalFreedom <= 0 ||
    updatedResources.publicSafety <= 0;

  if (isZero) {
    shouldReplaceSupervisor = true;
    if (updatedResources.citizenTrust <= 0) {
      dismissalReason = '시민 신뢰의 완전한 상실 및 대규모 시민 총파업 발발';
      replacementCardId = 'supervisor_replacement_trust';
    } else if (updatedResources.fairness <= 0) {
      dismissalReason = '알고리즘 차별 및 집단 위헌 소송으로 인한 사법 체계 마비';
      replacementCardId = 'supervisor_replacement_fairness';
    } else if (updatedResources.personalFreedom <= 0) {
      dismissalReason = '극단적 디지털 감시사회와 시민·인재 계층의 전면 탈출';
      replacementCardId = 'supervisor_replacement_freedom';
    } else {
      dismissalReason = '도심 치안 시스템의 전면적 와해 및 무법 상태 도달';
      replacementCardId = 'supervisor_replacement_safety';
    }
  } else if (state.crisisState && state.crisisState.strikeCount >= 2) {
    shouldReplaceSupervisor = true;
    dismissalReason = `위기 관리 미흡 (${currentCard.topicBadge} 지속 방치에 따른 평의회 불신임)`;
    replacementCardId = 'supervisor_replacement_crisis';
  }

  // 10. Handle Supervisor Replacement if triggered
  if (shouldReplaceSupervisor) {
    const supervisorRecord: SupervisorRecord = {
      supervisorNumber: state.supervisorNumber,
      tenureDays: state.supervisorTenure,
      dismissalReason,
      endDay: state.currentDay,
      keyVerdict: decisionRecord.choiceText,
    };

    const newSupervisorNumber = state.supervisorNumber + 1;
    updatedFlags.current_supervisor_number = newSupervisorNumber;

    // Partial recovery of resources towards balanced baseline
    const recoveredResources: Resources = {
      citizenTrust: Math.max(35, Math.min(65, updatedResources.citizenTrust + 25)),
      fairness: Math.max(35, Math.min(65, updatedResources.fairness + 25)),
      personalFreedom: Math.max(35, Math.min(65, updatedResources.personalFreedom + 25)),
      publicSafety: Math.max(35, Math.min(65, updatedResources.publicSafety + 25)),
    };

    const updatedRecent = [currentCard.id, ...(state.recentCardIds || [])].slice(0, 30);

    const nextState: GameState = {
      ...state,
      currentDay: state.currentDay + 1,
      supervisorNumber: newSupervisorNumber,
      supervisorTenure: 1,
      currentCardId: replacementCardId,
      resources: recoveredResources,
      operationalCapacity: 50,
      pendingDelayedEffects: updatedPendingDelayed,
      appliedDelayedEffectIds: Array.from(appliedDelayedIds),
      completedObjectiveIds: nextCompletedObjectives,
      recentCardIds: updatedRecent,
      scheduledCardQueue: choice.nextCardId
        ? [choice.nextCardId, ...(state.scheduledCardQueue || [])]
        : state.scheduledCardQueue || [],
      crisisResolvedIds: state.crisisResolvedIds || [],
      storyFlags: updatedFlags,
      relationshipValues: updatedRelationships,
      discoveredSecrets: updatedSecrets,
      decisionHistory: updatedHistory,
      completedCardIds: updatedCompletedIds,
      crisisState: null,
      supervisorHistory: [supervisorRecord, ...state.supervisorHistory],
      activeNotification: {
        id: `notif_replace_${Date.now()}`,
        type: 'warning',
        title: `제${newSupervisorNumber}대 AI 감독관 취임`,
        subtitle: '전임자의 파면으로 인해 새로운 감독관이 직무를 승계했습니다.',
        timestamp: Date.now(),
      },
      lastSavedAt: new Date().toISOString(),
    };

    return { nextState, replaced: true, dismissalReason };
  }

  // 11. Normal Crisis Evaluation
  const newCrisis = detectResourceCrisis(updatedResources, state.crisisState, state.currentDay);

  // Final verdict flags precede the epilogue; completion requires reading it.
  const isActComplete = Boolean(
    state.currentAct === 'ACT_II'
      ? updatedFlags.act2_viewed_epilogue
      : updatedFlags.act1_viewed_epilogue
  );

  // Chapter tracking
  let updatedChapter = state.currentChapter || 1;
  if (updatedFlags.current_chapter) {
    updatedChapter = Number(updatedFlags.current_chapter) as 1 | 2 | 3;
  }

  // Determine current Act
  let updatedAct = state.currentAct;
  if (currentCard.act === 'ACT_II' || updatedFlags.act2_started) {
    updatedAct = 'ACT_II';
  }

  const updatedRecent = [currentCard.id, ...(state.recentCardIds || [])].slice(0, 30);
  const updatedCrisisResolvedIds = [...(state.crisisResolvedIds || [])];
  if (state.crisisState && newCrisis === null) {
    if (!updatedCrisisResolvedIds.includes(state.crisisState.crisisCardId)) {
      updatedCrisisResolvedIds.push(state.crisisState.crisisCardId);
    }
  }

  // 12. Select Next Card
  const tempState: GameState = {
    ...state,
    currentAct: updatedAct,
    currentChapter: updatedChapter,
    currentDay: state.currentDay + 1,
    supervisorTenure: state.supervisorTenure + 1,
    resources: updatedResources,
    operationalCapacity: updatedOperationalCapacity,
    pendingDelayedEffects: updatedPendingDelayed,
    appliedDelayedEffectIds: Array.from(appliedDelayedIds),
    completedObjectiveIds: nextCompletedObjectives,
    recentCardIds: updatedRecent,
    scheduledCardQueue: state.scheduledCardQueue || [],
    crisisResolvedIds: updatedCrisisResolvedIds,
    storyFlags: updatedFlags,
    relationshipValues: updatedRelationships,
    discoveredSecrets: updatedSecrets,
    decisionHistory: updatedHistory,
    completedCardIds: updatedCompletedIds,
    crisisState: newCrisis,
    isActCompleted: isActComplete,
    activeNotification,
  };

  const { card: nextCard, nextSeed, remainingScheduledQueue } = selectNextCard(tempState, choice.nextCardId);

  // Synchronize act & chapter with incoming nextCard
  if (nextCard.act === 'ACT_II') {
    updatedAct = 'ACT_II';
    if (nextCard.id.startsWith('act2_ch1')) updatedChapter = 1;
    else if (nextCard.id.startsWith('act2_ch2')) updatedChapter = 2;
    else if (nextCard.id.startsWith('act2_ch3')) updatedChapter = 3;
  }

  // 13. Trigger any pending Delayed Effects attached to the incoming nextCard
  let triggeredDelayedEffect: DelayedEffect | null = null;
  const remainingPending: DelayedEffect[] = [];

  for (const delayed of updatedPendingDelayed) {
    if (delayed.triggerCardId === nextCard.id && !appliedDelayedIds.has(delayed.id)) {
      triggeredDelayedEffect = delayed;
      appliedDelayedIds.add(delayed.id);
      updatedResources = applyResourceDelta(updatedResources, delayed.effects);
    } else {
      remainingPending.push(delayed);
    }
  }

  if (triggeredDelayedEffect) {
    decisionRecord.delayedEffectApplied = {
      id: triggeredDelayedEffect.id,
      description: triggeredDelayedEffect.description,
      delta: triggeredDelayedEffect.effects,
    };
  }

  const finalNextState: GameState = {
    ...tempState,
    currentAct: updatedAct,
    currentChapter: updatedChapter,
    currentCardId: nextCard.id,
    resources: updatedResources,
    scheduledCardQueue: remainingScheduledQueue || tempState.scheduledCardQueue,
    pendingDelayedEffects: remainingPending,
    appliedDelayedEffectIds: Array.from(appliedDelayedIds),
    rngSeed: nextSeed,
    lastSavedAt: new Date().toISOString(),
  };

  return { nextState: finalNextState, replaced: false };
}
