/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterEmotion, CharacterId, OracleVisualState } from '../types/game';

interface CharacterPortraitProps {
  characterId: CharacterId;
  emotion?: CharacterEmotion;
  oracleState?: OracleVisualState;
  className?: string;
  size?: number;
}

export const SystemPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  emotion = 'neutral',
  oracleState = 'normal',
  className = '',
  size = 110,
}) => {
  // Determine effective ORACLE state: if character is oracle and emotion is set, map it
  const effectiveOracleState: OracleVisualState =
    oracleState !== 'normal'
      ? oracleState
      : emotion === 'confident'
      ? 'confident'
      : emotion === 'uncertain'
      ? 'uncertain'
      : emotion === 'glitch'
      ? 'glitch'
      : emotion === 'angry'
      ? 'conflict'
      : 'normal';

  const renderSVG = () => {
    switch (characterId) {
      // -----------------------------------------------------------------------
      // 1. ORACLE: Asymmetric Geometric Hologram
      // -----------------------------------------------------------------------
      case 'oracle': {
        const isConflict = effectiveOracleState === 'conflict';
        const isError = effectiveOracleState === 'error';
        const isGlitch = effectiveOracleState === 'glitch';
        const isConfident = effectiveOracleState === 'confident';
        const isUncertain = effectiveOracleState === 'uncertain';

        const primaryColor = isConflict
          ? '#EF4444'
          : isGlitch
          ? '#EC4899'
          : isError
          ? '#F59E0B'
          : isConfident
          ? '#67E8F9'
          : isUncertain
          ? '#38BDF8'
          : '#22D3EE';

        const secondaryColor = isConflict ? '#991B1B' : isGlitch ? '#831843' : '#0284C7';
        const glowOpacity = isConfident ? 0.95 : isUncertain ? 0.45 : 0.75;

        return (
          <svg
            viewBox="0 0 200 200"
            width={size}
            height={size}
            className={`w-full h-full ${isUncertain ? 'animate-pulse' : ''}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="oracleRadial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={primaryColor} stopOpacity={glowOpacity} />
                <stop offset="45%" stopColor={secondaryColor} stopOpacity={0.4} />
                <stop offset="85%" stopColor="#081426" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#080D17" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="oracleCore" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="100%" stopColor={secondaryColor} />
              </linearGradient>
            </defs>

            {/* Dark Chamber Backdrop */}
            <circle cx="100" cy="100" r="92" fill="#0B1220" />
            <circle cx="100" cy="100" r="88" fill="url(#oracleRadial)" />

            {/* Glitch / Error Offset Shadows */}
            {isError && (
              <>
                <polygon
                  points="102,42 152,72 152,132 102,162 52,132 52,72"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  opacity="0.8"
                />
                <line x1="20" y1="95" x2="180" y2="95" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
                <line x1="30" y1="105" x2="170" y2="105" stroke="#EF4444" strokeWidth="1" opacity="0.7" />
              </>
            )}

            {/* Outer Geometric HUD Ring */}
            <circle
              cx="100"
              cy="100"
              r="84"
              stroke={primaryColor}
              strokeWidth="1.2"
              strokeDasharray={isUncertain ? '3 12' : '8 4 16 4'}
              opacity="0.6"
            />
            <circle
              cx="100"
              cy="100"
              r="74"
              stroke={primaryColor}
              strokeWidth="0.8"
              strokeDasharray="40 10 20 10"
              opacity="0.4"
            />

            {/* Asymmetrical Geometric Hexagon Core */}
            <polygon
              points="100,45 148,73 148,127 100,155 52,127 52,73"
              stroke={primaryColor}
              strokeWidth={isConfident ? 2.5 : 1.6}
              fill="#061325"
              fillOpacity="0.4"
            />

            {/* Inner Gyro Cross Rings */}
            <ellipse
              cx="100"
              cy="100"
              rx="46"
              ry="24"
              stroke={primaryColor}
              strokeWidth="1.2"
              transform="rotate(-25 100 100)"
              opacity="0.75"
            />
            <ellipse
              cx="100"
              cy="100"
              rx="46"
              ry="24"
              stroke={primaryColor}
              strokeWidth="1.2"
              transform="rotate(35 100 100)"
              opacity="0.75"
            />

            {/* Floating Energy Arc Reticle */}
            <circle cx="100" cy="100" r="16" fill="url(#oracleCore)" />
            <circle cx="100" cy="100" r="8" fill="#FFFFFF" opacity={isConfident ? 1 : 0.85} />

            {/* Status Micro-Readouts */}
            <text x="32" y="32" fill={primaryColor} fontSize="8" fontFamily="monospace" opacity="0.7">
              {isConflict ? 'ERR//CONFLICT' : isError ? 'SYS//GLITCH' : isConfident ? 'ALIGN//100%' : 'ORACLE//CORE'}
            </text>
            <text x="124" y="176" fill={primaryColor} fontSize="8" fontFamily="monospace" opacity="0.6">
              v2079.11
            </text>
          </svg>
        );
      }

      // -----------------------------------------------------------------------
      // 2. 서윤하 박사: Asymmetric Glasses, Lab Coat, Anxious/Brilliant
      // -----------------------------------------------------------------------
      case 'seoYoonha': {
        const isWorried = emotion === 'worried' || emotion === 'uncertain';
        const isConfident = emotion === 'confident';

        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className="w-full h-full" fill="none">
            {/* Background Studio Light */}
            <circle cx="100" cy="100" r="92" fill="#0C101F" />
            <circle cx="100" cy="95" r="70" fill="#4338CA" fillOpacity="0.15" />

            {/* Lab Coat Shoulders */}
            <path
              d="M38 185 C42 145 68 135 100 135 C132 135 158 145 162 185 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Lab Coat Lapels */}
            <path d="M78 138 L94 185 L106 185 L122 138" fill="#312E81" opacity="0.8" />
            <path d="M100 148 L100 185" stroke="#6366F1" strokeWidth="1" strokeDasharray="2 3" />

            {/* Data Badge on Lab Coat */}
            <rect x="56" y="152" width="16" height="20" rx="2" fill="#0F172A" stroke="#818CF8" strokeWidth="1" />
            <circle cx="64" cy="158" r="3" fill="#818CF8" />

            {/* Neck */}
            <path d="M88 120 L88 142 L112 142 L112 120 Z" fill="#E2C9B6" />

            {/* Head Contour */}
            <path
              d="M72 82 C72 52 128 52 128 82 C128 112 118 128 100 128 C82 128 72 112 72 82 Z"
              fill="#F3D5C0"
            />

            {/* Asymmetrical Bob Haircut */}
            <path
              d="M66 84 C64 45 136 42 134 84 C134 104 128 114 126 116 C124 94 124 72 100 70 C76 72 74 102 70 118 C67 114 66 102 66 84 Z"
              fill="#18181B"
            />
            {/* Left Longer Hair Strand */}
            <path d="M68 84 Q62 120 74 134 Q66 110 68 84" fill="#27272A" />

            {/* Eyebrows */}
            {isWorried ? (
              // Furrowed, tilted brows
              <>
                <path d="M80 82 Q88 80 94 85" stroke="#27272A" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M106 85 Q112 80 120 82" stroke="#27272A" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : isConfident ? (
              // Resolute, alert brows
              <>
                <path d="M80 82 Q88 78 94 80" stroke="#27272A" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M106 80 Q112 78 120 82" stroke="#27272A" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : (
              // Neutral brows
              <>
                <path d="M80 83 Q88 81 94 83" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
                <path d="M106 83 Q112 81 120 83" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
              </>
            )}

            {/* Eyes */}
            <ellipse cx="87" cy="91" rx="4" ry={isWorried ? 3.5 : 4} fill="#18181B" />
            <ellipse cx="113" cy="91" rx="4" ry={isWorried ? 3.5 : 4} fill="#18181B" />
            <circle cx="88.5" cy="89.5" r="1.2" fill="#FFFFFF" />
            <circle cx="114.5" cy="89.5" r="1.2" fill="#FFFFFF" />

            {/* Asymmetrical High-Tech Optical Glasses on Left/Center */}
            <rect
              x="77"
              y="84"
              width="20"
              height="15"
              rx="3"
              stroke="#818CF8"
              strokeWidth="1.8"
              fill="#6366F1"
              fillOpacity="0.15"
            />
            <rect
              x="103"
              y="84"
              width="20"
              height="15"
              rx="3"
              stroke="#818CF8"
              strokeWidth="1.8"
              fill="#6366F1"
              fillOpacity="0.15"
            />
            <line x1="97" y1="91" x2="103" y2="91" stroke="#818CF8" strokeWidth="1.8" />
            {/* HUD Reticle Line on Lens */}
            <line
              x1="79"
              y1="91"
              x2="95"
              y2="91"
              stroke={isWorried ? '#F59E0B' : '#818CF8'}
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />

            {/* Mouth */}
            {isWorried ? (
              <path d="M94 115 Q100 111 106 114" stroke="#A16207" strokeWidth="1.8" strokeLinecap="round" />
            ) : isConfident ? (
              <path d="M93 113 Q100 118 107 114" stroke="#A16207" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <line x1="95" y1="114" x2="105" y2="114" stroke="#A16207" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        );
      }

      // -----------------------------------------------------------------------
      // 3. 강도현 행정국장: Sharp Suit, Gold Badge, Bureaucratic Edge
      // -----------------------------------------------------------------------
      case 'kangDohyun': {
        const isAngry = emotion === 'angry';
        const isConfident = emotion === 'confident';

        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className="w-full h-full" fill="none">
            <circle cx="100" cy="100" r="92" fill="#0C1019" />
            <circle cx="100" cy="95" r="70" fill="#334155" fillOpacity="0.2" />

            {/* Angular Sharp Double-Breasted Suit Shoulders */}
            <path
              d="M32 185 L44 140 L76 135 L100 152 L124 135 L156 140 L168 185 Z"
              fill="#1E293B"
              stroke="#475569"
              strokeWidth="1.6"
            />
            {/* White Shirt Collar & Steel Tie */}
            <polygon points="90,135 110,135 106,155 94,155" fill="#F8FAFC" />
            <polygon points="97,152 103,152 105,185 95,185" fill="#64748B" />

            {/* Golden Municipal Council Crest Badge on Chest */}
            <polygon
              points="64,150 72,154 72,166 64,172 56,166 56,154"
              fill="#EAB308"
              stroke="#CA8A04"
              strokeWidth="1"
            />
            <circle cx="64" cy="161" r="2.5" fill="#FEF08A" />

            {/* Neck */}
            <rect x="88" y="118" width="24" height="20" fill="#E5C7B2" />

            {/* Strong Angular Jawline Head */}
            <polygon points="76,75 80,118 100,130 120,118 124,75 100,68" fill="#F5D7C2" />

            {/* Slicked-Back Sharp Hair */}
            <path d="M72 76 C72 45 128 45 128 76 L124 85 L120 72 L80 72 L76 85 Z" fill="#0F172A" />

            {/* Eyebrows */}
            {isAngry ? (
              <>
                <line x1="80" y1="83" x2="94" y2="87" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="106" y1="87" x2="120" y2="83" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : isConfident ? (
              <>
                <line x1="80" y1="84" x2="94" y2="83" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="106" y1="81" x2="120" y2="83" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="81" y1="84" x2="94" y2="85" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="106" y1="85" x2="119" y2="84" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
              </>
            )}

            {/* Narrow Calculating Eyes */}
            <ellipse cx="88" cy="92" rx="4.5" ry="3" fill="#0F172A" />
            <ellipse cx="112" cy="92" rx="4.5" ry="3" fill="#0F172A" />

            {/* Mouth */}
            {isAngry ? (
              <line x1="93" y1="114" x2="107" y2="113" stroke="#991B1B" strokeWidth="2.2" strokeLinecap="round" />
            ) : isConfident ? (
              <path d="M94 113 Q102 116 108 111" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <line x1="94" y1="114" x2="106" y2="114" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        );
      }

      // -----------------------------------------------------------------------
      // 4. 한지우 대표: Orange Scarf, Passionate Activist
      // -----------------------------------------------------------------------
      case 'hanJiwoo': {
        const isAngry = emotion === 'angry';
        const isWorried = emotion === 'worried';

        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className="w-full h-full" fill="none">
            <circle cx="100" cy="100" r="92" fill="#130E0A" />
            <circle cx="100" cy="95" r="70" fill="#EA580C" fillOpacity="0.15" />

            {/* Field Jacket Shoulders */}
            <path
              d="M36 185 C42 144 70 135 100 135 C130 135 158 144 164 185 Z"
              fill="#27272A"
              stroke="#3F3F46"
              strokeWidth="1.5"
            />

            {/* Vibrant Orange Scarf */}
            <path
              d="M74 130 C76 148 94 165 100 165 C106 165 124 148 126 130 L118 124 L100 132 L82 124 Z"
              fill="#F97316"
              stroke="#EA580C"
              strokeWidth="1.5"
            />
            {/* Scarf Tail Draping Down */}
            <path d="M92 165 L88 185 L102 185 L104 165 Z" fill="#EA580C" />

            {/* Neck */}
            <rect x="90" y="112" width="20" height="18" fill="#F3D1BC" />

            {/* Head */}
            <circle cx="100" cy="88" r="28" fill="#F9DEC9" />

            {/* Short Wavy Hair with Fringe */}
            <path
              d="M72 88 C70 54 130 52 128 88 C128 72 124 64 100 64 C76 64 72 72 72 88 Z"
              fill="#451A03"
            />
            <path d="M72 84 Q82 92 88 84 Q98 92 108 84 Q118 92 128 84" fill="#451A03" />

            {/* Eyebrows */}
            {isAngry ? (
              <>
                <path d="M80 82 L93 86" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M107 86 L120 82" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : isWorried ? (
              <>
                <path d="M80 84 Q88 81 93 85" stroke="#451A03" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M107 85 Q112 81 120 84" stroke="#451A03" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M80 82 Q88 79 93 82" stroke="#451A03" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M107 82 Q112 79 120 82" stroke="#451A03" strokeWidth="2.2" strokeLinecap="round" />
              </>
            )}

            {/* Determined Dark Eyes */}
            <circle cx="87" cy="90" r="4.5" fill="#451A03" />
            <circle cx="113" cy="90" r="4.5" fill="#451A03" />
            <circle cx="89" cy="88.5" r="1.3" fill="#FFFFFF" />
            <circle cx="115" cy="88.5" r="1.3" fill="#FFFFFF" />

            {/* Mouth */}
            {isAngry ? (
              <ellipse cx="100" cy="110" rx="6" ry="4" fill="#7C2D12" stroke="#EA580C" strokeWidth="1" />
            ) : isWorried ? (
              <path d="M94 112 Q100 108 106 112" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M94 110 Q100 115 106 110" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        );
      }

      // -----------------------------------------------------------------------
      // 5. 백시온 감사관: Purple Optical Monocle, Dark Trench Coat
      // -----------------------------------------------------------------------
      case 'baekSion': {
        const isConfident = emotion === 'confident';

        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className="w-full h-full" fill="none">
            <circle cx="100" cy="100" r="92" fill="#0E0B19" />
            <circle cx="100" cy="95" r="70" fill="#7E22CE" fillOpacity="0.18" />

            {/* High-Collar Trench Coat */}
            <path
              d="M34 185 L48 132 L78 126 L100 148 L122 126 L152 132 L166 185 Z"
              fill="#18181B"
              stroke="#3F3F46"
              strokeWidth="1.5"
            />
            {/* Violet Inner Lining */}
            <path d="M80 128 L100 152 L120 128" fill="#581C87" opacity="0.8" />

            {/* Head Contour */}
            <polygon points="76,74 80,114 100,126 120,114 124,74 100,68" fill="#F2D8C7" />

            {/* Dark Neat Undercut Hair */}
            <path d="M72 74 C72 48 128 48 128 74 L120 72 L80 72 Z" fill="#18181B" />

            {/* Purple Glowing Optical Analysis Monocle over Left Eye */}
            <circle
              cx="114"
              cy="89"
              r="10"
              stroke="#C084FC"
              strokeWidth="2"
              fill="#A855F7"
              fillOpacity="0.3"
            />
            {/* Monocle Mounting Arm to Ear */}
            <path d="M124 89 L132 87" stroke="#A855F7" strokeWidth="1.5" />
            {/* Data Stream Grid in Monocle */}
            <line x1="106" y1="89" x2="122" y2="89" stroke="#E9D5FF" strokeWidth="0.8" strokeDasharray="2 2" />

            {/* Right Regular Eye */}
            <circle cx="86" cy="89" r="4" fill="#18181B" />
            <circle cx="87.5" cy="87.5" r="1.2" fill="#FFFFFF" />

            {/* Eyebrows */}
            <line x1="79" y1="82" x2="93" y2="82" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="107" y1="79" x2="121" y2="81" stroke="#A855F7" strokeWidth="2.2" strokeLinecap="round" />

            {/* Mouth */}
            {isConfident ? (
              <path d="M94 110 Q102 114 107 109" stroke="#581C87" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <line x1="94" y1="110" x2="106" y2="110" stroke="#581C87" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        );
      }

      // -----------------------------------------------------------------------
      // 6. 오혜진 원장: Medical Visor, Holographic Stethoscope, Resolute
      // -----------------------------------------------------------------------
      case 'ohHyejin': {
        const isWorried = emotion === 'worried';
        const isAngry = emotion === 'angry';

        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className="w-full h-full" fill="none">
            <circle cx="100" cy="100" r="92" fill="#140A0D" />
            <circle cx="100" cy="95" r="70" fill="#BE123C" fillOpacity="0.18" />

            {/* Medical Scrubs & Vest */}
            <path
              d="M36 185 C42 142 70 135 100 135 C130 135 158 142 164 185 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* V-neck Scrub */}
            <polygon points="86,135 114,135 100,154" fill="#0284C7" />

            {/* Holographic Crimson Stethoscope on Neck */}
            <path
              d="M74 135 C74 165 126 165 126 135"
              stroke="#FB7185"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 2"
            />
            <circle cx="100" cy="165" r="6" fill="#F43F5E" stroke="#FFE4E6" strokeWidth="1" />

            {/* Head Contour */}
            <circle cx="100" cy="88" r="28" fill="#F5DACB" />

            {/* Tired dark circles under eyes if worried */}
            {isWorried && (
              <>
                <ellipse cx="87" cy="94" rx="6" ry="2" fill="#BE123C" fillOpacity="0.25" />
                <ellipse cx="113" cy="94" rx="6" ry="2" fill="#BE123C" fillOpacity="0.25" />
              </>
            )}

            {/* Hair with Clinician Bun */}
            <path d="M70 86 C68 52 132 50 130 86 L124 74 L76 74 Z" fill="#292524" />
            <circle cx="100" cy="52" r="10" fill="#292524" />

            {/* Glowing Medical Visor Headset on Forehead */}
            <rect
              x="72"
              y="68"
              width="56"
              height="8"
              rx="2"
              fill="#0F172A"
              stroke="#F43F5E"
              strokeWidth="1.2"
            />
            <circle cx="82" cy="72" r="2" fill="#38BDF8" />
            <circle cx="118" cy="72" r="2" fill="#F43F5E" />

            {/* Eyes */}
            <circle cx="87" cy="89" r="4.2" fill="#292524" />
            <circle cx="113" cy="89" r="4.2" fill="#292524" />
            <circle cx="89" cy="87.5" r="1.2" fill="#FFFFFF" />
            <circle cx="115" cy="87.5" r="1.2" fill="#FFFFFF" />

            {/* Eyebrows */}
            {isAngry ? (
              <>
                <line x1="80" y1="82" x2="93" y2="85" stroke="#292524" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="107" y1="85" x2="120" y2="82" stroke="#292524" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : isWorried ? (
              <>
                <path d="M80 84 Q88 80 93 84" stroke="#292524" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M107 84 Q112 80 120 84" stroke="#292524" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="80" y1="82" x2="93" y2="82" stroke="#292524" strokeWidth="2" strokeLinecap="round" />
                <line x1="107" y1="82" x2="120" y2="82" stroke="#292524" strokeWidth="2" strokeLinecap="round" />
              </>
            )}

            {/* Mouth */}
            {isAngry ? (
              <line x1="93" y1="109" x2="107" y2="109" stroke="#881337" strokeWidth="2.2" strokeLinecap="round" />
            ) : isWorried ? (
              <path d="M94 110 Q100 106 106 110" stroke="#881337" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <line x1="94" y1="109" x2="106" y2="109" stroke="#881337" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        );
      }

      // -----------------------------------------------------------------------
      // 7. 노바 시민: Hooded Jacket, Neural Jack, Vulnerable Resident
      // -----------------------------------------------------------------------
      case 'citizen': {
        const isWorried = emotion === 'worried' || emotion === 'neutral';
        const isAngry = emotion === 'angry';

        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className="w-full h-full" fill="none">
            <circle cx="100" cy="100" r="92" fill="#0A1017" />
            <circle cx="100" cy="95" r="70" fill="#0284C7" fillOpacity="0.15" />

            {/* Oversized Hooded Jacket */}
            <path
              d="M36 185 C40 140 68 130 100 130 C132 130 160 140 164 185 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Hood Silhouette around Head */}
            <path
              d="M66 124 C56 68 144 68 134 124 C120 132 80 132 66 124 Z"
              fill="#0F172A"
              stroke="#38BDF8"
              strokeWidth="1"
            />

            {/* Face inside Hood */}
            <circle cx="100" cy="94" r="24" fill="#E8CBB8" />

            {/* Patched Cybernetic Neural Port on Right Temple */}
            <rect x="74" y="86" width="5" height="10" rx="1.5" fill="#334155" stroke="#38BDF8" strokeWidth="0.8" />
            <circle cx="76.5" cy="91" r="1.5" fill={isAngry ? '#EF4444' : isWorried ? '#F59E0B' : '#38BDF8'} />

            {/* Eyes */}
            <circle cx="91" cy="94" r="3.8" fill="#1E293B" />
            <circle cx="109" cy="94" r="3.8" fill="#1E293B" />

            {/* Eyebrows */}
            {isAngry ? (
              <>
                <line x1="86" y1="88" x2="96" y2="91" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="104" y1="91" x2="114" y2="88" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M85 89 Q91 86 96 89" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                <path d="M104 89 Q109 86 115 89" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
              </>
            )}

            {/* Mouth */}
            <path
              d={isAngry ? 'M94 108 L106 108' : 'M94 109 Q100 106 106 109'}
              stroke="#854D0E"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        );
      }

      // -----------------------------------------------------------------------
      // 8. 최고평의회: Monolithic Crest, Authority
      // -----------------------------------------------------------------------
      case 'council':
      default: {
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className="w-full h-full" fill="none">
            <circle cx="100" cy="100" r="92" fill="#080C14" />
            <circle cx="100" cy="95" r="72" fill="#E2E8F0" fillOpacity="0.08" />

            {/* Monolithic Robes */}
            <polygon points="40,185 64,120 100,105 136,120 160,185" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
            <polygon points="85,120 100,105 115,120 108,185 92,185" fill="#E2E8F0" fillOpacity="0.2" />

            {/* Monolithic Floating Golden Emblem */}
            <circle cx="100" cy="74" r="32" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="6 3" />
            <polygon points="100,48 108,66 128,74 108,82 100,100 92,82 72,74 92,66" fill="#F8FAFC" />
            <circle cx="100" cy="74" r="6" fill="#38BDF8" />

            {/* Council Readout Tag */}
            <text x="100" y="162" textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="monospace" letterSpacing="2">
              COUNCIL//SUPREME
            </text>
          </svg>
        );
      }
    }
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-800/80 bg-[#080D17] shadow-inner select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {renderSVG()}
    </div>
  );
};
