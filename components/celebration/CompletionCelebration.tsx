'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Props {
  goalHours: number;
  achievedHours: number;
}

export function CompletionCelebration({ goalHours, achievedHours }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#58CC02', '#FFC800', '#7EE000', '#FF9600'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#58CC02', '#FFC800', '#7EE000', '#FF9600'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Play completion sound
    try {
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.4);
      });
    } catch {}
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
        className="text-8xl"
      >
        🏆
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-3xl font-black text-gray-900">단식 완료!</h2>
        <p className="text-gray-500 mt-1">
          목표 <span className="font-bold text-primary">{goalHours}시간</span> 달성 🎉
        </p>
        {achievedHours > goalHours && (
          <p className="text-sm text-yellow-600 font-semibold mt-1">
            +{(achievedHours - goalHours).toFixed(1)}시간 보너스!
          </p>
        )}
      </motion.div>

      {/* Achievement badges */}
      <div className="flex gap-2 flex-wrap justify-center">
        {goalHours >= 12 && <span className="badge">🔥 지방 연소</span>}
        {goalHours >= 14 && <span className="badge">⚡ 케토시스</span>}
        {goalHours >= 16 && <span className="badge">🔬 자가포식</span>}
        {goalHours >= 18 && <span className="badge">🌟 성장호르몬</span>}
      </div>
    </div>
  );
}
