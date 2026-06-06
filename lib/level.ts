export interface Level {
  index: number;
  name: string;
  emoji: string;
  minDays: number;
  maxDays: number | null; // null = 최고 레벨
  color: string;
}

export const LEVELS: Level[] = [
  { index: 0, name: '배고픔 초보',  emoji: '🌱', minDays: 0,  maxDays: 9,   color: '#86EFAC' },
  { index: 1, name: '참기 장인',    emoji: '🔥', minDays: 10, maxDays: 29,  color: '#FCA5A5' },
  { index: 2, name: '위장 지배자',  emoji: '⚡', minDays: 30, maxDays: 59,  color: '#A78BFA' },
  { index: 3, name: '공복의 신',    emoji: '👑', minDays: 60, maxDays: null, color: '#FCD34D' },
];

export function getLevel(totalDays: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalDays >= LEVELS[i].minDays) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getLevelProgress(totalDays: number): {
  level: Level;
  next: Level | null;
  progress: number; // 0~1
  daysInLevel: number;
  daysToNext: number | null;
} {
  const level = getLevel(totalDays);
  const next = level.index < LEVELS.length - 1 ? LEVELS[level.index + 1] : null;
  const daysInLevel = totalDays - level.minDays;
  const levelRange = next ? next.minDays - level.minDays : 1;
  const progress = next ? Math.min(daysInLevel / levelRange, 1) : 1;
  const daysToNext = next ? next.minDays - totalDays : null;
  return { level, next, progress, daysInLevel, daysToNext };
}
