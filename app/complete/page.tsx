'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CompletionCelebration } from '@/components/celebration/CompletionCelebration';
import { MealRecommendations } from '@/components/meals/MealRecommendations';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { motion } from 'framer-motion';

function CompleteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const goalHours = Number(params.get('goal') ?? 16);
  const achievedHours = Number(params.get('achieved') ?? goalHours);

  return (
    <main className="min-h-screen flex flex-col items-center pb-10 bg-gradient-to-b from-green-50 to-yellow-50">
      <div className="w-full max-w-sm px-6 pt-10">
        <CompletionCelebration goalHours={goalHours} achievedHours={achievedHours} />
      </div>

      <div className="w-full max-w-sm px-6 mt-6">
        <MealRecommendations />
      </div>

      <div className="w-full max-w-sm px-6 mt-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.replace('/timer')}
          className="w-full bg-primary text-white font-black text-xl py-5 rounded-3xl shadow-lg shadow-green-200"
        >
          🌿 타이머로 돌아가기
        </motion.button>
      </div>
    </main>
  );
}

export default function CompletePage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-6xl animate-float">🏆</div></div>}>
        <CompleteContent />
      </Suspense>
    </AuthGuard>
  );
}
