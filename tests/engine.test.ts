import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import {
  ALL_CARDS,
  ACT1_CARDS,
  ACT2_CARDS,
  CARD_MAP,
  CONDITIONAL_CARDS,
  DAILY_CARDS,
  CRISIS_CARDS,
  SUPERVISOR_REPLACEMENT_CARDS,
} from '../src/data/cards';
import { POLICY_LINKS, FREE_PLAY_PROPOSALS } from '../src/data/cards/freePlay';
import { createInitialGameState } from '../src/engine/gameEngine';
import { transitionSession, sessionScreen } from '../src/engine/gameSession';
import { entryFailure, selectNextCard } from '../src/engine/cardSelector';
import {
  ACT1_ORDER,
  ACT2_ORDER,
  ACT2_CHAPTERS,
  MAIN_IDS,
  ACT1_END,
  ACT2_END,
  chapterOf,
} from '../src/engine/storyFlow';
import { detectResourceCrisis } from '../src/engine/resourceEngine';
import { migrateGameState, loadGameState, SAVE_KEY } from '../src/services/saveManager';
import { Act2CompleteScreen } from '../src/components/Act2CompleteScreen';
import { ActCompleteModal } from '../src/components/ActCompleteModal';
import { ActTransitionModal } from '../src/components/ActTransitionModal';
import { choose, decide, playUntil } from './helpers';

// v0.3: legacy high-value crisis stories now require a competing harm too.
const highHarm = {citizenTrust:'fairness',fairness:'publicSafety',personalFreedom:'publicSafety',publicSafety:'personalFreedom'} as const;

const act1 = playUntil((s) => s.flowPhase === 'act1Complete');
const intro = transitionSession(act1, { type: 'requestAct2' }).nextState;
const act2 = transitionSession(intro, { type: 'confirmAct2' }).nextState;
const ending = playUntil((s) => s.flowPhase === 'act2Complete', act2);
const free = transitionSession(ending, { type: 'enterFreePlay' }).nextState;

