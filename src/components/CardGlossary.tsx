import React, { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { glossaryFor } from '../data/ethicsGlossary';

function HoldDefinition({ term, description }: { term: string; description: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    // Prevent scrolling without removing scrollbars or changing any dimensions.
    const preventScroll = (event: Event) => event.preventDefault();
    const preventKeys = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); }
    };
    const end = () => setOpen(false);
    window.addEventListener('wheel', preventScroll, { passive: false, capture: true });
    window.addEventListener('touchmove', preventScroll, { passive: false, capture: true });
    window.addEventListener('keydown', preventKeys, true);
    window.addEventListener('blur', end);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    document.addEventListener('visibilitychange', end);
    return () => {
      window.removeEventListener('wheel', preventScroll, true);
      window.removeEventListener('touchmove', preventScroll, true);
      window.removeEventListener('keydown', preventKeys, true);
      window.removeEventListener('blur', end);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      document.removeEventListener('visibilitychange', end);
    };
  }, [open]);
  return <>
    <button type="button" className="glossary-hold" aria-label={`${term} 뜻 보기 · 누르는 동안 표시`} aria-describedby={open ? id : undefined}
      onPointerDown={event => {
        if (event.button !== 0 || !event.isPrimary) return;
        event.preventDefault(); event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        setOpen(true);
      }}
      onPointerUp={() => setOpen(false)} onPointerCancel={() => setOpen(false)} onLostPointerCapture={() => setOpen(false)}
      onKeyDown={event => {
        if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); if (!event.repeat) setOpen(true); }
      }}
      onKeyUp={event => {
        if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); setOpen(false); }
      }}
      onBlur={() => setOpen(false)} onContextMenu={event => event.preventDefault()}
      onClick={event => { event.stopPropagation(); if (event.detail === 0) setOpen(value => !value); }}
    >{term}</button>
    {open && createPortal(<aside id={id} role="tooltip" className="glossary-tooltip">
      <strong>{term}</strong><p>{description}</p><small>손을 떼면 닫힙니다</small>
    </aside>, document.body)}
  </>;
}

export function CardGlossary({ text }: { text: string }) {
  const terms = glossaryFor(text);
  if (!terms.length) return null;
  return <aside className="card-glossary" aria-label="어려운 용어 설명" data-reading-area>
    <span className="glossary-hint">뜻 보기 · 꾹 누르기</span>
    <div className="glossary-terms">{terms.map(([term, description]) => <HoldDefinition key={term} term={term} description={description} />)}</div>
  </aside>;
}
