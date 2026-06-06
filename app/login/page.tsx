'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/timer');
  }, [user, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 via-white to-yellow-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-8 max-w-sm w-full"
      >
        {/* Logo / Mascot */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="text-9xl"
        >
          🌿
        </motion.div>

        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-2">TwoFasting</h1>
          <p className="text-gray-500 text-lg">단식의 모든 순간을 함께해요</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {['🔥 지방 연소', '⚡ 케토시스', '🔬 자가포식', '🌟 성장호르몬'].map(f => (
            <span key={f} className="bg-white border border-green-200 text-gray-600 text-sm px-3 py-1 rounded-full font-medium shadow-sm">
              {f}
            </span>
          ))}
        </div>

        <GoogleLoginButton />

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          로그인하면 모든 기기에서<br />단식 기록이 동기화돼요
        </p>
      </motion.div>
    </main>
  );
}
