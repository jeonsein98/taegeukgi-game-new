import React from 'react';
import { GameMode } from '../types';
import { Hand, MousePointerClick, Sparkles, Check, Layers, Star, Lightbulb } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ModeSelectorProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  showHints: boolean;
  onToggleHints: (enabled: boolean) => void;
  isFirstScreen?: boolean;
  onBackToStart?: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  showHints,
  onToggleHints,
  isFirstScreen = false,
  onBackToStart,
}) => {
  // Normalize currentMode for 1/2/3 levels
  const activeLevel =
    currentMode === 'level1' || currentMode === 'click'
      ? 'level1'
      : currentMode === 'level3'
      ? 'level3'
      : 'level2';

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border-4 border-amber-300 shadow-2xl text-center select-none">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-sm mb-3">
        <Sparkles className="w-4 h-4" />
        <span>🇰🇷 태극기 구성요소 맞추기</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
        {isFirstScreen ? '시작할 놀이 단계를 선택해 주세요!' : '놀이 단계를 골라주세요!'}
      </h2>
      <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-lg mx-auto mb-6">
        원하는 단계를 터치하면 태극기 맞추기가 시작됩니다.
      </p>

      {/* 3 Stage Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Stage 1: 1단계 (터치 모드) */}
        <button
          type="button"
          onClick={() => {
            sounds.playSelect();
            onSelectMode('level1');
          }}
          className={`p-5 rounded-3xl border-3 text-left transition-all flex flex-col justify-between cursor-pointer ${
            activeLevel === 'level1'
              ? 'bg-blue-50/90 border-blue-500 ring-4 ring-blue-300/80 shadow-lg scale-[1.02]'
              : 'bg-slate-50 hover:bg-blue-50/40 border-slate-200 hover:border-blue-300 shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <span className="bg-blue-100 text-blue-800 text-[11px] font-black px-2.5 py-1 rounded-full">
                1단계
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-lg font-black text-slate-900">
                1단계
              </h3>
            </div>
            <p className="text-xs font-bold text-blue-700 mb-2">
              (터치 모드)
            </p>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              조각을 1회 톡 터치한 뒤, 태극기 틀의 알맞은 자리를 1회 터치하면 자동으로 배치됩니다.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-bold">간편한 터치 조작</span>
            {activeLevel === 'level1' && (
              <span className="bg-blue-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> 선택됨
              </span>
            )}
          </div>
        </button>

        {/* Stage 2: 2단계 (드래그 모드) */}
        <button
          type="button"
          onClick={() => {
            sounds.playSelect();
            onSelectMode('level2');
          }}
          className={`p-5 rounded-3xl border-3 text-left transition-all flex flex-col justify-between cursor-pointer ${
            activeLevel === 'level2'
              ? 'bg-amber-50/90 border-amber-500 ring-4 ring-amber-300/80 shadow-lg scale-[1.02]'
              : 'bg-slate-50 hover:bg-amber-50/40 border-slate-200 hover:border-amber-300 shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Hand className="w-6 h-6 animate-pulse" />
              </div>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-1 rounded-full">
                2단계
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              2단계
            </h3>
            <p className="text-xs font-bold text-amber-700 mb-2">
              (드래그 모드)
            </p>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              손가락이나 펜으로 조각들을 직접 끌어서 태극기 제자리에 쏙 넣어보아요!
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-bold">드래그 앤 드롭</span>
            {activeLevel === 'level2' && (
              <span className="bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> 선택됨
              </span>
            )}
          </div>
        </button>

        {/* Stage 3: 3단계 (괘 조립 모드) */}
        <button
          type="button"
          onClick={() => {
            sounds.playSelect();
            onSelectMode('level3');
          }}
          className={`p-5 rounded-3xl border-3 text-left transition-all flex flex-col justify-between cursor-pointer ${
            activeLevel === 'level3'
              ? 'bg-purple-50/90 border-purple-500 ring-4 ring-purple-300/80 shadow-lg scale-[1.02]'
              : 'bg-slate-50 hover:bg-purple-50/40 border-slate-200 hover:border-purple-300 shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <span className="bg-purple-100 text-purple-800 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                3단계
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              3단계
            </h3>
            <p className="text-xs font-bold text-purple-700 mb-2">
              (괘 조립 모드)
            </p>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              건·곤·감·리의 긴 막대(양효 ㅡ)와 짧은 막대(음효 - -)를 하나하나 직접 붙여서 완성해요!
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
            <span className="text-[11px] text-purple-700 font-bold">4괘 막대 조립</span>
            {activeLevel === 'level3' && (
              <span className="bg-purple-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> 선택됨
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Auxiliary Options: Visual Hints Toggle */}
      <div className="bg-slate-50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-left border border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              학습 보조 가이드 선 (힌트) 표시
            </span>
            <p className="text-[11px] text-slate-500">
              틀 안에 알맞은 조각 모양과 연한 가이드 선을 비춰주어 쉬운 배치를 돕습니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playSelect();
            onToggleHints(!showHints);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            showHints
              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          }`}
        >
          {showHints ? '힌트 ON (켜짐)' : '힌트 OFF (꺼짐)'}
        </button>
      </div>

      {/* Back to Start Screen Button */}
      {onBackToStart && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              onBackToStart();
            }}
            className="px-5 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 mx-auto"
          >
            <span>← 처음 시작 화면으로 돌아가기</span>
          </button>
        </div>
      )}
    </div>
  );
};
