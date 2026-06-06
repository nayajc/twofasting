'use client';
import { motion } from 'framer-motion';
import type { Phase } from '@/types';

interface Props {
  phase: Phase;
  state: 'done' | 'active' | 'locked';
}

export function PhaseCard({ phase, state }: Props) {
  return (
    <motion.div
      initial={state === 'active' ? { scale: 0.95, opacity: 0.8 } : {}}
      animate={state === 'active' ? { scale: 1, opacity: 1 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
        state === 'active'
          ? 'border-2 shadow-md'
          : state === 'done'
          ? 'bg-gray-50 border-gray-100 opacity-70'
          : 'bg-gray-50 border-gray-100 opacity-40'
      }`}
      style={
        state === 'active'
          ? { backgroundColor: phase.bgColor, borderColor: phase.textColor + '60' }
          : {}
      }
    >
      <div className={`text-2xl ${state === 'locked' ? 'grayscale' : ''}`}>
        {state === 'done' ? '✅' : phase.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-bold"
            style={{ color: state === 'active' ? phase.textColor : '#9CA3AF' }}
          >
            {phase.startHour}h — {phase.koreanName}
          </span>
          {state === 'active' && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: phase.textColor + '20', color: phase.textColor }}
            >
              지금
            </motion.span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{phase.description}</p>
      </div>
      {state === 'locked' && <span className="text-gray-300 text-lg">🔒</span>}
    </motion.div>
  );
}
