'use client';
import { motion } from 'framer-motion';
import type { FastingDuration } from '@/types';

const GOALS: { hours: FastingDuration; label: string; desc: string }[] = [
  { hours: 12, label: '12시간', desc: '입문' },
  { hours: 14, label: '14시간', desc: '기본' },
  { hours: 16, label: '16시간', desc: '표준' },
  { hours: 18, label: '18시간', desc: '심화' },
  { hours: 24, label: '24시간', desc: '챌린지' },
];

interface Props {
  selected: FastingDuration;
  onChange: (h: FastingDuration) => void;
  disabled?: boolean;
}

export function GoalSelector({ selected, onChange, disabled }: Props) {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {GOALS.map(g => (
        <motion.button
          key={g.hours}
          whileTap={{ scale: 0.92 }}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          onClick={() => !disabled && onChange(g.hours)}
          className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 font-bold transition-all min-w-[64px] ${
            selected === g.hours
              ? 'bg-primary border-primary text-white shadow-lg shadow-green-200'
              : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className="text-base">{g.label}</span>
          <span className={`text-xs mt-0.5 ${selected === g.hours ? 'text-green-100' : 'text-gray-400'}`}>
            {g.desc}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
