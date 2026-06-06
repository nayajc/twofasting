import type { Phase } from '@/types';

export const FASTING_PHASES: Phase[] = [
  {
    id: 'digestion',
    startHour: 0,
    endHour: 4,
    name: 'Digestion',
    koreanName: '소화 중',
    description: '소화 중, 혈당 처리',
    icon: '🍽️',
    colorToken: 'phase-0',
    bgColor: '#E8F4FD',
    textColor: '#2E86AB',
  },
  {
    id: 'blood-sugar',
    startHour: 4,
    endHour: 8,
    name: 'Blood Sugar Drop',
    koreanName: '혈당 안정',
    description: '혈당 안정, 인슐린 감소',
    icon: '📉',
    colorToken: 'phase-1',
    bgColor: '#E8F8F5',
    textColor: '#1E8449',
  },
  {
    id: 'fat-burning',
    startHour: 8,
    endHour: 12,
    name: 'Fat Burning',
    koreanName: '지방 연소',
    description: '지방 연소 시작',
    icon: '🔥',
    colorToken: 'phase-2',
    bgColor: '#FEF9E7',
    textColor: '#D35400',
  },
  {
    id: 'ketosis',
    startHour: 12,
    endHour: 16,
    name: 'Ketosis',
    koreanName: '케토시스',
    description: '케톤 생성, 지방 연소 활발',
    icon: '⚡',
    colorToken: 'phase-3',
    bgColor: '#FFFDE7',
    textColor: '#F57F17',
  },
  {
    id: 'autophagy',
    startHour: 16,
    endHour: 18,
    name: 'Autophagy',
    koreanName: '자가포식',
    description: '자가포식(Autophagy) 시작',
    icon: '🔬',
    colorToken: 'phase-4',
    bgColor: '#F3E5F5',
    textColor: '#7B1FA2',
  },
  {
    id: 'growth-hormone',
    startHour: 18,
    endHour: 25, // beyond 24h
    name: 'Growth Hormone',
    koreanName: '성장호르몬',
    description: '성장호르몬 분비, 세포 재생',
    icon: '🌟',
    colorToken: 'phase-5',
    bgColor: '#E8F5E9',
    textColor: '#2E7D32',
  },
];

export function getCurrentPhase(elapsedHours: number): Phase {
  for (const phase of FASTING_PHASES) {
    if (elapsedHours >= phase.startHour && elapsedHours < phase.endHour) {
      return phase;
    }
  }
  return FASTING_PHASES[FASTING_PHASES.length - 1];
}

export function getPhasesUpTo(goalHours: number): Phase[] {
  return FASTING_PHASES.filter(p => p.startHour < goalHours);
}

export function getAllUnlockedPhases(elapsedHours: number): Phase[] {
  return FASTING_PHASES.filter(p => elapsedHours >= p.startHour);
}
