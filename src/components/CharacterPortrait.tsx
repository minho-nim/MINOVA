import React from 'react';
import { CharacterEmotion, CharacterId, OracleVisualState } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { CHARACTER_ART } from '../data/characterArt';
import { SystemPortrait } from './SystemPortrait';
import type { SpeakerPortrait } from '../data/cardSpeakers';

interface Props {
  characterId: CharacterId;
  emotion?: CharacterEmotion;
  oracleState?: OracleVisualState;
  className?: string;
  size?: number;
  variant?: 'portrait' | 'expression';
  expressionIndex?: 0 | 1 | 2;
  frame?: 'tile' | 'natural' | 'dialogue';
  speakerPortrait?: SpeakerPortrait;
}

/** Select native-resolution atlas regions without flattening text into portraits. */
export const CharacterPortrait: React.FC<Props> = ({
  characterId, emotion = 'neutral', oracleState = 'normal', className = '', size = 110,
  variant = 'portrait', expressionIndex, frame = 'tile', speakerPortrait,
}) => {
  const art = CHARACTER_ART[characterId];
  if (!art) return <SystemPortrait characterId={characterId} emotion={emotion} oracleState={oracleState} className={className} size={size} />;
  let index = expressionIndex ?? art.emotions[emotion];
  // Oracle states belong to ORACLE; a person's stated emotion remains authoritative.
  if (characterId === 'oracle' && expressionIndex === undefined && oracleState !== 'normal') {
    index = oracleState === 'uncertain' ? 1 : oracleState === 'confident' ? 0 : 2;
  }
  // A state mapped to the base face can use the much larger original portrait.
  // Only distinct expressions need the small expression cells; the gallery stays explicit.
  const useExpression = variant === 'expression' || expressionIndex !== undefined || index !== 0;
  const region = useExpression ? art.expressions[index] : art.portrait;
  const label = useExpression ? art.labels[index] : '기본';
  const raster = speakerPortrait?.src ?? (useExpression ? art.rasterExpressions?.[index] : art.rasterPortrait);
  const alt = speakerPortrait?.label ?? `${CHARACTERS[characterId].name} · ${label} 표정`;
  return (
    <div className={`character-portrait ${frame === 'natural' ? 'natural-portrait' : frame === 'dialogue' ? 'dialogue-portrait' : ''} ${art.collective && !speakerPortrait ? 'collective-portrait' : ''} ${characterId === 'oracle' ? 'oracle-portrait' : ''} ${className}`} data-emotion={index === 2 ? 'alert' : index === 1 ? 'analyzing' : 'neutral'} style={{ width: size, height: frame === 'natural' ? 'auto' : size, '--character-color': CHARACTERS[characterId].themeColor } as React.CSSProperties}>
      {raster ? <img src={raster} alt={alt} width={speakerPortrait?.width} height={speakerPortrait?.height} draggable={false} /> : <svg viewBox={region.join(' ')} preserveAspectRatio="xMidYMid meet" role="img" aria-label={alt}>
        <image href={art.source} width={art.sourceWidth??1536} height={art.sourceHeight??1024} />
      </svg>}
    </div>
  );
};
