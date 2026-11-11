/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { validateStoryContent, ValidationReport } from '../engine/contentValidator';
import { clearGameState } from '../services/saveManager';
import { X, Volume2, VolumeX, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetGame,
  soundEnabled,
  onToggleSound,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  if (!isOpen) return null;

  const handleRunValidator = () => {
    const report = validateStoryContent();
    setValidationReport(report);
  };

  const handleConfirmReset = () => {
    clearGameState();
    setShowConfirmReset(false);
    onResetGame();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80  animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F1420] text-slate-100 rounded-2xl shadow-none border border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-slate-300" />
            <h2 className="text-base font-medium text-slate-100">설정</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="설정 닫기"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Audio Effects Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#121824] rounded-xl border border-slate-800">
            <div>
              <h3 className="text-xs font-medium text-slate-200">효과음</h3>
              <p className="text-[11px] text-slate-400">
                카드를 넘기거나 선택할 때 소리를 냅니다.
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-slate-200 text-slate-900 border-slate-200'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          {/* Story Data Validator */}
          <div className="p-3.5 bg-[#121824] rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-medium text-slate-200">게임 데이터 점검</h3>
                <p className="text-[11px] text-slate-400">
                  누락된 인물이나 연결되지 않은 카드가 있는지 확인합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunValidator}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors text-slate-100 cursor-pointer shadow-sm"
              >
                검증 실행
              </button>
            </div>

            {validationReport && (
              <div className="mt-3 p-3 bg-[#0B0E17] rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 font-medium mb-2">
                  {validationReport.valid ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={16} strokeWidth={1.5} /> 연결 오류 없음
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle size={16} strokeWidth={1.5} /> 오류 발견 ({validationReport.errors.length}건)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono bg-[#121824] p-2 rounded">
                  <div>총 카드 수: {validationReport.stats.totalCards}장</div>
                  <div>메인 스토리: {validationReport.stats.storyCards}장</div>
                  <div>위기 카드: {validationReport.stats.crisisCards}장</div>
                  <div>일상 안건: {validationReport.stats.dailyCards}장</div>
                  <div>전환 카드: {validationReport.stats.transitionCards}장</div>
                  <div>등장인물: {validationReport.stats.totalCharacters}명</div>
                </div>

                {validationReport.errors.length > 0 && (
                  <div className="mt-2 text-rose-400 text-[11px] space-y-1">
                    {validationReport.errors.map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Game Information & Architecture */}
          <div className="p-3.5 bg-[#121824] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-100">
              <Info size={16} strokeWidth={1.5} className="text-indigo-400" />
              <span>MINOVA · 0.1</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              진행 상황은 이 브라우저에 자동 저장됩니다. 브라우저 데이터를 지우거나 다른 기기를 사용하면 이전 기록을 이어갈 수 없습니다.
            </p>
          </div>

          {/* Reset / New Game */}
          <div className="pt-2 border-t border-slate-800">
            {showConfirmReset ? (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl space-y-2">
                <p className="text-xs text-rose-300 font-semibold">
                  모든 진행 상황과 역대 판결 기록이 초기화됩니다. 계속하시겠습니까?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    초기화 확인
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-950/70 rounded-xl border border-rose-900/60 transition-colors cursor-pointer"
              >
                <RotateCcw size={16} strokeWidth={1.5} />
                <span>게임 데이터 완전 초기화 (새 게임)</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0B0E17] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-200 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};
