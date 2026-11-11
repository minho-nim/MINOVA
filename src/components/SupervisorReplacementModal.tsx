/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SupervisorRecord } from '../types/game';
import { AlertOctagon, UserX, ArrowRight } from 'lucide-react';

interface SupervisorReplacementModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  lastSupervisorRecord: SupervisorRecord | null;
  newSupervisorNumber: number;
}

export const SupervisorReplacementModal: React.FC<SupervisorReplacementModalProps> = ({
  isOpen,
  onConfirm,
  lastSupervisorRecord,
  newSupervisorNumber,
}) => {
  if (!isOpen || !lastSupervisorRecord) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90  animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0F1420] text-slate-100 rounded-2xl shadow-none border border-slate-800 overflow-hidden text-center p-6 sm:p-7 flex flex-col items-center">
        {/* Urgent Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
          <AlertOctagon size={32} />
        </div>

        {/* Title */}
        <span className="text-[11px] font-medium tracking-normal  text-rose-400 mb-1">
          NOVA CITY 감찰위원회 직권 조치
        </span>
        <h2 className="text-lg sm:text-xl font-medium text-slate-100 tracking-normal">
          제{lastSupervisorRecord.supervisorNumber}대 감독관 직무 정지 및 해임
        </h2>

        {/* Reason breakdown */}
        <div className="w-full my-4 p-4 bg-[#121824] rounded-xl border border-slate-800 text-left space-y-2">
          <div>
            <div className="text-[11px] font-medium text-slate-400">직무 정지 사유:</div>
            <p className="text-xs sm:text-sm font-semibold text-rose-300 leading-snug">
              {lastSupervisorRecord.dismissalReason}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-300 font-mono">
            <span>재임 기간:</span>
            <span className="font-medium text-slate-100">
              {lastSupervisorRecord.tenureDays}일간 (DAY {lastSupervisorRecord.endDay})
            </span>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
            * 전임 감독관이 밝혀낸 감사 기록 및 도시 법제는 영구 보존되며, 평의회 긴급 재정으로 핵심 자원이 비상 조정되었습니다.
          </div>
        </div>

        {/* Successor notice */}
        <div className="w-full p-3 bg-indigo-950/50 border border-indigo-900/60 rounded-xl text-xs text-indigo-200 text-left flex items-start gap-2.5 mb-5">
          <div className="p-1 rounded bg-indigo-900/70 text-indigo-300 shrink-0 mt-0.5">
            <UserX size={16} strokeWidth={1.5} />
          </div>
          <div>
            <span className="font-medium text-slate-100">제{newSupervisorNumber}대 신임 감독관 긴급 소환</span>
            <p className="text-[11px] text-indigo-300/80 mt-0.5">
              귀하는 전임자의 유산을 이어받아 ORACLE의 정책 제안을 다시 검증해야 합니다.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onConfirm}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-white rounded-xl transition-colors shadow-none cursor-pointer active:scale-[0.99]"
        >
          <span>신임 감독관 집무실 입장</span>
          <ArrowRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};
