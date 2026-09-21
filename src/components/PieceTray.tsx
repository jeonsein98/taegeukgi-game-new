import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PieceId, GameMode, BarType } from '../types';
import { TAEGEUKGI_PIECES } from '../data/pieces';
import { PieceGraphic, BarGraphic, OFFICIAL_SLOTS } from './TaegeukgiSvg';
import { MousePointerClick, Hand, Check, Compass } from 'lucide-react';

interface PieceTrayProps {
  mode: GameMode;
  unplacedPieces: PieceId[];
  selectedPieceId: PieceId | null;
  onSelectPiece: (pieceId: PieceId) => void;
  onDragEndPiece: (pieceId: PieceId, clientX: number, clientY: number) => void;
  // Level 3 specific props
  solidBarsRemaining?: number;
  brokenBarsRemaining?: number;
  selectedBarType?: BarType | null;
  onSelectBarType?: (type: BarType | null) => void;
  onDragEndBar?: (type: BarType, clientX: number, clientY: number) => void;
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  mode,
  unplacedPieces,
  selectedPieceId,
  onSelectPiece,
  onDragEndPiece,
  solidBarsRemaining = 6,
  brokenBarsRemaining = 6,
  selectedBarType = null,
  onSelectBarType,
  onDragEndBar,
}) => {
  const isLevel3 = mode === 'level3';

  // Dynamic trigram tilt angle state during drag
  // Korean flag official trigram angles:
  // Geon (Top-Left) & Gon (Bottom-Right): -56.31°
  // Gam (Top-Right) & Ri (Bottom-Left): +56.31°
  const [dragTilt, setDragTilt] = useState<{ solid: number; broken: number }>({
    solid: -56.31,
    broken: -56.31,
  });
  const [isDraggingBar, setIsDraggingBar] = useState<{ solid: boolean; broken: boolean }>({
    solid: false,
    broken: false,
  });
  const [draggingPieceId, setDraggingPieceId] = useState<PieceId | null>(null);

  const calculateTilt = (pointX: number, pointY: number) => {
    const boardEl = document.getElementById('taegeukgi-flag-board');
    if (!boardEl) return -56.31;
    const rect = boardEl.getBoundingClientRect();

    // 4 Trigram center coordinates in viewport pixels
    // Geon (Top-Left, -56.31°)
    const geonX = rect.left + rect.width * (200 / 900);
    const geonY = rect.top + rect.height * (133.333 / 600);

    // Gon (Bottom-Right, -56.31°)
    const gonX = rect.left + rect.width * (700 / 900);
    const gonY = rect.top + rect.height * (466.667 / 600);

    // Gam (Top-Right, +56.31°)
    const gamX = rect.left + rect.width * (700 / 900);
    const gamY = rect.top + rect.height * (133.333 / 600);

    // Ri (Bottom-Left, +56.31°)
    const riX = rect.left + rect.width * (200 / 900);
    const riY = rect.top + rect.height * (466.667 / 600);

    const distGeon = Math.hypot(pointX - geonX, pointY - geonY);
    const distGon = Math.hypot(pointX - gonX, pointY - gonY);
    const distGam = Math.hypot(pointX - gamX, pointY - gamY);
    const distRi = Math.hypot(pointX - riX, pointY - riY);

    const minGeonGon = Math.min(distGeon, distGon);
    const minGamRi = Math.min(distGam, distRi);

    // If approaching Gam or Ri -> tilt to +56.31°
    // If approaching Geon or Gon -> tilt to -56.31°
    return minGamRi < minGeonGon ? 56.31 : -56.31;
  };

  // Level 3 total remaining count
  const taegeukRemaining = unplacedPieces.filter((p) =>
    p.startsWith('taegeuk')
  );
  const level3TotalRemaining =
    taegeukRemaining.length + solidBarsRemaining + brokenBarsRemaining;

  if (isLevel3 && level3TotalRemaining === 0) {
    return (
      <div className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center text-emerald-800 font-bold flex items-center justify-center gap-2 shadow-sm">
        <span>🎉 모든 막대와 태극을 제자리에 완성했습니다!</span>
      </div>
    );
  }

  if (!isLevel3 && unplacedPieces.length === 0) {
    return (
      <div className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center text-emerald-800 font-bold flex items-center justify-center gap-2 shadow-sm">
        <span>🎉 모든 조각을 올바르게 맞추었습니다!</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/95 backdrop-blur-sm border-2 border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg select-none">
      {/* Tray Header & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {!isLevel3 && (
            <div
              className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-sm shadow-xs ${
                mode === 'level1' || mode === 'click'
                  ? 'bg-blue-600'
                  : 'bg-amber-500'
              }`}
            >
              {unplacedPieces.length}
            </div>
          )}
          <div>
            <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
              <span>
                {isLevel3
                  ? '3단계 : 괘(卦) 구성 막대 및 태극 보관함'
                  : '태극기 구성요소 조각 보관함'}
              </span>
              {!isLevel3 && (
                <span className="text-xs font-semibold text-slate-500">
                  ({unplacedPieces.length}개 남음)
                </span>
              )}
            </h3>
            {!isLevel3 && (
              <p className="text-xs font-bold text-slate-600">
                {mode === 'level1' || mode === 'click'
                  ? '👆 조각을 먼저 1회 터치한 뒤, 태극기 틀의 알맞은 자리를 1회 터치하세요'
                  : '🖐️ 조각을 손가락으로 끌어서 태극기 틀의 알맞은 위치에 놓으세요'}
              </p>
            )}
          </div>
        </div>

        {/* Selected piece indicator in Level 1 only */}
        {selectedPieceId && (mode === 'level1' || mode === 'click') && (
          <div className="bg-blue-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 animate-bounce">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>선택 중: {TAEGEUKGI_PIECES[selectedPieceId]?.name}</span>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* LEVEL 3 TRAY (Taegeuk + Long Bar + Short Bar)            */}
      {/* ========================================================= */}
      {isLevel3 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. Taegeuk Red (if not placed) */}
          {taegeukRemaining.includes('taegeuk-red') && (
            <div className="flex flex-col items-center justify-between text-center select-none py-1">
              <span className="text-xs font-black text-red-700 mb-1">
                태극 상단 (양)
              </span>

              <div className="my-2 h-20 flex items-center justify-center relative w-full">
                {/* Ghost silhouette staying on tray */}
                <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                  <PieceGraphic id="taegeuk-red" size={78} isGhost={true} />
                </div>

                {/* Draggable piece shape directly without box */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  whileDrag={{ scale: 1.18, zIndex: 100 }}
                  drag
                  dragElastic={0}
                  dragMomentum={false}
                  dragSnapToOrigin
                  onDragEnd={(_, info) =>
                    onDragEndPiece('taegeuk-red', info.point.x, info.point.y)
                  }
                  onClick={() => {
                    if (onSelectBarType) onSelectBarType(null);
                    onSelectPiece('taegeuk-red');
                  }}
                  style={{ touchAction: 'none' }}
                  className="cursor-grab active:cursor-grabbing select-none relative z-10 flex items-center justify-center p-1 bg-transparent"
                >
                  <div
                    style={{
                      filter:
                        selectedPieceId === 'taegeuk-red'
                          ? 'drop-shadow(0 0 12px #DC2626) drop-shadow(0 4px 8px rgba(0,0,0,0.25))'
                          : 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
                    }}
                    className="transition-transform duration-150"
                  >
                    <PieceGraphic id="taegeuk-red" size={78} />
                  </div>
                </motion.div>
              </div>

              <span className="text-xs font-bold text-slate-700">
                빨간색 태극
              </span>
            </div>
          )}

          {/* 2. Taegeuk Blue (if not placed) */}
          {taegeukRemaining.includes('taegeuk-blue') && (
            <div className="flex flex-col items-center justify-between text-center select-none py-1">
              <span className="text-xs font-black text-blue-700 mb-1">
                태극 하단 (음)
              </span>

              <div className="my-2 h-20 flex items-center justify-center relative w-full">
                {/* Ghost silhouette staying on tray */}
                <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                  <PieceGraphic id="taegeuk-blue" size={78} isGhost={true} />
                </div>

                {/* Draggable piece shape directly without box */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  whileDrag={{ scale: 1.18, zIndex: 100 }}
                  drag
                  dragElastic={0}
                  dragMomentum={false}
                  dragSnapToOrigin
                  onDragEnd={(_, info) =>
                    onDragEndPiece('taegeuk-blue', info.point.x, info.point.y)
                  }
                  onClick={() => {
                    if (onSelectBarType) onSelectBarType(null);
                    onSelectPiece('taegeuk-blue');
                  }}
                  style={{ touchAction: 'none' }}
                  className="cursor-grab active:cursor-grabbing select-none relative z-10 flex items-center justify-center p-1 bg-transparent"
                >
                  <div
                    style={{
                      filter:
                        selectedPieceId === 'taegeuk-blue'
                          ? 'drop-shadow(0 0 12px #2563EB) drop-shadow(0 4px 8px rgba(0,0,0,0.25))'
                          : 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
                    }}
                    className="transition-transform duration-150"
                  >
                    <PieceGraphic id="taegeuk-blue" size={78} />
                  </div>
                </motion.div>
              </div>

              <span className="text-xs font-bold text-slate-700">
                파란색 태극
              </span>
            </div>
          )}

          {/* 3. Solid Bar (긴 막대 / 양효 ㅡ) */}
          <div className="flex flex-col items-center justify-between text-center select-none py-1">
            <div className="w-full flex items-center justify-center mb-1 px-1">
              <span className="text-xs font-black text-purple-800">
                양효 (陽爻)
              </span>
            </div>

            <div className="my-2 h-16 flex items-center justify-center relative w-full">
              {/* Ghost silhouette */}
              <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                <BarGraphic type="solid" width={140} isGhost={true} />
              </div>

              {/* Draggable bar shape directly without box */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                drag
                dragElastic={0}
                dragMomentum={false}
                dragSnapToOrigin
                onDragStart={(_, info) => {
                  setIsDraggingBar((prev) => ({ ...prev, solid: true }));
                  const t = calculateTilt(info.point.x, info.point.y);
                  setDragTilt((prev) => ({ ...prev, solid: t }));
                }}
                onDrag={(_, info) => {
                  const t = calculateTilt(info.point.x, info.point.y);
                  if (t !== dragTilt.solid) {
                    setDragTilt((prev) => ({ ...prev, solid: t }));
                  }
                }}
                onDragEnd={(_, info) => {
                  setIsDraggingBar((prev) => ({ ...prev, solid: false }));
                  setDragTilt((prev) => ({ ...prev, solid: -56.31 }));
                  if (onDragEndBar) {
                    onDragEndBar('solid', info.point.x, info.point.y);
                  }
                }}
                animate={{
                  rotate: isDraggingBar.solid ? dragTilt.solid : 0,
                  scale: isDraggingBar.solid ? 1.15 : 1,
                  zIndex: isDraggingBar.solid ? 100 : 10,
                }}
                transition={{
                  rotate: { type: 'spring', stiffness: 350, damping: 25 },
                }}
                onClick={() => {
                  if (onSelectBarType) {
                    onSelectBarType(selectedBarType === 'solid' ? null : 'solid');
                  }
                }}
                style={{ touchAction: 'none' }}
                className="select-none relative z-10 flex items-center justify-center p-2 bg-transparent cursor-grab active:cursor-grabbing"
              >
                <div
                  style={{
                    filter:
                      selectedBarType === 'solid'
                        ? 'drop-shadow(0 0 12px #7C3AED) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                        : 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
                  }}
                  className="transition-transform duration-150"
                >
                  <BarGraphic type="solid" width={140} />
                </div>
              </motion.div>
            </div>

            <div>
              <span className="text-xs font-black text-slate-800 block">
                긴 막대 (연결된 줄)
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block">
                건괘(3), 감괘(1), 리괘(2)에 사용
              </span>
            </div>
          </div>

          {/* 4. Broken Bar (짧은 막대 / 음효 - -) */}
          <div className="flex flex-col items-center justify-between text-center select-none py-1">
            <div className="w-full flex items-center justify-center mb-1 px-1">
              <span className="text-xs font-black text-purple-800">
                음효 (陰爻)
              </span>
            </div>

            <div className="my-2 h-16 flex items-center justify-center relative w-full">
              {/* Ghost silhouette */}
              <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                <BarGraphic type="broken" width={140} isGhost={true} />
              </div>

              {/* Draggable bar shape directly without box */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                drag
                dragElastic={0}
                dragMomentum={false}
                dragSnapToOrigin
                onDragStart={(_, info) => {
                  setIsDraggingBar((prev) => ({ ...prev, broken: true }));
                  const t = calculateTilt(info.point.x, info.point.y);
                  setDragTilt((prev) => ({ ...prev, broken: t }));
                }}
                onDrag={(_, info) => {
                  const t = calculateTilt(info.point.x, info.point.y);
                  if (t !== dragTilt.broken) {
                    setDragTilt((prev) => ({ ...prev, broken: t }));
                  }
                }}
                onDragEnd={(_, info) => {
                  setIsDraggingBar((prev) => ({ ...prev, broken: false }));
                  setDragTilt((prev) => ({ ...prev, broken: -56.31 }));
                  if (onDragEndBar) {
                    onDragEndBar('broken', info.point.x, info.point.y);
                  }
                }}
                animate={{
                  rotate: isDraggingBar.broken ? dragTilt.broken : 0,
                  scale: isDraggingBar.broken ? 1.15 : 1,
                  zIndex: isDraggingBar.broken ? 100 : 10,
                }}
                transition={{
                  rotate: { type: 'spring', stiffness: 350, damping: 25 },
                }}
                onClick={() => {
                  if (onSelectBarType) {
                    onSelectBarType(selectedBarType === 'broken' ? null : 'broken');
                  }
                }}
                style={{ touchAction: 'none' }}
                className="select-none relative z-10 flex items-center justify-center p-2 bg-transparent cursor-grab active:cursor-grabbing"
              >
                <div
                  style={{
                    filter:
                      selectedBarType === 'broken'
                        ? 'drop-shadow(0 0 12px #7C3AED) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                        : 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
                  }}
                  className="transition-transform duration-150"
                >
                  <BarGraphic type="broken" width={140} />
                </div>
              </motion.div>
            </div>

            <div>
              <span className="text-xs font-black text-slate-800 block">
                짧은 막대 (끊어진 줄)
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block">
                곤괘(3), 감괘(2), 리괘(1)에 사용
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* LEVEL 1 & 2 TRAY (6 Whole Pieces)                         */
        /* ========================================================= */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {unplacedPieces.map((id) => {
            const piece = TAEGEUKGI_PIECES[id];
            const isSelected = selectedPieceId === id;
            const isDragMode = mode === 'drag' || mode === 'level2';

            return (
              <div
                key={id}
                className="relative flex flex-col items-center select-none py-1"
              >
                {/* The Piece Display & Drag Stage */}
                <div className="w-full h-24 sm:h-28 relative flex items-center justify-center">
                  {/* Ghost silhouette staying on the tray */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                    <PieceGraphic id={id} size={84} isGhost={true} />
                  </div>

                  {/* The Draggable Piece itself - pure shape, no box */}
                  <motion.div
                    layout
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    drag={isDragMode}
                    dragSnapToOrigin
                    onDragStart={() => setDraggingPieceId(id)}
                    onDragEnd={(_, info) => {
                      setDraggingPieceId(null);
                      onDragEndPiece(id, info.point.x, info.point.y);
                    }}
                    animate={{
                      rotate: draggingPieceId === id ? (OFFICIAL_SLOTS[id]?.rotation || 0) : 0,
                      scale: draggingPieceId === id ? 1.15 : 1,
                      zIndex: draggingPieceId === id ? 100 : 10,
                    }}
                    transition={{
                      rotate: { type: 'spring', stiffness: 350, damping: 25 },
                    }}
                    onClick={() => onSelectPiece(id)}
                    style={{ touchAction: 'none' }}
                    className="cursor-grab active:cursor-grabbing select-none relative z-10 flex items-center justify-center p-2 bg-transparent"
                  >
                    <div
                      style={{
                        filter: isSelected
                          ? 'drop-shadow(0 0 12px #2563EB) drop-shadow(0 4px 8px rgba(0,0,0,0.25))'
                          : 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
                      }}
                      className="transition-transform duration-150"
                    >
                      <PieceGraphic id={id} size={84} />
                    </div>
                  </motion.div>
                </div>

                {/* Piece Label */}
                <div className="mt-1.5 text-center w-full px-1">
                  <span className="block font-black text-xs text-slate-800 truncate">
                    {piece.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {piece.meaning.split(',')[0]}
                  </span>
                  {isSelected && (
                    <span className="inline-block mt-1 bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                      선택됨
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
