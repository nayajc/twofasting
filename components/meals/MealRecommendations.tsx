'use client';
import { motion } from 'framer-motion';
import { MEAL_RECOMMENDATIONS } from '@/data/meals';

export function MealRecommendations() {
  return (
    <div className="w-full max-w-sm">
      <h3 className="text-lg font-black text-gray-800 mb-3">🥗 지금 먹기 좋은 음식</h3>
      <div className="grid grid-cols-2 gap-2">
        {MEAL_RECOMMENDATIONS.map((meal, i) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm"
          >
            <div className="text-3xl mb-1">{meal.emoji}</div>
            <div className="font-bold text-gray-800 text-sm">{meal.koreanName}</div>
            <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{meal.description}</div>
            <span className="inline-block mt-1.5 text-xs bg-green-50 text-primary font-semibold px-2 py-0.5 rounded-full">
              {meal.tag}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
