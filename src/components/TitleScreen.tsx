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
        <a className="wordmark" href="#" aria-label="MINOVA 홈">MINOVA</a>
        <div className="masthead-caption">2079년 · 노바시</div>
        <div className="system-live"><Radio size={12} /> ORACLE 연결됨</div>
      </header>
      <main>
        <section className="title-intro">
          <div>
            <p className="eyebrow">도시 운영국 · 감독관 임명</p>
            <h1>이 도시의 결정에는<br /><em>당신의 서명이 필요합니다.</em></h1>
            <p className="intro-copy">출근길 신호부터 병원 침대까지, ORACLE은 매일 정책을 제안합니다.<br />누구를 기다리게 할지, 누구를 먼저 살릴지 결정하세요.</p>
          </div>
          <div className="start-terminal">
            <div className="terminal-label"><span className="live-dot" /> 감독관 승인 대기</div>
            <h2>{savedState ? '검토 중인 안건이 있습니다.' : '첫 안건이 도착했습니다.'}</h2>
            <p>카드 한 장에 안건 하나.<br />제안을 읽고 시행할지, 돌려보낼지 결정하세요.</p>
            <button className="start-button" onClick={savedState && onResumeGame ? onResumeGame : onStartNewGame}><Play size={16} fill="currentColor" />{savedState ? `감독관 업무 이어하기 · ${savedState.currentDay}일째` : '감독관으로 취임하기'}<ArrowRight size={18} /></button>
            {savedState && <button className="restart-button" onClick={onStartNewGame}><RotateCcw size={12} /> 새 게임 시작</button>}
            <div className="terminal-help">좌우 스와이프 · 방향키 · 선택 버튼 <span>자동 저장</span></div>
          </div>
        </section>
        <section className="cast-section" aria-labelledby="cast-heading">
          <div className="section-caption"><h2 id="cast-heading">당신에게 안건을 가져올 사람들</h2><span>인물을 선택해 소개 보기</span></div>
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
            <div className="dossier-heading"><span className="eyebrow">인물 기록</span><h3>{character.name}</h3><p>{character.organization}</p><div className="trait-list">{details.traits.map(trait => <span key={trait}>{trait}</span>)}</div></div>
            <blockquote>“{details.quote}”<p>{character.description}</p></blockquote>
            <div className="expression-list">{(['neutral', 'worried', 'angry'] as const).map((emotion, i) => <div key={emotion}><CharacterPortrait characterId={selected} emotion={emotion} variant="expression" size={64} /><span>{['기본', '고민', '단호'][i]}</span></div>)}</div>
          </div>
        </section>
      </main>
      <footer className="city-footer"><div><span><Users size={13} />시민 신뢰</span><span><Scale size={13} />공정성</span><span><Fingerprint size={13} />개인 자유</span><span><Shield size={13} />사회 안전</span></div></footer>
    </div>
  );
};
