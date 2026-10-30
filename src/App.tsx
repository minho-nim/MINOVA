/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, ResourceDelta, SupervisorRecord } from './types/game';
import { CARD_MAP } from './data/cards';
import { createInitialGameState } from './engine/gameEngine';
import { loadGameState, saveGameState, clearGameState } from './services/saveManager';
import { playDecisionChime, playCrisisAlarm, playSwipeTick } from './utils/audio';

import { Header } from './components/Header';
import { ResourceBar } from './components/ResourceBar';
import { GameCard } from './components/GameCard';
import { Controls } from './components/Controls';
import { TitleScreen } from './components/TitleScreen';
import { DecisionHistoryModal } from './components/DecisionHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { SupervisorReplacementModal } from './components/SupervisorReplacementModal';
import { ActCompleteModal } from './components/ActCompleteModal';
import { ActTransitionModal } from './components/ActTransitionModal';
import { transitionSession, SessionAction } from './engine/gameSession';
import { Act2CompleteScreen } from './components/Act2CompleteScreen';
import { NotificationToast } from './components/NotificationToast';
import { CHARACTERS } from './data/characters';
import { MAIN_CAST, DISPLAY_ROLES } from './data/characterArt';
import { CharacterPortrait } from './components/CharacterPortrait';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [inTitleScreen, setInTitleScreen] = useState<boolean>(true);
  const [previewDirection, setPreviewDirection] = useState<'left' | 'right' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [saveError, setSaveError] = useState(false);
  const persistGame = useCallback((state: GameState) => {
    setSaveError(!saveGameState(state));
  }, []);

  // Modals & Panels
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isChoiceDetailsOpen,setIsChoiceDetailsOpen]=useState(false);
  useEffect(()=>{
    document.body.classList.toggle('game-active',!inTitleScreen);
    return()=>document.body.classList.remove('game-active');
  },[inTitleScreen]);
  const [dossierTab, setDossierTab] = useState<
    'objectives' | 'history' | 'investigations' | 'secrets'
  >('history');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState<boolean>(false);
  const [lastSupervisorRecord, setLastSupervisorRecord] = useState<SupervisorRecord | null>(null);
  const decisionLock = useRef(false);
  const decisionTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(()=>()=>decisionTimers.current.forEach(clearTimeout),[]);
  const inputLocked =
    isHistoryOpen || isSettingsOpen || isReplacementModalOpen || isChoiceDetailsOpen || gameState?.flowPhase !== 'playing';
  const applySessionAction = (action: SessionAction) => {
    if (!gameState) return;
    const result = transitionSession(gameState, action);
    setGameState(result.nextState);
    persistGame(result.nextState);
  };

  // Check saved game on mount
  useEffect(() => {
    const saved = loadGameState();
    if (saved.success && saved.state) {
      setGameState(saved.state);
      // Stay on TitleScreen so player can choose whether to resume or start new
    }
  }, []);

  // Handle starting a new game
  const handleStartNewGame = () => {
    decisionTimers.current.forEach(clearTimeout);
    decisionTimers.current=[];
    setIsProcessing(false);
    setIsSettingsOpen(false);
    setIsHistoryOpen(false);
    setIsReplacementModalOpen(false);
    decisionLock.current = false;
    clearGameState();
    const freshState = createInitialGameState();
    setGameState(freshState);
    persistGame(freshState);
    setInTitleScreen(false);
  };

  // Handle resuming existing game
  const handleResumeGame = () => {
    if (gameState) {
      setInTitleScreen(false);
    } else {
      handleStartNewGame();
    }
  };

  // Active current card
  const currentCard = useMemo(() => {
    if (!gameState) return null;
    return CARD_MAP.get(gameState.currentCardId) || CARD_MAP.get('act1_01_inauguration')!;
  }, [gameState]);

  // Preview delta calculation for ResourceBar indicator dots
  const previewDelta: ResourceDelta | null = useMemo(() => {
    if (!currentCard || !previewDirection) return null;
    return previewDirection === 'left'
      ? currentCard.leftChoice.effects
      : currentCard.rightChoice.effects;
  }, [currentCard, previewDirection]);

  // Handle swipe or button decision commit
  const handleDecision = useCallback(
    (direction: 'left' | 'right') => {
      if (!gameState || isProcessing || inputLocked || decisionLock.current) return;
      decisionLock.current = true;
      setIsProcessing(true);

      // Play audio feedback
      playDecisionChime(direction, soundEnabled);

      const { nextState, replaced, dismissalReason } = transitionSession(gameState, {
        type: 'decision',
        direction,
      });

      // Persist state
      persistGame(nextState);
      setPreviewDirection(null);
      decisionTimers.current.push(setTimeout(()=>{
      setGameState(nextState);

      // Check if replacement was triggered
      if (replaced) {
        playCrisisAlarm(soundEnabled);
        const latestRecord = nextState.supervisorHistory[0] || {
          supervisorNumber: gameState.supervisorNumber,
          tenureDays: gameState.supervisorTenure,
          dismissalReason: dismissalReason || '시정 관리 지표 위기',
          endDay: gameState.currentDay,
          keyVerdict: '',
        };
        setLastSupervisorRecord(latestRecord);
        setIsReplacementModalOpen(true);
      } else if (nextState.crisisState && !gameState.crisisState) {
        // Just entered a crisis
        playCrisisAlarm(soundEnabled);
      }

      // Re-enable interactions after brief cool-down
      decisionTimers.current.push(setTimeout(() => {
        setIsProcessing(false);
        decisionLock.current = false;
        decisionTimers.current=[];
      }, 150));
      },200));
    },
    [gameState, isProcessing, soundEnabled, inputLocked],
  );

  const handleHoverDirectionChange = useCallback(
    (dir: 'left' | 'right' | null) => {
      setPreviewDirection(dir);
      if (dir) {
        playSwipeTick(soundEnabled);
      }
    },
    [soundEnabled],
  );

  const handleToggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleConfirmReplacement = () => {
    setIsReplacementModalOpen(false);
  };

  const handleInitiateAct2 = () => applySessionAction({ type: 'requestAct2' });
  const handleConfirmAct2Transition = () => applySessionAction({ type: 'confirmAct2' });

  const handleOpenObjectives = () => {
    setDossierTab('objectives');
    setIsHistoryOpen(true);
  };

  const handleOpenHistory = () => {
    setDossierTab('history');
    setIsHistoryOpen(true);
  };

  const handleDismissNotification = () => {
    if (gameState && gameState.activeNotification) {
      setGameState({
        ...gameState,
        activeNotification: null,
      });
    }
  };

  // If on Title Screen
  if (inTitleScreen) {
    return (
      <div className="min-h-screen bg-[#060911] text-slate-100 flex items-center justify-center font-sans antialiased">
        <TitleScreen
          onStartNewGame={handleStartNewGame}
          onResumeGame={gameState ? handleResumeGame : undefined}
          savedState={gameState}
        />
      </div>
    );
  }

  if (!gameState || !currentCard) {
    return (
      <div className="min-h-screen bg-[#060911] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-xs text-slate-400 font-mono">ORACLE 시스템 초기화 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-shell min-h-screen text-slate-100 font-sans antialiased selection:bg-cyan-900 selection:text-white relative">
      {saveError && (
        <div
          role="alert"
          className="fixed top-0 left-0 right-0 z-[70] bg-amber-950 text-amber-100 px-4 py-2 text-xs text-center"
        >
          브라우저에 진행을 저장하지 못했습니다. 이 화면을 닫기 전에 저장 공간을 확인해 주세요.
        </div>
      )}
      <aside className="game-sidebar">
        <a
          className="wordmark"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setInTitleScreen(true);
          }}
        >
          CROSSROADS<span>AI VERDICT</span>
        </a>
        <p className="eyebrow">NOVA CITY / HUMAN OVERSIGHT</p>
        <h1>
          당신의 판단이
          <br />
          도시의 내일이 됩니다.
        </h1>
        <p className="sidebar-copy">
          하나의 도시, 서로 다른 진실.
          <br />
          사람들의 목소리를 듣고 선택하세요.
        </p>
        <div className="sidebar-roster">
          {MAIN_CAST.map((id) => (
            <div
              key={id}
              className={`roster-person ${currentCard.characterId === id ? 'is-speaking' : ''}`}
              style={{ '--character-color': CHARACTERS[id].themeColor } as React.CSSProperties}
            >
              <CharacterPortrait characterId={id} size={46} />
              <div>
                <strong>{CHARACTERS[id].name}</strong>
                <span>{DISPLAY_ROLES[id] ?? CHARACTERS[id].role}</span>
              </div>
              {currentCard.characterId === id && <i className="live-dot" />}
            </div>
          ))}
        </div>
        <button className="return-title" onClick={() => setInTitleScreen(true)}>
          ← 도시와 인물 소개
        </button>
      </aside>
      {/* Centered Mobile/PC container with max-w 480-500px matching Reigns viewport */}
      <div className="game-console w-full max-w-[480px] sm:max-w-[500px] min-h-screen bg-[#0B0F19] flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.8)] sm:border-x border-slate-800/80 relative overflow-hidden">
        {/* Floating Objective / System Notification Toast */}
        <NotificationToast
          notification={gameState.activeNotification}
          onDismiss={handleDismissNotification}
        />

        {/* 1. Header (Logo, Act & Chapter, Date, Supervisor #, Objectives Trigger) */}
        <Header
          state={gameState}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenObjectives={handleOpenObjectives}
        />

        {/* 2. Resource Gauges Bar (Citizen Trust, Fairness, Personal Freedom, Public Safety) */}
        <ResourceBar
          resources={gameState.resources}
          previewDelta={previewDelta}
          activeCrisisResourceId={gameState.crisisState?.resourceId || null}
        />

        {/* 3. Main Center Area: Swipeable Card */}
        <main className="game-main flex-1 flex flex-col items-center justify-center px-4 py-2 w-full my-auto">
          {isProcessing&&<div className="sr-only" role="status">선택을 기록했습니다 · 다음 안건을 준비합니다</div>}
          {gameState.flowPhase === 'playing' && !gameState.waitingUntilDay ? (
            <GameCard
              key={currentCard.id}
              card={currentCard}
              storyFlags={gameState.storyFlags}
              resources={gameState.resources}
              dialogueContext={gameState}
              onDecision={handleDecision}
              onHoverDirectionChange={handleHoverDirectionChange}
              isProcessing={isProcessing || inputLocked}
              previewDirection={isProcessing?null:previewDirection}
            />
          ) : gameState.waitingUntilDay ? (
            <div className="p-8 text-center">
              <h2>새 안건 대기</h2>
              <p className="text-sm text-slate-400 my-4">
                정책 검토 간격을 지키며 다음 안건을 기다립니다.
              </p>
              <button className="start-button" onClick={() => applySessionAction({ type: 'wait' })}>
                다음 심의일로
              </button>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">스토리 결과를 확인해 주세요.</p>
          )}
        </main>

        {/* 4. Bottom Controls (Left/Right buttons, History, Settings) */}
        {gameState.flowPhase === 'playing' && (
          <Controls
            card={currentCard}
            storyFlags={gameState.storyFlags}
            onDecision={handleDecision}
            onOpenHistory={handleOpenHistory}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onHoverDirectionChange={handleHoverDirectionChange}
            isProcessing={isProcessing || inputLocked || Boolean(gameState.waitingUntilDay)}
            onDetailsOpenChange={setIsChoiceDetailsOpen}
          />
        )}
      </div>

      {/* Decision History & Case Dossier Modal */}
      <DecisionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        state={gameState}
        initialTab={dossierTab}
      />

      {/* Settings & System Validator Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetGame={handleStartNewGame}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Supervisor Replacement Cinematic Modal */}
      <SupervisorReplacementModal
        isOpen={isReplacementModalOpen}
        onConfirm={handleConfirmReplacement}
        lastSupervisorRecord={lastSupervisorRecord}
        newSupervisorNumber={gameState.supervisorNumber}
      />

      {/* ACT I Completion Modal */}
      <ActCompleteModal
        isOpen={gameState.flowPhase === 'act1Complete' && !isReplacementModalOpen && !isHistoryOpen}
        onClose={() => setInTitleScreen(true)}
        state={gameState}
        onOpenHistory={handleOpenHistory}
        onRestart={handleStartNewGame}
        onStartAct2={handleInitiateAct2}
      />

      {gameState.flowPhase === 'act2Complete' && !isReplacementModalOpen && (
        <Act2CompleteScreen
          state={gameState}
          onFreePlay={() => applySessionAction({ type: 'enterFreePlay' })}
          onMainMenu={() => setInTitleScreen(true)}
        />
      )}
      {/* ACT II Cinematic Transition Modal */}
      <ActTransitionModal
        isOpen={gameState.flowPhase === 'act2Intro'}
        onConfirm={handleConfirmAct2Transition}
      />
    </div>
  );
}