test('ACT I completes all 25 cards at the real epilogue and presents the completion screen', () => {
  assert.equal(act1.currentAct, 'ACT_I');
  assert.ok(ACT1_ORDER.every((id) => act1.completedCardIds.includes(id)));
  assert.equal(act1.decisionHistory[0].cardId, ACT1_END);
  assert.equal(sessionScreen(act1), 'act1Complete');
  assert.match(
    renderToStaticMarkup(
      React.createElement(ActCompleteModal, {
        isOpen: true,
        state: act1,
        onClose() {},
        onOpenHistory() {},
        onRestart() {},
        onStartAct2() {},
      }),
    ),
    /ACT II : 통계에 없는 사람들 시작하기/,
  );
});
test('UI protocol requires completion -> ACT II start -> intro confirmation', () => {
  assert.equal(sessionScreen(intro), 'act2Intro');
  assert.equal(intro.currentAct, 'ACT_I');
  assert.match(
    renderToStaticMarkup(React.createElement(ActTransitionModal, { isOpen: true, onConfirm() {} })),
    /ACT II 직무 개시/,
  );
  assert.equal(act2.currentAct, 'ACT_II');
  assert.equal(act2.currentChapter, 1);
  assert.equal(
    transitionSession(createInitialGameState(), { type: 'confirmAct2' }).nextState.currentAct,
    'ACT_I',
  );
});
test('ACT I cannot enter ACT II through flags, explicit links, queued cards or dailies', () => {
  const s = {
    ...createInitialGameState(),
    storyFlags: { medical_ai_enabled: true, xai_enforced: true },
    scheduledCardQueue: ['cond_triage_lawsuit'],
  };
  const result = selectNextCard(s, 'act2_ch1_01_triage_alert');
  assert.equal(result.card!.act, 'ACT_I');
  assert.ok(result.remainingScheduledQueue.includes('cond_triage_lawsuit'));
  assert.ok(result.diagnostics.some((x) => x.includes('wrong-act')));
});
test('all 30 ACT II cards are encountered in editorial order, chapters never regress', () => {
  const records = ending.decisionHistory
    .slice()
    .reverse()
    .filter((h) => ACT2_ORDER.includes(h.cardId));
  assert.deepEqual(
    records.map((h) => h.cardId),
    ACT2_ORDER,
  );
  assert.equal(new Set(records.map((h) => h.cardId)).size, 30);
  assert.deepEqual(
    ACT2_CHAPTERS.map((c) => c.length),
    [10, 9, 11],
  );
  const chapters = records.map((h) => chapterOf(h.cardId));
  assert.ok(chapters.every((n, i) => i === 0 || n >= chapters[i - 1]));
});
test('ACT II result requires required incidents, verdict and epilogue; not a date or count', () => {
  assert.equal(ending.storyFlags.act2_completed, true);
  assert.equal(ending.decisionHistory[0].cardId, ACT2_END);
  assert.equal(sessionScreen(ending), 'act2Complete');
  const s = { ...createInitialGameState(), currentDay: 9999, storyFlags: { act2_completed: true } };
  assert.equal(decide(s).flowPhase, 'playing');
});
test('result screen exposes decisions, secrets, four resources, supervisor history and both actions', () => {
  const html = renderToStaticMarkup(
    React.createElement(Act2CompleteScreen, { state: ending, onFreePlay() {}, onMainMenu() {} }),
  );
  for (const label of [
    'ACT II 완료',
    '주요 결정',
    '발견한 비밀',
    '시민 신뢰',
    '공정성',
    '개인 자유',
    '사회 안전',
    '감독관 이력',
    '자유 운영 계속하기',
    '메인 메뉴로 돌아가기',
  ])
    assert.ok(html.includes(label));
  assert.equal(sessionScreen(ending, true), 'title');
  assert.equal(sessionScreen(ending, false), 'act2Complete');
});
test('entering free play preserves city, characters, secrets, day, tenure and all history', () => {
  assert.equal(free.gameMode, 'freePlay');
  assert.equal(free.currentAct, 'ACT_II');
  assert.equal(free.flowPhase, 'playing');
  for (const key of [
    'resources',
    'relationshipValues',
    'discoveredSecrets',
    'storyFlags',
    'decisionHistory',
    'supervisorHistory',
    'currentDay',
    'supervisorNumber',
  ] as const)
    assert.deepEqual(free[key], ending[key]);
});
test('400 free-play turns never replay main story, repeat one-time events, or violate per-card cooldown', () => {
  let s = free;
  const seen = new Set(s.completedCardIds);
  const last = { ...s.lastCardDays };
  for (let i = 0; i < 400; i++) {
    const card = CARD_MAP.get(s.currentCardId)!;
    assert.ok(!MAIN_IDS.has(card.id));
    if (!card.repeatable) assert.ok(!seen.has(card.id), card.id);
    if (card.type === 'daily' && last[card.id] !== undefined)
      assert.ok(s.currentDay - last[card.id] > (card.cooldown ?? 20), card.id);
    seen.add(card.id);
    last[card.id] = s.currentDay;
    s = decide(s, choose(s));
    assert.equal(s.gameMode, 'freePlay');
    assert.equal(s.currentAct, 'ACT_II');
  }
  assert.ok(s.decisionHistory.some((h) => h.gameMode === 'freePlay'));
  assert.notDeepEqual(s.resources, free.resources);
});
test('all 25 conditionals have a real selectable cause, including the 19 new policy proposals', () => {
  assert.equal(POLICY_LINKS.length, 19);
  for (const p of POLICY_LINKS) {
    const card = FREE_PLAY_PROPOSALS.find((c) => c.rightChoice.scheduleCardId === p.followUp)!;
    const initial = {
      ...free,
      currentCardId: card.id,
      completedCardIds: free.completedCardIds.filter((id) => id !== card.id && id !== p.followUp),
      resources: { citizenTrust: 50, fairness: 50, personalFreedom: 50, publicSafety: 50 },
      crisisState: null,
    };
    assert.equal(entryFailure(card.id, initial), null);
    const approved = decide(initial, 'right');
    assert.equal(approved.storyFlags[p.flag], true);
    assert.equal(approved.currentCardId, p.followUp);
    const rejected = decide(initial, 'left');
    assert.equal(rejected.storyFlags[p.flag], false);
    assert.notEqual(rejected.currentCardId, p.followUp);
  }
  const flags = new Set(
    ALL_CARDS.flatMap((c) => [c.leftChoice, c.rightChoice]).flatMap((c) =>
      Object.keys(c.flags || {}),
    ),
  );
  for (const c of CONDITIONAL_CARDS)
    for (const flag of Object.keys(c.requiredFlags || {})) assert.ok(flags.has(flag), flag);
});
test('emergency response precedes explicit story links and solved strike-2 crisis cannot dismiss', () => {
  const base = {
    ...act2,
    resources: { citizenTrust: 50, fairness: 50, personalFreedom: 50, publicSafety: 12 },
    crisisState: null,
  };
  const crisis = decide(base, 'left');
  assert.equal(crisis.currentCardId, 'crisis_safety_low');
  const s = {
    ...free,
    currentCardId: 'crisis_safety_low',
    resources: { citizenTrust: 50, fairness: 50, personalFreedom: 50, publicSafety: 8 },
    crisisState: {
      resourceId: 'publicSafety' as const,
      crisisType: 'low' as const,
      crisisCardId: 'crisis_safety_low',
      triggeredDay: 1,
      instanceId: 'safety:1',
      strikeCount: 2,
    },
  };
  const r = transitionSession(s, { type: 'decision', direction: 'left' });
  assert.equal(r.replaced, false);
  assert.equal(r.nextState.crisisState, null);
  assert.equal(r.nextState.gameMode, 'freePlay');
  const recurring = detectResourceCrisis({ ...s.resources, publicSafety: 5 }, null, 90)!;
  assert.notEqual(recurring.instanceId, s.crisisState.instanceId);
  assert.equal(
    selectNextCard({ ...free, crisisState: recurring, crisisResolvedIds: ['crisis_safety_low'] })
      .card!.id,
    'crisis_safety_low',
  );
});
test('free-play replacement preserves story, relationships, mode, cooldown and history; oath resumes operation', () => {
  const card = DAILY_CARDS.find((c) => (c.leftChoice.effects.publicSafety || 0) < 0)!;
  const s = {
    ...free,
    currentCardId: card.id,
    resources: { citizenTrust: 50, fairness: 50, personalFreedom: 50, publicSafety: 1 },
    lastCardDays: { ...free.lastCardDays, [card.id]: -1000 },
  };
  const r = transitionSession(s, { type: 'decision', direction: 'left' });
  assert.equal(r.replaced, true);
  assert.equal(r.nextState.gameMode, 'freePlay');
  assert.equal(r.nextState.currentAct, 'ACT_II');
  assert.equal(r.nextState.supervisorNumber, s.supervisorNumber + 1);
  assert.deepEqual(r.nextState.discoveredSecrets, s.discoveredSecrets);
  assert.equal(r.nextState.decisionHistory.length, s.decisionHistory.length + 1);
  assert.ok(r.nextState.recentCardIds.includes(card.id));
  assert.equal(decide(r.nextState).currentCardId, 'supervisor_replacement_orientation');
  assert.equal(decide(decide(r.nextState)).gameMode, 'freePlay');
});
test('delayed effects are applied once before crisis and decision ledger uses final resource values', () => {
  const source = 'act1_12_whistleblower_approach';
  const pending = CARD_MAP.get('act1_04_movement_surveillance')!.rightChoice.delayedEffect!;
  const s = {
    ...createInitialGameState(),
    currentCardId: source,
    currentDay: 20,
    completedCardIds: ACT1_ORDER.slice(0, 11),
    resources: { citizenTrust: 8, fairness: 60, personalFreedom: 60, publicSafety: 60 },
    pendingDelayedEffects: [pending],
  };
  const n = decide(s, 'left');
  assert.equal(n.resources.citizenTrust, 10);
  assert.equal(n.currentCardId, 'crisis_trust_low');
  assert.deepEqual(n.decisionHistory[0].resourcesAfter, n.resources);
  assert.equal(n.appliedDelayedEffectIds.filter((id) => id === pending.id).length, 1);
});
test('legacy save migration backs up original bytes, restores result screens, and keeps existing ACT II', () => {
  const memory = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memory.set(k, v);
    },
    removeItem: (k: string) => memory.delete(k),
  } as any;
  const legacy = { ...ending, schemaVersion: 4 };
  delete (legacy as any).gameMode;
  delete (legacy as any).flowPhase;
  const raw = JSON.stringify(legacy);
  memory.set(SAVE_KEY, raw);
  const loaded = loadGameState();
  assert.equal(loaded.success, true);
  assert.equal(memory.get(loaded.backupKey!), raw);
  assert.equal(loaded.state!.flowPhase, 'act2Complete');
  assert.deepEqual(loaded.state!.decisionHistory, JSON.parse(raw).decisionHistory);
  const oldAct1 = migrateGameState({ ...act1, schemaVersion: 4, flowPhase: undefined });
  assert.equal(oldAct1.flowPhase, 'act1Complete');
  const early = migrateGameState({
    ...act2,
    schemaVersion: 4,
    storyFlags: {},
    flowPhase: undefined,
  });
  assert.equal(early.currentAct, 'ACT_II');
  const resumed = migrateGameState(JSON.parse(JSON.stringify(free)));
  assert.equal(resumed.gameMode, 'freePlay');
  assert.deepEqual(resumed.resources, free.resources);
});
test('unsupported ACT III, missing targets, duplicates and chapter skips are diagnosed', () => {
  for (const id of ['act3_01', 'missing', 'act1_01_inauguration', 'act2_ch3_08_act2_epilogue']) {
    const r = selectNextCard(act2, id);
    assert.ok(r.diagnostics.length > 0, id);
    assert.notEqual(r.card?.id, id);
  }
  assert.ok(ending.currentAct !== 'ACT_III_PREVIEW');
});
test('all nine crisis types are reachable through actual resource detection, all six replacement cards exist', () => {
  const found = new Set<string>();
  for (const key of ['citizenTrust', 'fairness', 'personalFreedom', 'publicSafety'])
    for (const value of [5, 98])
      found.add(
        detectResourceCrisis(
          {
            ...free.resources,
            citizenTrust: 50,
            fairness: 50,
            personalFreedom: 50,
            publicSafety: 50,
            [key]: value,
            ...(value > 90 ? { [highHarm[key as keyof typeof highHarm]]: 19 } : {}),
          },
          null,
          20,
        )!.crisisCardId,
      );
  found.add(
    detectResourceCrisis(
      { citizenTrust: 5, fairness: 5, personalFreedom: 50, publicSafety: 50 },
      null,
      20,
    )!.crisisCardId,
  );
  assert.deepEqual([...found].sort(), CRISIS_CARDS.map((c) => c.id).sort());
  assert.equal(SUPERVISOR_REPLACEMENT_CARDS.length, 6);
});

