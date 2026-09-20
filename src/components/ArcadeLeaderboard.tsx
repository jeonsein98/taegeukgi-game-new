import React, { useState } from 'react';
import { GameMode, ArcadeRankRecord } from '../types';
import {
  getRankingRecords,
  deleteRankingRecord,
  resetRankingRecords,
  formatRankingTime,
  getFriendlyModeName,
} from '../utils/ranking';
import { sounds } from '../utils/audio';
import {
  Trophy,
  Medal,
  Clock,
  Sparkles,
  Trash2,
  RotateCcw,
  X,
  Flame,
} from 'lucide-react';

interface ArcadeLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  highlightRecordId?: string | null;
  initialFilterMode?: GameMode | 'all';
}

export const ArcadeLeaderboard: React.FC<ArcadeLeaderboardProps> = ({
  isOpen,
  onClose,
  highlightRecordId = null,
  initialFilterMode = 'all',
}) => {
  const [filter, setFilter] = useState<GameMode | 'all'>(initialFilterMode);
  const [records, setRecords] = useState<ArcadeRankRecord[]>(() => getRankingRecords());
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter and sort records by elapsedSeconds ascending (fastest first)
  const filteredRecords = records
    .filter((r) => {
      if (filter === 'all') return true;
      const normMode = r.mode === 'click' ? 'level1' : r.mode;
      const normFilter = filter === 'click' ? 'level1' : filter;
      return normMode === normFilter;
    })
    .sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playWrong();
    const updated = deleteRankingRecord(id);
    setRecords(updated);
  };

  const handleReset = () => {
    sounds.playSnap();
    const reset = resetRankingRecords();
    setRecords(reset);
    setConfirmReset(false);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-900 font-black text-sm shadow-md ring-2 ring-amber-200">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-black text-sm shadow-md ring-2 ring-slate-100">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black text-sm shadow-md ring-2 ring-amber-400/40">
          🥉 3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-xs border border-slate-300">
        {rank}위
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Retro Arcade Header */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-4 sm:p-5 text-white relative shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/40 shadow-inner">
              <Trophy className="w-7 h-7 text-amber-300 drop-shadow-md animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-200 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ARCADE HALL OF FAME</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm flex items-center gap-2">
                <span>🎮 오락실 명예의 전당</span>
                <span className="text-xs bg-amber-400/90 text-slate-900 px-2 py-0.5 rounded-full font-black">
                  실시간 순위표
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="p-3 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl">
            {(
              [
                { id: 'all', label: '전체 순위', icon: '🏆' },
                { id: 'level1', label: '1단계 터치', icon: '👆' },
                { id: 'drag', label: '2단계 드래그', icon: '🖐️' },
                { id: 'level3', label: '3단계 괘조립', icon: '🧩' },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sounds.playSelect();
                    setFilter(tab.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-300/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-xs font-bold text-slate-500">
            총 {filteredRecords.length}명 기록 누적
          </span>
        </div>

        {/* Rankings Table / List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-2xl">
                🕹️
              </div>
              <p className="font-bold text-sm">아직 이 단계의 기록이 없어요!</p>
              <p className="text-xs text-slate-500">태극기를 완성하고 첫 번째 1위 주인공이 되어보세요!</p>
            </div>
          ) : (
            filteredRecords.map((rec, index) => {
              const rank = index + 1;
              const isHighlighted = highlightRecordId === rec.id;
              const modeInfo = getFriendlyModeName(rec.mode);

              return (
                <div
                  key={rec.id}
                  className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                    isHighlighted
                      ? 'bg-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-300 animate-pulse'
                      : rank === 1
                      ? 'bg-gradient-to-r from-amber-50/90 via-yellow-50/50 to-white border-amber-300 shadow-xs'
                      : rank === 2
                      ? 'bg-gradient-to-r from-slate-50/90 to-white border-slate-300 shadow-xs'
                      : rank === 3
                      ? 'bg-gradient-to-r from-orange-50/70 to-white border-amber-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Left: Rank & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    {getRankBadge(rank)}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 text-sm sm:text-base truncate">
                          {rec.name}
                        </span>
                        {isHighlighted && (
                          <span className="px-2 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-full uppercase tracking-wider animate-bounce">
                            방금 달성! 🎉
                          </span>
                        )}
                        {rank === 1 && !isHighlighted && (
                          <span className="px-1.5 py-0.5 bg-amber-400/90 text-amber-950 font-black text-[10px] rounded-md flex items-center gap-0.5">
                            <Flame className="w-3 h-3 fill-amber-700" /> 최고기록
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span
                          className={`px-2 py-0.2 rounded-md font-bold border text-[10px] ${modeInfo.badgeColor}`}
                        >
                          {modeInfo.icon} {modeInfo.label}
                        </span>
                        <span>·</span>
                        <span>{rec.dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Record Clear Time & Delete Option */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 font-mono text-sm sm:text-base font-black text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatRankingTime(rec.elapsedSeconds)}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {rec.elapsedSeconds}초
                      </span>
                    </div>

                    {/* Quick delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(rec.id, e)}
                      title="이 기록 삭제"
                      className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 font-bold">정말 초기화할까요?</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-xs"
                >
                  네, 초기화
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>순위표 초기화</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
          >
            순위표 닫기 ✕
          </button>
        </div>
      </div>
    </div>
  );
};
