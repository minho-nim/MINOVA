/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ResourceDelta, ResourceId, Resources } from '../types/game';
import { RESOURCE_BOUNDS, RESOURCE_META, RESOURCE_ORDER } from '../engine/resourceEngine';
import { Users, Scale, Key, Shield, AlertTriangle } from 'lucide-react';

interface ResourceBarProps {
  resources: Resources;
  previewDelta?: ResourceDelta | null;
  activeCrisisResourceId?: ResourceId | 'compound' | 'high_trust' | 'high_safety' | null;
}

const RESOURCE_ICONS: Record<ResourceId, React.ElementType> = {
  citizenTrust: Users,
  fairness: Scale,
  personalFreedom: Key,
  publicSafety: Shield,
};

export const ResourceBar: React.FC<ResourceBarProps> = ({
  resources,
  previewDelta,
  activeCrisisResourceId,
}) => {
  // Track previous resources to animate deltas on change
  const prevResourcesRef = useRef<Resources>(resources);
  const [animatingDeltas, setAnimatingDeltas] = useState<Partial<Record<ResourceId, number>>>({});

  useEffect(() => {
    const prev = prevResourcesRef.current;
    const diffs: Partial<Record<ResourceId, number>> = {};
    let hasDiff = false;

    for (const key of RESOURCE_ORDER) {
      const diff = resources[key] - prev[key];
      if (diff !== 0) {
        diffs[key] = diff;
        hasDiff = true;
      }
    }

    prevResourcesRef.current = resources;

    if (hasDiff) {
      setAnimatingDeltas(diffs);
      const timer = setTimeout(() => {
        setAnimatingDeltas({});
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [resources]);

  return (
    <div className="w-full bg-[#080D17]/95 backdrop-blur-md border-b border-slate-800/80 px-2 py-2 select-none shadow-md shrink-0">
      <div className="grid grid-cols-4 gap-1.5 max-w-[480px] mx-auto">
        {RESOURCE_ORDER.map((key) => {
          const meta = RESOURCE_META[key];
          const Icon = RESOURCE_ICONS[key];
          const val = resources[key];
          const delta = previewDelta?.[key];
          const hasDelta = delta !== undefined && delta !== 0;
          const isCritical = val <= RESOURCE_BOUNDS.CRISIS_LOW;
          const isWarning = !isCritical && val <= RESOURCE_BOUNDS.WARNING_LOW;
          const isCrisisActive = activeCrisisResourceId === key || activeCrisisResourceId === 'compound';

          // Reign-style indicator dot: small if |delta| < 15, large if |delta| >= 15
          const isLargeDelta = Math.abs(delta || 0) >= 15;

          // Circular progress math (circumference for r=15 is 2*PI*15 ~= 94.25)
          const radius = 15;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (Math.max(0, Math.min(100, val)) / 100) * circumference;

          // Animated delta from recent commit
          const recentChange = animatingDeltas[key];

          return (
            <div
              key={key}
              className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${
                isCrisisActive
                  ? 'border-rose-500/80 bg-rose-950/40 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse'
                  : isCritical
                  ? 'border-rose-600/70 bg-rose-950/25'
                  : isWarning
                  ? 'border-amber-600/70 bg-amber-950/20'
                  : 'border-slate-800/70 bg-[#0E1524]'
              }`}
            >
              {/* Floating Animated Delta Popups on Decision Commit */}
              {recentChange !== undefined && (
                <div
                  className={`absolute -top-3 z-30 px-1.5 py-0.5 rounded text-[10px] font-mono font-black tracking-tight shadow-md animate-bounce pointer-events-none ${
                    recentChange > 0
                      ? 'bg-emerald-500 text-slate-950 ring-1 ring-emerald-300'
                      : 'bg-rose-500 text-white ring-1 ring-rose-300'
                  }`}
                >
                  {recentChange > 0 ? `+${recentChange}` : recentChange}
                </div>
              )}

              {/* Preview Direction Dot Indicator (Reigns Style) */}
              {hasDelta && (
                <div
                  className={`absolute -top-1 right-1 z-20 flex items-center justify-center rounded-full transition-transform ${
                    isLargeDelta ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
                  } ${
                    delta! > 0
                      ? 'bg-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : 'bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  }`}
                >
                  <span className="text-[8px] font-bold leading-none">
                    {delta! > 0 ? '▲' : '▼'}
                  </span>
                </div>
              )}

              {/* Gauge & Icon Container */}
              <div className="relative w-9 h-9 flex items-center justify-center my-0.5">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    stroke={
                      isCritical
                        ? '#F43F5E'
                        : isWarning
                        ? '#F59E0B'
                        : '#22D3EE'
                    }
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-300"
                  />
                </svg>

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isCritical ? (
                    <AlertTriangle size={13} className="text-rose-400 animate-pulse" />
                  ) : (
                    <Icon
                      size={13}
                      className={
                        isWarning
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }
                    />
                  )}
                </div>
              </div>

              {/* Korean Name & Current Numeric Value */}
              <span className="text-[11px] font-bold text-slate-200 tracking-tight leading-tight mt-0.5 truncate max-w-full">
                {meta.label}
              </span>
              <span
                className={`text-[11px] font-mono font-bold tabular-nums leading-none mt-0.5 ${
                  isCritical
                    ? 'text-rose-400'
                    : isWarning
                    ? 'text-amber-400'
                    : 'text-cyan-300'
                }`}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
