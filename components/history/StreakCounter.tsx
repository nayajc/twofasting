'use client';
import { motion } from 'framer-motion';

interface Props {
  current: number;
  longest: number;
}

export function StreakCounter({ current, longest }: Props) {
  return (
    <div className="flex gap-4 w-full max-w-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex-1 bg-white border-2 border-primary/20 rounded-2xl p-4 text-center"
      >
        <div className="text-4xl font-black text-primary">{current}</div>
        <div className="text-sm font-bold text-gray-500 mt-1">🔥 현재 스트리크</div>
        <div className="text-xs text-gray-400">연속 단식 일수</div>
      </motion.div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-white border-2 border-yellow-200 rounded-2xl p-4 text-center"
      >
        <div className="text-4xl font-black text-yellow-500">{longest}</div>
        <div className="text-sm font-bold text-gray-500 mt-1">🏆 최장 스트리크</div>
        <div className="text-xs text-gray-400">최고 기록</div>
      </motion.div>
    </div>
  );
}
