import { ArcadeRankRecord, GameMode } from '../types';

const STORAGE_KEY = 'taegeukgi_arcade_ranking_user_records_v2';

// No mock data or simulated players. Starts completely clean so only real player records persist!
export const INITIAL_ARCADE_RECORDS: ArcadeRankRecord[] = [];

// Helper to normalize mode keys so level1 and legacy click match accurately
export function normalizeModeKey(m: string): 'level1' | 'drag' | 'level3' {
  if (m === 'click' || m === 'level1') return 'level1';
  if (m === 'level3') return 'level3';
  return 'drag';
}

export function getRankingRecords(): ArcadeRankRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Clear legacy storage key if present to remove old mock players ('태극마스터', '대한민국만세', '새싹태극이')
      const legacyRaw = localStorage.getItem('taegeukgi_arcade_ranking_records_v1');
      if (legacyRaw) {
        try {
          const parsedLegacy = JSON.parse(legacyRaw);
          if (Array.isArray(parsedLegacy)) {
            // Filter out any mock seed items
            const realUserOnly = parsedLegacy.filter(
              (r) => r && !r.id?.startsWith('seed-') && r.dateStr !== '명예의 전당'
            );
            if (realUserOnly.length > 0) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(realUserOnly));
              return realUserOnly;
            }
          }
        } catch {
          // ignore error
        }
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any seed mock records that might have slipped in
      return parsed.filter(
        (r) => r && !r.id?.startsWith('seed-') && r.dateStr !== '명예의 전당'
      );
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
    const cleanRecords = records.filter(
      (r) => r && !r.id?.startsWith('seed-') && r.dateStr !== '명예의 전당'
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanRecords));
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
  const newRecord: ArcadeRankRecord = {
    id: `rank-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    mode,
    elapsedSeconds: Math.max(1, elapsedSeconds),
    timestamp: Date.now(),
    dateStr,
  };

  const updated = [newRecord, ...current];
  saveRankingRecords(updated);

  // Calculate accurate rank within the specific stage/mode (sorted by elapsedSeconds ascending, tie-breaker: timestamp ascending)
  const targetNorm = normalizeModeKey(mode);
  const modeRecords = updated
    .filter((r) => normalizeModeKey(r.mode) === targetNorm)
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
    rankInMode,
    overallRank,
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

export function getFriendlyModeName(m: GameMode): { label: string; badgeColor: string; icon: string } {
  const norm = normalizeModeKey(m);
  if (norm === 'level1') {
    return {
      label: '1단계 터치',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: '👆',
    };
  }
  if (norm === 'drag') {
    return {
      label: '2단계 드래그',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: '🖐️',
    };
  }
  return {
    label: '3단계 괘조립',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '🧩',
  };
}

