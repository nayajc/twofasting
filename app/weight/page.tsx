'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { saveWeight, getWeightHistory, deleteWeight } from '@/lib/firestore';
import type { WeightRecord } from '@/types';

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

const TODAY = toDateKey(new Date());

export default function WeightPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const r = await getWeightHistory(user.uid);
    setRecords(r.sort((a, b) => a.dateKey.localeCompare(b.dateKey)));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const sorted = [...records].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const todayRecord = records.find(r => r.dateKey === TODAY);

  const totalLost = first && latest && latest !== first
    ? Math.round((first.weight - latest.weight) * 10) / 10 : 0;

  // 최소/최대 (그래프용)
  const weights = sorted.map(r => r.weight);
  const minW = weights.length ? Math.min(...weights) - 1 : 50;
  const maxW = weights.length ? Math.max(...weights) + 1 : 100;
  const range = maxW - minW || 1;

  // 최근 30개만 그래프
  const graphData = sorted.slice(-30);

  const handleSave = async () => {
    if (!user || !input) return;
    const val = parseFloat(input);
    if (isNaN(val) || val < 20 || val > 300) return;
    setSaving(true);
    try {
      await saveWeight(user.uid, val, TODAY);
      setInput('');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dateKey: string) => {
    if (!user) return;
    setDeletingKey(dateKey);
    try {
      await deleteWeight(user.uid, dateKey);
      await load();
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 flex flex-col pb-24">
        {/* Header */}
        <div className="bg-white px-6 pt-14 pb-5 shadow-[0_1px_0_#f0f0f0]">
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">체중 관리</p>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">체중 기록</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-5 flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-gray-900">
                {latest ? `${latest.weight}` : '—'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">⚖️ 현재 kg</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-gray-900">
                {first ? `${first.weight}` : '—'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">🏁 시작 kg</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className={`text-2xl font-black ${totalLost > 0 ? 'text-gray-900' : totalLost < 0 ? 'text-gray-400' : 'text-gray-300'}`}>
                {totalLost > 0 ? `-${totalLost}` : totalLost < 0 ? `+${Math.abs(totalLost)}` : '—'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">📉 변화 kg</div>
            </div>
          </div>

          {/* 입력 카드 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-bold text-gray-800 mb-3">
              오늘 체중 {todayRecord ? `(${todayRecord.weight}kg 기록됨)` : ''}
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder={todayRecord ? String(todayRecord.weight) : '예) 68.5'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold text-sm focus:outline-none focus:border-gray-400 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">kg</span>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !input}
                className="px-5 py-3 bg-gray-900 text-white font-black text-sm rounded-xl disabled:opacity-40 active:scale-95 transition-all"
              >
                {saving ? '...' : '저장'}
              </button>
            </div>
            {todayRecord && (
              <p className="text-xs text-gray-400 mt-2">새로 저장하면 오늘 기록이 덮어씌워집니다</p>
            )}
          </div>

          {/* 그래프 */}
          {graphData.length >= 2 && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800">체중 변화</p>
                <p className="text-xs text-gray-400">최근 {graphData.length}일</p>
              </div>
              <div className="relative h-32">
                <svg width="100%" height="100%" viewBox={`0 0 ${graphData.length * 20} 100`} preserveAspectRatio="none">
                  {/* 그리드 라인 */}
                  {[0, 50, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2={graphData.length * 20} y2={y}
                      stroke="#F3F4F6" strokeWidth="1" />
                  ))}
                  {/* 영역 fill */}
                  <path
                    d={[
                      `M 10 ${100 - ((graphData[0].weight - minW) / range) * 100}`,
                      ...graphData.slice(1).map((r, i) =>
                        `L ${(i + 1) * 20 + 10} ${100 - ((r.weight - minW) / range) * 100}`
                      ),
                      `L ${(graphData.length - 1) * 20 + 10} 100`,
                      `L 10 100 Z`,
                    ].join(' ')}
                    fill="#F9FAFB"
                  />
                  {/* 라인 */}
                  <polyline
                    points={graphData.map((r, i) =>
                      `${i * 20 + 10},${100 - ((r.weight - minW) / range) * 100}`
                    ).join(' ')}
                    fill="none"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* 점 */}
                  {graphData.map((r, i) => (
                    <circle key={r.dateKey}
                      cx={i * 20 + 10}
                      cy={100 - ((r.weight - minW) / range) * 100}
                      r="3" fill="#111827" />
                  ))}
                </svg>
                {/* Y축 라벨 */}
                <div className="absolute top-0 right-0 flex flex-col justify-between h-full text-right pr-1">
                  <span className="text-[10px] text-gray-300">{maxW.toFixed(1)}</span>
                  <span className="text-[10px] text-gray-300">{minW.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 기록 리스트 */}
          {!loading && sorted.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">전체 기록</p>
              <div className="flex flex-col divide-y divide-gray-50">
                <AnimatePresence>
                  {[...sorted].reverse().map(r => (
                    <motion.div
                      key={r.dateKey}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {new Date(r.dateKey + 'T00:00:00').toLocaleDateString('ko-KR', {
                            month: 'long', day: 'numeric', weekday: 'short'
                          })}
                          {r.dateKey === TODAY && (
                            <span className="ml-2 text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full font-bold">오늘</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-gray-900">{r.weight} kg</span>
                        <button
                          onClick={() => handleDelete(r.dateKey)}
                          disabled={deletingKey === r.dateKey}
                          className="text-gray-200 hover:text-gray-400 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {!loading && sorted.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-4xl mb-3">⚖️</div>
              <p className="text-gray-600 font-bold">첫 체중을 기록해보세요</p>
              <p className="text-gray-400 text-sm mt-1">매일 기록하면 변화가 보입니다</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
