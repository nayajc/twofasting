'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useActiveFast } from '@/hooks/useActiveFast';
import { useFastingTick } from '@/hooks/useFastingTick';
import { startFast, stopFast, getFastHistory, updateFastStartTime } from '@/lib/firestore';
import { computeStreak } from '@/lib/fasting';
import { getLevelProgress } from '@/lib/level';
import type { FastingDuration, FastingRecord } from '@/types';
import { FASTING_PHASES } from '@/data/fastingPhases';

const GOALS: FastingDuration[] = [12, 14, 16, 18, 20, 24];

const QUOTES = [
  '배고픔은 지나가지만, 뱃살은 안 간다.',
  '단식은 돈도 안 들고 살도 빠지는 최고의 할인 행사.',
  '냉장고 문 열기 전에 내 인생부터 열어보자.',
  '먹지 않으면 살이 안 찐다… 이건 과학이다.',
  '야식 참으면 내일 아침 내가 나를 존경함.',
  '단식 1일차: 음식 광고가 다 나한테 말 거는 중.',
  '배고픔은 착각이다… 치킨은 진짜지만.',
  '지금 참으면 여름에 웃는다. 지금 먹으면 바지가 운다.',
  '입은 심심하지만 몸은 고마워하는 중.',
  '단식은 의지 테스트, 실패하면 치킨 테스트.',
  '한 끼 안 먹으면 통장도 다이어트 성공.',
  '배고플 때 물 마시면… 최소한 물은 안 찐다.',
  '먹을까 말까 고민될 땐, 이미 답은 \'말까\'다.',
  '단식은 자기관리, 야식은 자기파괴.',
  '내일의 내가 오늘의 나를 고소하지 않게 하자.',
  '음식은 도망 안 간다. 내 뱃살만 도망 안 간다.',
  '배고픔 10분 참으면 자존감 +1 상승.',
  '지금 먹으면 5분 행복, 안 먹으면 5kg 행복.',
  '단식 중엔 공기마저 맛있다. 문제는 칼로리가 0이라는 것.',
  '입을 닫으면 인생이 열린다 (일단 바지 지퍼부터).',
];

const PHASE_COLORS: Record<number, string> = {
  0: '#94A3B8', 1: '#3B82F6', 2: '#F97316',
  3: '#EAB308', 4: '#8B5CF6', 5: '#10B981',
};

const NULL_TICK = {
  elapsed: 0, remaining: 0, progress: 0, complete: false,
  currentPhase: null as never,
  formattedRemaining: { hours: '00', minutes: '00', seconds: '00' },
  formattedOvertime: null,
  now: new Date(),
};

