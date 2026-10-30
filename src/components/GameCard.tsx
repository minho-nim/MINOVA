/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CardDialogueContext, GameCard as GameCardType, StoryFlags, Resources } from '../types/game';
import { choicePresentation, choiceActionLabel } from '../data/cardPresentation';
import { CHARACTERS } from '../data/characters';
import { CharacterPortrait } from './CharacterPortrait';
import { DISPLAY_ROLES } from '../data/characterArt';
import { getCardSpeaker } from '../data/cardSpeakers';
import { readableDialogue } from '../data/readableDialogue';
import { resolveCardDialogue } from '../engine/gameEngine';
import { ShieldAlert } from 'lucide-react';
import { CardGlossary } from './CardGlossary';
import { dialogueParagraphs } from '../data/ethicsGlossary';

interface GameCardProps {
  card: GameCardType;
  storyFlags: StoryFlags;
  resources: Resources;
  dialogueContext?: CardDialogueContext;
  onDecision: (direction: 'left' | 'right') => void;
  onHoverDirectionChange: (direction: 'left' | 'right' | null) => void;
  isProcessing: boolean;
  previewDirection?: 'left' | 'right' | null;
}

const SWIPE_THRESHOLD = 75;

export const GameCard: React.FC<GameCardProps> = ({
  card,
  storyFlags,
  resources,
  dialogueContext,
  onDecision,
  onHoverDirectionChange,
  isProcessing,
  previewDirection,
}) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const dialogueRef = useRef<HTMLDivElement>(null);

  const character = CHARACTERS[card.characterId];
  const speaker = getCardSpeaker(card);
  const dialogueText = readableDialogue(card.id, resolveCardDialogue(card, storyFlags, resources, dialogueContext));
  useEffect(()=>{if(dialogueRef.current)dialogueRef.current.scrollTop=0;},[card.id,dialogueText]);

  // Compute swipe progress (-1 to 1)

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
    [isProcessing, exitDirection, onDecision, onHoverDirectionChange],
  );

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(e.repeat)return;
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.closest('[data-reading-area]')
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
    if ((e.target as Element).closest('[data-reading-area],button,a,summary')) return;
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
    if((e.target as Element).closest('button,a,summary'))return;
    setIsDragging(true);
    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isProcessing || exitDirection || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startPosRef.current.x;
    const rawDy = touch.clientY - startPosRef.current.y;
    // Let the reading pane scroll vertically; only a horizontal gesture swipes.
    if (Math.abs(rawDy)>Math.abs(dx) && Math.abs(rawDy)>10) {
      setIsDragging(false); setDragOffset({x:0,y:0}); return;
    }
    const dy = rawDy * 0.25;
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
  const rotationDeg =
    exitDirection === 'left' ? -18 : exitDirection === 'right' ? 18 : dragOffset.x / 14;
  const translateX =
    exitDirection === 'left' ? -420 : exitDirection === 'right' ? 420 : dragOffset.x;
  const translateY = exitDirection ? -30 : dragOffset.y;

  const transformStyle = `translate3d(${translateX}px, ${translateY}px, 0px) rotate(${rotationDeg}deg)`;
  const transitionStyle = isDragging
    ? 'none'
    : 'transform 0.24s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.2s ease-out';

  // Active choice being previewed
  const activeDirection = dragOffset.x < -16 ? 'left' : dragOffset.x > 16 ? 'right' : previewDirection;
  const activeChoice = activeDirection==='left'?card.leftChoice:activeDirection==='right'?card.rightChoice:null;

  const leftActionLabel=choiceActionLabel(card,'left',storyFlags);
  const rightActionLabel=choiceActionLabel(card,'right',storyFlags);

  return (
    <div className="verdict-stage relative w-full max-w-[440px] sm:max-w-[460px] mx-auto flex flex-col items-center">
      {activeChoice&&<aside className={`choice-preview ${activeDirection==='left'?'is-left':'is-right'}`} role="status" aria-label="스와이프 선택 미리보기">
        <strong>{activeDirection==='left'?`← ${leftActionLabel}`:`${rightActionLabel} →`}</strong>
        <p>{choicePresentation(card,activeDirection!,storyFlags).text}</p>
        <small>{!isDragging?'선택지 미리보기 · 아래 버튼으로 선택':Math.abs(dragOffset.x)>=SWIPE_THRESHOLD?'손을 놓으면 선택합니다 · 돌아오면 취소':'계속 밀면 선택합니다 · 돌아오면 취소'}</small>
      </aside>}

      {/* Main Interactive Card Stack */}
      <div className="verdict-stack relative w-full">
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
            touchAction: 'pan-y',
          }}
          className={`verdict-card relative w-full bg-[#111827] rounded-2xl border border-slate-700/80 shadow-[0_16px_40px_rgba(0,0,0,0.7)] p-4 sm:p-5 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none overflow-hidden min-h-[360px] sm:min-h-[380px] ${
            card.type === 'crisis' ? 'ring-2 ring-rose-500/90' : ''
          }`}
        >
          {/* Card Header: Topic Badge & Incident Title */}
          <div className="verdict-topic w-full flex items-center justify-between pb-2.5 border-b border-slate-800/80 text-[11px] font-mono">
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
          <div
            className="verdict-character flex items-center gap-3.5 my-3 py-1"
            style={{ '--character-color': character.themeColor } as React.CSSProperties}
          >
            {/* Portrait with specific character styling and reactive emotion */}
            <div className="relative shrink-0">
              <CharacterPortrait
                characterId={card.characterId}
                emotion={card.emotion || 'neutral'}
                oracleState={card.oracleState || 'normal'}
                size={96}
                frame="dialogue"
                speakerPortrait={speaker?.portrait}
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
                <h3 className="font-bold text-slate-100 tracking-tight leading-snug">
                  {speaker?.name ?? character?.name ?? '시스템'}
                </h3>
              </div>
              <p className="verdict-role mt-1 font-medium">
                {speaker?.role ?? DISPLAY_ROLES[card.characterId] ?? character?.role}
              </p>
            </div>
          </div>

          <section className="verdict-reading" data-reading-area role="region" aria-label="사건 설명과 대화" tabIndex={0}>
          <h4 className="verdict-headline font-semibold text-slate-200 tracking-tight mb-2 border-l-2 border-cyan-500 pl-2">
            {card.title}
          </h4>

          {/* Dialogue Text Body in Editorial Typography (15~16px, leading 1.6) */}
          <div ref={dialogueRef} className="verdict-copy py-1" tabIndex={0} aria-label="대사 전체 · 위아래 스크롤" aria-live="polite" aria-atomic="true">
            {dialogueParagraphs(dialogueText).map((paragraph,index)=><p key={index} className="verdict-dialogue text-[#F1F5F9] font-normal select-text">{paragraph}</p>)}
            <CardGlossary text={[dialogueText,card.title,choicePresentation(card,'left',storyFlags).text,choicePresentation(card,'right',storyFlags).text].join(' ')} />
          </div>
          </section>

          {/* Card Bottom Meta Footer */}
        </div>
      </div>
    </div>
  );
};
