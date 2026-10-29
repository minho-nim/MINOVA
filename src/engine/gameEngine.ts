/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { choicePresentation } from '../data/cardPresentation';
import { CARD_MAP } from '../data/cards';
import { CHARACTERS } from '../data/characters';
import {
  CharacterId,
  CardDialogueContext,
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
import { selectNextCard, entryFailure } from './cardSelector';
import {
  ACT1_END,
  ACT2_END,
  MAIN_IDS,
  nextStoryId,
  chapterOf,
  storyComplete,
  authoredNextId,
} from './storyFlow';
import {
  applyResourceDelta,
  detectResourceCrisis,
  RESOURCE_BOUNDS,
  RESOURCE_ORDER,
  RESOURCE_META,
} from './resourceEngine';
import { reconcileCompletedObjectives, evaluateCompletedObjectives, getNewlyCompletedObjective } from './storyEngine';

export const CURRENT_SCHEMA_VERSION = 5;

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
    gameMode: 'story',
    flowPhase: 'playing',
    skippedStoryCardIds: [],
    selectionDiagnostics: [],
    resolvedCrisisInstances: [],
    consecutiveSideEvents: 0,
    lastCardDays: {},
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
  if (
    state.currentAct !== 'ACT_I' ||
    state.flowPhase !== 'act2Intro' ||
    !state.storyFlags.act1_completed ||
    !storyComplete(state, 'ACT_I')
  )
    return state;
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
    gameMode: 'story',
    flowPhase: 'playing',
    isActCompleted: false,
    currentAct: 'ACT_II',
    currentChapter: 1,
    currentCardId: state.crisisState?.crisisCardId || 'act2_ch1_01_triage_alert',
    storyFlags: normalizedFlags,
    activeNotification: notification,
    lastSavedAt: new Date().toISOString(),
  };
}

export function resolveCardDialogue(
  card: GameCard,
  flags: StoryFlags,
  resources: Resources,
  context?: CardDialogueContext,
): string {
  if (typeof card.dialogue === 'function') {
    return card.dialogue(flags, resources, context);
  }
  return card.dialogue;
}

