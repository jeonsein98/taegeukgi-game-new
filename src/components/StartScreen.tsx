import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Volume2, VolumeX, Maximize2, Minimize2, Play, Heart, Star } from 'lucide-react';
import { sounds } from '../utils/audio';

interface StartScreenProps {
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenLeaderboard,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="relative w-full h-full min-h-[100dvh] flex flex-col justify-between items-center bg-gradient-to-b from-blue-50 via-slate-50 to-red-50 text-slate-800 p-4 sm:p-6 overflow-x-hidden select-none">
      {/* Background Subtle Floating Motifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-red-400 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-blue-500 blur-3xl"
        />

        {/* Floating Sparkles & Stars */}
        {[
          { x: '10%', y: '15%', delay: 0, icon: Star, color: 'text-amber-400' },
          { x: '88%', y: '18%', delay: 0.5, icon: Sparkles, color: 'text-rose-400' },
          { x: '15%', y: '80%', delay: 1, icon: Heart, color: 'text-pink-400' },
          { x: '85%', y: '78%', delay: 1.5, icon: Star, color: 'text-yellow-400' },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className={`absolute ${item.color} hidden sm:block`}
            style={{ left: item.x, top: item.y }}
            animate={{ y: [0, -12, 0], rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
          >
            <item.icon className="w-8 h-8 fill-current opacity-70" />
          </motion.div>
        ))}
      </div>

      {/* Top Bar with Quick Utilities (iPad Fullscreen, Sound, Leaderboard) */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>유치원 어린이 맞춤 놀이</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen Button - Highly recommended for iPad */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200 text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
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
                <span>화면 꽉 채우기 ⛶</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-xs cursor-pointer active:scale-95 transition-all"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          {/* Leaderboard */}
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-200" />
            <span className="hidden sm:inline">명예의 전당</span>
            <span>🏆</span>
          </button>
        </div>
      </div>

      {/* Center Main Stage Card */}
      <div className="relative z-10 w-full max-w-2xl mx-auto my-auto flex flex-col items-center text-center px-4 py-6 sm:py-8">
        {/* Animated Flag / Badge Hero Visual */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative mb-5"
        >
          {/* Flag Outer Halo */}
          <div className="absolute -inset-3 bg-gradient-to-tr from-red-400 via-amber-300 to-blue-500 rounded-3xl opacity-50 blur-lg animate-pulse" />

          {/* Flag Preview Plaque */}
          <div className="relative bg-white rounded-3xl p-3 shadow-2xl border-4 border-amber-300 flex items-center justify-center">
            <svg viewBox="0 0 300 200" className="w-48 sm:w-64 h-auto rounded-2xl shadow-inner bg-white">
              {/* White Background */}
              <rect width="300" height="200" fill="#FFFFFF" rx="10" />

              {/* Taegeuk Circle */}
              <g transform="translate(150, 100) rotate(-33.69)">
                {/* Red Top Half */}
                <path d="M -50 0 A 50 50 0 0 1 50 0 A 25 25 0 0 1 0 0 A 25 25 0 0 0 -50 0 Z" fill="#CD2E3A" />
                {/* Blue Bottom Half */}
                <path d="M 50 0 A 50 50 0 0 1 -50 0 A 25 25 0 0 1 0 0 A 25 25 0 0 0 50 0 Z" fill="#0047A0" />
              </g>

              {/* 4 Trigrams Simplified Preview */}
              {/* Geon (Top-Left ☰) */}
              <g transform="translate(56, 42) rotate(-56.31)">
                <rect x="-18" y="-9" width="36" height="4" rx="2" fill="#000000" />
                <rect x="-18" y="-2" width="36" height="4" rx="2" fill="#000000" />
                <rect x="-18" y="5" width="36" height="4" rx="2" fill="#000000" />
              </g>
              {/* Ri (Bottom-Left ☲) */}
              <g transform="translate(56, 158) rotate(56.31)">
                <rect x="-18" y="-9" width="36" height="4" rx="2" fill="#000000" />
                <rect x="-18" y="-2" width="16" height="4" rx="2" fill="#000000" />
                <rect x="2" y="-2" width="16" height="4" rx="2" fill="#000000" />
                <rect x="-18" y="5" width="36" height="4" rx="2" fill="#000000" />
              </g>
              {/* Gam (Top-Right ☵) */}
              <g transform="translate(244, 42) rotate(56.31)">
                <rect x="-18" y="-9" width="16" height="4" rx="2" fill="#000000" />
                <rect x="2" y="-9" width="16" height="4" rx="2" fill="#000000" />
                <rect x="-18" y="-2" width="36" height="4" rx="2" fill="#000000" />
                <rect x="-18" y="5" width="16" height="4" rx="2" fill="#000000" />
                <rect x="2" y="5" width="16" height="4" rx="2" fill="#000000" />
              </g>
              {/* Gon (Bottom-Right ☷) */}
              <g transform="translate(244, 158) rotate(-56.31)">
                <rect x="-18" y="-9" width="16" height="4" rx="2" fill="#000000" />
                <rect x="2" y="-9" width="16" height="4" rx="2" fill="#000000" />
                <rect x="-18" y="-2" width="16" height="4" rx="2" fill="#000000" />
                <rect x="2" y="-2" width="16" height="4" rx="2" fill="#000000" />
                <rect x="-18" y="5" width="16" height="4" rx="2" fill="#000000" />
                <rect x="2" y="5" width="16" height="4" rx="2" fill="#000000" />
              </g>
            </svg>
          </div>
        </motion.div>

        {/* Title & Tagline */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 mb-7"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
            <span>대한민국 태극기 퍼즐</span>
            <span className="text-base">🇰🇷</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight drop-shadow-sm">
            태극기 맞추기 놀이
          </h1>

          <p className="text-sm sm:text-base font-bold text-slate-600 max-w-md mx-auto">
            빨강·파랑 태극 문양과 네 개의 괘를 쏙쏙 맞춰보아요!
          </p>
        </motion.div>

        {/* Huge, Fun, Primary "게임 스타트" Button */}
        <motion.button
          type="button"
          onClick={() => {
            sounds.playSelect();
            onStartGame();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: 'spring' }}
          className="w-full max-w-sm py-4 sm:py-5 px-8 rounded-3xl bg-gradient-to-r from-red-500 via-amber-500 to-blue-600 hover:from-red-600 hover:via-amber-600 hover:to-blue-700 text-white font-black text-xl sm:text-2xl tracking-wide shadow-xl hover:shadow-2xl border-4 border-white cursor-pointer active:scale-95 flex items-center justify-center gap-3 transition-all ring-4 ring-amber-300/80 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
            <Play className="w-6 h-6 fill-current text-amber-200 ml-0.5" />
          </div>
          <span>게임 스타트!</span>
          <span className="text-2xl animate-bounce">🎮</span>
        </motion.button>

        {/* Friendly Character Cheer Message for 5-year-old kindergarten children */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-2 border-slate-200 shadow-sm max-w-lg w-full"
        >
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-lg">🌸</span>
            <span className="text-xs sm:text-sm font-black text-slate-800">
              유관순 누나 · 안중근 삼촌 · 안창호 선생님 · 윤봉길 삼촌
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 font-semibold">
            “태극기를 멋지게 완성하면 자랑스러운 독립 영웅들이 신나게 칭찬해 줘요!”
          </p>
        </motion.div>
      </div>

      {/* Bottom Educational Footnote */}
      <div className="relative z-10 w-full max-w-4xl text-center py-2 text-xs text-slate-500 font-medium">
        <span>🇰🇷 1단계(터치) · 2단계(드래그) · 3단계(괘 조립)로 재미있게 배워요!</span>
      </div>
    </div>
  );
};
