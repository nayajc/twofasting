'use client';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { getFastHistory } from '@/lib/firestore';
import { computeStreak, toDateKey } from '@/lib/fasting';
import type { FastingRecord } from '@/types';

export default function HistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<FastingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getFastHistory(user.uid).then(r => {
      setRecords(r);
      setLoading(false);
    });
  }, [user]);

  const completed = records.filter(r => r.completed);
  const streak = computeStreak(completed);
  const totalDays = new Set(completed.map(r => r.dateKey)).size;

  // 12-week heatmap
  const today = new Date();
  const weeks = Array.from({ length: 12 }, (_, wi) =>
    Array.from({ length: 7 }, (_, di) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (11 - wi) * 7 - (6 - di));
      const key = d.toISOString().slice(0, 10);
      const dayRecords = records.filter(r => r.dateKey === key);
      const status = dayRecords.some(r => r.completed)
        ? 'success'
        : dayRecords.length > 0
          ? 'fail'
          : 'none';
      return { key, status };
    })
  );

  const recent = [...records]
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, 10);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 flex flex-col pb-24">
        {/* Header */}
        <div className="bg-white px-6 pt-14 pb-5 shadow-[0_1px_0_#f0f0f0]">
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">단식 기록</p>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">히스토리</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-5 flex flex-col gap-4">
          {/* Stats */}
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

          {/* Heatmap */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-bold text-gray-800 mb-3">12주 기록</p>
            {loading ? (
              <div className="h-16 flex items-center justify-center text-gray-300 text-sm">불러오는 중…</div>
            ) : (
              <div className="flex gap-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1 flex-1">
                    {week.map(({ key, status }) => (
                      <div
                        key={key}
                        className={`aspect-square rounded-sm ${
                          status === 'success' ? 'bg-gray-900' : status === 'fail' ? 'bg-gray-300' : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent list */}
          {recent.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">최근 기록</p>
              <div className="flex flex-col divide-y divide-gray-50">
                {recent.map(r => (
                  <div key={r.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${r.completed ? 'bg-gray-900' : 'bg-gray-300'}`} />
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {r.startTime.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {r.startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 시작
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">{r.achievedHours}h</p>
                      <p className="text-xs text-gray-400">목표 {r.goalHours}h</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && completed.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-gray-600 font-bold">첫 단식을 완료해보세요</p>
              <p className="text-gray-400 text-sm mt-1">완료된 단식이 여기에 쌓입니다</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
