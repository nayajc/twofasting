'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useActiveFast } from '@/hooks/useActiveFast';
import { useFastingTick } from '@/hooks/useFastingTick';
import { startFast, stopFast, getFastHistory } from '@/lib/firestore';
import { computeStreak } from '@/lib/fasting';
import type { FastingDuration, FastingRecord } from '@/types';
import { FASTING_PHASES } from '@/data/fastingPhases';

const GOALS: FastingDuration[] = [12, 16, 18, 20, 24];

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

function ArcTimer({ progress, color, size = 220, children }: {
  progress: number;
  color: string;
  size?: number;
  children: React.ReactNode;
}) {
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(progress, 1));

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default function TimerPage() {
  const { user } = useAuth();
  const { activeFast } = useActiveFast();
  const [goal, setGoal] = useState<FastingDuration>(16);
  const [actionLoading, setActionLoading] = useState(false);
  const [records, setRecords] = useState<FastingRecord[]>([]);

  const rawTick = useFastingTick(activeFast);
  const tick = rawTick ?? NULL_TICK;

  const phaseIndex = tick.currentPhase
    ? FASTING_PHASES.findIndex(p => p.id === tick.currentPhase?.id)
    : 0;
  const phaseColor = activeFast
    ? (PHASE_COLORS[Math.max(0, phaseIndex)] ?? '#94A3B8')
    : '#E5E7EB';

  useEffect(() => {
    if (!user) return;
    getFastHistory(user.uid).then(setRecords);
  }, [user, activeFast]);

  const completed = records.filter(r => r.completed);
  const streak = computeStreak(completed);
  const totalDays = completed.length;

  const handleStart = useCallback(async () => {
    if (!user) return;
    setActionLoading(true);
    try { await startFast(user.uid, goal); }
    finally { setActionLoading(false); }
  }, [user, goal]);

  const handleStop = useCallback(async () => {
    if (!user || !activeFast) return;
    setActionLoading(true);
    try { await stopFast(user.uid, activeFast, tick.elapsed > 0); }
    finally { setActionLoading(false); }
  }, [user, activeFast, tick.elapsed]);

  const { hours: h, minutes: m, seconds: s } = tick.formattedRemaining;

  const startHour = activeFast
    ? activeFast.startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : null;
  const endHour = activeFast
    ? new Date(activeFast.startTime.getTime() + activeFast.goalHours * 3600000)
        .toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : null;

  const displayGoal = activeFast ? activeFast.goalHours : goal;

  const last7: { date: string; status: 'success' | 'fail' | 'none' }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const dayRecords = records.filter(r => r.dateKey === key);
    const status = dayRecords.some(r => r.completed)
      ? 'success'
      : dayRecords.length > 0
        ? 'fail'
        : 'none';
    return { date: key, status };
  });

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 flex flex-col pb-24">
        {/* Header */}
        <div className="bg-white px-6 pt-14 pb-5 flex items-center justify-between shadow-[0_1px_0_#f0f0f0]">
          <div>
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">
              {activeFast ? '단식 진행 중' : '단식 준비'}
            </p>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">TwoFasting</h1>
          </div>
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="profile" className="w-9 h-9 rounded-full border border-gray-100" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-bold">
              {user?.displayName?.[0] ?? '?'}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-5 flex flex-col gap-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-gray-900">{streak.current}</div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">🔥 연속</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-gray-900">{totalDays}</div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">📅 총 일수</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-gray-900">{streak.longest}</div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">🏆 최장</div>
            </div>
          </div>

          {/* Main Timer Card */}
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col items-center gap-5">
            {/* Goal selector */}
            <div className="flex gap-2">
              {GOALS.map(g => (
                <button
                  key={g}
                  onClick={() => !activeFast && setGoal(g)}
                  disabled={!!activeFast}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                    displayGoal === g
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-400'
                  } ${activeFast ? 'cursor-default' : 'hover:bg-gray-200'}`}
                >
                  {g}h
                </button>
              ))}
            </div>

            {/* Arc Timer */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFast ? 'active' : 'idle'}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3 }}
              >
                <ArcTimer progress={tick.progress} color={phaseColor}>
                  {tick.complete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-5xl"
                    >🎉</motion.div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-0.5 tabular-nums">
                        <span className="text-4xl font-black text-gray-900">{h}</span>
                        <span className="text-xl font-bold text-gray-300 mx-0.5">:</span>
                        <span className="text-4xl font-black text-gray-900">{m}</span>
                        <span className="text-xl font-bold text-gray-300 mx-0.5">:</span>
                        <span className="text-4xl font-black text-gray-900">{s}</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 font-medium">
                        {activeFast
                          ? (tick.elapsed > (activeFast.goalHours) ? '🌟 보너스 타임' : '남은 시간')
                          : `목표 ${displayGoal}시간`}
                      </span>
                    </>
                  )}
                </ArcTimer>
              </motion.div>
            </AnimatePresence>

            {/* Start/End time */}
            {activeFast && (
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="font-medium">{startHour} 시작</span>
                <div className="h-px w-6 bg-gray-200" />
                <span className="font-medium">{endHour} 목표</span>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={activeFast ? handleStop : handleStart}
              disabled={actionLoading}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 ${
                activeFast
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-gray-800'
              }`}
            >
              {actionLoading
                ? '...'
                : activeFast
                  ? '단식 종료'
                  : '단식 시작'}
            </button>
          </div>

          {/* Phase card */}
          {activeFast && tick.currentPhase && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${phaseColor}20` }}
              >
                {tick.currentPhase.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{tick.currentPhase.name}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{tick.currentPhase.description}</p>
              </div>
            </motion.div>
          )}

          {/* Last 7 days */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-800">최근 7일</span>
              <span className="text-xs text-gray-400">{completed.filter(r => last7.some(d => d.date === r.dateKey)).length} / 7 완료</span>
            </div>
            <div className="flex gap-2">
              {last7.map(({ date, status }) => {
                const day = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { weekday: 'short' });
                const bg = status === 'success' ? 'bg-gray-900' : status === 'fail' ? 'bg-gray-300' : 'bg-gray-100';
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`w-full aspect-square rounded-lg ${bg}`} />
                    <span className="text-[10px] text-gray-400">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
