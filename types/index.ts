export type FastingDuration = 12 | 14 | 16 | 18 | 24;

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
  currentStreak: number;
  longestStreak: number;
}

export interface ActiveFast {
  startTime: Date;
  goalHours: FastingDuration;
  status: 'active';
}

export interface FastingRecord {
  id: string;
  startTime: Date;
  endTime: Date;
  goalHours: FastingDuration;
  achievedHours: number;
  completed: boolean;
  dateKey: string; // YYYY-MM-DD in user's local timezone at endTime
  status: 'completed' | 'abandoned';
}

export interface Phase {
  id: string;
  startHour: number; // inclusive [
  endHour: number;   // exclusive )
  name: string;
  koreanName: string;
  description: string;
  icon: string;
  colorToken: string;
  bgColor: string;
  textColor: string;
}

export interface Meal {
  id: string;
  name: string;
  koreanName: string;
  description: string;
  emoji: string;
  tag: string;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
}
