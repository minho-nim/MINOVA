// Static QA fixture using the actual GameCard component and built CSS.
// No game state, browser save, decisions or engine transitions are modified.
// Run after build: node --import tsx scripts/render-card-layout-review.ts
import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ALL_CARDS} from '../src/data/cards';
import {GameCard} from '../src/components/GameCard';
const style=fs.readdirSync('dist/assets').find(name=>name.endsWith('.css'))!;
const resources={citizenTrust:50,fairness:50,personalFreedom:50,publicSafety:50};
const cards=ALL_CARDS.map(card=>`<article data-review-id="${card.id}">${renderToStaticMarkup(React.createElement(GameCard,{card,storyFlags:{},resources,onDecision(){},onHoverDirectionChange(){},isProcessing:false}))}</article>`).join('\n');
fs.writeFileSync('dist/card-layout-review.html',`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>대화 카드 크기 검증</title><link rel="stylesheet" href="/assets/${style}"><style>.review-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;max-width:1000px;margin:auto;padding:20px;}.review-grid>article{min-width:0;}@media(max-width:760px){.review-grid{grid-template-columns:minmax(0,1fr);padding:12px;}}</style></head><body><h1>실제 카드 159장 · 표시 검증용</h1><p>실제 GameCard와 빌드 CSS. 저장 및 정책 선택 없음.</p><main class="review-grid">${cards}</main></body></html>`);
console.log('Rendered actual 159 card presentations into dist/card-layout-review.html');
