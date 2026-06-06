'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { GoalSelector } from '@/components/timer/GoalSelector';
import { RingTimer } from '@/components/timer/RingTimer';
import { FastingControls } from '@/components/timer/FastingControls';
import { FastingEffects } from '@/components/effects/FastingEffects';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useActiveFast } from '@/hooks/useActiveFast';
import { useFastingTick } from '@/hooks/useFastingTick';
import { startFast, stopFast } from '@/lib/firestore';
import type { FastingDuration } from '@/types';
import { FASTING_PHASES } from '@/data/fastingPhases';

const PHASE_COLORS: Record<number, string> = {
  0: '#94A3B8',
  1: '#3B82F6',
  2: '#F97316',
  3: '#EAB308',
  4: '#8B5CF6',
  5: '#10B981',
};

const NULL_TICK = {
  elapsed: 0,
  remaining: 0,
  progress: 0,
  complete: false,
  currentPhase: null as never,
  formattedRemaining: { hours: '00', minutes: '00', seconds: '00' },
  now: new Date(),
};

export default function TimerPage() {
  const { user } = useAuth();
  const { activeFast } = useActiveFast();
  const [goal, setGoal] = useState<FastingDuration>(16);
  const [actionLoading, setActionLoading] = useState(false);

  const rawTick = useFastingTick(activeFast);
  const tick = rawTick ?? NULL_TICK;

  const phaseIndex = tick.currentPhase
    ? FASTING_PHASES.findIndex(p => p.id === tick.currentPhase?.id)
    : 0;
  const phaseColor = PHASE_COLORS[Math.max(0, phaseIndex)] ?? '#94A3B8';

  const handleStart = useCallback(async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await startFast(user.uid, goal);
    } finally {
      setActionLoading(false);
    }
  }, [user, goal]);

  const handleStop = useCallback(async () => {
    if (!user || !activeFast) return;
    setActionLoading(true);
    try {
      await stopFast(user.uid, activeFast, tick.elapsed > 0);
    } finally {
      setActionLoading(false);
    }
  }, [user, activeFast, tick.elapsed]);

  const { hours: h, minutes: m, seconds: s } = tick.formattedRemaining;

  return (
    <AuthGuard>
      <main className="min-h-screen flex flex-col items-center pb-24 bg-gradient-to-b from-green-50 to-white">
        {/* Header */}
        <div className="w-full max-w-sm px-6 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">TwoFasting</h1>
              <p className="text-sm text-gray-400">
                {activeFast ? '단식 중 🔥' : '단식 준비 완료 🌿'}
              </p>
            </div>
            {user?.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt="profile"
                className="w-10 h-10 rounded-full border-2 border-green-200"
              />
            )}
          </div>
        </div>

        {/* Goal Selector */}
        <div className="w-full max-w-sm px-6 mb-8">
          <GoalSelector
            selected={activeFast ? activeFast.goalHours : goal}
            onChange={setGoal}
            disabled={!!activeFast}
          />
        </div>

        {/* Ring Timer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFast ? 'active' : 'idle'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-8"
          >
            <RingTimer
              progress={tick.progress}
              hours={h}
              minutes={m}
              seconds={s}
              isComplete={tick.complete}
              isBonusTime={tick.elapsed > (activeFast?.goalHours ?? 0)}
              phaseColor={phaseColor}
            />
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mb-10">
          <FastingControls
            isActive={!!activeFast}
            isComplete={tick.complete}
            onStart={handleStart}
            onStop={handleStop}
            loading={actionLoading}
          />
        </div>

        {/* Effects */}
        {activeFast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm px-6"
          >
            <FastingEffects
              elapsedHours={tick.elapsed}
              goalHours={activeFast.goalHours}
            />
          </motion.div>
        )}
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
