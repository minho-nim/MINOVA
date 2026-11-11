/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameState } from '../types/game';
import { Trophy, Compass, ArrowRight, History, Sparkles } from 'lucide-react';

interface ActCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  onOpenHistory: () => void;
  onRestart: () => void;
  onStartAct2?: () => void;
}

export const ActCompleteModal: React.FC<ActCompleteModalProps> = ({
  isOpen,
  onClose,
  state,
  onOpenHistory,
  onStartAct2,
  onRestart,
}) => {
  if (!isOpen) return null;

  const isAct2 = state.currentAct === 'ACT_II';

  // Determine Ethical Profile
  let archetypeTitle = '원칙주의적 인권 수호자';
  let archetypeDesc =
    '기계의 효율보다 인간의 기본권과 투명성을 우선하며, 알고리즘 독주에 맞서 윤리적 가드레일을 세웠습니다.';

  if (isAct2) {
    const dignity = state.storyFlags.final_act2_verdict === 'human_dignity';
    archetypeTitle = dignity ? '보편 존엄의 수호자' : '완전 최적화의 설계자';
    archetypeDesc = dignity
      ? 'CIVITAS 점수를 폐기하고 데이터에 기록되지 않은 시민에게도 동등한 권리를 보장했습니다.'
      : 'CIVITAS 점수를 존속시키고 ORACLE의 자율 집행을 통해 도시의 안정과 효율을 선택했습니다.';
  } else if (state.storyFlags.final_act1_verdict === 'ai_autonomous') {
    archetypeTitle = '실용주의적 테크노크라트';
    archetypeDesc =
      '도시의 생존과 초효율 시스템 안정을 위해 과감하게 AI에게 자율권을 위임하며 번영의 길을 택했습니다.';
  } else if (state.discoveredSecrets.length >= 2) {
    archetypeTitle = '철저한 진실 추구관';
    archetypeDesc =
      '외부의 압력과 체제의 은폐 속에서도 끝까지 원시 데이터를 파헤쳐 AI 설계의 숨겨진 모순을 폭로했습니다.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#0F1420] text-slate-100 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden p-6 sm:p-7 flex flex-col items-center max-h-[92vh] overflow-y-auto">
        {/* Trophy icon */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
          <Trophy size={28} />
        </div>

        {/* Title */}
        <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-400">
          {isAct2 ? 'ACT II : 통계에 없는 사람들 · 피날레' : 'ACT I : 완벽한 조언자 · 피날레'}
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1 text-center">
          거버넌스 청문회 최종 판결 완결
        </h2>

        {/* Archetype Card */}
        <div className="w-full my-4 p-4 rounded-xl bg-gradient-to-br from-indigo-950/80 to-[#121824] border border-indigo-800/60 text-white text-left shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium mb-1">
            <Compass size={14} />
            <span>플레이어의 AI 윤리 성향 판정</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 tracking-tight">{archetypeTitle}</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{archetypeDesc}</p>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 text-xs text-slate-300 mb-4">
          <div className="p-2.5 bg-[#121824] rounded-lg border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-500">누적 집행 안건</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
              {state.decisionHistory.length}건
            </span>
          </div>
          <div className="p-2.5 bg-[#121824] rounded-lg border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-500">발견한 시스템 기밀</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
              {state.discoveredSecrets.length}건
            </span>
          </div>
          <div className="p-2.5 bg-[#121824] rounded-lg border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-500">감독관 재임 일수</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
              DAY {state.currentDay} (제{state.supervisorNumber}대)
            </span>
          </div>
          <div className="p-2.5 bg-[#121824] rounded-lg border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-500">감독관 교체 횟수</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
              {state.supervisorHistory.length}회
            </span>
          </div>
        </div>

        {/* ACT II Ready Box */}
        {!isAct2 && <div className="w-full p-4 bg-gradient-to-r from-cyan-950/70 to-indigo-950/70 border border-cyan-800/80 rounded-xl text-left text-xs mb-5 space-y-1.5 shadow-md">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
            <Sparkles size={14} className="text-cyan-400" />
            <span>ACT II 정식 개막 : 통계에 없는 사람들 (The Uncounted)</span>
          </div>
          <p className="text-[11px] text-cyan-100/90 leading-relaxed">
            의료 AI의 트리아지와 채용 알고리즘의 보이지 않는 장벽을 둘러싼 제2막이 준비되었습니다. 귀하의 ACT I 결정이 그대로 후속 사건으로 이어집니다.
          </p>
        </div>}
        {isAct2 && <p className="text-xs text-slate-300 mb-5">현재 공개된 이야기를 모두 마쳤습니다. ACT III는 예고 단계입니다.</p>}

        {/* Buttons */}
        <div className="w-full space-y-2">
          {isAct2 && <button type="button" onClick={onRestart} className="w-full py-3 rounded-xl bg-cyan-300 text-slate-900 font-bold cursor-pointer">새 게임 시작</button>}
          {onStartAct2 && (
            <button
              type="button"
              onClick={onStartAct2}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-slate-900 bg-gradient-to-r from-cyan-300 to-indigo-300 hover:from-cyan-200 hover:to-indigo-200 rounded-xl transition-all shadow-lg cursor-pointer"
            >
              <span>ACT II : 통계에 없는 사람들 시작하기</span>
              <ArrowRight size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenHistory}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <History size={14} />
            <span>사건 및 판단 기록부 전편 열람</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-transparent hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer"
          >
            <span>닫기 (현재 일상 유지)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
