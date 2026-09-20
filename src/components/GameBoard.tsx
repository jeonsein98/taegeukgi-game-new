import React from 'react';
import { PieceId, GameMode, BarSlotKey, TrigramType, BarType } from '../types';
import {
  FLAG_DIMENSIONS,
  OFFICIAL_SLOTS,
  TAEGEUK_RED_PATH,
  TAEGEUK_BLUE_PATH,
  TrigramSvgGroup,
} from './TaegeukgiSvg';
import { BAR_SLOTS } from '../data/bars';

interface GameBoardProps {
  mode: GameMode;
  placedPieces: Record<PieceId, boolean>;
  placedBars?: Record<BarSlotKey, boolean>;
  selectedPieceId: PieceId | null;
  selectedBarType?: BarType | null;
  showHints: boolean;
  onSlotClick: (slotId: PieceId) => void;
  onBarSlotClick?: (barKey: BarSlotKey) => void;
  registerSlotRef: (slotId: PieceId, el: HTMLDivElement | null) => void;
  boardContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  mode,
  placedPieces,
  placedBars = {} as Record<BarSlotKey, boolean>,
  selectedPieceId,
  selectedBarType = null,
  showHints,
  onSlotClick,
  onBarSlotClick,
  registerSlotRef,
  boardContainerRef,
}) => {
  const isLevel1 = mode === 'level1' || mode === 'click';
  const isLevel2 = mode === 'level2' || mode === 'drag';
  const isLevel3 = mode === 'level3';
  const isMinimal = isLevel2 || isLevel3;

  // Check if a trigram is completely assembled in Level 3
  const isTrigramComplete = (trigram: TrigramType) => {
    return (
      Boolean(placedBars[`${trigram}-0`]) &&
      Boolean(placedBars[`${trigram}-1`]) &&
      Boolean(placedBars[`${trigram}-2`])
    );
  };

  const isClickTarget = (slotId: PieceId) => {
    return (
      (mode === 'level1' || mode === 'click') &&
      selectedPieceId !== null &&
      !placedPieces[slotId]
    );
  };

  const isMatchedTarget = (slotId: PieceId) => {
    return isClickTarget(slotId) && selectedPieceId === slotId;
  };

  return (
    <div className="relative w-auto h-full max-h-[44dvh] sm:max-h-[48dvh] md:max-h-[52dvh] aspect-[3/2] max-w-full mx-auto select-none flex items-center justify-center">
      {/* Taegeukgi Flag Frame (Official 3:2 Ratio) */}
      <div
        ref={boardContainerRef}
        id="taegeukgi-flag-board"
        className="relative w-full h-full aspect-[3/2] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-slate-200/90 overflow-hidden"
        style={{
          boxShadow:
            '0 25px 45px -12px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Subtle fabric weave & light border */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/40 to-slate-100/30 pointer-events-none" />

        {/* Flag Pole / Halyard accent on the left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 opacity-90 z-20" />

        {/* Diagonal Guideline (only faint visual aid in Level 1 when hints are ON) */}
        {showHints && isLevel1 && (
          <svg
            viewBox="0 0 900 600"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          >
            <line
              x1="0"
              y1="0"
              x2="900"
              y2="600"
              stroke="#64748B"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            <line
              x1="900"
              y1="0"
              x2="0"
              y2="600"
              stroke="#64748B"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
          </svg>
        )}

        {/* Master SVG Canvas with Official Legal Proportions (900 x 600) */}
        <svg
          viewBox="0 0 900 600"
          className="w-full h-full relative z-10 overflow-visible"
        >
          <defs>
            <filter
              id="taegeukGlowRed"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#991B1B"
                floodOpacity="0.25"
              />
            </filter>
            <filter
              id="taegeukGlowBlue"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#1E3A8A"
                floodOpacity="0.25"
              />
            </filter>
            <filter id="trigramShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#000000"
                floodOpacity="0.2"
              />
            </filter>
          </defs>

          {/* ======================================================== */}
          {/* CENTER: TAEGEUK CIRCLE (Diameter 300 = Height 600 / 2)   */}
          {/* ======================================================== */}
          <g id="center-taegeuk-group">
            {/* Taegeuk Circle Background Boundary Guide (Clean minimal circular slot) */}
            <circle
              cx="450"
              cy="300"
              r="150"
              fill={showHints && isLevel1 ? '#F8FAFC' : 'none'}
              stroke="#CBD5E1"
              strokeWidth={showHints && isLevel1 ? 2 : 1.5}
              strokeDasharray="8 6"
              opacity={0.6}
            />

            {/* Red Upper Taegeuk (양) */}
            <g transform="translate(450, 300)">
              {placedPieces['taegeuk-red'] ? (
                <path
                  d={TAEGEUK_RED_PATH}
                  fill="#CD2E3A"
                  filter="url(#taegeukGlowRed)"
                  className="transition-all duration-300"
                />
              ) : isMatchedTarget('taegeuk-red') ? (
                /* Targeted matching shape when selected in Level 1 */
                <path
                  d={TAEGEUK_RED_PATH}
                  fill="rgba(239, 68, 68, 0.35)"
                  stroke="#DC2626"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                  className="animate-pulse pointer-events-none"
                />
              ) : !isMinimal || showHints ? (
                <path
                  d={TAEGEUK_RED_PATH}
                  fill={showHints ? 'rgba(254, 226, 226, 0.65)' : 'none'}
                  stroke="#F87171"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  opacity={showHints ? 0.85 : 0.25}
                />
              ) : null}
            </g>

            {/* Blue Lower Taegeuk (음) */}
            <g transform="translate(450, 300)">
              {placedPieces['taegeuk-blue'] ? (
                <path
                  d={TAEGEUK_BLUE_PATH}
                  fill="#0047A0"
                  filter="url(#taegeukGlowBlue)"
                  className="transition-all duration-300"
                />
              ) : isMatchedTarget('taegeuk-blue') ? (
                /* Targeted matching shape when selected in Level 1 */
                <path
                  d={TAEGEUK_BLUE_PATH}
                  fill="rgba(37, 99, 235, 0.35)"
                  stroke="#2563EB"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                  className="animate-pulse pointer-events-none"
                />
              ) : !isMinimal || showHints ? (
                <path
                  d={TAEGEUK_BLUE_PATH}
                  fill={showHints ? 'rgba(219, 234, 254, 0.65)' : 'none'}
                  stroke="#60A5FA"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  opacity={showHints ? 0.85 : 0.25}
                />
              ) : null}
            </g>
          </g>

          {/* ======================================================== */}
          {/* 4 TRIGRAMS: In Level 1 & 2 whole pieces, in Level 3 bars */}
          {/* ======================================================== */}

          {/* 1. 건괘 (좌상단) */}
          <g
            transform={`translate(${OFFICIAL_SLOTS.geon.cx}, ${OFFICIAL_SLOTS.geon.cy}) rotate(${OFFICIAL_SLOTS.geon.rotation})`}
            filter={
              !isLevel3 && placedPieces['geon']
                ? 'url(#trigramShadow)'
                : isLevel3 && isTrigramComplete('geon')
                ? 'url(#trigramShadow)'
                : 'none'
            }
          >
            <TrigramSvgGroup
              type="geon"
              isGhost={!isLevel3 ? !placedPieces['geon'] : false}
              minimalSlot={isMinimal}
              highlightAll={!isLevel3 && isMatchedTarget('geon') && !placedPieces['geon']}
              barsPlaced={
                isLevel3
                  ? [
                      Boolean(placedBars['geon-0']),
                      Boolean(placedBars['geon-1']),
                      Boolean(placedBars['geon-2']),
                    ]
                  : undefined
              }
              onBarClick={
                isLevel3 && onBarSlotClick
                  ? (idx) => onBarSlotClick(`geon-${idx}`)
                  : undefined
              }
            />
          </g>

          {/* 2. 곤괘 (우하단) */}
          <g
            transform={`translate(${OFFICIAL_SLOTS.gon.cx}, ${OFFICIAL_SLOTS.gon.cy}) rotate(${OFFICIAL_SLOTS.gon.rotation})`}
            filter={
              !isLevel3 && placedPieces['gon']
                ? 'url(#trigramShadow)'
                : isLevel3 && isTrigramComplete('gon')
                ? 'url(#trigramShadow)'
                : 'none'
            }
          >
            <TrigramSvgGroup
              type="gon"
              isGhost={!isLevel3 ? !placedPieces['gon'] : false}
              minimalSlot={isMinimal}
              highlightAll={!isLevel3 && isMatchedTarget('gon') && !placedPieces['gon']}
              barsPlaced={
                isLevel3
                  ? [
                      Boolean(placedBars['gon-0']),
                      Boolean(placedBars['gon-1']),
                      Boolean(placedBars['gon-2']),
                    ]
                  : undefined
              }
              onBarClick={
                isLevel3 && onBarSlotClick
                  ? (idx) => onBarSlotClick(`gon-${idx}`)
                  : undefined
              }
            />
          </g>

          {/* 3. 감괘 (우상단) */}
          <g
            transform={`translate(${OFFICIAL_SLOTS.gam.cx}, ${OFFICIAL_SLOTS.gam.cy}) rotate(${OFFICIAL_SLOTS.gam.rotation})`}
            filter={
              !isLevel3 && placedPieces['gam']
                ? 'url(#trigramShadow)'
                : isLevel3 && isTrigramComplete('gam')
                ? 'url(#trigramShadow)'
                : 'none'
            }
          >
            <TrigramSvgGroup
              type="gam"
              isGhost={!isLevel3 ? !placedPieces['gam'] : false}
              minimalSlot={isMinimal}
              highlightAll={!isLevel3 && isMatchedTarget('gam') && !placedPieces['gam']}
              barsPlaced={
                isLevel3
                  ? [
                      Boolean(placedBars['gam-0']),
                      Boolean(placedBars['gam-1']),
                      Boolean(placedBars['gam-2']),
                    ]
                  : undefined
              }
              onBarClick={
                isLevel3 && onBarSlotClick
                  ? (idx) => onBarSlotClick(`gam-${idx}`)
                  : undefined
              }
            />
          </g>

          {/* 4. 리괘 (좌하단) */}
          <g
            transform={`translate(${OFFICIAL_SLOTS.ri.cx}, ${OFFICIAL_SLOTS.ri.cy}) rotate(${OFFICIAL_SLOTS.ri.rotation})`}
            filter={
              !isLevel3 && placedPieces['ri']
                ? 'url(#trigramShadow)'
                : isLevel3 && isTrigramComplete('ri')
                ? 'url(#trigramShadow)'
                : 'none'
            }
          >
            <TrigramSvgGroup
              type="ri"
              isGhost={!isLevel3 ? !placedPieces['ri'] : false}
              minimalSlot={isMinimal}
              highlightAll={!isLevel3 && isMatchedTarget('ri') && !placedPieces['ri']}
              barsPlaced={
                isLevel3
                  ? [
                      Boolean(placedBars['ri-0']),
                      Boolean(placedBars['ri-1']),
                      Boolean(placedBars['ri-2']),
                    ]
                  : undefined
              }
              onBarClick={
                isLevel3 && onBarSlotClick
                  ? (idx) => onBarSlotClick(`ri-${idx}`)
                  : undefined
              }
            />
          </g>
        </svg>

        {/* ======================================================== */}
        {/* INTERACTIVE TOUCH / CLICK SLOT OVERLAYS                   */}
        {/* ======================================================== */}

        {/* Level 1 & 2: Whole Trigrams Touch Zones */}
        {!isLevel3 && (
          <>
            {/* Slot 1: 건괘 (Top-Left) */}
            <div
              ref={(el) => registerSlotRef('geon', el)}
              id="slot-geon"
              onClick={() => onSlotClick('geon')}
              style={{
                left: `${(OFFICIAL_SLOTS.geon.cx / 900) * 100}%`,
                top: `${(OFFICIAL_SLOTS.geon.cy / 600) * 100}%`,
                width: '19%',
                height: '19%',
                transform: `translate(-50%, -50%) rotate(${OFFICIAL_SLOTS.geon.rotation}deg)${
                  isMatchedTarget('geon') ? ' scale(1.06)' : ''
                }`,
              }}
              className={`absolute rounded-xl flex flex-col items-center justify-center transition-all z-20 cursor-pointer ${
                placedPieces['geon']
                  ? 'pointer-events-none'
                  : isMatchedTarget('geon')
                  ? 'bg-amber-300/10 cursor-pointer'
                  : isClickTarget('geon')
                  ? 'hover:bg-slate-200/20'
                  : 'hover:bg-amber-50/10'
              }`}
              title="건괘 (하늘 ☰)"
            >
              {showHints && isLevel1 && !placedPieces['geon'] && (
                <span className="text-[11px] sm:text-xs font-black text-slate-700 bg-white/95 px-2 py-0.5 rounded-full shadow-xs mt-14 pointer-events-none border border-slate-200">
                  건괘 (하늘 ☰)
                </span>
              )}
            </div>

            {/* Slot 2: 곤괘 (Bottom-Right) */}
            <div
              ref={(el) => registerSlotRef('gon', el)}
              id="slot-gon"
              onClick={() => onSlotClick('gon')}
              style={{
                left: `${(OFFICIAL_SLOTS.gon.cx / 900) * 100}%`,
                top: `${(OFFICIAL_SLOTS.gon.cy / 600) * 100}%`,
                width: '19%',
                height: '19%',
                transform: `translate(-50%, -50%) rotate(${OFFICIAL_SLOTS.gon.rotation}deg)`,
              }}
              className={`absolute rounded-xl flex flex-col items-center justify-center transition-all z-20 cursor-pointer ${
                placedPieces['gon']
                  ? 'pointer-events-none'
                  : isMatchedTarget('gon')
                  ? 'bg-amber-300/10 cursor-pointer'
                  : isClickTarget('gon')
                  ? 'hover:bg-slate-200/20'
                  : 'hover:bg-amber-50/10'
              }`}
              title="곤괘 (땅 ☷)"
            >
              {showHints && isLevel1 && !placedPieces['gon'] && (
                <span className="text-[11px] sm:text-xs font-black text-slate-700 bg-white/95 px-2 py-0.5 rounded-full shadow-xs mt-14 pointer-events-none border border-slate-200">
                  곤괘 (땅 ☷)
                </span>
              )}
            </div>

            {/* Slot 3: 감괘 (Top-Right) */}
            <div
              ref={(el) => registerSlotRef('gam', el)}
              id="slot-gam"
              onClick={() => onSlotClick('gam')}
              style={{
                left: `${(OFFICIAL_SLOTS.gam.cx / 900) * 100}%`,
                top: `${(OFFICIAL_SLOTS.gam.cy / 600) * 100}%`,
                width: '19%',
                height: '19%',
                transform: `translate(-50%, -50%) rotate(${OFFICIAL_SLOTS.gam.rotation}deg)`,
              }}
              className={`absolute rounded-xl flex flex-col items-center justify-center transition-all z-20 cursor-pointer ${
                placedPieces['gam']
                  ? 'pointer-events-none'
                  : isMatchedTarget('gam')
                  ? 'bg-amber-300/10 cursor-pointer'
                  : isClickTarget('gam')
                  ? 'hover:bg-slate-200/20'
                  : 'hover:bg-amber-50/10'
              }`}
              title="감괘 (물 ☵)"
            >
              {showHints && isLevel1 && !placedPieces['gam'] && (
                <span className="text-[11px] sm:text-xs font-black text-slate-700 bg-white/95 px-2 py-0.5 rounded-full shadow-xs mt-14 pointer-events-none border border-slate-200">
                  감괘 (물 ☵)
                </span>
              )}
            </div>

            {/* Slot 4: 리괘 (Bottom-Left) */}
            <div
              ref={(el) => registerSlotRef('ri', el)}
              id="slot-ri"
              onClick={() => onSlotClick('ri')}
              style={{
                left: `${(OFFICIAL_SLOTS.ri.cx / 900) * 100}%`,
                top: `${(OFFICIAL_SLOTS.ri.cy / 600) * 100}%`,
                width: '19%',
                height: '19%',
                transform: `translate(-50%, -50%) rotate(${OFFICIAL_SLOTS.ri.rotation}deg)`,
              }}
              className={`absolute rounded-xl flex flex-col items-center justify-center transition-all z-20 cursor-pointer ${
                placedPieces['ri']
                  ? 'pointer-events-none'
                  : isMatchedTarget('ri')
                  ? 'bg-amber-300/10 cursor-pointer'
                  : isClickTarget('ri')
                  ? 'hover:bg-slate-200/20'
                  : 'hover:bg-amber-50/10'
              }`}
              title="리괘 (불 ☲)"
            >
              {showHints && isLevel1 && !placedPieces['ri'] && (
                <span className="text-[11px] sm:text-xs font-black text-slate-700 bg-white/95 px-2 py-0.5 rounded-full shadow-xs mt-14 pointer-events-none border border-slate-200">
                  리괘 (불 ☲)
                </span>
              )}
            </div>
          </>
        )}

        {/* Level 3: Individual 12 Bar Touch Overlays */}
        {isLevel3 && onBarSlotClick && (
          <>
            {(Object.keys(BAR_SLOTS) as BarSlotKey[]).map((key) => {
              const slot = BAR_SLOTS[key];
              const isPlaced = placedBars[key];
              const isTargetType = selectedBarType === slot.requiredType;
              const barRotation =
                slot.trigram === 'geon' || slot.trigram === 'gon'
                  ? OFFICIAL_SLOTS.geon.rotation
                  : OFFICIAL_SLOTS.gam.rotation;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onBarSlotClick(key)}
                  style={{
                    left: `${(slot.cx / 900) * 100}%`,
                    top: `${(slot.cy / 600) * 100}%`,
                    width: '18%',
                    height: '6%',
                    transform: `translate(-50%, -50%) rotate(${barRotation}deg)${
                      isTargetType ? ' scale(1.06)' : ''
                    }`,
                  }}
                  className={`absolute rounded-lg transition-all z-20 cursor-pointer flex items-center justify-center ${
                    isPlaced
                      ? 'pointer-events-none'
                      : isTargetType
                      ? 'bg-amber-400/30 ring-2 ring-amber-400 border border-amber-500 animate-pulse'
                      : 'hover:bg-purple-100/40'
                  }`}
                  title={slot.label}
                />
              );
            })}

            {/* Trigram completion celebratory labels */}
            {showHints && (
              <>
                <div className="absolute left-[24%] top-[25%] -translate-x-1/2 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-xs bg-white/95 text-slate-700 pointer-events-none">
                  건(하늘 ☰) {isTrigramComplete('geon') && '✨완성!'}
                </div>
                <div className="absolute left-[75%] top-[75%] -translate-x-1/2 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-xs bg-white/95 text-slate-700 pointer-events-none">
                  곤(땅 ☷) {isTrigramComplete('gon') && '✨완성!'}
                </div>
                <div className="absolute left-[75%] top-[25%] -translate-x-1/2 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-xs bg-white/95 text-slate-700 pointer-events-none">
                  감(물 ☵) {isTrigramComplete('gam') && '✨완성!'}
                </div>
                <div className="absolute left-[24%] top-[75%] -translate-x-1/2 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-xs bg-white/95 text-slate-700 pointer-events-none">
                  리(불 ☲) {isTrigramComplete('ri') && '✨완성!'}
                </div>
              </>
            )}
          </>
        )}

        {/* Slot 5: 빨간색 태극 (Center-Top) */}
        <div
          ref={(el) => registerSlotRef('taegeuk-red', el)}
          id="slot-taegeuk-red"
          onClick={() => onSlotClick('taegeuk-red')}
          style={{
            left: `${(OFFICIAL_SLOTS['taegeuk-red'].cx / 900) * 100}%`,
            top: `${(OFFICIAL_SLOTS['taegeuk-red'].cy / 600) * 100}%`,
            width: '32%',
            height: '26%',
          }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center transition-all z-20 cursor-pointer ${
            placedPieces['taegeuk-red']
              ? 'pointer-events-none'
              : isMatchedTarget('taegeuk-red')
              ? 'bg-red-400/10 cursor-pointer'
              : isClickTarget('taegeuk-red')
              ? 'hover:bg-red-50/20'
              : 'hover:bg-red-50/10'
          }`}
          title="빨간색 태극 (양)"
        >
          {showHints && isLevel1 && !placedPieces['taegeuk-red'] && (
            <span className="text-[11px] sm:text-xs font-black text-red-600 bg-white/95 px-2.5 py-0.5 rounded-full shadow-xs border border-red-200 pointer-events-none">
              빨강 태극 (양)
            </span>
          )}
        </div>

        {/* Slot 6: 파란색 태극 (Center-Bottom) */}
        <div
          ref={(el) => registerSlotRef('taegeuk-blue', el)}
          id="slot-taegeuk-blue"
          onClick={() => onSlotClick('taegeuk-blue')}
          style={{
            left: `${(OFFICIAL_SLOTS['taegeuk-blue'].cx / 900) * 100}%`,
            top: `${(OFFICIAL_SLOTS['taegeuk-blue'].cy / 600) * 100}%`,
            width: '32%',
            height: '26%',
          }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center transition-all z-20 cursor-pointer ${
            placedPieces['taegeuk-blue']
              ? 'pointer-events-none'
              : isMatchedTarget('taegeuk-blue')
              ? 'bg-blue-400/10 cursor-pointer'
              : isClickTarget('taegeuk-blue')
              ? 'hover:bg-blue-50/20'
              : 'hover:bg-blue-50/10'
          }`}
          title="파란색 태극 (음)"
        >
          {showHints && isLevel1 && !placedPieces['taegeuk-blue'] && (
            <span className="text-[11px] sm:text-xs font-black text-blue-600 bg-white/95 px-2.5 py-0.5 rounded-full shadow-xs border border-blue-200 pointer-events-none">
              파랑 태극 (음)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