function ArcTimer({ progress, color, size = 220, isBonus = false, children }: {
  progress: number; color: string; size?: number; isBonus?: boolean; children: React.ReactNode;
}) {
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(progress, 1));

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={isBonus ? '#FEE2E2' : '#F0F0F0'} strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={isBonus ? '#EF4444' : color} strokeWidth={10}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={isBonus ? 0 : offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// datetime-local 값 ↔ Date 변환 헬퍼
function toDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TimerPage() {
  const { user } = useAuth();
  const { activeFast } = useActiveFast();
  const [goal, setGoal] = useState<FastingDuration>(16);
  const [actionLoading, setActionLoading] = useState(false);
  const [records, setRecords] = useState<FastingRecord[]>([]);

  // Quote rotation
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const quoteTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start time editor
  const [editingStart, setEditingStart] = useState(false);
  const [editStartValue, setEditStartValue] = useState('');

  // Notification permission
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const requestNotifPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  useEffect(() => {
    quoteTimer.current = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => { setQuoteIndex(i => (i + 1) % QUOTES.length); setQuoteVisible(true); }, 400);
    }, 5000);
    return () => { if (quoteTimer.current) clearInterval(quoteTimer.current); };
  }, []);

  const rawTick = useFastingTick(activeFast);
  const tick = rawTick ?? NULL_TICK;

  // 완료 알림
  useEffect(() => {
    if (tick.complete && !notifiedRef.current) {
      notifiedRef.current = true;
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('🎉 단식 완료!', {
          body: `목표 ${activeFast?.goalHours}시간 달성했어요. 고마무라! 쫌!`,
          icon: '/icons/icon-192.svg',
        });
      }
    }
    if (!tick.complete) notifiedRef.current = false;
  }, [tick.complete, activeFast?.goalHours]);

  const phaseIndex = tick.currentPhase
    ? FASTING_PHASES.findIndex(p => p.id === tick.currentPhase?.id) : 0;
  const phaseColor = activeFast ? (PHASE_COLORS[Math.max(0, phaseIndex)] ?? '#94A3B8') : '#E5E7EB';

  useEffect(() => {
    if (!user) return;
    getFastHistory(user.uid).then(setRecords);
  }, [user, activeFast]);

  const completed = records.filter(r => r.completed);
  const streak = computeStreak(completed);
  const totalDays = new Set(completed.map(r => r.dateKey)).size;
  const levelInfo = getLevelProgress(totalDays);

  // 이번 달 달성률
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const thisMonthDays = new Set(
    completed.filter(r => r.dateKey.startsWith(thisMonthKey)).map(r => r.dateKey)
  ).size;
  const monthRate = Math.round((thisMonthDays / dayOfMonth) * 100);

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

  const handleEditStart = () => {
    if (!activeFast) return;
    setEditStartValue(toDatetimeLocal(activeFast.startTime));
    setEditingStart(true);
  };

  const handleSaveStart = async () => {
    if (!user || !editStartValue) return;
    const newStart = new Date(editStartValue);
    if (isNaN(newStart.getTime()) || newStart >= new Date()) return;
    setActionLoading(true);
    try { await updateFastStartTime(user.uid, newStart); }
    finally { setActionLoading(false); setEditingStart(false); }
  };

  const { hours: h, minutes: m, seconds: s } = tick.formattedRemaining;
  const displayGoal = activeFast ? activeFast.goalHours : goal;

  const startHour = activeFast
    ? activeFast.startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : null;
  const endHour = activeFast
    ? new Date(activeFast.startTime.getTime() + activeFast.goalHours * 3600000)
        .toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : null;

  const last7: { date: string; status: 'success' | 'fail' | 'none' }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const dayRecords = records.filter(r => r.dateKey === key);
    const status = dayRecords.some(r => r.completed) ? 'success' : dayRecords.length > 0 ? 'fail' : 'none';
    return { date: key, status };
  });

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 flex flex-col pb-24 relative">
        {/* Header */}
        <div className="bg-white px-6 pt-14 pb-5 shadow-[0_1px_0_#f0f0f0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">
                {activeFast ? '단식 진행 중' : '단식 준비'}
              </p>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">고마무라!</h1>
            </div>

            {/* 쫌! 로고 */}
            <div className="absolute left-1/2 -translate-x-1/2 top-8">
              <div className="w-16 h-16 bg-gray-100 rounded-[22px] flex items-center justify-center shadow-sm">
                <span className="text-3xl font-black text-gray-900 leading-none">쫌</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifPermission !== 'granted' && (
                <button
                  onClick={requestNotifPermission}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                  title="단식 완료 알림 켜기"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>
              )}
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="profile" className="w-9 h-9 rounded-full border border-gray-100" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-bold">
                  {user?.displayName?.[0] ?? '?'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-5 flex flex-col gap-4">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <div className="text-xl font-black text-gray-900">{streak.current}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-medium">🔥 연속</div>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <div className="text-xl font-black text-gray-900">{totalDays}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-medium">📅 총일수</div>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <div className="text-xl font-black text-gray-900">{streak.longest}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-medium">🏆 최장</div>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <div className="text-xl font-black text-gray-900">{monthRate}%</div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-medium">📊 이번달</div>
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{levelInfo.level.emoji}</span>
                <div>
                  <p className="text-sm font-black text-gray-900">{levelInfo.level.name}</p>
                  <p className="text-xs text-gray-400">
                    {levelInfo.next
                      ? `${levelInfo.daysToNext}일 후 → ${levelInfo.next.name} ${levelInfo.next.emoji}`
                      : '최고 레벨 달성! 🎖️'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-400">{totalDays}일 완료</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: levelInfo.level.color }}
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            {levelInfo.next && (
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-300 font-medium">
                <span>{levelInfo.level.name}</span>
                <span>{levelInfo.next.name}</span>
              </div>
            )}
          </div>

          {/* Main Timer Card */}
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col items-center gap-5">
            {/* Goal selector */}
            <div className="flex gap-2">
              {GOALS.map(g => (
                <button key={g} onClick={() => !activeFast && setGoal(g)} disabled={!!activeFast}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                    displayGoal === g ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                  } ${activeFast ? 'cursor-default' : 'hover:bg-gray-200'}`}>
                  {g}h
                </button>
              ))}
            </div>

            {/* Arc Timer */}
            <AnimatePresence mode="wait">
              <motion.div key={activeFast ? 'active' : 'idle'}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.3 }}>
                <ArcTimer progress={tick.progress} color={phaseColor} isBonus={!!activeFast && tick.complete}>
                  {(() => {
                    const ot = tick.formattedOvertime;
                    if (activeFast && tick.complete && ot) {
                      const isJustComplete = ot.hours === '00' && ot.minutes === '00' && ot.seconds === '00';
                      return (
                        <>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl mb-1">🎉</motion.div>
                          <span className="text-xs font-bold text-red-300 mb-1">목표 {activeFast.goalHours}h 달성!</span>
                          {!isJustComplete && (
                            <>
                              <div className="flex items-baseline gap-0.5 tabular-nums">
                                <span className="text-sm font-black text-red-400 mr-0.5">+</span>
                                <span className="text-3xl font-black text-red-500">{ot.hours}</span>
                                <span className="text-lg font-bold text-red-200 mx-0.5">:</span>
                                <span className="text-3xl font-black text-red-500">{ot.minutes}</span>
                                <span className="text-lg font-bold text-red-200 mx-0.5">:</span>
                                <span className="text-3xl font-black text-red-500">{ot.seconds}</span>
                              </div>
                              <span className="text-xs text-red-400 mt-1 font-medium">보너스 시간 🔥</span>
                            </>
                          )}
                        </>
                      );
                    }
                    return (
                      <>
                        <div className="flex items-baseline gap-0.5 tabular-nums">
                          <span className="text-4xl font-black text-gray-900">{h}</span>
                          <span className="text-xl font-bold text-gray-300 mx-0.5">:</span>
                          <span className="text-4xl font-black text-gray-900">{m}</span>
                          <span className="text-xl font-bold text-gray-300 mx-0.5">:</span>
                          <span className="text-4xl font-black text-gray-900">{s}</span>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 font-medium">
                          {activeFast ? '남은 시간' : `목표 ${displayGoal}시간`}
                        </span>
                      </>
                    );
                  })()}
                </ArcTimer>
              </motion.div>
            </AnimatePresence>

            {/* Start/End time + 수정 버튼 */}
            {activeFast && (
              <div className="w-full">
                {editingStart ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="datetime-local"
                      value={editStartValue}
                      max={toDatetimeLocal(new Date())}
                      onChange={e => setEditStartValue(e.target.value)}
                      className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400"
                    />
                    <button onClick={handleSaveStart} disabled={actionLoading}
                      className="px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl">저장</button>
                    <button onClick={() => setEditingStart(false)}
                      className="px-3 py-2 bg-gray-100 text-gray-500 text-xs font-bold rounded-xl">취소</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="font-medium">{startHour} 시작</span>
                      <div className="h-px w-6 bg-gray-200" />
                      <span className="font-medium">{endHour} 목표</span>
                    </div>
                    <button onClick={handleEditStart}
                      className="ml-1 text-gray-300 hover:text-gray-500 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action button */}
            <button onClick={activeFast ? handleStop : handleStart} disabled={actionLoading}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 ${
                activeFast ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-gray-800'
              }`}>
              {actionLoading ? '...' : activeFast ? '단식 종료' : '단식 시작'}
            </button>
          </div>

          {/* Phase card */}
          {activeFast && tick.currentPhase && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${phaseColor}20` }}>
                {tick.currentPhase.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-gray-800">{tick.currentPhase.koreanName}</p>
                  <span className="text-[10px] font-bold text-gray-300">{tick.currentPhase.startHour}h~</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{tick.currentPhase.description}</p>
              </div>
            </motion.div>
          )}

          {/* Quote */}
          <div className="bg-white rounded-2xl shadow-sm p-4 min-h-[72px] flex items-center justify-center">
            <p className="text-sm font-bold text-gray-700 text-center leading-relaxed transition-all duration-300"
              style={{ opacity: quoteVisible ? 1 : 0, transform: quoteVisible ? 'translateY(0)' : 'translateY(6px)' }}>
              {QUOTES[quoteIndex]}
            </p>
          </div>

          {/* Last 7 days */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-800">최근 7일</span>
              <span className="text-xs text-gray-400">
                {last7.filter(d => d.status === 'success').length} / 7 완료
              </span>
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