test('save migration cannot overwrite the only copy when backup storage fails', () => {
  const raw = JSON.stringify({ ...act1, schemaVersion: 4 });
  let overwritten = false;
  globalThis.localStorage = {
    getItem: () => raw,
    setItem: (key: string) => {
      if (key !== SAVE_KEY) throw new Error('quota');
      overwritten = true;
    },
    removeItem() {},
  } as any;
  assert.equal(loadGameState().success, false);
  assert.equal(overwritten, false);
});
test('future queued events are retained and story is not starved by municipal events', () => {
  const s = {
    ...createInitialGameState(),
    scheduledCardQueue: ['cond_triage_lawsuit'],
    consecutiveSideEvents: 2,
  };
  const selected = selectNextCard(s);
  assert.equal(selected.card!.id, ACT1_ORDER[0]);
  assert.ok(selected.remainingScheduledQueue.includes('cond_triage_lawsuit'));
  const conditions = {
    ...s,
    storyFlags: {
      mobility_data_enabled: true,
      facial_tracking_active: true,
      citizen_appeal_enabled: true,
    },
  };
  assert.equal(selectNextCard(conditions).card!.id, ACT1_ORDER[0]);
});
test('current and future save round trips preserve intro phase, counters and free play', () => {
  const resumedIntro = migrateGameState(JSON.parse(JSON.stringify(intro)));
  assert.equal(resumedIntro.flowPhase, 'act2Intro');
  assert.equal(sessionScreen(resumedIntro), 'act2Intro');
  const resumedFree = migrateGameState(JSON.parse(JSON.stringify(free)));
  assert.equal(resumedFree.gameMode, 'freePlay');
  assert.deepEqual(resumedFree.relationshipValues, free.relationshipValues);
  assert.throws(() => migrateGameState({ ...free, schemaVersion: 999 }), /NEWER_SAVE_VERSION/);
});
test('unplayed legacy past chapters are marked skipped, without fake decisions or chapter regression', () => {
  const old = {
    ...act2,
    schemaVersion: 4,
    currentChapter: 3 as const,
    currentCardId: 'act2_ch3_05_oracle_interrogation',
    completedCardIds: ['act2_ch3_01_cross_system_anomaly', 'act2_ch3_03_civitas_exposure'],
  };
  const migrated = migrateGameState(old);
  assert.equal(migrated.currentChapter, 3);
  assert.ok(migrated.skippedStoryCardIds.includes('act2_ch1_09_icu_audit_telemetry'));
  assert.deepEqual(migrated.decisionHistory, old.decisionHistory);
  assert.deepEqual(
    new Set(migrated.completedCardIds),
    new Set([...old.completedCardIds, ...old.decisionHistory.map((h) => h.cardId)]),
  );
  const finished = playUntil((s) => s.flowPhase === 'act2Complete', migrated);
  assert.equal(finished.currentChapter, 3);
});

