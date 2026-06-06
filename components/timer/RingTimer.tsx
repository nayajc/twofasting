'use client';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

interface Props {
  progress: number; // 0-1
  hours: string;
  minutes: string;
  seconds: string;
  isComplete: boolean;
  isBonusTime?: boolean;
  phaseColor: string;
}

export function RingTimer({ progress, hours, minutes, seconds, isComplete, isBonusTime, phaseColor }: Props) {
  const displayProgress = isBonusTime ? 100 : progress * 100;

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Pulse glow when active */}
      {progress > 0 && !isComplete && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ boxShadow: [`0 0 0 0 ${phaseColor}40`, `0 0 0 24px ${phaseColor}00`] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}

      <CircularProgressbar
        value={displayProgress}
        strokeWidth={10}
        styles={buildStyles({
          pathColor: isComplete ? '#58CC02' : phaseColor,
          trailColor: '#F0F0F0',
          pathTransitionDuration: 0.5,
          rotation: 0,
        })}
      />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-6xl"
          >
            🎉
          </motion.div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-gray-900 tabular-nums">{hours}</span>
              <span className="text-2xl font-bold text-gray-400">:</span>
              <span className="text-5xl font-black text-gray-900 tabular-nums">{minutes}</span>
              <span className="text-2xl font-bold text-gray-400">:</span>
              <span className="text-5xl font-black text-gray-900 tabular-nums">{seconds}</span>
            </div>
            <span className="text-sm text-gray-400 mt-1 font-medium">
              {isBonusTime ? '🌟 보너스 타임' : '남은 시간'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
