import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PieceId, GameMode, BarType, BarSlotKey, TrigramType, CelebrationCharacterType } from './types';
import { TAEGEUKGI_PIECES, PIECE_ORDER } from './data/pieces';
import { BAR_SLOTS, ALL_BAR_SLOT_KEYS, TRIGRAM_NAMES } from './data/bars';
import { GameBoard } from './components/GameBoard';
import { PieceTray } from './components/PieceTray';
import { ModeSelector } from './components/ModeSelector';
import { StartScreen } from './components/StartScreen';
import { AiCompletionModal } from './components/AiCompletionModal';
import { ArcadeLeaderboard } from './components/ArcadeLeaderboard';
import { OFFICIAL_SLOTS } from './components/TaegeukgiSvg';
import { sounds } from './utils/audio';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  SlidersHorizontal,
  Hand,
  MousePointerClick,
  Layers,
  Star,
  Trophy,
  Maximize2,
  Minimize2,
  Home,
  Music,
} from 'lucide-react';

type AppScreen = 'start' | 'stage-select' | 'playing';

export default function App() {
  // Screen management: 'start' (게임 스타트 화면) -> 'stage-select' (스테이지 선택) -> 'playing' (게임 진행)
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('start');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBgmMuted, setIsBgmMuted] = useState<boolean>(false);

  // 1단계, 2단계, 3단계 지원
  const [mode, setMode] = useState<GameMode>('level1');
  const [isModeSelecting, setIsModeSelecting] = useState<boolean>(false);
  const [hasSelectedInitialStage, setHasSelectedInitialStage] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showLeaderboardHeaderModal, setShowLeaderboardHeaderModal] = useState<boolean>(false);

  // Placed pieces state (used for Level 1, 2, and Taegeuk in Level 3)
  const [placedPieces, setPlacedPieces] = useState<Record<PieceId, boolean>>({
    'taegeuk-red': false,
    'taegeuk-blue': false,
    geon: false,
    gon: false,
    gam: false,
    ri: false,
  });

  // Level 3: 12 individual bar slots state
  const [placedBars, setPlacedBars] = useState<Record<BarSlotKey, boolean>>({
    'geon-0': false,
    'geon-1': false,
    'geon-2': false,
    'gon-0': false,
    'gon-1': false,
    'gon-2': false,
    'gam-0': false,
    'gam-1': false,
    'gam-2': false,
    'ri-0': false,
    'ri-1': false,
    'ri-2': false,
  });

  // Selected bar type in Level 3 ('solid' | 'broken' | null)
  const [selectedBarType, setSelectedBarType] = useState<BarType | null>(null);

  // Tray unplaced list (randomized order for engaging play)
  const [unplacedPieces, setUnplacedPieces] = useState<PieceId[]>([]);
  // Active selected piece in click-to-place mode
  const [selectedPieceId, setSelectedPieceId] = useState<PieceId | null>(null);

  // Game timer & completion
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [victoryCount, setVictoryCount] = useState<number>(0);

  // Friendly toast banner for educational guidance
  const [feedback, setFeedback] = useState<{
    text: string;
    type: 'success' | 'warning' | 'info';
  } | null>({
    text: '태극기 조각을 제자리에 맞추어 아름다운 태극기를 완성해 보아요! 🇰🇷',
    type: 'info',
  });

  // Slot element references for iPad touch bounding box collision check
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<Record<PieceId, HTMLDivElement | null>>({
    'taegeuk-red': null,
    'taegeuk-blue': null,
    geon: null,
    gon: null,
    gam: null,
    ri: null,
  });

  const registerSlotRef = useCallback((slotId: PieceId, el: HTMLDivElement | null) => {
    slotRefs.current[slotId] = el;
  }, []);

  // Shuffle array helper
  const shufflePieces = (): PieceId[] => {
    const list = [...(PIECE_ORDER as PieceId[])];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  const isLevel3 = mode === 'level3';

  // Calculate remaining bars in Level 3
  const placedSolidCount = ALL_BAR_SLOT_KEYS.filter(
    (k) => BAR_SLOTS[k].requiredType === 'solid' && placedBars[k]
  ).length;
  const placedBrokenCount = ALL_BAR_SLOT_KEYS.filter(
    (k) => BAR_SLOTS[k].requiredType === 'broken' && placedBars[k]
  ).length;
  const solidBarsRemaining = Math.max(0, 6 - placedSolidCount);
  const brokenBarsRemaining = Math.max(0, 6 - placedBrokenCount);

  // Start / Restart game
  const initGame = useCallback(() => {
    setPlacedPieces({
      'taegeuk-red': false,
      'taegeuk-blue': false,
      geon: false,
      gon: false,
      gam: false,
      ri: false,
    });

    setPlacedBars({
      'geon-0': false,
      'geon-1': false,
      'geon-2': false,
      'gon-0': false,
      'gon-1': false,
      'gon-2': false,
      'gam-0': false,
      'gam-1': false,
      'gam-2': false,
      'ri-0': false,
      'ri-1': false,
      'ri-2': false,
    });

    setSelectedBarType(null);
    setSelectedPieceId(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setGameStarted(true);

    if (mode === 'level3') {
      setUnplacedPieces(['taegeuk-red', 'taegeuk-blue']);
      setFeedback({
        text: '✨ 3단계 (괘 조립 모드) : 4괘의 긴 막대(양효 ㅡ)와 짧은 막대(음효 - -)를 하나하나 붙여 태극기를 완성해 보아요!',
        type: 'info',
      });
    } else if (mode === 'level1' || mode === 'click') {
      setUnplacedPieces(shufflePieces());
      setFeedback({
        text: '👆 1단계 (터치 모드) : 조각을 1회 터치한 뒤 태극기 틀의 알맞은 위치를 톡 터치하세요!',
        type: 'info',
      });
    } else {
      setUnplacedPieces(shufflePieces());
      setFeedback({
        text: '🖐️ 2단계 (드래그 모드) : 손가락이나 펜으로 조각을 끌어다가 태극기 제자리에 쏙 놓아보세요!',
        type: 'info',
      });
    }
  }, [mode]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer counter (only active when playing on the board)
  useEffect(() => {
    if (currentScreen !== 'playing' || !gameStarted || isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentScreen, gameStarted, isCompleted]);

  // Fullscreen support for iPad / Tablets
  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as any;
      const isNativeFs = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
      // If native fullscreen was dismissed via system gesture or Esc, sync state
      if (!isNativeFs) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const doc = document as any;
    const rootEl = (document.getElementById('app-root') || document.documentElement) as any;
    const isCurrentlyFs = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement || isFullscreen);

    if (!isCurrentlyFs) {
      setIsFullscreen(true);
      if (rootEl.requestFullscreen) {
        rootEl.requestFullscreen().catch(() => {});
      } else if (rootEl.webkitRequestFullscreen) {
        rootEl.webkitRequestFullscreen();
      }
    } else {
      setIsFullscreen(false);
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    }
  };

  // Toggle sound effects
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.isMuted = next;
    if (!next) {
      sounds.playSelect();
      if (!isBgmMuted) {
        sounds.startBgm();
      }
    } else {
      sounds.stopBgm();
    }
  };

  // Toggle Arcade BGM
  const toggleBgm = () => {
    sounds.unlockAudio();
    const active = sounds.toggleBgm();
    setIsBgmMuted(!active);
    if (active) {
      sounds.playSelect();
      if (isMuted) {
        setIsMuted(false);
        sounds.isMuted = false;
      }
    }
  };

  // Ensure BGM plays while playing the game if not muted
  useEffect(() => {
    if (currentScreen === 'playing' && !isBgmMuted && !isMuted) {
      sounds.unlockAudio();
      sounds.startBgm();
    }
  }, [currentScreen, isBgmMuted, isMuted]);

  // Check Level 3 completion
  const checkLevel3Victory = (
    updatedBars: Record<BarSlotKey, boolean>,
    updatedPieces: Record<PieceId, boolean>
  ) => {
    const allBarsDone = ALL_BAR_SLOT_KEYS.every((k) => updatedBars[k]);
    const taegeukDone = updatedPieces['taegeuk-red'] && updatedPieces['taegeuk-blue'];

    if (allBarsDone && taegeukDone) {
      setIsCompleted(true);
      setVictoryCount((prev) => prev + 1);
      setFeedback({
        text: '🎉 축하합니다! 4괘의 12개 막대와 태극을 모두 정확히 조립하여 태극기를 완성했어요!',
        type: 'success',
      });
    }
  };

  // Check if piece matches target slot (Level 1, 2, and Taegeuk in Level 3)
  const placePieceSuccess = (pieceId: PieceId) => {
    sounds.playSnap();
    const updatedPieces = { ...placedPieces, [pieceId]: true };
    setPlacedPieces(updatedPieces);
    setUnplacedPieces((prev) => prev.filter((id) => id !== pieceId));
    setSelectedPieceId(null);

    const info = TAEGEUKGI_PIECES[pieceId];
    setFeedback({
      text: `👏 멋져요! '${info.shortName}'을(를) 바른 위치에 놓았습니다! (${info.meaning})`,
      type: 'success',
    });

    if (isLevel3) {
      checkLevel3Victory(placedBars, updatedPieces);
    } else {
      const allDone = (PIECE_ORDER as PieceId[]).every((id) => updatedPieces[id]);
      if (allDone) {
        setIsCompleted(true);
        setVictoryCount((prev) => prev + 1);
        setFeedback({
          text: '🎉 축하합니다! 모든 조각을 맞추어 태극기를 완성했어요!',
          type: 'success',
        });
      }
    }
  };

  // Click Mode: Slot Click Handler
  const handleSlotClick = (slotId: PieceId) => {
    if (placedPieces[slotId]) return;

    if (!selectedPieceId) {
      sounds.playSelect();
      setFeedback({
        text: `보관함에서 먼저 조각을 1회 터치하여 골라주세요!`,
        type: 'info',
      });
      return;
    }

    if (selectedPieceId === slotId) {
      placePieceSuccess(selectedPieceId);
    } else {
      sounds.playWrong();
      const currentSelectedInfo = TAEGEUKGI_PIECES[selectedPieceId];
      const targetSlotInfo = TAEGEUKGI_PIECES[slotId];
      setFeedback({
        text: `💡 지금 고른 조각은 '${currentSelectedInfo.shortName}'이에요. 여기는 '${targetSlotInfo.slotLabel}' 자리예요. 다시 찾아볼까요?`,
        type: 'warning',
      });
    }
  };

  // Click Mode: Tray Piece Click Handler
  const handleSelectPiece = (pieceId: PieceId) => {
    sounds.playSelect();
    setSelectedBarType(null); // Clear bar selection in level 3

    if (selectedPieceId === pieceId) {
      setSelectedPieceId(null);
      setFeedback({
        text: '조각 선택을 취소했습니다. 배치할 다른 조각을 골라보세요.',
        type: 'info',
      });
    } else {
      setSelectedPieceId(pieceId);
      const piece = TAEGEUKGI_PIECES[pieceId];
      setFeedback({
        text: `✨ '${piece.shortName}' 선택됨! (${piece.description}) 태극기 틀의 알맞은 빈자리를 톡 터치하세요!`,
        type: 'info',
      });
    }
  };

  // Drag Mode: Drag End Handler for whole pieces (Level 1, 2, and Taegeuk in Level 3)
  const handleDragEndPiece = (pieceId: PieceId, clientX: number, clientY: number) => {
    let isInSlot = false;
    let hitWrongSlotName: string | null = null;

    // 1. Primary Test: Mathematical SVG Relative Coordinates (evaluating both viewport & page coordinate candidates)
    const boardEl = boardContainerRef.current;
    if (boardEl) {
      const bRect = boardEl.getBoundingClientRect();
      const pageLeft = bRect.left + window.scrollX;
      const pageTop = bRect.top + window.scrollY;

      // Generate both coordinate candidates (viewport-relative and page-relative)
      const coordCandidates = [
        { relX: clientX - bRect.left, relY: clientY - bRect.top },
        { relX: clientX - pageLeft, relY: clientY - pageTop },
      ];

      for (const { relX, relY } of coordCandidates) {
        if (isInSlot) break;

        // Check if dropped reasonably near or on the board (generous 160px margin)
        if (
          relX >= -160 &&
          relX <= bRect.width + 160 &&
          relY >= -160 &&
          relY <= bRect.height + 160
        ) {
          const svgX = (relX / bRect.width) * 900;
          const svgY = (relY / bRect.height) * 600;

          const isTrigram =
            pieceId === 'geon' || pieceId === 'gon' || pieceId === 'gam' || pieceId === 'ri';
          const distFromCenter = Math.hypot(svgX - 450, svgY - 300);
          const targetDist = Math.hypot(
            svgX - OFFICIAL_SLOTS[pieceId].cx,
            svgY - OFFICIAL_SLOTS[pieceId].cy
          );

          if (isTrigram) {
            // Trigrams (건, 곤, 감, 리):
            // Very generous recognition: within 300px radius of official slot,
            // OR in the respective corner/quadrant as long as it's not right inside the center Taegeuk
            let inQuadrant = false;
            if (pieceId === 'geon') {
              // 건괘 (좌상단 10시)
              inQuadrant = svgX <= 510 && svgY <= 360 && distFromCenter > 50;
            } else if (pieceId === 'gam') {
              // 감괘 (우상단 2시)
              inQuadrant = svgX >= 390 && svgY <= 360 && distFromCenter > 50;
            } else if (pieceId === 'ri') {
              // 리괘 (좌하단 8시)
              inQuadrant = svgX <= 510 && svgY >= 240 && distFromCenter > 50;
            } else if (pieceId === 'gon') {
              // 곤괘 (우하단 4시)
              inQuadrant = svgX >= 390 && svgY >= 240 && distFromCenter > 50;
            }

            if (targetDist <= 300 || inQuadrant) {
              isInSlot = true;
            } else {
              // Check if dropped clearly near another trigram to provide educational advice
              const otherTrigrams: PieceId[] = ['geon', 'gam', 'ri', 'gon'].filter(
                (id) => id !== pieceId
              ) as PieceId[];
              for (const tId of otherTrigrams) {
                const d = Math.hypot(svgX - OFFICIAL_SLOTS[tId].cx, svgY - OFFICIAL_SLOTS[tId].cy);
                if (d <= 200) {
                  hitWrongSlotName = TAEGEUKGI_PIECES[tId].slotLabel;
                  break;
                }
              }
              if (!hitWrongSlotName && distFromCenter <= 150) {
                hitWrongSlotName = '태극 문양 (중앙)';
              }
            }
          } else {
            // Taegeuk pieces (태극 빨강, 태극 파랑)
            // Taegeuk circle is center (450, 300), radius 150.
            if (pieceId === 'taegeuk-red') {
              const blueAlreadyPlaced = placedPieces['taegeuk-blue'];
              if (blueAlreadyPlaced) {
                // If blue is already placed, ANY drop near the central Taegeuk area snaps red!
                if (distFromCenter <= 290 || targetDist <= 290) {
                  isInSlot = true;
                }
              } else {
                // If blue is not placed yet: red belongs to upper half, allow generous boundary
                if (targetDist <= 290 || (distFromCenter <= 280 && svgY <= 430)) {
                  isInSlot = true;
                } else if (distFromCenter <= 280 && svgY > 430) {
                  hitWrongSlotName = TAEGEUKGI_PIECES['taegeuk-blue'].slotLabel;
                }
              }
            } else if (pieceId === 'taegeuk-blue') {
              const redAlreadyPlaced = placedPieces['taegeuk-red'];
              if (redAlreadyPlaced) {
                // If red is already placed, ANY drop near the central Taegeuk area snaps blue!
                if (distFromCenter <= 290 || targetDist <= 290) {
                  isInSlot = true;
                }
              } else {
                // If red is not placed yet: blue belongs to lower half (curves up on right), allow generous boundary
                if (targetDist <= 290 || (distFromCenter <= 280 && svgY >= 170)) {
                  isInSlot = true;
                } else if (distFromCenter <= 280 && svgY < 170) {
                  hitWrongSlotName = TAEGEUKGI_PIECES['taegeuk-red'].slotLabel;
                }
              }
            }
          }
        }
      }
    }

    // 2. Secondary Test: DOM Element Bounding Client Rect with dual page/client coordinate check
    if (!isInSlot) {
      const targetSlotEl = slotRefs.current[pieceId];
      if (targetSlotEl) {
        const rect = targetSlotEl.getBoundingClientRect();
        const tolerance = 130;
        const insideClient =
          clientX >= rect.left - tolerance &&
          clientX <= rect.right + tolerance &&
          clientY >= rect.top - tolerance &&
          clientY <= rect.bottom + tolerance;

        const pageLeft = rect.left + window.scrollX;
        const pageTop = rect.top + window.scrollY;
        const insidePage =
          clientX >= pageLeft - tolerance &&
          clientX <= pageLeft + rect.width + tolerance &&
          clientY >= pageTop - tolerance &&
          clientY <= pageTop + rect.height + tolerance;

        if (insideClient || insidePage) {
          isInSlot = true;
        }
      }
    }

    if (isInSlot) {
      placePieceSuccess(pieceId);
      return;
    }

    sounds.playWrong();
    const currentPieceInfo = TAEGEUKGI_PIECES[pieceId];
    if (hitWrongSlotName) {
      setFeedback({
        text: `아쉽네요! 그곳은 '${hitWrongSlotName}' 자리예요. ${currentPieceInfo.shortName}은(는) '${currentPieceInfo.slotLabel}'에 놓아보세요!`,
        type: 'warning',
      });
    } else {
      setFeedback({
        text: `${currentPieceInfo.shortName}을(를) 태극기의 '${currentPieceInfo.slotLabel}' 근처로 끌어다 놓아보세요!`,
        type: 'info',
      });
    }
  };

  // =========================================================================
  // LEVEL 3 SPECIFIC HANDLERS (Individual Bars)
  // =========================================================================

  // Level 3: Tray Bar Type Selection
  const handleSelectBarType = (type: BarType | null) => {
    sounds.playSelect();
    setSelectedPieceId(null); // clear piece selection
    setSelectedBarType(type);

    if (!type) {
      setFeedback({
        text: '막대 선택을 취소했습니다.',
        type: 'info',
      });
    } else if (type === 'solid') {
      setFeedback({
        text: '✨ 긴 막대(양효 ㅡ) 선택됨! 건괘 3줄, 감괘 가운데, 리괘 위/아래의 빈자리를 톡 터치하세요!',
        type: 'info',
      });
    } else {
      setFeedback({
        text: '✨ 짧은 막대(음효 - -) 선택됨! 곤괘 3줄, 감괘 위/아래, 리괘 가운데의 빈자리를 톡 터치하세요!',
        type: 'info',
      });
    }
  };

  // Level 3: Bar Slot Click on Flag
  const handleBarSlotClick = (barKey: BarSlotKey) => {
    if (placedBars[barKey]) return;

    const slotInfo = BAR_SLOTS[barKey];

    if (!selectedBarType) {
      sounds.playSelect();
      setFeedback({
        text: `💡 이곳은 [${slotInfo.label}] 자리예요! 아래 보관함에서 ${
          slotInfo.requiredType === 'solid'
            ? '긴 막대(양효 ㅡ)'
            : '짧은 막대(음효 - -)'
        }를 먼저 터치해 주세요!`,
        type: 'info',
      });
      return;
    }

    if (selectedBarType === slotInfo.requiredType) {
      // Correct bar placement!
      sounds.playSnap();
      const updatedBars = { ...placedBars, [barKey]: true };
      setPlacedBars(updatedBars);

      // Check if trigram is finished
      const trigram: TrigramType = slotInfo.trigram;
      const trigramDone =
        updatedBars[`${trigram}-0` as BarSlotKey] &&
        updatedBars[`${trigram}-1` as BarSlotKey] &&
        updatedBars[`${trigram}-2` as BarSlotKey];

      if (trigramDone) {
        sounds.playQuizCorrect();
        setFeedback({
          text: `🎉 대단해요! ${TRIGRAM_NAMES[trigram].name} (${TRIGRAM_NAMES[trigram].meaning})를 완성했습니다!`,
          type: 'success',
        });
      } else {
        setFeedback({
          text: `👏 참 잘했어요! ${slotInfo.label}를 제자리에 정확하게 붙였습니다!`,
          type: 'success',
        });
      }

      checkLevel3Victory(updatedBars, placedPieces);
    } else {
      // Wrong bar type
      sounds.playWrong();
      setFeedback({
        text: `💡 아쉽네요! ${slotInfo.trigramName}의 이 자리는 ${
          slotInfo.requiredType === 'solid'
            ? '긴 막대(양효 ㅡ)'
            : '짧은 막대(음효 - -)'
        }가 들어갈 자리예요!`,
        type: 'warning',
      });
    }
  };

  // Level 3: Drag & Drop End for Bars
  const handleDragEndBar = (barType: BarType, clientX: number, clientY: number) => {
    const boardEl = boardContainerRef.current || document.getElementById('taegeukgi-flag-board');
    if (!boardEl) return;

    const bRect = boardEl.getBoundingClientRect();
    let bestMatchingKey: BarSlotKey | null = null;
    let minScreenDist = Math.max(140, bRect.width * 0.22); // generous hit radius for iPad touch

    // 1. Check exact slot centers in client coordinate space
    for (const key of ALL_BAR_SLOT_KEYS) {
      if (!placedBars[key]) {
        const slot = BAR_SLOTS[key];
        if (slot.requiredType === barType) {
          const slotScreenX = bRect.left + (slot.cx / 900) * bRect.width;
          const slotScreenY = bRect.top + (slot.cy / 600) * bRect.height;
          const dist = Math.hypot(clientX - slotScreenX, clientY - slotScreenY);
          if (dist < minScreenDist) {
            minScreenDist = dist;
            bestMatchingKey = key;
          }
        }
      }
    }

    // 2. If no direct slot center hit, check quadrant proximity on the board
    if (!bestMatchingKey) {
      const relX = (clientX - bRect.left) / bRect.width;
      const relY = (clientY - bRect.top) / bRect.height;

      // Allow generous margins around board (-0.2 to 1.2)
      if (relX >= -0.2 && relX <= 1.2 && relY >= -0.2 && relY <= 1.2) {
        if (barType === 'solid') {
          // 건괘 (좌상단): 3줄 모두 solid
          if (relX <= 0.52 && relY <= 0.52) {
            const geonSlots: BarSlotKey[] = ['geon-0', 'geon-1', 'geon-2'];
            bestMatchingKey = geonSlots.find((k) => !placedBars[k]) || null;
          }
          // 감괘 (우상단): 가운데 줄(gam-1) solid
          else if (relX >= 0.48 && relY <= 0.52 && !placedBars['gam-1']) {
            bestMatchingKey = 'gam-1';
          }
          // 리괘 (좌하단): 위쪽(ri-0), 아래쪽(ri-2) solid
          else if (relX <= 0.52 && relY >= 0.48) {
            const riSolid: BarSlotKey[] = ['ri-0', 'ri-2'];
            bestMatchingKey = riSolid.find((k) => !placedBars[k]) || null;
          }
        } else if (barType === 'broken') {
          // 곤괘 (우하단): 3줄 모두 broken
          if (relX >= 0.48 && relY >= 0.48) {
            const gonSlots: BarSlotKey[] = ['gon-0', 'gon-1', 'gon-2'];
            bestMatchingKey = gonSlots.find((k) => !placedBars[k]) || null;
          }
          // 감괘 (우상단): 위쪽(gam-0), 아래쪽(gam-2) broken
          else if (relX >= 0.48 && relY <= 0.52) {
            const gamBroken: BarSlotKey[] = ['gam-0', 'gam-2'];
            bestMatchingKey = gamBroken.find((k) => !placedBars[k]) || null;
          }
          // 리괘 (좌하단): 가운데 줄(ri-1) broken
          else if (relX <= 0.52 && relY >= 0.48 && !placedBars['ri-1']) {
            bestMatchingKey = 'ri-1';
          }
        }
      }
    }

    if (bestMatchingKey !== null) {
      const targetSlot = BAR_SLOTS[bestMatchingKey];
      sounds.playSnap();
      const updatedBars = { ...placedBars, [bestMatchingKey]: true };
      setPlacedBars(updatedBars);

      const trigram: TrigramType = targetSlot.trigram;
      const trigramDone =
        updatedBars[`${trigram}-0` as BarSlotKey] &&
        updatedBars[`${trigram}-1` as BarSlotKey] &&
        updatedBars[`${trigram}-2` as BarSlotKey];

      if (trigramDone) {
        sounds.playQuizCorrect();
        setFeedback({
          text: `🎉 멋져요! ${TRIGRAM_NAMES[trigram].name} (${TRIGRAM_NAMES[trigram].meaning})를 완성했습니다!`,
          type: 'success',
        });
      } else {
        setFeedback({
          text: `👏 정확해요! ${targetSlot.label}를 알맞게 붙였습니다!`,
          type: 'success',
        });
      }

      checkLevel3Victory(updatedBars, placedPieces);
      return;
    }

    // Look for closest wrong slot to provide helpful guidance
    let closestWrongSlot: (typeof BAR_SLOTS)[BarSlotKey] | null = null;
    let minWrongDist = Math.max(140, bRect.width * 0.22);
    for (const key of ALL_BAR_SLOT_KEYS) {
      if (!placedBars[key]) {
        const slot = BAR_SLOTS[key];
        const slotScreenX = bRect.left + (slot.cx / 900) * bRect.width;
        const slotScreenY = bRect.top + (slot.cy / 600) * bRect.height;
        const dist = Math.hypot(clientX - slotScreenX, clientY - slotScreenY);
        if (dist < minWrongDist) {
          minWrongDist = dist;
          closestWrongSlot = slot;
        }
      }
    }

    sounds.playWrong();
    if (closestWrongSlot) {
      setFeedback({
        text: `💡 ${closestWrongSlot.label} 자리는 ${
          closestWrongSlot.requiredType === 'solid' ? '긴 막대(양효 ㅡ)' : '짧은 막대(음효 - -)'
        } 자리예요!`,
        type: 'warning',
      });
    } else {
      setFeedback({
        text: `${
          barType === 'solid' ? '긴 막대(양효 ㅡ)' : '짧은 막대(음효 - -)'
        }를 태극기 4괘의 빈 줄 근처로 끌어다 놓아보세요!`,
        type: 'info',
      });
    }
  };

  // Total Placed Counter
  const totalCount = isLevel3 ? 14 : 6;
  const currentCount = isLevel3
    ? (placedPieces['taegeuk-red'] ? 1 : 0) +
      (placedPieces['taegeuk-blue'] ? 1 : 0) +
      Object.values(placedBars).filter(Boolean).length
    : Object.values(placedPieces).filter(Boolean).length;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectModeFromModal = (newMode: GameMode) => {
    sounds.playSelect();
    if (newMode === mode) {
      initGame();
    } else {
      setMode(newMode);
    }
  };

  // Celebration character: Cycle through the 4 independence heroes from the portrait image
  // (안중근 의사, 도산 안창호 선생, 유관순 열사, 윤봉길 의사)
  const celebrationHeroes: CelebrationCharacterType[] = [
    'an-jung-geun',
    'ahn-chang-ho',
    'ryu-gwan-sun',
    'yun-bong-gil',
  ];
  const celebrationCharacter: CelebrationCharacterType =
    celebrationHeroes[Math.max(0, victoryCount - 1) % celebrationHeroes.length];

  // =========================================================================
  // PERSISTENT ROOT CONTAINER (Prevents iPad fullscreen drop on screen transitions)
  // =========================================================================
  return (
    <div
      id="app-root"
      className={`relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden select-none bg-slate-100 text-slate-800 ${
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-[100dvh]' : ''
      }`}
    >
      {/* 1. SCREEN 1: Start Screen ("게임 스타트!" landing page) */}
      {currentScreen === 'start' && (
        <div className="h-full w-full overflow-hidden">
          <StartScreen
            onStartGame={() => {
              sounds.playSelect();
              if (!isBgmMuted && !isMuted) {
                sounds.startBgm();
              }
              setCurrentScreen('stage-select');
            }}
            onOpenLeaderboard={() => setShowLeaderboardHeaderModal(true)}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            isBgmMuted={isBgmMuted}
            onToggleBgm={toggleBgm}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        </div>
      )}

      {/* 2. SCREEN 2: Stage Selection Screen (1단계, 2단계, 3단계 선택) */}
      {currentScreen === 'stage-select' && (
        <div className="h-full w-full overflow-y-auto bg-gradient-to-b from-blue-50 via-slate-50 to-amber-50 flex flex-col justify-between p-3 sm:p-5 select-none">
          {/* Top bar in Stage Selection */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-2 shrink-0 mb-3">
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                setCurrentScreen('start');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Home className="w-3.5 h-3.5 text-blue-600" />
              <span>처음 화면으로</span>
            </button>

            <div className="flex items-center gap-2">
              {/* iPad Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                title="아이패드 화면을 꽉 채워요!"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">화면 원래대로</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">화면 꽉 채우기</span>
                    <span className="sm:hidden">⛶</span>
                  </>
                )}
              </button>

              {/* Arcade BGM Toggle */}
              <button
                type="button"
                onClick={toggleBgm}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all ${
                  !isBgmMuted
                    ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-300/70'
                    : 'bg-white text-slate-500 border-slate-300'
                }`}
                title={!isBgmMuted ? '오락실 배경음악 끄기' : '오락실 배경음악 켜기'}
              >
                {!isBgmMuted ? (
                  <>
                    <span className="flex items-end gap-0.5 h-3">
                      <span className="w-1 bg-amber-600 rounded-full h-2 animate-pulse" />
                      <span className="w-1 bg-amber-600 rounded-full h-3 animate-pulse [animation-delay:150ms]" />
                      <span className="w-1 bg-amber-600 rounded-full h-1.5 animate-pulse [animation-delay:300ms]" />
                    </span>
                    <span>음악 ON 🎵</span>
                  </>
                ) : (
                  <>
                    <Music className="w-3.5 h-3.5 text-slate-400" />
                    <span>음악 OFF</span>
                  </>
                )}
              </button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 cursor-pointer shadow-xs"
                title={isMuted ? '효과음 켜기' : '효과음 끄기'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* Leaderboard */}
              <button
                type="button"
                onClick={() => {
                  sounds.playSelect();
                  setShowLeaderboardHeaderModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-200" />
                <span className="hidden sm:inline">명예의 전당</span>
                <span>🏆</span>
              </button>
            </div>
          </div>

          {/* Center: Stage Selection Modal / Component */}
          <div className="my-auto w-full max-w-3xl mx-auto">
            <ModeSelector
              currentMode={mode}
              onSelectMode={(newMode) => {
                setMode(newMode);
                setHasSelectedInitialStage(true);
                setCurrentScreen('playing');
                if (!isBgmMuted && !isMuted) {
                  sounds.startBgm();
                }
                initGame();
              }}
              showHints={showHints}
              onToggleHints={setShowHints}
              isFirstScreen={!hasSelectedInitialStage}
              onBackToStart={() => setCurrentScreen('start')}
            />
          </div>

          <div className="text-center text-xs font-medium text-slate-500 py-2 shrink-0">
            🇰🇷 대한민국 태극기 맞추기 놀이
          </div>
        </div>
      )}

      {/* 3. SCREEN 3: Playing Screen (Fits iPad screen 100% without scroll) */}
      {currentScreen === 'playing' && (
        <div className="h-full w-full bg-slate-100 text-slate-800 flex flex-col justify-between overflow-hidden selection:bg-amber-200">
      {/* Top Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-slate-200 px-3 sm:px-4 py-2 sticky top-0 z-40 shadow-xs shrink-0">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Brand & Stage Indicator */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                setCurrentScreen('start');
              }}
              className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-500 via-amber-400 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md select-none active:scale-95 cursor-pointer"
              title="처음 시작 화면으로"
            >
              🇰🇷
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>태극기 맞추기</span>
                <span className="hidden md:inline text-xs text-slate-500 font-semibold">(대한민국 국기)</span>
              </h1>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  {mode === 'level1' || mode === 'click' ? (
                    <>
                      <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-blue-700">1단계 : 터치</span>
                    </>
                  ) : mode === 'level3' ? (
                    <>
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-purple-700">3단계 : 괘 조립</span>
                    </>
                  ) : (
                    <>
                      <Hand className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-amber-700">2단계 : 드래그</span>
                    </>
                  )}
                </span>
                <span>·</span>
                <span className="text-slate-800">
                  진행 {currentCount}/{totalCount}
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Timer, Mode Change, iPad Fullscreen, Sound, Restart */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Timer Badge */}
            <div className="bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-xl font-mono text-xs font-black text-slate-700">
              ⏱️ {formatTimer(elapsedSeconds)}
            </div>

            {/* iPad Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
              title="아이패드 화면을 꽉 채워요!"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden md:inline">화면 원래대로</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden md:inline">화면 꽉 채우기</span>
                  <span className="md:hidden">⛶</span>
                </>
              )}
            </button>

            {/* Arcade Leaderboard / Hall of Fame Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                setShowLeaderboardHeaderModal(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 active:scale-95 text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-all"
              title="오락실 명예의 전당 (순위표)"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">순위표</span>
              <span>🏆</span>
            </button>

            {/* Change Mode Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                setCurrentScreen('stage-select');
              }}
              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-all"
              title="단계 다시 고르기"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>단계 선택</span>
            </button>

            {/* Arcade BGM Toggle */}
            <button
              type="button"
              onClick={toggleBgm}
              className={`px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all ${
                !isBgmMuted
                  ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-300/70'
                  : 'bg-white text-slate-500 border-slate-300'
              }`}
              title={!isBgmMuted ? '오락실 배경음악 끄기' : '오락실 배경음악 켜기'}
            >
              {!isBgmMuted ? (
                <>
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-1 bg-amber-600 rounded-full h-2 animate-pulse" />
                    <span className="w-1 bg-amber-600 rounded-full h-3 animate-pulse [animation-delay:150ms]" />
                    <span className="w-1 bg-amber-600 rounded-full h-1.5 animate-pulse [animation-delay:300ms]" />
                  </span>
                  <span>음악 ON 🎵</span>
                </>
              ) : (
                <>
                  <Music className="w-3.5 h-3.5 text-slate-400" />
                  <span>음악 OFF</span>
                </>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 cursor-pointer shadow-xs transition-colors"
              title={isMuted ? '효과음 켜기' : '효과음 끄기'}
              aria-label="소리 토글"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              )}
            </button>

            {/* Restart Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                initGame();
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-all"
              title="다시 하기"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">다시 하기</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Educational Play Canvas - Sized perfectly for iPad Fullscreen */}
      <main className="max-w-5xl w-full mx-auto px-2 sm:px-4 py-1 flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
        {/* Friendly Feedback Announcement Banner */}
        {feedback && (
          <div
            className={`w-full max-w-4xl mx-auto px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2 shadow-xs shrink-0 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-300'
                : feedback.type === 'warning'
                ? 'bg-amber-100 text-amber-900 border-2 border-amber-300'
                : 'bg-blue-50 text-blue-950 border-2 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-base shrink-0">
                {feedback.type === 'success'
                  ? '🌟'
                  : feedback.type === 'warning'
                  ? '💡'
                  : '📢'}
              </span>
              <span className="truncate">{feedback.text}</span>
            </div>
            {/* Visual Progress Stars */}
            <div className="flex items-center gap-0.5 shrink-0">
              {Array.from({ length: totalCount }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${
                    i < currentCount ? 'text-amber-500 font-black' : 'text-slate-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Game Board: Central Taegeukgi flag frame (flex-1 min-h-0 to expand responsively) */}
        <div className="w-full flex-1 min-h-0 flex items-center justify-center py-0.5">
          <GameBoard
            mode={mode}
            placedPieces={placedPieces}
            placedBars={placedBars}
            selectedPieceId={selectedPieceId}
            selectedBarType={selectedBarType}
            showHints={showHints}
            onSlotClick={handleSlotClick}
            onBarSlotClick={handleBarSlotClick}
            registerSlotRef={registerSlotRef}
            boardContainerRef={boardContainerRef}
          />
        </div>

        {/* Bottom: Piece Storage Tray (shrink-0) */}
        <div className="w-full max-w-4xl mx-auto shrink-0 pb-0.5">
          <PieceTray
            mode={mode}
            unplacedPieces={unplacedPieces}
            selectedPieceId={selectedPieceId}
            onSelectPiece={handleSelectPiece}
            onDragEndPiece={handleDragEndPiece}
            solidBarsRemaining={solidBarsRemaining}
            brokenBarsRemaining={brokenBarsRemaining}
            selectedBarType={selectedBarType}
            onSelectBarType={handleSelectBarType}
            onDragEndBar={handleDragEndBar}
          />
        </div>
      </main>

      {/* Footer Educational Guide & Attribution */}
      <footer className="bg-white/80 border-t border-slate-200 px-3 py-1 text-center text-[11px] sm:text-xs text-slate-600 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-1 sm:gap-2">
          <div>
            🇰🇷 <strong>태극기 상식:</strong> 흰색 바탕(평화) · 빨강/파랑(태극) · 건(하늘 ☰) · 곤(땅 ☷) · 감(물 ☵) · 리(불 ☲)
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500">
            아이패드 전체화면 최적화 · 유치원 5세 맞춤 놀이
          </div>
        </div>
      </footer>
        </div>
      )}

      {/* Completion Modal with Gemini AI praise, OX Quiz, and Google Sheets logger */}
      {isCompleted && (
        <AiCompletionModal
          elapsedSeconds={elapsedSeconds}
          mode={mode}
          onRestart={initGame}
          onSelectMode={handleSelectModeFromModal}
          celebrationCharacter={celebrationCharacter}
        />
      )}

      {/* Standalone Arcade Leaderboard (accessible anytime via header button) */}
      <ArcadeLeaderboard
        isOpen={showLeaderboardHeaderModal}
        onClose={() => setShowLeaderboardHeaderModal(false)}
        initialFilterMode={mode}
      />
    </div>
  );
}
