import { ALL_CARDS, CARD_MAP } from '../src/data/cards';
import { createInitialGameState } from '../src/engine/gameEngine';
import { transitionSession, SessionAction } from '../src/engine/gameSession';
import { RESOURCE_ORDER } from '../src/engine/resourceEngine';
import { migrateGameState } from '../src/services/saveManager';
import { GameState, ResourceId } from '../src/types/game';

export const STRATEGIES = ['left', 'right', 'random', 'lowest', ...RESOURCE_ORDER] as const;
export type Strategy = typeof STRATEGIES[number];
type Direction = 'left' | 'right';
// Independent choice RNG: engine draws cannot perturb the player's random choices.
function randomSource(seed: number) {
  let n = seed >>> 0;
  return () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
}
export function strategyDirection(state: GameState, strategy: Strategy, random: () => number): Direction {
  if (strategy === 'left' || strategy === 'right') return strategy;
  if (strategy === 'random') return random() < .5 ? 'left' : 'right';
  const target = strategy === 'lowest'
    ? RESOURCE_ORDER.reduce((a, b) => state.resources[a] <= state.resources[b] ? a : b)
    : strategy;
  // Evaluate choices through the real engine, including delays, crises and replacement.
  const utility = (direction: Direction) => {
    const result = transitionSession(state, { type:'decision', direction });
    const r = result.nextState.resources;
    // Avoid farming replacement recovery; ties protect other endangered resources.
    return r[target] * 10 + RESOURCE_ORDER.reduce((s,k) => s + Math.min(r[k], 25), 0)
      - (result.replaced ? 2000 : 0);
  };
  const left = utility('left'), right = utility('right');
  return left === right ? (random() < .5 ? 'left' : 'right') : left > right ? 'left' : 'right';
}
export function emptyMetrics() {
  return {
    runs:0, act1:0, act2:0, freePlay:0, finished100:0, replacements:0, crises:0,
    decisions:0, freeDecisions:0, waits:0, repeatedCards:0, sameSpeaker:0, speakerPairs:0,
    adjacentRepeat:0, municipalAdjacentRepeat:0, stalls:0, limits:0, resourceViolations:0, saveViolations:0,
    ledgerViolations:0, oneTimeViolations:0, cooldownViolations:0,
    lowEpisodes:0, highEpisodes:0, followUps:0, roundTrips:0,
    resources:Object.fromEntries(RESOURCE_ORDER.map(k => [k,{sum:0,count:0,min:100,max:0,preRecoveryMin:100}])) as Record<ResourceId,{sum:number;count:number;min:number;max:number;preRecoveryMin:number}>,
    cards:{} as Record<string,number>, choices:{} as Record<string,{left:number;right:number}>,
    stallExamples:[] as string[],
  };
}
export function simulate(strategy: Strategy, seed: number, metrics = emptyMetrics(), freeDays = 100) {
  metrics.runs++;
  const random = randomSource(seed ^ 0x9e3779b9);
  let state = { ...createInitialGameState(), rngSeed:seed % 233280 };
  let freeDay = 0, act1 = false, act2 = false, free = false;
  const seen = new Set<string>(), episodes = new Set<string>();
  let lastSpeaker = '', lastCard = '';
  const recordResources = (s: GameState) => {
    for (const key of RESOURCE_ORDER) {
      const v = s.resources[key], m = metrics.resources[key];
      m.sum += v; m.count++; m.min = Math.min(m.min,v); m.max = Math.max(m.max,v);
      if (!Number.isFinite(v) || v < 0 || v > 100 || !Number.isInteger(v)) metrics.resourceViolations++;
      const beforeRecovery = v - (s.decisionHistory[0]?.supervisorRecoveryDelta?.[key] || 0);
      m.preRecoveryMin = Math.min(m.preRecoveryMin,beforeRecovery);
    }
  };
  recordResources(state);
  for (let step = 0; step < 400; step++) {
    if (state.flowPhase === 'act1Complete' && !act1) { act1=true; metrics.act1++; }
    if (state.flowPhase === 'act2Complete' && !act2) { act2=true; metrics.act2++; }
    if (state.gameMode === 'freePlay' && !free) { free=true; freeDay=state.currentDay; metrics.freePlay++; }
    if (free && state.currentDay - freeDay >= freeDays) { metrics.finished100++; return { state, metrics }; }
    let action: SessionAction;
    if (state.flowPhase === 'act1Complete') action = { type:'requestAct2' };
    else if (state.flowPhase === 'act2Intro') action = { type:'confirmAct2' };
    else if (state.flowPhase === 'act2Complete') action = { type:'enterFreePlay' };
    else if (state.waitingUntilDay) { action={type:'wait'}; metrics.waits++; }
    else action={type:'decision',direction:strategyDirection(state,strategy,random)};
    const previous = state;
    const result = transitionSession(state,action);
    state = result.nextState;
    const madeDecision = state.decisionHistory.length === previous.decisionHistory.length + 1;
    if (state === previous || (action.type === 'decision' && !madeDecision)) {
      metrics.stalls++;
      if(metrics.stallExamples.length<5) metrics.stallExamples.push(`${seed}:${state.currentCardId}:${state.selectionDiagnostics.at(-1)}`);
      return {state,metrics};
    }
    if (madeDecision && action.type === 'decision') {
      const card = CARD_MAP.get(previous.currentCardId)!;
      metrics.decisions++; if(free) metrics.freeDecisions++;
      metrics.cards[card.id] = (metrics.cards[card.id] || 0) + 1;
      const choices = metrics.choices[card.id] ||= {left:0,right:0}; choices[action.direction]++;
      if(seen.has(card.id)) { metrics.repeatedCards++; if(!card.repeatable && card.type!=='transition') metrics.oneTimeViolations++; }
      if(lastSpeaker) { metrics.speakerPairs++; if(lastSpeaker===card.characterId) metrics.sameSpeaker++; }
      if(lastCard===card.id) { metrics.adjacentRepeat++; if(card.type!=='crisis' && card.type!=='transition') metrics.municipalAdjacentRepeat++; }
      const lastDay = previous.lastCardDays[card.id];
      if(card.type==='daily' && lastDay!==undefined && previous.currentDay-lastDay <= (card.cooldown??20)) metrics.cooldownViolations++;
      seen.add(card.id); lastCard=card.id; lastSpeaker=card.characterId;
      if(result.replaced) metrics.replacements++;
      if(card.type==='conditional') metrics.followUps++;
      const ledger=state.decisionHistory[0];
      for(const k of RESOURCE_ORDER) if(ledger.resourcesAfter[k]!==state.resources[k] || previous.resources[k]+(ledger.resourceDelta[k]||0)!==state.resources[k]) metrics.ledgerViolations++;
      recordResources(state);
    }
    if(state.crisisState && !episodes.has(state.crisisState.instanceId!)) {
      episodes.add(state.crisisState.instanceId!); metrics.crises++;
      if(state.crisisState.crisisType==='high') metrics.highEpisodes++; else metrics.lowEpisodes++;
    }
    // Real save restore at each screen transition and every 25 decisions; continue from restored state.
    if(action.type!=='decision' || (madeDecision && state.decisionHistory.length%100===0)) {
      const serialized=JSON.stringify(state);
      const restored=migrateGameState(JSON.parse(serialized)); metrics.roundTrips++;
      const stable = (s: GameState) => JSON.stringify([s.resources,s.currentDay,s.currentAct,s.currentChapter,s.gameMode,s.flowPhase,s.currentCardId,s.rngSeed,s.completedCardIds,s.decisionHistory,s.relationshipValues,s.discoveredSecrets,s.supervisorHistory,s.scheduledCardQueue,s.pendingDelayedEffects]);
      if(stable(restored)!==stable(state)) metrics.saveViolations++;
      state=restored;
    }
  }
  metrics.limits++;
  return {state,metrics};
}
export function auditChoices() {
  const totals = Object.fromEntries(RESOURCE_ORDER.map(k=>[k,{left:0,right:0,min:0,max:0}])) as Record<ResourceId,{left:number;right:number;min:number;max:number}>;
  const dominated: string[] = [], equal: string[] = [], allPositive: string[] = [];
  const effects: Record<string,unknown> = {};
  for(const c of ALL_CARDS) {
    const l=c.leftChoice.effects,r=c.rightChoice.effects;
    effects[c.id]={title:c.title,type:c.type,left:l,right:r,leftDelay:c.leftChoice.delayedEffect,rightDelay:c.rightChoice.delayedEffect};
    for(const k of RESOURCE_ORDER) { const m=totals[k]; m.left+=l[k]||0;m.right+=r[k]||0;m.min=Math.min(m.min,l[k]||0,r[k]||0);m.max=Math.max(m.max,l[k]||0,r[k]||0); }
    for(const d of ['left','right'] as const) {
      const a=c[d+'Choice' as 'leftChoice'].effects,b=c[d==='left'?'rightChoice':'leftChoice'].effects;
      if(RESOURCE_ORDER.every(k=>(a[k]||0)>=(b[k]||0)) && RESOURCE_ORDER.some(k=>(a[k]||0)>(b[k]||0))) dominated.push(`${c.id}:${d}`);
      if(RESOURCE_ORDER.every(k=>(a[k]||0)>=0) && RESOURCE_ORDER.some(k=>(a[k]||0)>0)) allPositive.push(`${c.id}:${d}`);
    }
    if(RESOURCE_ORDER.every(k=>(l[k]||0)===(r[k]||0))) equal.push(c.id);
  }
  return {cardCount:ALL_CARDS.length,totals,dominated,equal,allPositive,effects};
}
