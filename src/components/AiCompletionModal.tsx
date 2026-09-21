import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameMode, AiResponseData, ArcadeRankRecord, CelebrationCharacterType } from '../types';
import { sounds } from '../utils/audio';
import { CelebrationCharacters } from './CelebrationCharacters';
import { ArcadeLeaderboard } from './ArcadeLeaderboard';
import {
  addRankingRecord,
  formatRankingTime,
  getFriendlyModeName,
} from '../utils/ranking';
import {
  Trophy,
  Sparkles,
  Bot,
  Send,
  RotateCcw,
  Sheet,
  Medal,
  Flame,
  ListOrdered,
} from 'lucide-react';

interface AiCompletionModalProps {
  elapsedSeconds: number;
  mode: GameMode;
  onRestart: () => void;
  onSelectMode: (mode: GameMode) => void;
  celebrationCharacter?: CelebrationCharacterType;
}

export const AiCompletionModal: React.FC<AiCompletionModalProps> = ({
  elapsedSeconds,
  mode,
  onRestart,
  onSelectMode,
  celebrationCharacter = 'ryu-gwan-sun',
}) => {
  const [studentName, setStudentName] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiData, setAiData] = useState<AiResponseData | null>(null);
  const [gasUrl, setGasUrl] = useState<string>(
    typeof window !== 'undefined' ? (import.meta.env?.VITE_GAS_URL || '') : ''
  );
  const [isSavingGas, setIsSavingGas] = useState<boolean>(false);
  const [gasSaveStatus, setGasSaveStatus] = useState<string | null>(null);
  const [showGasConfig, setShowGasConfig] = useState<boolean>(false);

  // Arcade Ranking state
  const [rankResult, setRankResult] = useState<{
    record: ArcadeRankRecord;
    rankInMode: number;
    overallRank: number;
    totalInMode: number;
  } | null>(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);

  // Trigger celebratory confetti, fanfare, and rhythmic clapping when mounted
  useEffect(() => {
    sounds.playFanfare();
    const applauseTimer = setTimeout(() => {
      sounds.playApplause();
    }, 450);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#CD2E3A', '#0047A0', '#F59E0B', '#10B981', '#6366F1'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);

      return () => {
        clearTimeout(timer);
        clearTimeout(applauseTimer);
      };
    } catch {
      // Confetti fallback
    }
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m > 0 ? `${m}분 ` : ''}${s}초`;
  };

  // Submit Name: Register in Arcade Ranking & Request Gemini AI Praise
  const handleSubmitNameAndRank = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = studentName.trim() || '우리 친구';

    // 1. Register into persistent Arcade Leaderboard
    const rankingOutcome = addRankingRecord(finalName, mode, elapsedSeconds);
    setRankResult(rankingOutcome);

    // 2. Play arcade sound & festive burst
    sounds.playArcadeRank();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch {}

    // 3. Request Gemini AI feedback
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: finalName,
          timeSpentSeconds: elapsedSeconds,
          mode: mode,
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        setAiData(result.data);
      } else {
        throw new Error('AI 응답 생성 실패');
      }
    } catch (err) {
      console.warn('Gemini request fallback:', err);
      // Client-side fallback
      setAiData({
        praiseMessage: `우리 ${finalName} 학생, 정말 대단해요! 🌟 태극기의 빨강, 파랑 태극과 4괘(건·곤·감·리)를 정확하게 조립해 냈네요! 오락실 명예의 전당에서도 멋진 활약을 펼쳤어요! 👍🇰🇷`,
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getModeLabel = (m: GameMode) => {
    if (m === 'level1' || m === 'click') return '1단계 : 터치 모드';
    if (m === 'level3') return '3단계 : 괘 조립 모드';
    return '2단계 : 드래그 모드';
  };

  // Send completion log to Google Apps Script Web App
  const handleSaveToGoogleSheet = async () => {
    setIsSavingGas(true);
    setGasSaveStatus(null);

    const payload = {
      studentName: studentName.trim() || '이름 미입력 학생',
      elapsedSeconds,
      mode: getModeLabel(mode),
      praiseMessage: aiData?.praiseMessage || '태극기 퍼즐 완성',
      gasUrl: gasUrl.trim() || undefined,
    };

    try {
      const res = await fetch('/api/gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setGasSaveStatus('✅ 구글 시트에 성공적으로 저장되었습니다!');
        sounds.playQuizCorrect();
      } else {
        setGasSaveStatus(`ℹ️ ${data.message || '저장 응답 확인'}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setGasSaveStatus(`⚠️ 전송 확인: ${errorMsg}`);
    } finally {
      setIsSavingGas(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 p-5 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2 border-2 border-white/40 shadow-inner">
            <Trophy className="w-9 h-9 text-amber-300 drop-shadow-md" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
            대한민국 태극기 완성! 🇰🇷
          </h2>
          <p className="text-sm text-amber-100 font-bold mt-1">
            소요 시간: {formatTime(elapsedSeconds)} · {getModeLabel(mode)}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Animated Celebration Character: Cute Dino or Shark clapping alternately */}
          <CelebrationCharacters character={celebrationCharacter} />

          {/* Level Selection Section: 다른 단계 선택 창 */}
          <div className="bg-amber-50/60 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-sm font-black text-slate-800">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>도전할 다른 단계 선택하기</span>
              </div>
              <span className="text-xs font-bold text-amber-800">원하는 단계를 누르면 바로 시작해요!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1단계 */}
              <button
                type="button"
                onClick={() => {
                  sounds.playSelect();
                  onSelectMode('level1');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  mode === 'level1' || mode === 'click'
                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xl">👆</span>
                    {mode === 'level1' || mode === 'click' ? (
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        방금 완료!
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        초급
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-slate-800">1단계 : 터치 모드</h4>
                  <p className="text-[11px] font-semibold text-slate-600 mt-1 leading-snug">
                    조각 터치 후 태극기 자리를 톡! (쉬움)
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                  <span className="inline-block text-xs font-black text-emerald-700">
                    {mode === 'level1' || mode === 'click' ? '이 단계 다시하기 ↺' : '1단계 시작하기 →'}
                  </span>
                </div>
              </button>

              {/* 2단계 */}
              <button
                type="button"
                onClick={() => {
                  sounds.playSelect();
                  onSelectMode('drag');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  mode === 'drag'
                    ? 'bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-300'
                    : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xl">🖐️</span>
                    {mode === 'drag' ? (
                      <span className="text-[10px] font-black bg-sky-600 text-white px-2 py-0.5 rounded-full">
                        방금 완료!
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        중급
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-slate-800">2단계 : 드래그 모드</h4>
                  <p className="text-[11px] font-semibold text-slate-600 mt-1 leading-snug">
                    손가락이나 마우스로 조각 끌어다 놓기 (보통)
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                  <span className="inline-block text-xs font-black text-sky-700">
                    {mode === 'drag' ? '이 단계 다시하기 ↺' : '2단계 시작하기 →'}
                  </span>
                </div>
              </button>

              {/* 3단계 */}
              <button
                type="button"
                onClick={() => {
                  sounds.playSelect();
                  onSelectMode('level3');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  mode === 'level3'
                    ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-300'
                    : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xl">🧩</span>
                    {mode === 'level3' ? (
                      <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-full">
                        방금 완료!
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        마스터
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-slate-800">3단계 : 4괘 조립 모드</h4>
                  <p className="text-[11px] font-semibold text-slate-600 mt-1 leading-snug">
                    양효(ㅡ)와 음효(- -) 12개 막대 직접 조립 (도전!)
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                  <span className="inline-block text-xs font-black text-purple-700">
                    {mode === 'level3' ? '이 단계 다시하기 ↺' : '3단계 시작하기 →'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Step 1: Student Name Input & Arcade Ranking Entry */}
          {!rankResult ? (
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-5 text-center shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-amber-800 font-black text-xs sm:text-sm mb-1 uppercase tracking-wide">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>🎮 오락실 명예의 전당 & 순위표 등록</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-1">
                친구 이름을 입력하고 순위에 올려보세요!
              </h3>
              <p className="text-xs text-slate-600 font-semibold mb-4">
                클리어 타임 <span className="font-mono font-bold text-amber-700">{formatTime(elapsedSeconds)}</span> 기록이 우리 반 순위표에 누적 저장됩니다.
              </p>

              <form onSubmit={handleSubmitNameAndRank} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="이름 또는 별명 (예: 김민준, 태극용사)"
                    maxLength={20}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="flex-1 px-4 py-3 bg-white border-2 border-amber-300 focus:border-amber-500 rounded-xl text-base font-bold text-slate-800 outline-none shadow-xs text-center"
                  />
                  <button
                    type="submit"
                    disabled={isLoadingAi}
                    className="px-5 py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 active:scale-95 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    <Trophy className="w-4 h-4 text-amber-200" />
                    <span>순위 올리기 🚀</span>
                  </button>
                </div>

                {/* Quick Name Chips for iPad Touch */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs pt-1">
                  <span className="text-slate-600 font-semibold">간편 선택:</span>
                  {['민준이', '서연이', '예준이', '지우', '태극영웅', '우리 친구'].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setStudentName(name)}
                      className="bg-white hover:bg-amber-100 active:scale-95 text-slate-700 font-bold px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer transition-all text-xs"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </form>
            </div>
          ) : (
            /* Step 2: Arcade High Score Badge + AI Praise Display */
            <div className="space-y-4">
              {/* Arcade Rank Badge Card */}
              <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-0.75 rounded-2xl shadow-md">
                <div className="bg-white rounded-[14px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-900 shadow-md ring-4 ring-amber-100 shrink-0">
                      {rankResult.rankInMode === 1 ? (
                        <span className="text-2xl font-black">🥇</span>
                      ) : rankResult.rankInMode === 2 ? (
                        <span className="text-2xl font-black">🥈</span>
                      ) : rankResult.rankInMode === 3 ? (
                        <span className="text-2xl font-black">🥉</span>
                      ) : (
                        <span className="text-xl font-black">{rankResult.rankInMode}위</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {getFriendlyModeName(mode).label}
                        </span>
                        <span className="text-xs font-bold text-slate-400">· {formatTime(elapsedSeconds)}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-0.5">
                        🎉 <span className="text-indigo-600">{rankResult.record.name}</span> 친구,{' '}
                        <span className="text-amber-600 font-black">{rankResult.rankInMode}위</span> 달성!
                      </h3>
                      <p className="text-xs text-slate-600 font-semibold">
                        {rankResult.rankInMode === 1
                          ? '🌟 축하합니다! 이 단계의 최고 신기록(1위)을 달성했어요!'
                          : `현재 ${rankResult.totalInMode}명의 기록 중 ${rankResult.rankInMode}위에 이름을 올렸습니다.`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playSelect();
                      setShowLeaderboardModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all"
                  >
                    <ListOrdered className="w-4 h-4" />
                    <span>오락실 전체 순위표 보기 🏆</span>
                  </button>
                </div>
              </div>

              {/* Personalized AI Praise Box */}
              {isLoadingAi ? (
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 text-center flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold text-slate-600">
                    선생님 AI가 {rankResult.record.name} 친구를 위한 칭찬 메시지를 작성하고 있어요...
                  </span>
                </div>
              ) : aiData ? (
                <div className="bg-gradient-to-br from-red-50 via-amber-50 to-blue-50 border-2 border-amber-300/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-2 text-amber-700 font-black text-xs uppercase tracking-wide">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>Gemini AI 선생님의 따뜻한 칭찬</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                    "{aiData.praiseMessage}"
                  </p>
                </div>
              ) : null}

              {/* Google Sheets Save Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                    <Sheet className="w-4 h-4 text-emerald-600" />
                    <span>구글 스프레드시트 학습 기록</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGasConfig(!showGasConfig)}
                    className="text-[11px] text-slate-700 hover:text-slate-900 underline cursor-pointer"
                  >
                    {showGasConfig ? '설정 닫기' : 'GAS URL 설정'}
                  </button>
                </div>

                {showGasConfig && (
                  <div className="mb-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Google Apps Script Web App 배포 URL:
                    </label>
                    <input
                      type="url"
                      value={gasUrl}
                      onChange={(e) => setGasUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-700 outline-none"
                    />
                    <p className="text-[10px] text-slate-700">
                      환경변수 NEXT_PUBLIC_GAS_URL이 설정되어 있으면 비워두셔도 자동 전송됩니다.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleSaveToGoogleSheet}
                    disabled={isSavingGas}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSavingGas ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>전송 중...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>구글 시트에 기록 저장하기</span>
                      </>
                    )}
                  </button>

                  {gasSaveStatus && (
                    <span className="text-xs font-bold text-slate-700">
                      {gasSaveStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-500">
            💡 위에서 도전하고 싶은 단계를 누르면 새로운 게임이 시작됩니다!
          </p>
          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              onRestart();
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-extrabold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer text-sm ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>현재 단계 다시하기</span>
          </button>
        </div>
      </div>

      {/* Arcade Leaderboard Modal */}
      <ArcadeLeaderboard
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        highlightRecordId={rankResult?.record.id}
        initialFilterMode={mode}
      />
    </div>
  );
};