export function executeDecision(
  state: GameState,
  direction: 'left' | 'right',
): { nextState: GameState; replaced: boolean; dismissalReason?: string } {
  const currentCard = CARD_MAP.get(state.currentCardId);
  if (state.flowPhase !== 'playing' || state.waitingUntilDay)
    return { nextState: state, replaced: false };
  if (!currentCard)
    return {
      nextState: {
        ...state,
        selectionDiagnostics: [...state.selectionDiagnostics, 'current:missing-card'],
      },
      replaced: false,
    };
  const systemCard = currentCard.id.startsWith('supervisor_replacement_');
  const failure = systemCard ? null : entryFailure(currentCard.id, state);
  if (failure)
    return {
      nextState: {
        ...state,
        selectionDiagnostics: [
          ...state.selectionDiagnostics,
          'current:' + currentCard.id + ':' + failure,
        ],
      },
      replaced: false,
    };

  const choice = direction === 'left' ? currentCard.leftChoice : currentCard.rightChoice;
  const presentedChoice = choicePresentation(currentCard, direction, state.storyFlags);

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
    Math.min(100, (state.operationalCapacity ?? 50) + (choice.operationalDelta ?? 0)),
  );

  // 4. Merge and normalize story flags
  let updatedFlags: StoryFlags = { ...state.storyFlags };
  if (choice.flags) {
    const flags = { ...choice.flags };
    if (currentCard.id === ACT2_END) delete flags.act3_preview_unlocked;
    Object.assign(updatedFlags, flags);
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
          Math.min(100, updatedRelationships[charId] + (delta || 0)),
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

  const completedCardIds = [...new Set([...state.completedCardIds, currentCard.id])];
  // A verdict records the decision; completion means the full authored story including epilogue was read.
  if (
    currentCard.id === 'act2_ch3_07_final_civitas_verdict' &&
    !completedCardIds.includes(ACT2_END)
  ) {
    updatedFlags.act2_verdict_reached = true;
    updatedFlags.act2_completed = false;
  }
  let next: GameState = {
    ...state,
    currentDay: state.currentDay + 1,
    supervisorTenure: state.supervisorTenure + 1,
    resources: updatedResources,
    operationalCapacity: updatedOperationalCapacity,
    pendingDelayedEffects: updatedPendingDelayed,
    appliedDelayedEffectIds: [...appliedDelayedIds],
    storyFlags: updatedFlags,
    relationshipValues: updatedRelationships,
    discoveredSecrets: updatedSecrets,
    completedCardIds,
    recentCardIds: [currentCard.id, ...state.recentCardIds].slice(0, 100),
    lastCardDays: { ...state.lastCardDays, [currentCard.id]: state.currentDay },
    scheduledCardQueue: [...state.scheduledCardQueue],
    consecutiveSideEvents: MAIN_IDS.has(currentCard.id) ? 0 : state.consecutiveSideEvents + 1,
    lastSavedAt: new Date().toISOString(),
  };
  if (choice.scheduleCardId && !next.scheduledCardQueue.includes(choice.scheduleCardId))
    next.scheduledCardQueue.push(choice.scheduleCardId);
  // Only authored chapter boundaries advance chapters; an incidental card can never change the ACT.
  if (state.currentAct === 'ACT_II' && state.gameMode === 'story') {
    const remaining = nextStoryId(next);
    if (remaining)
      next.currentChapter = Math.max(state.currentChapter, chapterOf(remaining)) as 1 | 2 | 3;
    next.storyFlags.current_chapter = next.currentChapter;
  }
  if (
    state.gameMode === 'story' &&
    storyComplete(next, state.currentAct === 'ACT_I' ? 'ACT_I' : 'ACT_II')
  ) {
    if (state.currentAct === 'ACT_I' && updatedFlags.act1_viewed_epilogue) {
      next.flowPhase = 'act1Complete';
      next.isActCompleted = true;
    } else if (
      state.currentAct === 'ACT_II' &&
      updatedFlags.act2_viewed_epilogue &&
      updatedFlags.final_act2_verdict
    ) {
      next.storyFlags.act2_completed = true;
      next.flowPhase = 'act2Complete';
      next.isActCompleted = true;
    }
  }
  const plannedLink = MAIN_IDS.has(currentCard.id)
    ? authoredNextId(next, currentCard)
    : choice.nextCardId;
  if (choice.nextCardId) {
    const failure = entryFailure(choice.nextCardId, next);
    if (failure)
      next.selectionDiagnostics = [
        ...next.selectionDiagnostics,
        `source-next:${currentCard.id}:${choice.nextCardId}:${failure}`,
      ].slice(-50);
  }
  let planned =
    next.flowPhase === 'playing'
      ? selectNextCard({ ...next, crisisState: null }, plannedLink)
      : null;
  if (choice.nextCardId && choice.nextCardId !== plannedLink) {
    next.selectionDiagnostics = [
      ...next.selectionDiagnostics,
      `editorial-link:${currentCard.id}:${choice.nextCardId}->${plannedLink ?? 'end'}`,
    ].slice(-50);
  }
  // Effects are settled once for the incoming event, before evaluating its emergency interruption.
  const appliedNow: DelayedEffect[] = [];
  next.pendingDelayedEffects = updatedPendingDelayed.filter((effect) => {
    if (effect.triggerCardId !== planned?.card?.id || appliedDelayedIds.has(effect.id)) return true;
    updatedResources = applyResourceDelta(updatedResources, effect.effects);
    appliedDelayedIds.add(effect.id);
    appliedNow.push(effect);
    return false;
  });
  next.resources = updatedResources;
  next.appliedDelayedEffectIds = [...appliedDelayedIds];
  const crisis = detectResourceCrisis(updatedResources, state.crisisState, state.currentDay);
  if (
    crisis &&
    state.crisisState?.instanceId === crisis.instanceId &&
    currentCard.type === 'crisis'
  )
    crisis.strikeCount++;
  const previousResolved = state.crisisState && crisis?.crisisCardId !== state.crisisState.crisisCardId;
  if (state.crisisState && previousResolved) {
    next.crisisResolvedIds = [
      ...new Set([...state.crisisResolvedIds, state.crisisState.crisisCardId]),
    ];
    next.resolvedCrisisInstances = [
      ...state.resolvedCrisisInstances,
      state.crisisState.instanceId ||
        `${state.crisisState.crisisCardId}:${state.crisisState.triggeredDay}`,
    ];
  }
  next.crisisState = crisis;
  const zeroKey = RESOURCE_ORDER.find((key) => updatedResources[key] <= 0);
  const exhaustedResponses = Boolean(crisis && currentCard.type === 'crisis' && crisis.strikeCount >= 2);
  // A crisis response that reaches zero still gets its second response. A policy
  // decision reaching zero outside emergency response retains the existing dismissal rule.
  const shouldReplace = Boolean((zeroKey && currentCard.type !== 'crisis') || exhaustedResponses);
  let dismissalReason: string | undefined;
  let recoveryDelta: ResourceDelta | undefined;
  if (shouldReplace) {
    const names = {
      citizenTrust: 'trust',
      fairness: 'fairness',
      personalFreedom: 'freedom',
      publicSafety: 'safety',
    };
    dismissalReason = exhaustedResponses
      ? '두 차례 위기 대응 후에도 지속된 위기에 따른 불신임'
      : `${RESOURCE_META[zeroKey!].label} 상실에 따른 평의회 불신임`;
    const record: SupervisorRecord = {
      supervisorNumber: state.supervisorNumber,
      tenureDays: state.supervisorTenure,
      dismissalReason,
      endDay: state.currentDay,
      keyVerdict: presentedChoice.text,
    };
    const recovered = { ...updatedResources };
    recoveryDelta = {};
    for (const key of RESOURCE_ORDER) {
      recovered[key] = Math.max(35, Math.min(65, updatedResources[key] + 25));
      recoveryDelta[key] = recovered[key] - updatedResources[key];
    }
    next.resources = recovered;
    next.operationalCapacity = 50;
    next.supervisorNumber++;
    next.supervisorTenure = 1;
    next.storyFlags.current_supervisor_number = next.supervisorNumber;
    next.supervisorHistory = [record, ...state.supervisorHistory];
    next.crisisState = null;
    next.currentCardId = `supervisor_replacement_${exhaustedResponses ? 'crisis' : names[zeroKey!]}`;
  } else if (next.flowPhase === 'playing') {
    // Explicit system path: the cause-of-dismissal report is followed by the new supervisor's oath.
    if (
      currentCard.id.startsWith('supervisor_replacement_') &&
      currentCard.id !== 'supervisor_replacement_orientation' &&
      !crisis
    ) {
      next.currentCardId = 'supervisor_replacement_orientation';
    } else if (crisis) {
      next.currentCardId = crisis.crisisCardId;
      // Keep an interrupted non-story occurrence queued; do not lose it to the emergency.
      if (
        planned?.card &&
        !MAIN_IDS.has(planned.card.id) &&
        !next.scheduledCardQueue.includes(planned.card.id)
      )
        next.scheduledCardQueue.unshift(planned.card.id);
    } else if (planned?.card) {
      next.currentCardId = planned.card.id;
      next.rngSeed = planned.nextSeed;
      next.scheduledCardQueue = planned.remainingScheduledQueue;
    } else {
      next.waitingUntilDay = planned?.waitUntilDay;
    }
  }
  if (planned)
    next.selectionDiagnostics = [...next.selectionDiagnostics, ...planned.diagnostics].slice(-50);
  const delta: ResourceDelta = {};
  for (const key of RESOURCE_ORDER) {
    if (next.resources[key] !== state.resources[key])
      delta[key] = next.resources[key] - state.resources[key];
  }
  const decisionRecord: DecisionRecord = {
    id: `decision_${state.currentDay}_${Date.now()}`,
    day: state.currentDay,
    cardId: currentCard.id,
    cardTitle: currentCard.title,
    characterId: currentCard.characterId,
    characterName: CHARACTERS[currentCard.characterId]?.name || '시스템',
    topic: currentCard.topicBadge,
    direction,
    choiceText: presentedChoice.text,
    resourceDelta: delta,
    resourcesAfter: { ...next.resources },
    consequenceSummary: presentedChoice.consequence,
    timestamp: Date.now(),
    linkedFollowUpCardId: choice.scheduleCardId || plannedLink,
    gameMode: state.gameMode,
    act: state.currentAct,
    supervisorRecoveryDelta: recoveryDelta,
    delayedEffectApplied: appliedNow.length
      ? {
          id: appliedNow.at(-1)!.id,
          description: appliedNow.at(-1)!.description,
          delta: appliedNow.at(-1)!.effects,
        }
      : undefined,
    delayedEffectsApplied: appliedNow,
  };
  next.decisionHistory = [decisionRecord, ...state.decisionHistory];
  next.completedObjectiveIds = reconcileCompletedObjectives(
    state.completedObjectiveIds, next.storyFlags, completedCardIds,
  );
  const objective = getNewlyCompletedObjective(
    state.completedObjectiveIds,
    next.completedObjectiveIds,
  );
  next.activeNotification = shouldReplace
    ? {
        id: `replace_${next.currentDay}`,
        type: 'warning',
        title: `제${next.supervisorNumber}대 AI 감독관 취임`,
        subtitle: dismissalReason,
        timestamp: Date.now(),
      }
    : objective
      ? {
          id: `objective_${next.currentDay}`,
          type: 'objective',
          title: objective.title,
          subtitle: objective.description,
          timestamp: Date.now(),
        }
      : null;
  return { nextState: next, replaced: shouldReplace, dismissalReason };
}
