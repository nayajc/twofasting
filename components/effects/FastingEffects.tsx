'use client';
import { FASTING_PHASES } from '@/data/fastingPhases';
import { PhaseCard } from './PhaseCard';
import type { FastingDuration } from '@/types';

interface Props {
  elapsedHours: number;
  goalHours: FastingDuration;
}

export function FastingEffects({ elapsedHours, goalHours }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">단식 효과</h3>
      {FASTING_PHASES.map(phase => {
        const unlocked = elapsedHours >= phase.startHour;
        const active = elapsedHours >= phase.startHour && elapsedHours < phase.endHour;
        const done = elapsedHours >= phase.endHour;
        const state = done ? 'done' : active ? 'active' : 'locked';
        return <PhaseCard key={phase.id} phase={phase} state={state} />;
      })}
    </div>
  );
}
