import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { DecisionFeedbackData } from '../utils/decisionFeedback';
import { RESOURCE_META, RESOURCE_ORDER } from '../engine/resourceEngine';

interface Props {
  feedback: DecisionFeedbackData;
  onDismiss: (id: string) => void;
}

export function DecisionFeedback({ feedback, onDismiss }: Props) {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (focused) return;
    const timer = setTimeout(() => onDismiss(feedback.id), 1200);
    return () => clearTimeout(timer);
  }, [feedback.id, onDismiss, focused]);
  // Render outside the game shell: never consumes layout space or resizes dialogue.
  return createPortal(
    <aside className="decision-result-toast" aria-label="선택 결과">
      <div role="status" aria-live="polite" aria-atomic="true">
        <span className="decision-result-label">선택 결과</span>
        <p className="decision-result-summary">{feedback.summary}</p>
        <ul className="decision-result-deltas" aria-label="실제 지표 변화">
          {RESOURCE_ORDER.filter(key => feedback.delta[key] !== undefined).map(key => {
            const change = feedback.delta[key]!;
            return <li key={key}>{RESOURCE_META[key].label} <strong className={change > 0 ? 'is-positive' : 'is-negative'}>{change > 0 ? '+' : '−'}{Math.abs(change)}</strong></li>;
          })}
        </ul>
        {feedback.adjustment && <span className="decision-result-adjustment">{feedback.adjustment}</span>}
      </div>
      <button type="button" aria-label="선택 결과 닫기" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onClick={() => onDismiss(feedback.id)}>
        <X size={16} />
      </button>
    </aside>, document.body,
  );
}
