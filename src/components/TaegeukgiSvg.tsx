import React from 'react';
import { PieceId, BarType } from '../types';

/**
 * Official Specification of the National Flag of the Republic of Korea
 * (대한민국국기법 시행령 제7조 및 별표1 규격)
 */

export const FLAG_DIMENSIONS = {
  width: 900,
  height: 600,
  centerX: 450,
  centerY: 300,
  taegeukRadius: 150,
  diagonalAngle: 33.6900675, // degrees
  trigramTiltAngle: 56.3099325, // 90 - diagonalAngle (대한민국국기법: 효의 길이는 대각선과 직각)
  trigramWidth: 150,
  trigramHeight: 100,
  barThickness: 25,
  gap: 12.5,
  brokenBarWidth: 68.75, // (150 - 12.5) / 2
};

export const OFFICIAL_SLOTS: Record<
  PieceId,
  {
    id: PieceId;
    name: string;
    cx: number;
    cy: number;
    rotation: number;
    meaning: string;
    hint: string;
  }
> = {
  'taegeuk-red': {
    id: 'taegeuk-red',
    name: '빨간색 태극 (양)',
    cx: 450,
    cy: 230,
    rotation: 0,
    meaning: '하늘, 존귀, 밝음',
    hint: '가운데 위쪽 (빨강 양)',
  },
  'taegeuk-blue': {
    id: 'taegeuk-blue',
    name: '파란색 태극 (음)',
    cx: 450,
    cy: 370,
    rotation: 0,
    meaning: '땅, 희망, 조화',
    hint: '가운데 아래쪽 (파랑 음)',
  },
  geon: {
    id: 'geon',
    name: '건괘 (하늘 ☰)',
    cx: 221.19,
    cy: 147.46,
    // 대한민국국기법 시행령: 괘의 효는 대각선과 직각(-56.31도)
    rotation: -FLAG_DIMENSIONS.trigramTiltAngle,
    meaning: '하늘, 봄, 정의 (3줄)',
    hint: '왼쪽 위 (하늘 ☰)',
  },
  gon: {
    id: 'gon',
    name: '곤괘 (땅 ☷)',
    cx: 678.81,
    cy: 452.54,
    // 대한민국국기법 시행령: 괘의 효는 대각선과 직각(-56.31도)
    rotation: -FLAG_DIMENSIONS.trigramTiltAngle,
    meaning: '땅, 여름, 풍요 (6막대)',
    hint: '오른쪽 아래 (땅 ☷)',
  },
  gam: {
    id: 'gam',
    name: '감괘 (물 ☵)',
    cx: 678.81,
    cy: 147.46,
    // 대한민국국기법 시행령: 괘의 효는 대각선과 직각(+56.31도)
    rotation: FLAG_DIMENSIONS.trigramTiltAngle,
    meaning: '물, 겨울, 지혜',
    hint: '오른쪽 위 (물 ☵)',
  },
  ri: {
    id: 'ri',
    name: '리괘 (불 ☲)',
    cx: 221.19,
    cy: 452.54,
    // 대한민국국기법 시행령: 괘의 효는 대각선과 직각(+56.31도)
    rotation: FLAG_DIMENSIONS.trigramTiltAngle,
    meaning: '불, 가을, 광명',
    hint: '왼쪽 아래 (불 ☲)',
  },
};

export const TAEGEUK_RED_PATH =
  'M -150 0 A 150 150 0 0 1 150 0 A 75 75 0 0 0 0 0 A 75 75 0 0 1 -150 0 Z';

export const TAEGEUK_BLUE_PATH =
  'M 150 0 A 150 150 0 0 1 -150 0 A 75 75 0 0 0 0 0 A 75 75 0 0 1 150 0 Z';

/**
 * Single Bar SVG element (Solid or Broken)
 */
export const SingleBarSvg: React.FC<{
  type: BarType;
  y?: number;
  isGhost?: boolean;
  highlight?: boolean;
}> = ({ type, y = 0, isGhost = false, highlight = false }) => {
  const fillColor = isGhost ? (highlight ? 'rgba(254, 240, 138, 0.65)' : 'none') : '#111827';
  const strokeColor = highlight
    ? '#EAB308'
    : isGhost
    ? '#94A3B8'
    : '#0F172A';
  const strokeW = highlight ? 3 : isGhost ? 1.8 : 0.5;
  const strokeDash = highlight ? '6 4' : isGhost ? '5 3' : 'none';
  const opacity = isGhost ? (highlight ? 1 : 0.45) : 1;

  if (type === 'solid') {
    return (
      <rect
        x="-75"
        y={y}
        width="150"
        height="25"
        rx="2.5"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeDasharray={strokeDash}
        opacity={opacity}
        className={highlight ? 'animate-pulse' : ''}
      />
    );
  }

  return (
    <g opacity={opacity} className={highlight ? 'animate-pulse' : ''}>
      <rect
        x="-75"
        y={y}
        width="68.75"
        height="25"
        rx="2.5"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeDasharray={strokeDash}
      />
      <rect
        x="6.25"
        y={y}
        width="68.75"
        height="25"
        rx="2.5"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeDasharray={strokeDash}
      />
    </g>
  );
};

