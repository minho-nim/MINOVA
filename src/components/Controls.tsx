/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React,{useState,useEffect,useCallback} from 'react';
import { choicePresentation,choiceActionLabel } from '../data/cardPresentation';
import {ReadingModal} from './ReadingModal';
import { GameCard as GameCardType, StoryFlags } from '../types/game';
import { ArrowLeft, ArrowRight, History, Settings } from 'lucide-react';

interface ControlsProps {
  card: GameCardType;
  storyFlags?: StoryFlags;
  onDecision: (direction: 'left' | 'right') => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onHoverDirectionChange: (direction: 'left' | 'right' | null) => void;
  isProcessing: boolean;
  onDetailsOpenChange?: (open:boolean)=>void;
}

export const Controls: React.FC<ControlsProps> = ({
  card,
  storyFlags = {},
  onDecision,
  onOpenHistory,
  onOpenSettings,
  onHoverDirectionChange,
  isProcessing,
  onDetailsOpenChange,
}) => {
  const leftAction=choiceActionLabel(card,'left',storyFlags);
  const rightAction=choiceActionLabel(card,'right',storyFlags);
  const [detailsOpen,setDetailsOpen]=useState(false);
  const closeDetails=useCallback(()=>{setDetailsOpen(false);onDetailsOpenChange?.(false);},[onDetailsOpenChange]);
  useEffect(()=>()=>onDetailsOpenChange?.(false),[onDetailsOpenChange]);

  return (
    <div className="game-controls w-full max-w-[480px] sm:max-w-[500px] mx-auto px-3 py-2 flex flex-col gap-2 shrink-0">
      {/* Primary Decision Action Buttons */}
      <div className="choice-actions grid grid-cols-2 gap-2">
        {/* Left Choice Button */}
        <button
          type="button"
          disabled={isProcessing}
          aria-label={`${leftAction}: ${choicePresentation(card,'left',storyFlags).text}`}
          onClick={() => onDecision('left')}
          onMouseEnter={() => onHoverDirectionChange('left')}
          onMouseLeave={() => onHoverDirectionChange(null)}
          className="choice-button group relative flex flex-col items-start justify-between p-3 rounded-xl border border-rose-900/60 bg-[#140F18] hover:bg-[#1E1322] hover:border-rose-600/80 text-slate-100 transition-all active:scale-[0.98] disabled:opacity-50 text-left cursor-pointer shadow-md"
        >
          {/* Header Action Name with directional cue */}
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowLeft
                size={13}
                className="transition-transform group-hover:-translate-x-0.5 text-rose-400"
              />
              <span>{leftAction}</span>
            </span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 bg-rose-950/80 rounded border border-rose-800/60 text-rose-300">
              ←
            </kbd>
          </div>

          {/* Secondary Full Choice Explanation */}
          <span className="choice-text text-[12px] sm:text-[13px] font-normal text-slate-200 leading-[1.4]">
            {choicePresentation(card, 'left', storyFlags).text}
          </span>
        </button>

        {/* Right Choice Button */}
        <button
          type="button"
          disabled={isProcessing}
          aria-label={`${rightAction}: ${choicePresentation(card,'right',storyFlags).text}`}
          onClick={() => onDecision('right')}
          onMouseEnter={() => onHoverDirectionChange('right')}
          onMouseLeave={() => onHoverDirectionChange(null)}
          className="choice-button group relative flex flex-col items-end justify-between p-3 rounded-xl border border-cyan-900/60 bg-[#0C1622] hover:bg-[#132235] hover:border-cyan-600/80 text-slate-100 transition-all active:scale-[0.98] disabled:opacity-50 text-right cursor-pointer shadow-md"
        >
          {/* Header Action Name with directional cue */}
          <div className="flex items-center justify-between w-full mb-1 flex-row-reverse">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>{rightAction}</span>
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5 text-cyan-400"
              />
            </span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 bg-cyan-950/80 rounded border border-cyan-800/60 text-cyan-300">
              →
            </kbd>
          </div>

          {/* Secondary Full Choice Explanation */}
          <span className="choice-text text-[12px] sm:text-[13px] font-normal text-slate-200 leading-[1.4]">
            {choicePresentation(card, 'right', storyFlags).text}
          </span>
        </button>
      </div>

      {/* Auxiliary Utilities Footer Bar */}
      <div className="control-utilities flex items-center justify-between px-1 text-xs text-slate-400">
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 font-medium hover:text-slate-200 py-1 px-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <History size={13} />
          <span>기록 · 목표</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 font-medium hover:text-slate-200 py-1 px-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <Settings size={13} />
          <span>설정</span>
        </button>
        <button type="button" onClick={()=>{setDetailsOpen(true);onDetailsOpenChange?.(true);}} className="choice-details-button">선택지 전문</button>
      </div>
      {detailsOpen&&<ReadingModal title="선택지 전문" onClose={closeDetails}>
        <p>각 선택지의 전체 내용입니다. 읽은 뒤 창을 닫고 선택하세요.</p>
        <section className="choice-detail"><h3>← {leftAction}</h3><p>{choicePresentation(card,'left',storyFlags).text}</p></section>
        <section className="choice-detail"><h3>{rightAction} →</h3><p>{choicePresentation(card,'right',storyFlags).text}</p></section>
      </ReadingModal>}
    </div>
  );
};
