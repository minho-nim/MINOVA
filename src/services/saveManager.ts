import {
  createInitialGameState,
  CURRENT_SCHEMA_VERSION,
  normalizeStoryFlags,
} from '../engine/gameEngine';
import { selectNextCard, entryFailure } from '../engine/cardSelector';
import { CARD_MAP } from '../data/cards';
import {
  ACT1_END,
  ACT1_ORDER,
  ACT2_END,
  ACT2_ORDER,
  chapterOf,
  MAIN_IDS,
  nextStoryId,
} from '../engine/storyFlow';
import { reconcileCompletedObjectives } from '../engine/storyEngine';
import { GameState } from '../types/game';
import { clampResource, detectResourceCrisis } from '../engine/resourceEngine';

export const SAVE_KEY = 'crossroads_ai_verdict_save_v1';
export interface SaveResult {
  success: boolean;
  state?: GameState;
  error?: string;
  backupKey?: string;
}
const array = (v: unknown): any[] => (Array.isArray(v) ? v : []);
export function migrateGameState(parsed: any): GameState {
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    !parsed.resources ||
    !parsed.currentCardId
  )
    throw new Error('CORRUPTED_SAVE_DATA');
  if (parsed.schemaVersion > CURRENT_SCHEMA_VERSION) throw new Error('NEWER_SAVE_VERSION');
  const fresh = createInitialGameState();
  const legacy = (parsed.schemaVersion || 1) < CURRENT_SCHEMA_VERSION;
  const state: GameState = { ...fresh, ...parsed };
  for (const key of [
    'completedCardIds',
    'decisionHistory',
    'supervisorHistory',
    'discoveredSecrets',
    'recentCardIds',
    'scheduledCardQueue',
    'crisisResolvedIds',
    'pendingDelayedEffects',
    'appliedDelayedEffectIds',
    'completedObjectiveIds',
    'skippedStoryCardIds',
    'selectionDiagnostics',
    'resolvedCrisisInstances',
  ] as const)
    (state as any)[key] = [...array(parsed[key])];
  state.completedCardIds = [
    ...new Set([
      ...state.completedCardIds,
      ...state.decisionHistory.map((h) => h.cardId).filter((id) => CARD_MAP.has(id)),
    ]),
  ];
  state.storyFlags = normalizeStoryFlags({ ...parsed.storyFlags });
  state.relationshipValues = { ...fresh.relationshipValues, ...parsed.relationshipValues };
  state.resources = { ...fresh.resources };
  for (const key of Object.keys(state.resources) as (keyof GameState['resources'])[]) {
    const value =
      parsed.resources[key] ??
      (key === 'personalFreedom' ? parsed.resources.personalLiberty : undefined);
    state.resources[key] = Number.isFinite(value) ? clampResource(value) : 50;
  }
  state.gameMode = parsed.gameMode === 'freePlay' ? 'freePlay' : 'story';
  state.currentAct =
    parsed.currentAct === 'ACT_II' || parsed.currentAct === 'ACT_III_PREVIEW' ? 'ACT_II' : 'ACT_I';
  state.currentChapter = Math.min(3, Math.max(1, Number(parsed.currentChapter) || 1)) as 1 | 2 | 3;
  state.lastCardDays = { ...parsed.lastCardDays };
  // History restores cooldown even if old recent queues were truncated; older history remains unchanged.
  for (const record of [...state.decisionHistory].reverse())
    if (record.cardId && Number.isFinite(record.day))
      state.lastCardDays[record.cardId] = Math.max(
        state.lastCardDays[record.cardId] ?? -1,
        record.day,
      );
  state.consecutiveSideEvents = Number.isFinite(parsed.consecutiveSideEvents)
    ? parsed.consecutiveSideEvents
    : 0;
  if (state.crisisState)
    state.crisisState = {
      ...state.crisisState,
      instanceId:
        state.crisisState.instanceId ||
        `${state.crisisState.crisisCardId}:${state.crisisState.triggeredDay}`,
    };
  if (legacy) {
    state.selectionDiagnostics.push(`migration:v${parsed.schemaVersion || 1}->v5`);
    if (state.currentAct === 'ACT_II') {
      state.storyFlags.act2_started = true;
      if (ACT2_ORDER.includes(state.currentCardId))
        state.currentChapter = Math.max(state.currentChapter, chapterOf(state.currentCardId)) as
          | 1
          | 2
          | 3;
      // Never replay a passed chapter or manufacture a decision. Missing old content is explicitly marked skipped.
      state.skippedStoryCardIds = [
        ...new Set([
          ...state.skippedStoryCardIds,
          ...ACT2_ORDER.filter(
            (id) => chapterOf(id) < state.currentChapter && !state.completedCardIds.includes(id),
          ),
        ]),
      ];
    }
    const act2Done =
      state.currentAct === 'ACT_II' &&
      (state.storyFlags.act2_viewed_epilogue ||
        state.completedCardIds.includes(ACT2_END) ||
        (state.storyFlags.act2_completed && state.currentCardId !== ACT2_END));
    const act1Done =
      state.currentAct === 'ACT_I' &&
      (state.completedCardIds.includes(ACT1_END) ||
        state.storyFlags.act1_viewed_epilogue ||
        (state.storyFlags.act1_completed && state.currentCardId !== ACT1_END));
    state.flowPhase = act2Done ? 'act2Complete' : act1Done ? 'act1Complete' : 'playing';
    if (act2Done) {
      state.storyFlags.act2_completed = true;
      state.skippedStoryCardIds = [
        ...new Set([
          ...state.skippedStoryCardIds,
          ...ACT2_ORDER.filter((id) => !state.completedCardIds.includes(id)),
        ]),
      ];
    }
    if (act1Done)
      state.skippedStoryCardIds = [
        ...new Set([
          ...state.skippedStoryCardIds,
          ...ACT1_ORDER.filter((id) => !state.completedCardIds.includes(id)),
        ]),
      ];
    if (!act2Done && state.currentAct === 'ACT_II') state.storyFlags.act2_completed = false;
  }
  if (!['playing', 'act1Complete', 'act2Intro', 'act2Complete'].includes(state.flowPhase))
    state.flowPhase = 'playing';
  if (state.gameMode === 'freePlay' && !state.storyFlags.act2_completed) state.gameMode = 'story';
  if (state.gameMode === 'freePlay') state.flowPhase = 'playing';
  // v5 saves may contain the former "high number alone" emergency. Re-evaluate it
  // without inventing a decision, erasing history, or demoting the current ACT.
  if (state.crisisState?.crisisType === 'high')
    state.crisisState = detectResourceCrisis(state.resources,state.crisisState,state.currentDay);
  if (state.flowPhase === 'playing' && !state.waitingUntilDay) {
    const card = CARD_MAP.get(state.currentCardId);
    const failure = card?.id.startsWith('supervisor_replacement_')
      ? null
      : entryFailure(state.currentCardId, state);
    if (failure) {
      state.selectionDiagnostics.push('resume:' + state.currentCardId + ':' + failure);
      if (
        card?.type === 'conditional' &&
        !state.completedCardIds.includes(card.id) &&
        !state.scheduledCardQueue.includes(card.id)
      )
        state.scheduledCardQueue.push(card.id);
      const selection = selectNextCard(state);
      if (selection.card) state.currentCardId = selection.card.id;
      else state.waitingUntilDay = selection.waitUntilDay;
      state.rngSeed = selection.nextSeed;
      state.scheduledCardQueue = selection.remainingScheduledQueue;
    }
  }
  state.isActCompleted = state.flowPhase !== 'playing' || Boolean(state.storyFlags.act2_completed);
  state.completedObjectiveIds = reconcileCompletedObjectives(
    state.completedObjectiveIds, state.storyFlags, state.completedCardIds,
  );
  state.schemaVersion = CURRENT_SCHEMA_VERSION;
  return state;
}
export function saveGameState(state: GameState): boolean {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...state, lastSavedAt: new Date().toISOString() }),
    );
    return true;
  } catch {
    return false;
  }
}
export function loadGameState(): SaveResult {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { success: false, error: 'NO_SAVE_FOUND' };
    const parsed = JSON.parse(raw);
    const state = migrateGameState(parsed);
    let backupKey: string | undefined;
    if ((parsed.schemaVersion || 1) < CURRENT_SCHEMA_VERSION) {
      backupKey = `${SAVE_KEY}_backup_v${parsed.schemaVersion || 1}_${Date.now()}`;
      // Abort migration if backing up fails. Never overwrite the only copy.
      localStorage.setItem(backupKey, raw);
      if (!saveGameState(state))
        return { success: false, error: 'MIGRATION_SAVE_FAILED', backupKey };
    }
    return { success: true, state, backupKey };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CORRUPTED_SAVE_DATA',
    };
  }
}
export function clearGameState(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}
export function hasExistingSave(): boolean {
  try {
    return Boolean(localStorage.getItem(SAVE_KEY));
  } catch {
    return false;
  }
}
