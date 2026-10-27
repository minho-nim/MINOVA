import React from 'react';
import { CharacterEmotion, CharacterId, OracleVisualState } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { CHARACTER_SHEET, MAIN_CAST } from '../data/characterArt';
import { SystemPortrait } from './SystemPortrait';

interface Props {
  characterId: CharacterId;
  emotion?: CharacterEmotion;
  oracleState?: OracleVisualState;
  className?: string;
  size?: number;
  variant?: 'portrait' | 'expression';
}

/** Use viewports of the supplied character sheet without resampling the source art. */
export const CharacterPortrait: React.FC<Props> = ({ characterId, emotion = 'neutral', oracleState = 'normal', className = '', size = 110, variant = 'portrait' }) => {
  const index = MAIN_CAST.indexOf(characterId);
  if (index < 0) return <SystemPortrait characterId={characterId} emotion={emotion} oracleState={oracleState} className={className} size={size} />;
  const alert = emotion === 'angry' || oracleState === 'conflict' || oracleState === 'error';
  const analyzing = emotion === 'worried' || emotion === 'uncertain' || emotion === 'glitch' || oracleState === 'uncertain' || oracleState === 'glitch';
  const expression = alert ? 2 : analyzing ? 1 : 0;
  const useExpression = variant === 'expression' || alert || analyzing;
  const x = 16 + index * 254;
  const viewBox = useExpression ? `${x + expression * 79} 781 76 89` : `${x} 134 238 278`;
  return (
    <div className={`character-portrait ${className}`} data-emotion={alert ? 'alert' : analyzing ? 'analyzing' : 'neutral'} style={{ width: size, height: size, '--character-color': CHARACTERS[characterId].themeColor } as React.CSSProperties}>
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${CHARACTERS[characterId].name} · ${alert ? '단호' : analyzing ? '고민' : '기본'} 표정`}>
        <image href={CHARACTER_SHEET} width="1536" height="1024" />
      </svg>
    </div>
  );
};
