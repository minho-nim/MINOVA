/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, ResourceDelta, SupervisorRecord } from './types/game';
import { CARD_MAP } from './data/cards';
import { createInitialGameState, executeDecision, startAct2 } from './engine/gameEngine';
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
import { NotificationToast } from './components/NotificationToast';
import { CHARACTERS } from './data/characters';
import { MAIN_CAST } from './data/characterArt';
import { CharacterPortrait } from './components/CharacterPortrait';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [inTitleScreen, setInTitleScreen] = useState<boolean>(true);
  const [previewDirection, setPreviewDirection] = useState<'left' | 'right' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals & Panels
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [dossierTab, setDossierTab] = useState<'objectives' | 'history' | 'investigations' | 'secrets'>('history');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState<boolean>(false);
  const [lastSupervisorRecord, setLastSupervisorRecord] = useState<SupervisorRecord | null>(null);
  const [isActCompleteModalOpen, setIsActCompleteModalOpen] = useState<boolean>(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState<boolean>(false);

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
    setIsActCompleteModalOpen(false);
    setIsTransitionModalOpen(false);
    setIsReplacementModalOpen(false);
    setIsHistoryOpen(false);
    setIsSettingsOpen(false);
    clearGameState();
    const freshState = createInitialGameState();
    setGameState(freshState);
    saveGameState(freshState);
    setInTitleScreen(false);
  };

  // Handle resuming existing game
  const handleResumeGame = () => {
    if (gameState) {
      setInTitleScreen(false);
      setIsActCompleteModalOpen(Boolean(gameState.currentAct === 'ACT_II'
        ? gameState.storyFlags.act2_viewed_epilogue
        : gameState.storyFlags.act1_viewed_epilogue));
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
      if (!gameState || isProcessing) return;
      setIsProcessing(true);

      // Play audio feedback
      playDecisionChime(direction, soundEnabled);

      const { nextState, replaced, dismissalReason } = executeDecision(gameState, direction);

      // Persist state
      setGameState(nextState);
      saveGameState(nextState);

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

      // Reaching either epilogue opens its report, even after a final verdict.
      if (
        (!gameState.storyFlags.act1_viewed_epilogue && nextState.storyFlags.act1_viewed_epilogue) ||
        (!gameState.storyFlags.act2_viewed_epilogue && nextState.storyFlags.act2_viewed_epilogue)
      ) {
        setIsActCompleteModalOpen(true);
      }

      // Re-enable interactions after brief cool-down
      setTimeout(() => {
        setIsProcessing(false);
      }, 150);
    },
    [gameState, isProcessing, soundEnabled, currentCard]
  );

  const handleHoverDirectionChange = useCallback(
    (dir: 'left' | 'right' | null) => {
      setPreviewDirection(dir);
      if (dir) {
        playSwipeTick(soundEnabled);
      }
    },
    [soundEnabled]
  );

  const handleToggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleConfirmReplacement = () => {
    setIsReplacementModalOpen(false);
  };

  // Launch ACT II Transition
  const handleInitiateAct2 = () => {
    setIsActCompleteModalOpen(false);
    setIsTransitionModalOpen(true);
  };

  const handleConfirmAct2Transition = () => {
    if (!gameState) return;
    const act2State = startAct2(gameState);
    setGameState(act2State);
    saveGameState(act2State);
    setIsTransitionModalOpen(false);
  };

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
      <aside className="game-sidebar">
        <a className="wordmark" href="#" onClick={(event) => { event.preventDefault(); setInTitleScreen(true); }}>MINOVA</a>
        <p className="eyebrow">노바시 · 감독관실</p>
        <h1>오늘의 안건</h1>
        <p className="sidebar-copy">제안을 읽고 결정을 내려주세요.<br />이전 선택은 판단 기록부에 남습니다.</p>
        <div className="sidebar-roster">{MAIN_CAST.map(id => <div key={id} className={`roster-person ${currentCard.characterId === id ? 'is-speaking' : ''}`} style={{ '--character-color': CHARACTERS[id].themeColor } as React.CSSProperties}><CharacterPortrait characterId={id} size={46} /><div><strong>{CHARACTERS[id].name}</strong><span>{CHARACTERS[id].role}</span></div>{currentCard.characterId === id && <i className="live-dot" />}</div>)}</div>
        <button className="return-title" onClick={() => setInTitleScreen(true)}>← 도시와 인물 소개</button>
      </aside>
      {/* Centered Mobile/PC container with max-w 480-500px matching Reigns viewport */}
      <div className="game-console w-full max-w-[560px] min-h-screen bg-[#0B0F19] flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.8)] sm:border-x border-slate-800/80 relative overflow-hidden">
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
        <main className="story-stage flex-1 flex flex-col items-center justify-center px-4 py-2 w-full my-auto">
          <GameCard
            key={currentCard.id}
            card={currentCard}
            storyFlags={gameState.storyFlags}
            resources={gameState.resources}
            onDecision={handleDecision}
            onHoverDirectionChange={handleHoverDirectionChange}
            isProcessing={isProcessing}
          />
        </main>

        {/* 4. Bottom Controls (Left/Right buttons, History, Settings) */}
        <Controls
          card={currentCard}
          onDecision={handleDecision}
          onOpenHistory={handleOpenHistory}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onHoverDirectionChange={handleHoverDirectionChange}
          isProcessing={isProcessing}
        />
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
        isOpen={isActCompleteModalOpen}
        onClose={() => setIsActCompleteModalOpen(false)}
        state={gameState}
        onOpenHistory={handleOpenHistory}
        onRestart={handleStartNewGame}
        onStartAct2={gameState.currentAct === 'ACT_I' ? handleInitiateAct2 : undefined}
      />

      {/* ACT II Cinematic Transition Modal */}
      <ActTransitionModal
        isOpen={isTransitionModalOpen}
        onConfirm={handleConfirmAct2Transition}
      />
    </div>
  );
}
