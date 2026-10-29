/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { choicePresentation } from '../data/cardPresentation';
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
}

export const Controls: React.FC<ControlsProps> = ({
  card,
  storyFlags = {},
  onDecision,
  onOpenHistory,
  onOpenSettings,
  onHoverDirectionChange,
  isProcessing,
}) => {
  const leftAction = choicePresentation(card, 'left', storyFlags).actionLabel || '거부 · 반려';
  const rightAction = choicePresentation(card, 'right', storyFlags).actionLabel || '승인 · 실행';

  return (
    <div className="w-full max-w-[480px] sm:max-w-[500px] mx-auto px-3 py-2 flex flex-col gap-2 shrink-0">
      {/* Primary Decision Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Left Choice Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onDecision('left')}
          onMouseEnter={() => onHoverDirectionChange('left')}
          onMouseLeave={() => onHoverDirectionChange(null)}
          className="group relative flex flex-col items-start justify-between p-3 rounded-xl border border-rose-900/60 bg-[#140F18] hover:bg-[#1E1322] hover:border-rose-600/80 text-slate-100 transition-all active:scale-[0.98] disabled:opacity-50 text-left cursor-pointer shadow-md min-h-[76px]"
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
          <span className="text-[12px] sm:text-[13px] font-normal text-slate-200 leading-[1.4] break-keep">
            {choicePresentation(card, 'left', storyFlags).text}
          </span>
        </button>

        {/* Right Choice Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onDecision('right')}
          onMouseEnter={() => onHoverDirectionChange('right')}
          onMouseLeave={() => onHoverDirectionChange(null)}
          className="group relative flex flex-col items-end justify-between p-3 rounded-xl border border-cyan-900/60 bg-[#0C1622] hover:bg-[#132235] hover:border-cyan-600/80 text-slate-100 transition-all active:scale-[0.98] disabled:opacity-50 text-right cursor-pointer shadow-md min-h-[76px]"
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
          <span className="text-[12px] sm:text-[13px] font-normal text-slate-200 leading-[1.4] break-keep">
            {choicePresentation(card, 'right', storyFlags).text}
          </span>
        </button>
      </div>

      {/* Auxiliary Utilities Footer Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 font-medium hover:text-slate-200 py-1 px-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <History size={13} />
          <span>판단 기록부 & 목표</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 font-medium hover:text-slate-200 py-1 px-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <Settings size={13} />
          <span>환경 설정</span>
        </button>
      </div>
    </div>
  );
};
