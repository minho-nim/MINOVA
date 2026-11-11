/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { GameNotification } from '../types/game';
import { CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react';

interface NotificationToastProps {
  notification: GameNotification | null | undefined;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification, onDismiss]);

  if (!notification || !visible) return null;

  const isObjective = notification.type === 'objective';
  const isAct = notification.type === 'act_transition';

  return (
    <div className="absolute top-16 left-3 right-3 z-40 pointer-events-none flex justify-center animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="pointer-events-auto max-w-sm w-full bg-[#0E1422]/95 backdrop-blur-md border border-indigo-500/50 shadow-[0_8px_30px_rgba(0,0,0,0.6)] rounded-xl p-3 flex items-start gap-2.5 text-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-700/80 flex items-center justify-center shrink-0 mt-0.5">
          {isObjective ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : isAct ? (
            <Sparkles size={16} className="text-amber-400" />
          ) : (
            <AlertTriangle size={16} className="text-rose-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-400">
            {isObjective ? '목표 달성 (Objective Completed)' : isAct ? '새로운 ACT 개막' : '시스템 알림'}
          </div>
          <div className="text-xs font-bold text-slate-100 leading-snug truncate">
            {notification.title}
          </div>
          {notification.subtitle && (
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              {notification.subtitle}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
