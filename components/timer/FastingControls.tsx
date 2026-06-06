'use client';
import { motion } from 'framer-motion';

interface Props {
  isActive: boolean;
  isComplete: boolean;
  onStart: () => void;
  onStop: () => void;
  loading?: boolean;
}

export function FastingControls({ isActive, isComplete, onStart, onStop, loading }: Props) {
  if (isComplete) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onStop}
        className="bg-primary text-white font-black text-xl px-12 py-5 rounded-3xl shadow-lg shadow-green-200 hover:bg-primary-dark transition-colors"
      >
        🍽️ 단식 완료!
      </motion.button>
    );
  }

  if (isActive) {
    return (
      <div className="flex flex-col items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
          disabled={loading}
          className="bg-red-50 border-2 border-red-200 text-red-500 font-bold text-lg px-10 py-4 rounded-3xl hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          ⏹️ 단식 중단
        </motion.button>
        <p className="text-xs text-gray-400">중단하면 기록에 저장되지 않아요</p>
      </div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={onStart}
      disabled={loading}
      className="bg-primary text-white font-black text-2xl px-14 py-5 rounded-3xl shadow-xl shadow-green-200 hover:bg-primary-dark transition-colors disabled:opacity-50 animate-pulse-ring"
    >
      🌿 단식 시작
    </motion.button>
  );
}
