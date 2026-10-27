/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInitialGameState, CURRENT_SCHEMA_VERSION } from '../engine/gameEngine';
import { GameState, Resources } from '../types/game';

const SAVE_KEY = 'crossroads_ai_verdict_save_v1';

export interface SaveResult {
  success: boolean;
  state?: GameState;
  error?: string;
}

export function saveGameState(state: GameState): boolean {
  try {
    const serialized = JSON.stringify({
      ...state,
      lastSavedAt: new Date().toISOString(),
    });
    localStorage.setItem(SAVE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save game state to LocalStorage:', err);
    return false;
  }
}

export function loadGameState(): SaveResult {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return { success: false, error: 'NO_SAVE_FOUND' };
    }

    const parsed = JSON.parse(raw) as any;

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'INVALID_SAVE_FORMAT' };
    }

    // Migration from older schema to CURRENT_SCHEMA_VERSION (4):
    if (parsed.schemaVersion < CURRENT_SCHEMA_VERSION || !parsed.schemaVersion) {
      console.warn(
        `Migrating save from schema v${parsed.schemaVersion || 1} to v${CURRENT_SCHEMA_VERSION}...`
      );

      const oldRes = parsed.resources || {};
      const newResources: Resources = {
        citizenTrust: typeof oldRes.citizenTrust === 'number' ? oldRes.citizenTrust : 50,
        fairness: typeof oldRes.fairness === 'number' ? oldRes.fairness : 50,
        personalFreedom:
          typeof oldRes.personalFreedom === 'number'
            ? oldRes.personalFreedom
            : typeof oldRes.personalLiberty === 'number'
            ? oldRes.personalLiberty
            : 50,
        publicSafety: typeof oldRes.publicSafety === 'number' ? oldRes.publicSafety : 50,
      };

      parsed.resources = newResources;
      parsed.operationalCapacity =
        typeof parsed.operationalCapacity === 'number' ? parsed.operationalCapacity : 50;
      parsed.pendingDelayedEffects = Array.isArray(parsed.pendingDelayedEffects)
        ? parsed.pendingDelayedEffects
        : [];
      parsed.appliedDelayedEffectIds = Array.isArray(parsed.appliedDelayedEffectIds)
        ? parsed.appliedDelayedEffectIds
        : [];
      parsed.completedObjectiveIds = Array.isArray(parsed.completedObjectiveIds)
        ? parsed.completedObjectiveIds
        : [];
      parsed.currentAct = parsed.currentAct || 'ACT_I';
      parsed.currentChapter = typeof parsed.currentChapter === 'number' ? parsed.currentChapter : 1;

      parsed.recentCardIds = Array.isArray(parsed.recentCardIds) ? parsed.recentCardIds : [];
      parsed.scheduledCardQueue = Array.isArray(parsed.scheduledCardQueue) ? parsed.scheduledCardQueue : [];
      parsed.crisisResolvedIds = Array.isArray(parsed.crisisResolvedIds) ? parsed.crisisResolvedIds : [];

      parsed.schemaVersion = CURRENT_SCHEMA_VERSION;
      saveGameState(parsed);
    }

    // Always ensure safe array fallbacks
    parsed.recentCardIds = Array.isArray(parsed.recentCardIds) ? parsed.recentCardIds : [];
    parsed.scheduledCardQueue = Array.isArray(parsed.scheduledCardQueue) ? parsed.scheduledCardQueue : [];
    parsed.crisisResolvedIds = Array.isArray(parsed.crisisResolvedIds) ? parsed.crisisResolvedIds : [];

    if (!parsed.resources || !parsed.currentCardId) {
      return { success: false, error: 'CORRUPTED_SAVE_DATA' };
    }

    return { success: true, state: parsed as GameState };
  } catch (err) {
    console.error('Error loading game state:', err);
    return { success: false, error: 'CORRUPTED_SAVE_DATA' };
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.error('Failed to clear LocalStorage save:', err);
  }
}

export function hasExistingSave(): boolean {
  try {
    return Boolean(localStorage.getItem(SAVE_KEY));
  } catch {
    return false;
  }
}
