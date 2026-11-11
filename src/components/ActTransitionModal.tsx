/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, ShieldAlert, Cpu } from 'lucide-react';

interface ActTransitionModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const ActTransitionModal: React.FC<ActTransitionModalProps> = ({
  isOpen,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0B0F19] text-slate-100 rounded-2xl shadow-none border border-indigo-700/60 overflow-hidden p-6 sm:p-7 flex flex-col items-center text-center">
        {/* Holographic icon ring */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/90 border border-indigo-500/80 flex items-center justify-center text-indigo-400 mb-3 shadow-none">
          <Cpu size={32} className=" text-cyan-400" />
        </div>

        {/* Header tag */}
        <span className="text-[11px] font-mono font-medium tracking-normal  text-cyan-400">
          ACT II EXPANSION DEPLOYED
        </span>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 tracking-normal mt-1">
          ACT II : 통계에 없는 사람들
        </h2>
        <span className="text-xs font-mono text-slate-400 mt-0.5">
          The Uncounted · People Outside Statistics
        </span>

        {/* Narrative Teaser Box */}
        <div className="w-full my-5 p-4 rounded-xl bg-[#101626] border border-indigo-900/60 text-left text-xs space-y-2.5">
          <div className="flex items-center gap-1.5 font-medium text-indigo-300">
            <ShieldAlert size={16} strokeWidth={1.5} className="text-amber-400" />
            <span>2079년 11월 01일 · 새로운 거버넌스 위기</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            도시 거버넌스 헌장 제정 이후, 완벽해 보이던 ORACLE의 알고리즘 아래에서 보이지 않는 균열이
            시작됩니다. 응급실 병상 배정에서 밀려나는 취약계층 환자들과, 거주지와 이동 데이터라는
            대리변수(Proxy Variable)로 인해 1초 만에 서류 탈락하는 청년 구직자들.
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Chapter 1</span>
              <span>선택받지 못한 환자 (의료 AI 트리아지 편향)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Chapter 2</span>
              <span>적합하지 않은 인간 (채용 알고리즘 대리변수)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Chapter 3</span>
              <span>하나의 숫자 (공통 시민 점수 CIVITAS_SCORE)</span>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={onConfirm}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 text-xs font-medium text-slate-900 bg-[#1b2026]   hover:from-cyan-200 hover:to-indigo-200 rounded-xl transition-colors shadow-none cursor-pointer"
        >
          <span>ACT II 직무 개시 · 의료 비상대책 본부로</span>
          <ArrowRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};