test('original 140 cards are reachable across real story routes and resource/policy boundary scenarios', () => {
  const reached = new Set<string>();
  let s = createInitialGameState();
  for (let i = 0; i < 1600; i++) {
    let action: any;
    if (s.flowPhase === 'act1Complete') action = { type: 'requestAct2' };
    else if (s.flowPhase === 'act2Intro') action = { type: 'confirmAct2' };
    else if (s.flowPhase === 'act2Complete') action = { type: 'enterFreePlay' };
    else {
      reached.add(s.currentCardId);
      const forced: Record<string, 'left' | 'right'> = {
        act1_04_movement_surveillance: 'right',
        act1_06_medical_triage: 'right',
        act1_07_explainability_dilemma: 'left',
      };
      action = {
        type: 'decision',
        direction: s.currentCardId.startsWith('free_policy_')
          ? 'right'
          : forced[s.currentCardId] || choose(s),
      };
    }
    s = transitionSession(s, action).nextState;
  }
  for (const card of CRISIS_CARDS) {
    let resources = { citizenTrust: 50, fairness: 50, personalFreedom: 50, publicSafety: 50 };
    const keys: Record<string, keyof typeof resources> = {
      trust: 'citizenTrust',
      fairness: 'fairness',
      freedom: 'personalFreedom',
      safety: 'publicSafety',
    };
    if (card.id === 'crisis_compound_collapse') {
      resources.citizenTrust = 5;
      resources.fairness = 5;
    } else {
      const part = card.id.split('_');
      resources[keys[part[1]]] = part[2] === 'high' ? 98 : 5;
      if(part[2] === 'high') resources[highHarm[keys[part[1]]]] = 19;
    }
    const crisisState = detectResourceCrisis(resources, null, free.currentDay)!;
    const state = {
      ...free,
      resources,
      crisisState,
      currentCardId: selectNextCard({ ...free, resources, crisisState }).card!.id,
    };
    assert.equal(state.currentCardId, card.id);
    assert.equal(decide(state, choose(state)).decisionHistory[0].cardId, card.id);
    reached.add(card.id);
  }
  for (const key of ['citizenTrust', 'fairness', 'personalFreedom', 'publicSafety'] as const) {
    const source = DAILY_CARDS.flatMap((c) =>
      (['left', 'right'] as const).map((direction) => ({ card: c, direction })),
    ).find(
      (x) =>
        (x.card[(x.direction + 'Choice') as 'leftChoice' | 'rightChoice'].effects[key] || 0) < 0,
    )!;
    const state = {
      ...free,
      currentCardId: source.card.id,
      lastCardDays: {},
      resources: {
        citizenTrust: 50,
        fairness: 50,
        personalFreedom: 50,
        publicSafety: 50,
        [key]: 1,
      },
    };
    const result = transitionSession(state, { type: 'decision', direction: source.direction });
    assert.equal(result.replaced, true);
    reached.add(result.nextState.currentCardId);
    const oath = decide(result.nextState);
    assert.equal(oath.currentCardId, 'supervisor_replacement_orientation');
    reached.add(oath.currentCardId);
  }
  const resources = { citizenTrust: 8, fairness: 80, personalFreedom: 80, publicSafety: 80 };
  const crisisState = detectResourceCrisis(resources, null, free.currentDay)!;
  const firstResponse = decide(
    { ...free, resources, crisisState, currentCardId: crisisState.crisisCardId },
    'right',
  );
  assert.equal(firstResponse.supervisorNumber,free.supervisorNumber);
  const replacement = decide(firstResponse,'right');
  assert.equal(replacement.currentCardId, 'supervisor_replacement_crisis');
  reached.add(replacement.currentCardId);
  const originals = ALL_CARDS.filter((c) => !c.id.startsWith('free_policy_'));
  assert.equal(originals.length, 140);
  assert.deepEqual(
    originals.filter((c) => !reached.has(c.id)).map((c) => c.id),
    [],
  );
});

