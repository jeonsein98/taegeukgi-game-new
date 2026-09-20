import { BarSlotKey, BarSlotInfo, TrigramType, BarType } from '../types';

export interface BarSlotWithCoord extends BarSlotInfo {
  cx: number;
  cy: number;
}

export const BAR_SLOTS: Record<BarSlotKey, BarSlotWithCoord> = {
  // 1. 건괘 (乾 ☰, 좌상단): 모두 긴 막대 (solid) - 효는 대각선과 직각 (-56.31도)
  'geon-0': {
    key: 'geon-0',
    trigram: 'geon',
    trigramName: '건괘 (하늘 ☰)',
    barIndex: 0,
    barIndexName: '위쪽 줄',
    requiredType: 'solid',
    label: '건괘 위쪽 줄 (긴 막대 ㅡ)',
    cx: 189.99,
    cy: 126.66,
  },
  'geon-1': {
    key: 'geon-1',
    trigram: 'geon',
    trigramName: '건괘 (하늘 ☰)',
    barIndex: 1,
    barIndexName: '가운데 줄',
    requiredType: 'solid',
    label: '건괘 가운데 줄 (긴 막대 ㅡ)',
    cx: 221.19,
    cy: 147.46,
  },
  'geon-2': {
    key: 'geon-2',
    trigram: 'geon',
    trigramName: '건괘 (하늘 ☰)',
    barIndex: 2,
    barIndexName: '아래쪽 줄',
    requiredType: 'solid',
    label: '건괘 아래쪽 줄 (긴 막대 ㅡ)',
    cx: 252.39,
    cy: 168.26,
  },

  // 2. 곤괘 (坤 ☷, 우하단): 모두 짧은 막대 (broken) - 효는 대각선과 직각 (-56.31도)
  'gon-0': {
    key: 'gon-0',
    trigram: 'gon',
    trigramName: '곤괘 (땅 ☷)',
    barIndex: 0,
    barIndexName: '위쪽 줄',
    requiredType: 'broken',
    label: '곤괘 위쪽 줄 (짧은 막대 - -)',
    cx: 647.61,
    cy: 431.74,
  },
  'gon-1': {
    key: 'gon-1',
    trigram: 'gon',
    trigramName: '곤괘 (땅 ☷)',
    barIndex: 1,
    barIndexName: '가운데 줄',
    requiredType: 'broken',
    label: '곤괘 가운데 줄 (짧은 막대 - -)',
    cx: 678.81,
    cy: 452.54,
  },
  'gon-2': {
    key: 'gon-2',
    trigram: 'gon',
    trigramName: '곤괘 (땅 ☷)',
    barIndex: 2,
    barIndexName: '아래쪽 줄',
    requiredType: 'broken',
    label: '곤괘 아래쪽 줄 (짧은 막대 - -)',
    cx: 710.01,
    cy: 473.34,
  },

  // 3. 감괘 (坎 ☵, 우상단): 위-짧은막대, 가운데-긴막대, 아래-짧은막대 - 효는 대각선과 직각 (+56.31도)
  'gam-0': {
    key: 'gam-0',
    trigram: 'gam',
    trigramName: '감괘 (물 ☵)',
    barIndex: 0,
    barIndexName: '위쪽 줄',
    requiredType: 'broken',
    label: '감괘 위쪽 줄 (짧은 막대 - -)',
    cx: 710.01,
    cy: 126.66,
  },
  'gam-1': {
    key: 'gam-1',
    trigram: 'gam',
    trigramName: '감괘 (물 ☵)',
    barIndex: 1,
    barIndexName: '가운데 줄',
    requiredType: 'solid',
    label: '감괘 가운데 줄 (긴 막대 ㅡ)',
    cx: 678.81,
    cy: 147.46,
  },
  'gam-2': {
    key: 'gam-2',
    trigram: 'gam',
    trigramName: '감괘 (물 ☵)',
    barIndex: 2,
    barIndexName: '아래쪽 줄',
    requiredType: 'broken',
    label: '감괘 아래쪽 줄 (짧은 막대 - -)',
    cx: 647.61,
    cy: 168.26,
  },

  // 4. 리괘 (離 ☲, 좌하단): 위-긴막대, 가운데-짧은막대, 아래-긴막대 - 효는 대각선과 직각 (+56.31도)
  'ri-0': {
    key: 'ri-0',
    trigram: 'ri',
    trigramName: '리괘 (불 ☲)',
    barIndex: 0,
    barIndexName: '위쪽 줄',
    requiredType: 'solid',
    label: '리괘 위쪽 줄 (긴 막대 ㅡ)',
    cx: 252.39,
    cy: 431.74,
  },
  'ri-1': {
    key: 'ri-1',
    trigram: 'ri',
    trigramName: '리괘 (불 ☲)',
    barIndex: 1,
    barIndexName: '가운데 줄',
    requiredType: 'broken',
    label: '리괘 가운데 줄 (짧은 막대 - -)',
    cx: 221.19,
    cy: 452.54,
  },
  'ri-2': {
    key: 'ri-2',
    trigram: 'ri',
    trigramName: '리괘 (불 ☲)',
    barIndex: 2,
    barIndexName: '아래쪽 줄',
    requiredType: 'solid',
    label: '리괘 아래쪽 줄 (긴 막대 ㅡ)',
    cx: 189.99,
    cy: 473.34,
  },
};

export const ALL_BAR_SLOT_KEYS: BarSlotKey[] = [
  'geon-0', 'geon-1', 'geon-2',
  'gon-0', 'gon-1', 'gon-2',
  'gam-0', 'gam-1', 'gam-2',
  'ri-0', 'ri-1', 'ri-2',
];

export const TRIGRAM_NAMES: Record<TrigramType, { name: string; meaning: string; symbol: string }> = {
  geon: { name: '건괘', meaning: '하늘(천), 봄, 정의 (3개 모두 긴 막대)', symbol: '☰' },
  gon: { name: '곤괘', meaning: '땅(지), 여름, 풍요 (3개 모두 짧은 막대)', symbol: '☷' },
  gam: { name: '감괘', meaning: '물(수), 겨울, 지혜 (가운데만 긴 막대)', symbol: '☵' },
  ri: { name: '리괘', meaning: '불(화), 가을, 광명 (위/아래가 긴 막대)', symbol: '☲' },
};
