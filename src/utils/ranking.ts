import { ArcadeRankRecord, GameMode } from '../types';

const STORAGE_KEY = 'taegeukgi_arcade_ranking_records_v1';

export const INITIAL_ARCADE_RECORDS: ArcadeRankRecord[] = [
  {
    id: 'seed-1',
    name: '태극마스터 🌟',
    mode: 'level3',
    elapsedSeconds: 42,
    timestamp: Date.now() - 86400000 * 2,
    dateStr: '명예의 전당',
  },
  {
    id: 'seed-2',
    name: '대한민국만세 🇰🇷',
    mode: 'drag',
    elapsedSeconds: 24,
    timestamp: Date.now() - 86400000,
    dateStr: '명예의 전당',
  },
  {
    id: 'seed-3',
    name: '새싹태극이 🌱',
    mode: 'level1',
    elapsedSeconds: 16,
    timestamp: Date.now() - 3600000 * 5,
    dateStr: '명예의 전당',
  },
];

export function getRankingRecords(): ArcadeRankRecord[] {
  if (typeof window === 'undefined') return INITIAL_ARCADE_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ARCADE_RECORDS));
      return INITIAL_ARCADE_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ARCADE_RECORDS;
  } catch (err) {
    console.warn('Failed to load ranking records from localStorage:', err);
    return INITIAL_ARCADE_RECORDS;
  }
}

export function saveRankingRecords(records: ArcadeRankRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
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
  const dateStr = `${now.getMonth() + 1}.${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

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

  // Calculate rank within same mode (sorted by elapsedSeconds ascending)
  const normalizedMode = mode === 'click' ? 'level1' : mode;
  const modeRecords = updated
    .filter((r) => (r.mode === 'click' ? 'level1' : r.mode) === normalizedMode)
    .sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);

  const rankInMode = modeRecords.findIndex((r) => r.id === newRecord.id) + 1;

  // Calculate overall rank
  const overallSorted = [...updated].sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);
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
  saveRankingRecords(INITIAL_ARCADE_RECORDS);
  return INITIAL_ARCADE_RECORDS;
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
  if (m === 'level1' || m === 'click') {
    return {
      label: '1단계 터치',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: '👆',
    };
  }
  if (m === 'drag') {
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