interface TrigramBarsProps {
  type: 'geon' | 'gon' | 'gam' | 'ri';
  isGhost?: boolean;
  minimalSlot?: boolean;
  barsPlaced?: [boolean, boolean, boolean];
  highlightIndex?: number | null;
  highlightAll?: boolean;
  onBarClick?: (index: 0 | 1 | 2) => void;
}

export const TrigramSvgGroup: React.FC<TrigramBarsProps> = ({
  type,
  isGhost = false,
  minimalSlot = false,
  barsPlaced,
  highlightIndex = null,
  highlightAll = false,
  onBarClick,
}) => {
  const isSolid: [boolean, boolean, boolean] =
    type === 'geon'
      ? [true, true, true]
      : type === 'gon'
      ? [false, false, false]
      : type === 'gam'
      ? [false, true, false]
      : [true, false, true];

  const yPositions = [-50, -12.5, 25];

  // Stage 2 (Whole piece unplaced): Show minimal slot frame without revealing bar shapes unless highlighted
  if (minimalSlot && !barsPlaced && isGhost && !highlightAll) {
    return (
      <g>
        <rect
          x="-75"
          y="-50"
          width="150"
          height="100"
          rx="6"
          fill="rgba(248, 250, 252, 0.4)"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        {/* Subtle corner ticks */}
        <path
          d="M -71 -40 L -71 -46 L -65 -46 M 65 -46 L 71 -46 L 71 -40 M -71 40 L -71 46 L -65 46 M 65 46 L 71 46 L 71 40"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
      </g>
    );
  }

  return (
    <g>
      {/* Background minimal boundary frame for Stage 3 */}
      {minimalSlot && barsPlaced && (
        <rect
          x="-75"
          y="-50"
          width="150"
          height="100"
          rx="6"
          fill="rgba(248, 250, 252, 0.3)"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
      )}

      {isSolid.map((solid, idx) => {
        const barType: BarType = solid ? 'solid' : 'broken';
        const placed = barsPlaced ? barsPlaced[idx] : !isGhost;
        const isHighlight = highlightAll || highlightIndex === idx;

        return (
          <g
            key={`bar-${idx}`}
            onClick={(e) => {
              if (onBarClick) {
                e.stopPropagation();
                onBarClick(idx as 0 | 1 | 2);
              }
            }}
            className={onBarClick && !placed ? 'cursor-pointer hover:opacity-80' : ''}
          >
            {/* Invisible wider hit-area for touch */}
            {onBarClick && (
              <rect
                x="-80"
                y={yPositions[idx] - 6}
                width="160"
                height="37"
                fill="transparent"
              />
            )}

            {/* In Stage 3 with minimalSlot: If not placed, show neutral track lane without revealing solid/broken */}
            {minimalSlot && barsPlaced && !placed && !isHighlight ? (
              <rect
                x="-75"
                y={yPositions[idx]}
                width="150"
                height="25"
                rx="3"
                fill="rgba(241, 245, 249, 0.5)"
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ) : (
              <SingleBarSvg
                type={barType}
                y={yPositions[idx]}
                isGhost={!placed}
                highlight={isHighlight}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};

/**
 * Standalone graphic for the Long Bar (양효) or Short Bar (음효) in trays
 */
export const BarGraphic: React.FC<{
  type: BarType;
  width?: number;
  className?: string;
  isGhost?: boolean;
}> = ({ type, width = 120, className = '', isGhost = false }) => {
  const height = width * (32 / 160);
  return (
    <svg
      width={width}
      height={height}
      viewBox="-80 -16 160 32"
      className={className}
    >
      <SingleBarSvg type={type} y={-12.5} isGhost={isGhost} />
    </svg>
  );
};

/**
 * Self-contained Piece Graphic for trays, cards, and feedback modals
 */
export const PieceGraphic: React.FC<{
  id: PieceId;
  size?: number;
  className?: string;
  isGhost?: boolean;
}> = ({ id, size = 80, className = '', isGhost = false }) => {
  if (id === 'taegeuk-red') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="-160 -160 320 320"
        className={className}
        aria-label="빨간색 태극"
      >
        <path
          d={TAEGEUK_RED_PATH}
          fill={isGhost ? 'none' : '#CD2E3A'}
          stroke={isGhost ? '#EF4444' : '#B91C1C'}
          strokeWidth={isGhost ? 4 : 1.5}
          strokeDasharray={isGhost ? '8 6' : 'none'}
          opacity={isGhost ? 0.5 : 1}
        />
      </svg>
    );
  }

  if (id === 'taegeuk-blue') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="-160 -160 320 320"
        className={className}
        aria-label="파란색 태극"
      >
        <path
          d={TAEGEUK_BLUE_PATH}
          fill={isGhost ? 'none' : '#0047A0'}
          stroke={isGhost ? '#3B82F6' : '#1D4ED8'}
          strokeWidth={isGhost ? 4 : 1.5}
          strokeDasharray={isGhost ? '8 6' : 'none'}
          opacity={isGhost ? 0.5 : 1}
        />
      </svg>
    );
  }

  // 4 Trigrams (건, 곤, 감, 리)
  return (
    <svg
      width={size}
      height={size * (100 / 150)}
      viewBox="-80 -55 160 110"
      className={className}
      aria-label={`${id} 괘`}
    >
      <TrigramSvgGroup type={id} isGhost={isGhost} />
    </svg>
  );
};
