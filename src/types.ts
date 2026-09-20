export type PieceId = 
  | 'taegeuk-red' 
  | 'taegeuk-blue' 
  | 'geon' 
  | 'gon' 
  | 'gam' 
  | 'ri';

export type GameLevel = 'level1' | 'level2' | 'level3';
// Backward-compatible alias for existing code
export type GameMode = GameLevel | 'drag' | 'click';

export type TrigramType = 'geon' | 'gon' | 'gam' | 'ri';
export type BarType = 'solid' | 'broken'; // solid = 양효(긴 막대), broken = 음효(짧은 막대 2개)

export type BarSlotKey = 
  | 'geon-0' | 'geon-1' | 'geon-2'
  | 'gon-0' | 'gon-1' | 'gon-2'
  | 'gam-0' | 'gam-1' | 'gam-2'
  | 'ri-0' | 'ri-1' | 'ri-2';

export interface BarSlotInfo {
  key: BarSlotKey;
  trigram: TrigramType;
  trigramName: string;
  barIndex: 0 | 1 | 2; // 0: outer(위), 1: mid(가운데), 2: inner(아래)
  barIndexName: string;
  requiredType: BarType;
  label: string;
}

export interface PieceInfo {
  id: PieceId;
  name: string;
  shortName: string;
  symbol: string;
  hanja?: string;
  meaning: string;
  color: string;
  slotLabel: string;
  slotPosition: 'center-top' | 'center-bottom' | 'top-left' | 'bottom-right' | 'top-right' | 'bottom-left';
  description: string;
}

export interface AiResponseData {
  praiseMessage: string;
}

export interface GameRecord {
  studentName: string;
  elapsedSeconds: number;
  mode: GameMode;
  praiseMessage: string;
  timestamp: string;
  gasUrl?: string;
}

export interface ArcadeRankRecord {
  id: string;
  name: string;
  mode: GameMode;
  elapsedSeconds: number;
  timestamp: number;
  dateStr: string;
}

export type CelebrationCharacterType = 
  | 'ryu-gwan-sun' 
  | 'an-jung-geun' 
  | 'ahn-chang-ho'
  | 'yun-bong-gil'
  | 'kim-gu' 
  | 'dino' 
  | 'shark';
