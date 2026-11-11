import React, { useEffect, useState } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { DecisionFeedbackData } from '../utils/decisionFeedback';
import { RESOURCE_META, RESOURCE_ORDER } from '../engine/resourceEngine';

interface Props {
  feedback: DecisionFeedbackData;
  onDismiss: (id: string) => void;
  onOpenHistory: () => void;
}

export function DecisionFeedback({ feedback, onDismiss, onOpenHistory }: Props) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (hovered || focused) return;
    const timer = setTimeout(() => onDismiss(feedback.id), 7000);
    return () => clearTimeout(timer);
  }, [feedback.id, onDismiss, hovered, focused]);

  const changed = RESOURCE_ORDER.filter(key => feedback.delta[key] !== undefined);
  return (
    <section
      className="decision-feedback"
      aria-label="방금 내린 결정의 결과"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
      <div className="decision-feedback-heading">
        <span>결정 결과</span>
        <button type="button" aria-label="결정 결과 닫기" onClick={() => onDismiss(feedback.id)}>
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        <p className="decision-feedback-title">{feedback.title}</p>
        <p className="decision-feedback-summary">{feedback.summary}</p>
        {changed.length ? (
          <ul className="decision-feedback-deltas" aria-label="실제 도시 지표 변화">
            {changed.map(key => {
              const value = feedback.delta[key]!;
              return <li key={key}>
                <span>{RESOURCE_META[key].label}</span>
                <strong className={value > 0 ? 'delta-increase' : 'delta-decrease'}>
                  {value > 0 ? '+' : '−'}{Math.abs(value)}
                </strong>
              </li>;
            })}
          </ul>
        ) : <p className="decision-feedback-note">도시 지표 변화 없음</p>}
        {feedback.adjustment && <p className="decision-feedback-note">{feedback.adjustment}</p>}
      </div>
      <button type="button" className="decision-feedback-history" onClick={onOpenHistory}>
        판단 기록부에서 다시 보기 <ArrowUpRight size={16} strokeWidth={1.5} />
      </button>
    </section>
  );
}