test('all original card data files remain byte-for-byte identical to the original 140-card release', async () => {
  const fs = await import('node:fs/promises');
  const crypto = await import('node:crypto');
  const manifest = JSON.parse(
    await fs.readFile(new URL('./original-content.sha256.json', import.meta.url), 'utf8'),
  );
  for (const [path, hash] of Object.entries(manifest))
    assert.equal(
      crypto
        .createHash('sha256')
        .update(await fs.readFile(new URL('../' + path, import.meta.url)))
        .digest('hex'),
      hash,
      path,
    );
});
test('old saves with missing completion arrays reconstruct only actual recorded choices', () => {
  const old = { ...act2, schemaVersion: 1 };
  delete (old as any).completedCardIds;
  const restored = migrateGameState(old);
  for (const record of old.decisionHistory)
    assert.ok(restored.completedCardIds.includes(record.cardId));
  assert.deepEqual(restored.decisionHistory, old.decisionHistory);
});

test('forged phase flags alone cannot bypass required story completion', () => {
  const invalid = {
    ...createInitialGameState(),
    flowPhase: 'act1Complete' as const,
    storyFlags: { act1_completed: true },
  };
  assert.equal(
    transitionSession(invalid, { type: 'requestAct2' }).nextState.flowPhase,
    'act1Complete',
  );
  assert.equal(
    transitionSession({ ...invalid, flowPhase: 'act2Intro' }, { type: 'confirmAct2' }).nextState
      .currentAct,
    'ACT_I',
  );
  const invalidFree = {
    ...invalid,
    currentAct: 'ACT_II' as const,
    flowPhase: 'act2Complete' as const,
    storyFlags: { act2_completed: true },
  };
  assert.equal(
    transitionSession(invalidFree, { type: 'enterFreePlay' }).nextState.gameMode,
    'story',
  );
});
test('legacy ACT III teaser is presented as an ACT II result action and does not unlock ACT III', () => {
  const previous = ending.decisionHistory.find(
    (h) => h.cardId === 'act2_ch3_07_final_civitas_verdict',
  )!;
  const s = {
    ...ending,
    flowPhase: 'playing' as const,
    currentCardId: ACT2_END,
    completedCardIds: ending.completedCardIds.filter((id) => id !== ACT2_END),
    storyFlags: { ...ending.storyFlags, act2_completed: false, act2_viewed_epilogue: false },
    resources: { citizenTrust: 50, fairness: 50, personalFreedom: 50, publicSafety: 50 },
  };
  const n = decide(s, 'right');
  assert.equal(n.flowPhase, 'act2Complete');
  assert.ok(!n.storyFlags.act3_preview_unlocked);
  assert.ok(!n.decisionHistory[0].choiceText.includes('ACT III'));
});
