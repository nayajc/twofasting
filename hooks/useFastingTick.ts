'use client';
import { useState, useEffect } from 'react';
import type { ActiveFast } from '@/types';
import {
  elapsedHours,
  remainingMs,
  progressFraction,
  isComplete,
  formatDuration,
} from '@/lib/fasting';
import { getCurrentPhase } from '@/data/fastingPhases';
import type { Phase } from '@/types';

interface FastingTick {
  elapsed: number;       // hours
  remaining: number;     // ms
  progress: number;      // 0-1
  complete: boolean;
  currentPhase: Phase;
  formattedRemaining: { hours: string; minutes: string; seconds: string };
  now: Date;
}

export function useFastingTick(activeFast: ActiveFast | null): FastingTick | null {
  const [tick, setTick] = useState<FastingTick | null>(null);

  useEffect(() => {
    if (!activeFast) {
      setTick(null);
      return;
    }

    const compute = () => {
      const now = new Date();
      const elapsed = elapsedHours(activeFast.startTime, now);
      const remaining = remainingMs(activeFast.startTime, activeFast.goalHours, now);
      const progress = progressFraction(activeFast.startTime, activeFast.goalHours, now);
      const complete = isComplete(activeFast.startTime, activeFast.goalHours, now);
      const phase = getCurrentPhase(elapsed);
      const formattedRemaining = formatDuration(remaining);
      setTick({ elapsed, remaining, progress, complete, currentPhase: phase, formattedRemaining, now });
    };

    compute();
    const interval = setInterval(compute, 1000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') compute();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [activeFast]);

  return tick;
}
