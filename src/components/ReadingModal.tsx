import React,{useEffect,useId,useRef} from 'react';
import {createPortal} from 'react-dom';

export function ReadingModal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
  const ref=useRef<HTMLElement>(null);const titleId=useId();
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}
      if(event.key==='Tab'){
        const controls=ref.current?.querySelectorAll<HTMLElement>('button,a[href],[tabindex="0"]');
        if(!controls?.length)return;
        const first=controls[0],last=controls[controls.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',key,true);
    return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key,true);previous?.focus();};
  },[onClose]);
  return createPortal(<div className="reading-overlay">
    <section className="reading-modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header><h2 id={titleId}>{title}</h2><button type="button" onClick={onClose} aria-label="안내 닫기">닫기 ×</button></header>
      <div className="reading-modal-content">{children}</div>
    </section>
  </div>,document.body);
}
