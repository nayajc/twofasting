import { format } from 'date-fns';
import type { FastingRecord } from '@/types';

export function elapsedHours(startTime: Date, now: Date): number {
  return Math.max(0, (now.getTime() - startTime.getTime()) / (1000 * 60 * 60));
}

export function remainingMs(startTime: Date, goalHours: number, now: Date): number {
  const goalMs = goalHours * 60 * 60 * 1000;
  const elapsed = now.getTime() - startTime.getTime();
  return Math.max(0, goalMs - elapsed);
}

export function progressFraction(startTime: Date, goalHours: number, now: Date): number {
  const goalMs = goalHours * 60 * 60 * 1000;
  const elapsed = now.getTime() - startTime.getTime();
  return Math.min(1, Math.max(0, elapsed / goalMs));
}

export function isComplete(startTime: Date, goalHours: number, now: Date): boolean {
  return elapsedHours(startTime, now) >= goalHours;
}

export function toDateKey(date: Date): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return format(date, 'yyyy-MM-dd');
}

export function formatDuration(ms: number): { hours: string; minutes: string; seconds: string } {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export function computeStreak(records: FastingRecord[]): { current: number; longest: number } {
  const completedDays = records
    .filter(r => r.completed && r.status === 'completed')
    .map(r => r.dateKey)
    .sort();

  const uniqueDays = [...new Set(completedDays)].sort();

  if (uniqueDays.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let current = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // Check if streak is current (includes today or yesterday)
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  const lastDay = uniqueDays[uniqueDays.length - 1];
  current = lastDay === today || lastDay === yesterday ? tempStreak : 0;

  return { current, longest };
}
