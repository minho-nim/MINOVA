/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameState } from '../types/game';
import { CHAPTER_METAS, getCurrentChapterKey } from '../engine/storyEngine';
import { Settings, Target } from 'lucide-react';

export interface HeaderProps {
  state: GameState;
  onOpenSettings: () => void;
  onOpenObjectives?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onOpenSettings,
  onOpenObjectives,
}) => {
  // Compute simulated futuristic date in 2079
  const baseMonth = state.currentAct === 'ACT_II' ? 11 : 10;
  const simulatedDay = Math.min(30, 1 + (state.currentDay % 30));
  const dateFormatted = `2079.${String(baseMonth).padStart(2, '0')}.${String(
    simulatedDay
  ).padStart(2, '0')}`;

  const currentChKey = getCurrentChapterKey(state);
  const chapterMeta = CHAPTER_METAS[currentChKey] || CHAPTER_METAS.act1;

  const actLabel =
    state.currentAct === 'ACT_II' ? 'ACT II · 통계에 없는 사람들' : 'ACT I · 완벽한 조언자';
  const chapterSubLabel =
    state.currentAct === 'ACT_II'
      ? `CH ${state.currentChapter || 1} · ${chapterMeta.chapterTitle}`
      : 'CH 1 · 인간의 통제와 최적화';

  return (
    <header className="game-header w-full bg-[#080B11] border-b border-slate-800/80 px-3.5 py-2 select-none flex flex-col gap-1">
      {/* Top Bar: Wordmark, Tenure, Date & Settings */}
      <div className="flex items-center justify-between">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-slate-800 border border-slate-700 text-slate-100 flex items-center justify-center font-semibold text-[10px] tracking-normal shadow-inner">
            M
          </div>
          <span className="text-xs font-medium tracking-normal text-slate-200">
            MINOVA
          </span>
        </div>

        {/* Center: Supervisor info */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="text-slate-300 font-semibold">
            제{state.supervisorNumber}대 감독관
          </span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="text-amber-400 font-semibold">
            재임 {state.supervisorTenure}일
          </span>
        </div>

        {/* Date & Settings */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 hidden xs:inline">
            {dateFormatted}
          </span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="설정 및 시스템 검증"
          >
            <Settings size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Story Progression Bar: Current ACT & Chapter Name */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="font-medium text-indigo-400 shrink-0">
            {actLabel.split('·')[0].trim()}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-200 font-medium truncate">
            {chapterSubLabel}
          </span>
        </div>

        {onOpenObjectives && (
          <button
            type="button"
            onClick={onOpenObjectives}
            className="flex items-center gap-1 text-[10px] font-mono font-medium text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-950 px-2 py-0.5 rounded border border-amber-800/80 transition-colors shrink-0 cursor-pointer"
            title="현재 챕터 목표 확인"
          >
            <Target size={16} strokeWidth={1.5} className="text-amber-400" />
            <span>목표 ({state.completedObjectiveIds?.length || 0})</span>
          </button>
        )}
      </div>
    </header>
  );
};
