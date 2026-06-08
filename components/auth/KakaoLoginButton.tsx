'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithKakao } from '@/lib/auth';

export function KakaoLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithKakao();
    } catch (e: any) {
      setError('카카오 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center justify-center gap-3 w-full max-w-xs rounded-2xl px-6 py-4 font-bold text-base disabled:opacity-60 transition-all"
        style={{ backgroundColor: '#FEE500', color: '#191919' }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-[#3C1E1E]/30 border-t-[#3C1E1E] rounded-full animate-spin" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#3C1E1E">
            <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.617 5.077 4.087 6.528L5.1 21l4.663-2.485A11.6 11.6 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
          </svg>
        )}
        {loading ? '로그인 중...' : '카카오로 시작하기'}
      </motion.button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
