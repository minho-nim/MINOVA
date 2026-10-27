import React, { useState } from 'react';
import { ArrowRight, Play, RotateCcw, Shield, Scale, Users, Fingerprint, Radio } from 'lucide-react';
import { GameState } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { CAST_DETAILS, MAIN_CAST } from '../data/characterArt';
import { CharacterPortrait } from './CharacterPortrait';

interface TitleScreenProps {
  onStartNewGame: () => void;
  onResumeGame?: () => void;
  savedState: GameState | null;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartNewGame, onResumeGame, savedState }) => {
  const [selected, setSelected] = useState(MAIN_CAST[0]);
  const character = CHARACTERS[selected];
  const details = CAST_DETAILS[selected]!;
  return (
    <div className="title-screen">
      <header className="city-masthead">
        <a className="wordmark" href="#" aria-label="Crossroads 홈">CROSSROADS<span>AI VERDICT</span></a>
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
            <button className="start-button" onClick={savedState && onResumeGame ? onResumeGame : onStartNewGame}><Play size={16} fill="currentColor" />{savedState ? `감독관 업무 이어하기 · DAY ${savedState.currentDay}` : '감독관으로 취임하기'}<ArrowRight size={18} /></button>
            {savedState && <button className="restart-button" onClick={onStartNewGame}><RotateCcw size={12} /> 새 게임 시작</button>}
            <div className="terminal-help">좌우 스와이프 · 방향키 · 선택 버튼 <span>로컬 자동 저장</span></div>
          </div>
        </section>
        <section className="cast-section" aria-labelledby="cast-heading">
          <div className="section-caption"><h2 id="cast-heading">도시를 움직이는 여섯 개의 시선</h2><span>PERSONNEL FILES / 001—006</span></div>
          <div className="cast-grid">
            {MAIN_CAST.map((id, index) => {
              const person = CHARACTERS[id];
              return <button key={id} className={`cast-card ${selected === id ? 'is-selected' : ''}`} style={{ '--character-color': person.themeColor } as React.CSSProperties} onClick={() => setSelected(id)} aria-pressed={selected === id}>
                <div className="cast-art"><CharacterPortrait characterId={id} size={240} /><span className="cast-index">0{index + 1}</span><span className="cast-tag">{CAST_DETAILS[id]!.tag}</span></div>
                <div className="cast-name"><h3>{person.name}</h3><p>{person.role}</p></div>
                <div className="cast-line" />
              </button>;
            })}
          </div>
          <div className="character-dossier" style={{ '--character-color': character.themeColor } as React.CSSProperties} aria-live="polite">
            <div className="dossier-heading"><span className="eyebrow">CHARACTER DOSSIER</span><h3>{character.name}</h3><p>{character.organization}</p><div className="trait-list">{details.traits.map(trait => <span key={trait}>{trait}</span>)}</div></div>
            <blockquote>“{details.quote}”<p>{character.description}</p></blockquote>
            <div className="expression-list">{(['neutral', 'worried', 'angry'] as const).map((emotion, i) => <div key={emotion}><CharacterPortrait characterId={selected} emotion={emotion} variant="expression" size={64} /><span>{['기본', '고민', '단호'][i]}</span></div>)}</div>
          </div>
        </section>
      </main>
      <footer className="city-footer"><span>FOUR VALUES. NO PERFECT BALANCE.</span><div><span><Users size={13} />시민 신뢰</span><span><Scale size={13} />공정성</span><span><Fingerprint size={13} />개인 자유</span><span><Shield size={13} />사회 안전</span></div><span>NOVA CITY GOVERNANCE SYSTEM</span></footer>
    </div>
  );
};
