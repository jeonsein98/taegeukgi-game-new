import { ArcadeRankRecord, GameMode } from '../types';

const CURRENT_STORAGE_KEY = 'taegeukgi_arcade_ranking_user_records_v4';
const OLD_STORAGE_KEYS = [
  'taegeukgi_arcade_ranking_records_v1',
  'taegeukgi_arcade_ranking_user_records_v2',
  'taegeukgi_arcade_ranking_user_records_v3',
];

// No mock data or simulated players. Starts completely clean so only real player records persist!
export const INITIAL_ARCADE_RECORDS: ArcadeRankRecord[] = [];

// Helper to normalize mode keys so level1, level2, level3 match accurately across legacy 'click' / 'drag'
export type NormalizedStageKey = 'level1' | 'level2' | 'level3';

export function normalizeModeKey(m: string): NormalizedStageKey {
  if (m === 'click' || m === 'level1') return 'level1';
  if (m === 'level3') return 'level3';
  return 'level2'; // 'level2' or legacy 'drag'
}

// Check and filter out any dummy / seed / example records like '새싹태극이'
const MOCK_NAMES = [
  '새싹태극이',
  '태극마스터',
  '대한민국만세',
  '태극꿈나무',
  '독립만세',
  '예시',
  '샘플',
  '새싹',
];

export function isRealUserRecord(r: any): boolean {
  if (!r || typeof r !== 'object') return false;
  if (typeof r.name !== 'string') return false;
  const trimmed = r.name.trim();
  if (!trimmed) return false;
  for (const mock of MOCK_NAMES) {
    if (trimmed.includes(mock)) return false;
  }
  if (typeof r.id === 'string' && r.id.startsWith('seed-')) return false;
  if (r.dateStr === '명예의 전당') return false;
  return true;
}

export function getRankingRecords(): ArcadeRankRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CURRENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(isRealUserRecord);
      }
    }

    // Check older keys to rescue real user entries while strictly eliminating mock data
    for (const oldKey of OLD_STORAGE_KEYS) {
      const oldRaw = localStorage.getItem(oldKey);
      if (oldRaw) {
        try {
          const parsedOld = JSON.parse(oldRaw);
          if (Array.isArray(parsedOld)) {
            const realOnly = parsedOld.filter(isRealUserRecord);
            if (realOnly.length > 0) {
              localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(realOnly));
              OLD_STORAGE_KEYS.forEach((k) => {
                try { localStorage.removeItem(k); } catch {}
              });
              return realOnly;
            }
          }
        } catch {}
        try { localStorage.removeItem(oldKey); } catch {}
      }
    }
    return [];
  } catch (err) {
    console.warn('Failed to load ranking records from localStorage:', err);
    return [];
  }
}

export function saveRankingRecords(records: ArcadeRankRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanRecords = records.filter(isRealUserRecord);
    localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(cleanRecords));
    OLD_STORAGE_KEYS.forEach((k) => {
      try { localStorage.removeItem(k); } catch {}
    });
  } catch (err) {
    console.warn('Failed to save ranking records to localStorage:', err);
  }
}

export function addRankingRecord(
  name: string,
  mode: GameMode,
  elapsedSeconds: number
): {
  record: ArcadeRankRecord;
  rankInMode: number;
  overallRank: number;
  totalInMode: number;
  allRecords: ArcadeRankRecord[];
} {
  const current = getRankingRecords();
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const cleanName = name.trim() || '우리 친구';
  const stageKey = normalizeModeKey(mode);
  const newRecord: ArcadeRankRecord = {
    id: `rank-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    mode: stageKey,
    elapsedSeconds: Math.max(1, elapsedSeconds),
    timestamp: Date.now(),
    dateStr,
  };

  const updated = [newRecord, ...current].filter(isRealUserRecord);
  saveRankingRecords(updated);

  // Calculate accurate rank within the specific stage/mode (sorted by elapsedSeconds ascending, tie-breaker: timestamp ascending)
  const modeRecords = updated
    .filter((r) => normalizeModeKey(r.mode) === stageKey)
    .sort((a, b) => {
      if (a.elapsedSeconds !== b.elapsedSeconds) {
        return a.elapsedSeconds - b.elapsedSeconds;
      }
      return a.timestamp - b.timestamp;
    });

  const rankInMode = modeRecords.findIndex((r) => r.id === newRecord.id) + 1;

  // Calculate accurate overall rank across all modes
  const overallSorted = [...updated].sort((a, b) => {
    if (a.elapsedSeconds !== b.elapsedSeconds) {
      return a.elapsedSeconds - b.elapsedSeconds;
    }
    return a.timestamp - b.timestamp;
  });
  const overallRank = overallSorted.findIndex((r) => r.id === newRecord.id) + 1;

  return {
    record: newRecord,
    rankInMode: Math.max(1, rankInMode),
    overallRank: Math.max(1, overallRank),
    totalInMode: modeRecords.length,
    allRecords: updated,
  };
}

export function deleteRankingRecord(id: string): ArcadeRankRecord[] {
  const current = getRankingRecords();
  const filtered = current.filter((r) => r.id !== id);
  saveRankingRecords(filtered);
  return filtered;
}

export function resetRankingRecords(): ArcadeRankRecord[] {
  saveRankingRecords([]);
  return [];
}

export function formatRankingTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) {
    return `${m}분 ${s < 10 ? `0${s}` : s}초`;
  }
  return `${s}초`;
}

export function getFriendlyModeName(m: GameMode): { label: string; stageName: string; badgeColor: string; icon: string } {
  const norm = normalizeModeKey(m);
  if (norm === 'level1') {
    return {
      label: '1단계 터치',
      stageName: '1단계 : 터치 모드',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '👆',
    };
  }
  if (norm === 'level2') {
    return {
      label: '2단계 드래그',
      stageName: '2단계 : 드래그 모드',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: '🖐️',
    };
  }
  return {
    label: '3단계 괘조립',
    stageName: '3단계 : 4괘 조립 모드',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '🧩',
  };
}

