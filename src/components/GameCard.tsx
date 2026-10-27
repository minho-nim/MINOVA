/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameCard as GameCardType, StoryFlags, Resources } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { CharacterPortrait } from './CharacterPortrait';
import { resolveCardDialogue } from '../engine/gameEngine';
import { Check, X, ShieldAlert } from 'lucide-react';

interface GameCardProps {
  card: GameCardType;
  storyFlags: StoryFlags;
  resources: Resources;
  onDecision: (direction: 'left' | 'right') => void;
  onHoverDirectionChange: (direction: 'left' | 'right' | null) => void;
  isProcessing: boolean;
}

const SWIPE_THRESHOLD = 75;

export const GameCard: React.FC<GameCardProps> = ({
  card,
  storyFlags,
  resources,
  onDecision,
  onHoverDirectionChange,
  isProcessing,
}) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const character = CHARACTERS[card.characterId];
  const dialogueText = resolveCardDialogue(card, storyFlags, resources);

  // Compute swipe progress (-1 to 1)
  const swipeProgress = Math.max(-1, Math.min(1, dragOffset.x / SWIPE_THRESHOLD));
  const isLeftActive = dragOffset.x < -16;
  const isRightActive = dragOffset.x > 16;

  // Sync preview with parent resource bar
  useEffect(() => {
    if (exitDirection) return;
    if (dragOffset.x <= -SWIPE_THRESHOLD * 0.3) {
      onHoverDirectionChange('left');
    } else if (dragOffset.x >= SWIPE_THRESHOLD * 0.3) {
      onHoverDirectionChange('right');
    } else {
      onHoverDirectionChange(null);
    }
  }, [dragOffset.x, exitDirection, onHoverDirectionChange]);

  const triggerDecision = useCallback(
    (direction: 'left' | 'right') => {
      if (isProcessing || exitDirection) return;
      setExitDirection(direction);
      onHoverDirectionChange(null);
      setTimeout(() => {
        onDecision(direction);
        setExitDirection(null);
        setDragOffset({ x: 0, y: 0 });
      }, 220);
    },
    [isProcessing, exitDirection, onDecision, onHoverDirectionChange]
  );

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerDecision('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerDecision('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerDecision]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isProcessing || exitDirection) return;
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isProcessing || exitDirection) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = (e.clientY - startPosRef.current.y) * 0.25;
    setDragOffset({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    if (!isDragging || isProcessing || exitDirection) return;
    setIsDragging(false);
    if (dragOffset.x <= -SWIPE_THRESHOLD) {
      triggerDecision('left');
    } else if (dragOffset.x >= SWIPE_THRESHOLD) {
      triggerDecision('right');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isProcessing || exitDirection || e.touches.length === 0) return;
    setIsDragging(true);
    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isProcessing || exitDirection || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startPosRef.current.x;
    const dy = (touch.clientY - startPosRef.current.y) * 0.25;
    setDragOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    if (!isDragging || isProcessing || exitDirection) return;
    setIsDragging(false);
    if (dragOffset.x <= -SWIPE_THRESHOLD) {
      triggerDecision('left');
    } else if (dragOffset.x >= SWIPE_THRESHOLD) {
      triggerDecision('right');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Compute card transform
  const rotationDeg = exitDirection === 'left' ? -18 : exitDirection === 'right' ? 18 : (dragOffset.x / 14);
  const translateX = exitDirection === 'left' ? -420 : exitDirection === 'right' ? 420 : dragOffset.x;
  const translateY = exitDirection ? -30 : dragOffset.y;

  const transformStyle = `translate3d(${translateX}px, ${translateY}px, 0px) rotate(${rotationDeg}deg)`;
  const transitionStyle = isDragging ? 'none' : 'transform 0.24s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.2s ease-out';

  // Active choice being previewed
  const activeChoice =
    dragOffset.x < -16
      ? card.leftChoice
      : dragOffset.x > 16
      ? card.rightChoice
      : null;

  const qualitativeImpacts = activeChoice
    ? (['citizenTrust', 'fairness', 'personalFreedom', 'publicSafety'] as const)
        .filter((key) => activeChoice.effects[key] !== undefined && activeChoice.effects[key] !== 0)
        .map((key) => {
          const delta = activeChoice.effects[key] || 0;
          return {
            key,
            label:
              key === 'citizenTrust'
                ? '신뢰'
                : key === 'fairness'
                ? '공정'
                : key === 'personalFreedom'
                ? '자유'
                : '안전',
            direction: delta > 0 ? 'up' : 'down',
          };
        })
    : [];

  const leftActionLabel = card.leftChoice.actionLabel || (card.leftChoice.text.length > 8 ? '거부 · 대안' : card.leftChoice.text);
  const rightActionLabel = card.rightChoice.actionLabel || (card.rightChoice.text.length > 8 ? '승인 · 실행' : card.rightChoice.text);

  return (
    <div className="relative w-full max-w-[440px] sm:max-w-[460px] mx-auto flex flex-col items-center">
      {/* Dynamic Choice Preview Banner */}
      <div className="h-8 mb-1 flex items-center justify-center text-center px-2 w-full">
        {activeChoice ? (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                dragOffset.x < 0
                  ? 'text-rose-200 bg-rose-950/90 border-rose-500/60'
                  : 'text-cyan-200 bg-cyan-950/90 border-cyan-500/60'
              }`}
            >
              {dragOffset.x < 0 ? `◀ ${leftActionLabel}` : `${rightActionLabel} ▶`}
            </span>

            {qualitativeImpacts.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                {qualitativeImpacts.map((imp) => (
                  <span
                    key={imp.key}
                    className={
                      imp.direction === 'up'
                        ? 'text-emerald-400 font-bold'
                        : 'text-rose-400 font-bold'
                    }
                  >
                    {imp.label} {imp.direction === 'up' ? '▲' : '▼'}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="text-[11px] font-mono text-slate-500 select-none">
            카드를 좌우로 밀거나 아래 버튼을 누르세요
          </span>
        )}
      </div>

      {/* Main Interactive Card Stack */}
      <div className="relative w-full">
        {/* Deep Ghost Card Layer */}
        <div className="absolute inset-0 bg-[#0A0E17] rounded-2xl border border-slate-800/50 transform scale-[0.94] translate-y-2 pointer-events-none opacity-50 shadow-sm" />

        {/* Top Interactive Card */}
        <div
          ref={cardRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: transformStyle,
            transition: transitionStyle,
            opacity: exitDirection ? 0 : 1,
            touchAction: 'none',
          }}
          className={`verdict-card relative w-full bg-[#111827] rounded-2xl border border-slate-700/80 shadow-[0_16px_40px_rgba(0,0,0,0.7)] p-4 sm:p-5 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none overflow-hidden min-h-[360px] sm:min-h-[380px] ${
            card.type === 'crisis' ? 'ring-2 ring-rose-500/90' : ''
          }`}
        >
          {/* Swipe Left Direction Stamp */}
          <div
            className="absolute top-4 left-4 z-20 pointer-events-none transition-opacity duration-150"
            style={{ opacity: isLeftActive ? Math.min(1, Math.abs(swipeProgress) * 1.6) : 0 }}
          >
            <div className="border-2 border-rose-500 text-rose-300 rounded-lg px-3 py-1 font-bold text-xs tracking-wider uppercase transform -rotate-12 bg-rose-950/95 shadow-xl flex items-center gap-1.5 backdrop-blur-xs">
              <X size={15} className="stroke-[3]" />
              <span>{leftActionLabel}</span>
            </div>
          </div>

          {/* Swipe Right Direction Stamp */}
          <div
            className="absolute top-4 right-4 z-20 pointer-events-none transition-opacity duration-150"
            style={{ opacity: isRightActive ? Math.min(1, Math.abs(swipeProgress) * 1.6) : 0 }}
          >
            <div className="border-2 border-cyan-400 text-cyan-200 rounded-lg px-3 py-1 font-bold text-xs tracking-wider uppercase transform rotate-12 bg-cyan-950/95 shadow-xl flex items-center gap-1.5 backdrop-blur-xs">
              <Check size={15} className="stroke-[3]" />
              <span>{rightActionLabel}</span>
            </div>
          </div>

          {/* Card Header: Topic Badge & Incident Title */}
          <div className="w-full flex items-center justify-between pb-2.5 border-b border-slate-800/80 text-[11px] font-mono">
            <span className="text-cyan-400 font-semibold uppercase tracking-wider">
              {card.topicBadge}
            </span>
            <span className="text-slate-400">
              {card.type === 'crisis'
                ? '긴급 위기'
                : card.type === 'story'
                ? '핵심 의제'
                : card.type === 'transition'
                ? '체제 전환'
                : '일상 정책'}
            </span>
          </div>

          {/* Character Info & Stylized Sci-Fi Portrait Area */}
          <div className="verdict-character flex items-center gap-3.5 my-3 py-1" style={{ '--character-color': character.themeColor } as React.CSSProperties}>
            {/* Portrait with specific character styling and reactive emotion */}
            <div className="relative shrink-0">
              <CharacterPortrait
                characterId={card.characterId}
                emotion={card.emotion || 'neutral'}
                oracleState={card.oracleState || 'normal'}
                size={96}
              />
              {card.type === 'crisis' && (
                <div className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-1 shadow-md">
                  <ShieldAlert size={12} />
                </div>
              )}
            </div>

            {/* Character Name, Role & Case Headline */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-snug truncate">
                  {character?.name || '시스템'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5 font-medium truncate">
                {character?.role}
              </p>
              <h4 className="text-xs font-semibold text-slate-300 tracking-tight mt-2 line-clamp-1 border-l-2 border-cyan-500 pl-2">
                {card.title}
              </h4>
            </div>
          </div>

          {/* Dialogue Text Body in Editorial Typography (15~16px, leading 1.6) */}
          <div className="flex-1 flex flex-col justify-center py-1">
            <p className="text-[15px] sm:text-[16px] text-[#F1F5F9] leading-[1.62] font-normal break-keep select-text">
              "{dialogueText}"
            </p>
          </div>

          {/* Card Bottom Meta Footer */}
          <div className="pt-2 mt-auto flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80">
            <span className="truncate max-w-[48%] text-left text-rose-300/80">
              ← {leftActionLabel}
            </span>
            <span className="truncate max-w-[48%] text-right text-cyan-300/80">
              {rightActionLabel} →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
