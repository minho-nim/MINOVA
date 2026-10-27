/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ResourceId = 'citizenTrust' | 'fairness' | 'personalFreedom' | 'publicSafety';

export interface Resources {
  citizenTrust: number;     // 1. 시민 신뢰 (0-100)
  fairness: number;         // 2. 공정성 (0-100)
  personalFreedom: number;  // 3. 개인 자유 (0-100)
  publicSafety: number;     // 4. 사회 안전 (0-100)
}

export type ResourceDelta = Partial<Record<ResourceId, number>>;

export type CharacterId =
  | 'oracle'
  | 'seoYoonha'
  | 'kangDohyun'
  | 'hanJiwoo'
  | 'baekSion'
  | 'ohHyejin'
  | 'citizen'
  | 'council';

export type CharacterEmotion =
  | 'neutral'
  | 'worried'
  | 'angry'
  | 'confident'
  | 'uncertain'
  | 'glitch';

export type OracleVisualState =
  | 'normal'     // 차분한 청록색
  | 'confident'  // 선명한 발광
  | 'uncertain'  // 미세한 흔들림
  | 'error'      // 짧은 글리치
  | 'conflict'   // 경고 색상
  | 'glitch';    // 고강도 시스템 글리치

export interface Character {
  id: CharacterId;
  name: string;
  role: string;
  organization: string;
  description: string;
  themeColor: string;
  voiceStyle: string;
}

export type CardCategory = 'mainStory' | 'conditional' | 'daily' | 'crisis' | 'supervisorReplacement';
export type CardType = 'story' | 'conditional' | 'crisis' | 'daily' | 'transition';

export type StoryFlagValue = boolean | number | string;
export type StoryFlags = Record<string, StoryFlagValue>;

export interface DelayedEffect {
  id: string;                // 고유 식별자 (중복 적용 방지)
  triggerCardId: string;     // 해당 후속 사건의 카드 ID와 연결
  effects: ResourceDelta;    // 지연 발동될 자원 변화량
  description: string;       // 지연 발동 사유 설명
}

export interface CardChoice {
  text: string;
  label?: string;
  actionLabel?: string;      // 짧고 명확한 행동명 (예: '즉시 중단', '조건부 승인')
  effects: ResourceDelta;    // 즉시 적용 효과
  delayedEffect?: DelayedEffect; // 특정 후속 사건 조건에서 발동하는 지연 효과
  flags?: Partial<StoryFlags>;
  relationshipDeltas?: Partial<Record<CharacterId, number>>;
  nextCardId?: string;
  scheduleCardId?: string;   // 후속으로 예약 큐에 등록할 카드 ID
  consequence: string;       // 판단 기록부에 저장될 결과 요약
  operationalDelta?: number; // 내부 운영 능력 지표
}

export interface GameCard {
  id: string;
  type: CardType;
  category?: CardCategory;
  act: 'ACT_I' | 'ACT_II';
  characterId: CharacterId;
  emotion?: CharacterEmotion;       // 캐릭터 감정 상태 (neutral, worried, angry, confident, uncertain)
  oracleState?: OracleVisualState;  // ORACLE 전용 비주얼 상태
  title: string;
  topicBadge: string;        // '공정성과 차별', '개인정보와 감시' 등
  dialogue: string | ((flags: StoryFlags, resources: Resources) => string);
  leftChoice: CardChoice;
  rightChoice: CardChoice;
  requiredFlags?: Record<string, StoryFlagValue>;
  excludedFlags?: string[];
  minDay?: number;
  priority: number;
  weight: number;
  repeatable?: boolean;
  cooldown?: number;         // 최소 쿨다운 (기본 20)
  isMainStory?: boolean;
}

export interface DecisionRecord {
  id: string;
  day: number;
  cardId: string;
  cardTitle: string;
  characterId: CharacterId;
  characterName: string;
  topic: string;
  direction: 'left' | 'right';
  choiceText: string;
  resourceDelta: ResourceDelta;
  resourcesAfter: Resources;
  consequenceSummary: string;
  timestamp: number;
  linkedFollowUpCardId?: string;
  delayedEffectApplied?: {
    id: string;
    description: string;
    delta: ResourceDelta;
  };
}

export interface CrisisState {
  resourceId: ResourceId | 'compound' | 'high_trust' | 'high_safety';
  crisisType: 'low' | 'high' | 'compound';
  crisisCardId: string;
  triggeredDay: number;
  strikeCount: number; // 0, 1 -> 2 triggers replacement
}

export interface SupervisorRecord {
  supervisorNumber: number;
  tenureDays: number;
  dismissalReason: string;
  endDay: number;
  keyVerdict: string;
}

export type ActId = 'ACT_I' | 'ACT_II' | 'ACT_III_PREVIEW';

export interface ChapterObjective {
  id: string;
  act: 'ACT_I' | 'ACT_II';
  chapter: 1 | 2 | 3;
  title: string;
  category: 'medical' | 'hiring' | 'civitas' | 'governance';
  description: string;
}

export interface GameNotification {
  id: string;
  type: 'objective' | 'act_transition' | 'secret' | 'warning';
  title: string;
  subtitle?: string;
  timestamp: number;
}

export interface GameState {
  gameId: string;
  schemaVersion: number;
  currentDay: number;
  supervisorNumber: number;
  supervisorTenure: number;
  currentAct: ActId;
  currentChapter: 1 | 2 | 3;
  currentCardId: string;
  resources: Resources;
  operationalCapacity: number; // 내부 도시 운영 능력 (기본 50, UI 비표시)
  pendingDelayedEffects: DelayedEffect[]; // 아직 트리거되지 않은 지연 효과 목록
  appliedDelayedEffectIds: string[];    // 이미 적용된 지연 효과 ID (중복 적용 방지)
  completedObjectiveIds: string[];      // 달성한 챕터 목표 ID 목록
  recentCardIds: string[];              // 최근 등장 카드 큐 (최소 20회 쿨다운 검사용)
  scheduledCardQueue: string[];         // 조건부로 예약된 후속 사건 큐
  crisisResolvedIds: string[];          // 해결된 위기 카드 ID 목록
  storyFlags: StoryFlags;
  relationshipValues: Record<CharacterId, number>;
  discoveredSecrets: string[];
  decisionHistory: DecisionRecord[];
  completedCardIds: string[];
  crisisState: CrisisState | null;
  supervisorHistory: SupervisorRecord[];
  rngSeed: number;
  lastSavedAt: string;
  isActCompleted: boolean;
  activeNotification?: GameNotification | null;
}
