/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ResourceDelta, ResourceId, Resources } from '../types/game';
import { RESOURCE_BOUNDS, RESOURCE_META, RESOURCE_ORDER } from '../engine/resourceEngine';

interface ResourceBarProps {
  resources: Resources;
  previewDelta?: ResourceDelta | null;
  activeCrisisResourceId?: ResourceId | 'compound' | 'high_trust' | 'high_safety' | null;
}

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
    <div className="resource-bar w-full bg-[#080D17]/95  border-b border-slate-800/80 px-2 py-2 select-none shadow-none shrink-0">
      <div className="resource-grid grid grid-cols-4 gap-1.5 max-w-[480px] mx-auto">
        {RESOURCE_ORDER.map((key) => {
          const meta = RESOURCE_META[key];
          const val = resources[key];
          const delta = previewDelta?.[key];
          const hasDelta = delta !== undefined && delta !== 0;
          const isCritical = val <= RESOURCE_BOUNDS.CRISIS_LOW;
          const isWarning = !isCritical && val <= RESOURCE_BOUNDS.WARNING_LOW;
          const isCrisisActive = activeCrisisResourceId === key || activeCrisisResourceId === 'compound';

          // Reign-style indicator dot: small if |delta| < 15, large if |delta| >= 15
          const isLargeDelta = Math.abs(delta || 0) >= 15;

          // Animated delta from recent commit
          const recentChange = animatingDeltas[key];

          return (
            <div
              key={key}
              aria-label={`${meta.label} ${val}${isCritical ? ", 위기" : isWarning ? ", 주의" : ""}`}
              className={`resource-cell relative flex flex-col items-center justify-center p-1.5 rounded-lg border transition-colors ${
                isCrisisActive
                  ? 'border-rose-500/80 bg-rose-950/40 shadow-none '
                  : isCritical
                  ? 'border-rose-600/70 bg-rose-950/25'
                  : isWarning
                  ? 'border-amber-600/70 bg-amber-950/20'
                  : 'resource-stat border-slate-800/70 bg-[#0E1524]'
              }`}
            >
              {/* Floating Animated Delta Popups on Decision Commit */}
              {recentChange !== undefined && (
                <div
                  className={`absolute -top-3 z-30 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-normal shadow-none  pointer-events-none ${
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
                      ? 'bg-emerald-400 text-slate-950 shadow-none'
                      : 'bg-rose-500 text-white shadow-none'
                  }`}
                >
                  <span className="text-[8px] font-medium leading-none">
                    {delta! > 0 ? '▲' : '▼'}
                  </span>
                </div>
              )}

              {/* Korean Name & Current Numeric Value */}
              <span className="text-[11px] font-medium text-slate-200 tracking-normal leading-tight mt-0.5 truncate max-w-full">
                {meta.label}
                {(isCritical || isWarning) && <small className="resource-status">{isCritical ? '위기' : '주의'}</small>}
              </span>
              <span
                className={`resource-value text-[11px] font-mono font-medium tabular-nums leading-none mt-0.5 ${
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
