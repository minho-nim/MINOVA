import React from 'react';
import {glossaryFor} from '../data/ethicsGlossary';
export function CardGlossary({text}:{text:string}){
  const terms=glossaryFor(text);
  if(!terms.length)return null;
  return <aside className="card-glossary" aria-label="어려운 용어 설명">
    {terms.map(([term,description])=><details key={term}>
      <summary>* {term} · 뜻 보기</summary>
      <p>[{term}: {description}]</p>
    </details>)}
  </aside>;
}
