import { PieceInfo } from '../types';

export const TAEGEUKGI_PIECES: Record<string, PieceInfo> = {
  'taegeuk-red': {
    id: 'taegeuk-red',
    name: '빨간색 태극 (양 陽)',
    shortName: '빨강 태극',
    symbol: '🔴',
    hanja: '陽',
    meaning: '하늘, 존귀, 밝음',
    color: '#CD2E3A', // Official Taegeuk Red
    slotLabel: '태극 상단 (빨강)',
    slotPosition: 'center-top',
    description: '태극의 위쪽 빨간색은 존귀함과 햇살, 하늘의 밝은 기운(양)을 뜻해요.'
  },
  'taegeuk-blue': {
    id: 'taegeuk-blue',
    name: '파란색 태극 (음 陰)',
    shortName: '파랑 태극',
    symbol: '🔵',
    hanja: '陰',
    meaning: '땅, 희망, 바다, 조화',
    color: '#0047A0', // Official Taegeuk Blue
    slotLabel: '태극 하단 (파랑)',
    slotPosition: 'center-bottom',
    description: '태극의 아래쪽 파란색은 희망과 대지, 조화로운 기운(음)을 뜻해요.'
  },
  'geon': {
    id: 'geon',
    name: '건괘 (하늘 ☰)',
    shortName: '건괘',
    symbol: '☰',
    hanja: '乾',
    meaning: '하늘(天), 봄, 동쪽, 정의',
    color: '#111827',
    slotLabel: '건괘 (왼쪽 위 3줄)',
    slotPosition: 'top-left',
    description: '왼쪽 위(10시 방향)에 놓여요. 끊어지지 않은 긴 선 3개(양효 3개)로 이루어져 있어요.'
  },
  'gon': {
    id: 'gon',
    name: '곤괘 (땅 ☷)',
    shortName: '곤괘',
    symbol: '☷',
    hanja: '坤',
    meaning: '땅(地), 여름, 서쪽, 풍요',
    color: '#111827',
    slotLabel: '곤괘 (오른쪽 아래 6막대)',
    slotPosition: 'bottom-right',
    description: '오른쪽 아래(4시 방향)에 놓여요. 가운데가 끊어진 3줄(총 6개 짧은 막대, 음효 3개)이에요.'
  },
  'gam': {
    id: 'gam',
    name: '감괘 (물 ☵)',
    shortName: '감괘',
    symbol: '☵',
    hanja: '坎',
    meaning: '물(水), 겨울, 북쪽, 지혜',
    color: '#111827',
    slotLabel: '감괘 (오른쪽 위)',
    slotPosition: 'top-right',
    description: '오른쪽 위(2시 방향)에 놓여요. 위·아래는 끊어지고 가운데만 이어진 선이에요.'
  },
  'ri': {
    id: 'ri',
    name: '리괘 (불 ☲)',
    shortName: '리괘',
    symbol: '☲',
    hanja: '離',
    meaning: '불(火), 가을, 남쪽, 광명',
    color: '#111827',
    slotLabel: '리괘 (왼쪽 아래)',
    slotPosition: 'bottom-left',
    description: '왼쪽 아래(8시 방향)에 놓여요. 위·아래는 이어지고 가운데만 끊어진 선이에요.'
  }
};

export const PIECE_ORDER: string[] = [
  'taegeuk-red',
  'taegeuk-blue',
  'geon',
  'gon',
  'gam',
  'ri'
];
