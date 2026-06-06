'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { useAuth } from '@/hooks/useAuth';

const FEATURES = [
  { icon: '⏱️', title: '정밀 타이머', desc: '시작부터 끝까지 정확하게' },
  { icon: '🔥', title: '단계별 효과', desc: '지방연소 · 케토시스 · 자가포식' },
  { icon: '📅', title: '기록 추적', desc: '연속 달성 · 히트맵 시각화' },
  { icon: '☁️', title: '클라우드 동기화', desc: '모든 기기에서 이어서' },
];

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/timer');
  }, [user, router]);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm flex flex-col items-center gap-10"
        >
          {/* Wordmark */}
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="text-7xl mb-6"
            >
              🍃
            </motion.div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">고마무라!</h1>
            <p className="text-sm font-semibold text-gray-400 mt-1 tracking-widest uppercase">Gomamura</p>
            <p className="text-gray-500 mt-3 text-base leading-relaxed">
              간헐적 단식을 더 스마트하게.<br />
              매일의 기록이 건강을 만듭니다.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-sm font-bold text-gray-800">{f.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Login */}
          <div className="w-full flex flex-col items-center gap-3">
            <GoogleLoginButton />
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              로그인하면 모든 기기에서<br />단식 기록이 동기화됩니다
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
