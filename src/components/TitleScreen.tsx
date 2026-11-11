import React, { useState } from 'react';
import { ArrowRight, Play, RotateCcw, Shield, Scale, Users, Fingerprint, Radio } from 'lucide-react';
import { GameState } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { CAST_DETAILS, MAIN_CAST, CHARACTER_ART, FACTIONS, APPROVED_ART_ROOT, APPROVED_SHEETS, DISPLAY_ROLES } from '../data/characterArt';
import { CharacterPortrait } from './CharacterPortrait';
import { CharacterSheetViewer } from './CharacterSheetViewer';
import {StartBriefing} from './StartBriefing';

interface TitleScreenProps {
  onStartNewGame: () => void;
  onResumeGame?: () => void;
  savedState: GameState | null;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartNewGame, onResumeGame, savedState }) => {
  const [selected, setSelected] = useState(MAIN_CAST[0]);
  const [introTab,setIntroTab]=useState<'characters'|'city'>('characters');
  const [briefingOpen,setBriefingOpen]=useState(false);
  const character = CHARACTERS[selected];
  const details = CAST_DETAILS[selected]!;
  return (
    <div className="title-screen">
      <header className="city-masthead">
        <a className="wordmark" href="#" aria-label="MINOVA 홈">MINOVA</a>
        <div className="masthead-caption">NOVA CITY / 2079<span>PEOPLE. DATA. CHOICES. CONSEQUENCES.</span></div>
        <div className="system-live"><Radio size={12} /> ORACLE ONLINE</div>
      </header>
      <main>
        <section className="title-intro">
          <div>
            <p className="eyebrow">INTERACTIVE ETHICAL DILEMMA</p>
            <h1>하나의 도시,<br /><em>서로 다른 진실.</em></h1>
            <p className="intro-copy">완벽한 답을 제안하는 AI. 그 답을 살아가는 사람들.<br />도시의 다음 선택은 당신에게 달려 있습니다.</p>
          </div>
          <div className="start-terminal">
            <div className="terminal-label"><span className="live-dot" /> HUMAN OVERSIGHT REQUIRED <span>01 / 06</span></div>
            <h2>당신은 인간 AI 감독관입니다.</h2>
            <p>ORACLE의 정책을 승인하거나 거부하세요.<br />모든 판단은 도시의 균형과 사람들의 삶을 바꿉니다.</p>
            <button className="start-button" onClick={savedState && onResumeGame ? onResumeGame : ()=>setBriefingOpen(true)}><Play size={16} fill="currentColor" />{savedState ? `감독관 업무 이어하기 · DAY ${savedState.currentDay}` : '감독관으로 취임하기'}<ArrowRight size={18} /></button>
            {savedState && <button className="restart-button" onClick={()=>setBriefingOpen(true)}><RotateCcw size={12} /> 새 게임 시작</button>}
            <div className="terminal-help">좌우 스와이프 · 방향키 · 선택 버튼 <span>로컬 자동 저장</span></div>
          </div>
        </section>
        <nav className="intro-tabs" role="tablist" aria-label="NOVA CITY 소개" onKeyDown={event=>{
          if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
            event.preventDefault();const next=introTab==='characters'?'city':'characters';setIntroTab(next);document.getElementById(`intro-tab-${next}`)?.focus();
          }
        }}>
          <button id="intro-tab-characters" role="tab" aria-selected={introTab==='characters'} aria-controls="intro-panel-characters" tabIndex={introTab==='characters'?0:-1} onClick={()=>setIntroTab('characters')}>주요 인물</button>
          <button id="intro-tab-city" role="tab" aria-selected={introTab==='city'} aria-controls="intro-panel-city" tabIndex={introTab==='city'?0:-1} onClick={()=>setIntroTab('city')}>시민과 평의회</button>
        </nav>
        <section id="intro-panel-characters" role="tabpanel" className="cast-section" hidden={introTab!=='characters'} aria-labelledby="intro-tab-characters">
          <div className="section-caption"><h2 id="cast-heading">NOVA CITY의 주요 인물</h2><span>PERSONNEL FILES / 001—006</span></div>
          <div className="cast-grid">
            {MAIN_CAST.map((id, index) => {
              const person = CHARACTERS[id];
              return <button key={id} className={`cast-card ${selected === id ? 'is-selected' : ''}`} style={{ '--character-color': person.themeColor } as React.CSSProperties} onClick={() => setSelected(id)} aria-pressed={selected === id}>
                <div className="cast-art"><CharacterPortrait characterId={id} size={240} /><span className="cast-index">0{index + 1}</span><span className="cast-tag">{DISPLAY_ROLES[id]}</span></div>
                <div className="cast-name"><h3>{person.name}</h3><p>{DISPLAY_ROLES[id]}</p></div>
                <div className="cast-line" />
              </button>;
            })}
          </div>
          <CharacterSheetViewer source={APPROVED_SHEETS[selected]} name={character.name} />
          <div className="character-dossier" style={{ '--character-color': character.themeColor } as React.CSSProperties} aria-live="polite">
            <div className="dossier-heading"><span className="eyebrow">CHARACTER DOSSIER</span><h3>{character.name}</h3><p>{character.organization}</p><div className="trait-list">{details.traits.map(trait => <span key={trait}>{trait}</span>)}</div></div>
            <blockquote>“{details.quote}”<p>{character.description}</p></blockquote>
            <div className="expression-list">{(['neutral', 'worried', 'angry'] as const).map((emotion, i) => <div key={emotion}><CharacterPortrait characterId={selected} emotion={emotion} variant="expression" expressionIndex={i as 0 | 1 | 2} size={80} /><span>{CHARACTER_ART[selected]!.labels[i]}</span></div>)}</div>
          </div>
        </section>
        <section id="intro-panel-city" role="tabpanel" className="faction-section" hidden={introTab!=='city'} aria-labelledby="intro-tab-city">
          <div className="section-caption"><h2 id="faction-heading">도시의 두 목소리</h2><span>PEOPLE / COUNCIL</span></div>
          <div className="faction-grid">{FACTIONS.map(faction => <article key={faction.id} className="faction-card" style={{ '--character-color': faction.color } as React.CSSProperties}>
            <div className="faction-hero"><img src={faction.source} alt={`${faction.name} 구성원 전체`} loading="lazy" /></div>
            <div className="faction-copy"><p className="eyebrow">{faction.subtitle}</p><h3>{faction.name}</h3><blockquote>“{faction.quote}”</blockquote><div className="trait-list">{faction.traits.map(trait => <span key={trait}>{trait}</span>)}</div><p className="faction-description">{faction.description}</p></div>
            <div className="faction-scenes">{faction.scenes.map((scene, index) => <figure key={scene}><img src={`${APPROVED_ART_ROOT}${faction.id}-scene-${index}.png`} alt={scene} loading="lazy" /><figcaption>{scene}</figcaption></figure>)}</div>
            <div className="faction-sheet"><CharacterSheetViewer source={faction.sheet} name={faction.name} /></div>
          </article>)}</div>
        </section>
      </main>
      {briefingOpen&&<StartBriefing hasSavedGame={Boolean(savedState)} onClose={()=>setBriefingOpen(false)} onStart={()=>{setBriefingOpen(false);onStartNewGame();}} />}
      <footer className="city-footer"><span>FOUR VALUES. NO PERFECT BALANCE.</span><div><span><Users size={13} />시민 신뢰</span><span><Scale size={13} />공정성</span><span><Fingerprint size={13} />개인 자유</span><span><Shield size={13} />사회 안전</span></div><span>NOVA CITY GOVERNANCE SYSTEM</span></footer>
    </div>
  );
};
