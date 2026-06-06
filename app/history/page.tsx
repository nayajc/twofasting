'use client';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { StreakCounter } from '@/components/history/StreakCounter';
import { FastingHeatmap } from '@/components/history/FastingHeatmap';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { getFastHistory } from '@/lib/firestore';
import { computeStreak, toDateKey } from '@/lib/fasting';
import type { FastingRecord, HeatmapDay } from '@/types';

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

  const heatmapData: HeatmapDay[] = completed.map(r => ({
    date: r.dateKey,
    count: 1,
  }));

  return (
    <AuthGuard>
      <main className="min-h-screen flex flex-col items-center pb-24 bg-gradient-to-b from-yellow-50 to-white">
        <div className="w-full max-w-sm px-6 pt-12 pb-6">
          <h1 className="text-2xl font-black text-gray-900">히스토리</h1>
          <p className="text-sm text-gray-400">나의 단식 여정 📅</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-5xl animate-float">📅</div>
          </div>
        ) : (
          <div className="w-full max-w-sm px-6 flex flex-col gap-6">
            <StreakCounter current={streak.current} longest={streak.longest} />
            <FastingHeatmap data={heatmapData} />

            {completed.length === 0 && (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🌱</div>
                <p className="text-gray-500 font-medium">첫 단식을 완료해보세요!</p>
                <p className="text-gray-400 text-sm mt-1">완료된 단식만 기록됩니다</p>
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
