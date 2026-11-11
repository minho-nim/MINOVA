import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Opens the exact approved sheet, including turnarounds, clothing and props. */
export function CharacterSheetViewer({ source, name }: {source:string; name:string}) {
  const [open,setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const onKey = (e:KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab') {
        // The viewer has two controls; keep keyboard focus inside the modal.
        const controls = close.current?.parentElement?.querySelectorAll<HTMLElement>('button,a');
        if (!controls?.length) return;
        if (e.shiftKey && document.activeElement === controls[0]) {e.preventDefault(); controls[controls.length-1].focus();}
        else if (!e.shiftKey && document.activeElement === controls[controls.length-1]) {e.preventDefault(); controls[0].focus();}
      }
    };
    document.addEventListener('keydown',onKey);
    return () => {document.body.style.overflow = previousOverflow; document.removeEventListener('keydown',onKey); trigger.current?.focus();};
  },[open]);
  return <>
    <button className="sheet-open-button" ref={trigger} onClick={()=>setOpen(true)}>{name} 디자인 시트 · 전신 / 의상 / 소품</button>
    {open && createPortal(<div className="sheet-backdrop" onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
      <section className="sheet-viewer" role="dialog" aria-modal="true" aria-label={`${name} 승인 디자인 시트`}>
        <header><strong>{name} · 승인 디자인 시트</strong><a href={source} target="_blank" rel="noreferrer">원본 크기로 보기 ↗</a><button ref={close} onClick={()=>setOpen(false)} aria-label="디자인 시트 닫기">닫기 ×</button></header>
        <div className="sheet-scroll"><img src={source} alt={`${name} 전신 디자인, 표정, 의상 구조와 소품이 포함된 승인 원본`} /></div>
      </section>
    </div>,document.body)}
  </>;
}
