import type { Phase } from '@/types';

export const FASTING_PHASES: Phase[] = [
  {
    id: 'digestion',
    startHour: 0,
    endHour: 3,
    name: 'Digestion',
    koreanName: '소화 흡수',
    description: '혈당과 인슐린이 최고조에 달하며 음식을 소화 중입니다. 잉여 포도당은 글리코겐으로 저장됩니다.',
    icon: '🍽️',
    colorToken: 'phase-0',
    bgColor: '#F0F9FF',
    textColor: '#0369A1',
  },
  {
    id: 'blood-sugar',
    startHour: 3,
    endHour: 6,
    name: 'Blood Sugar Stabilizing',
    koreanName: '혈당 안정화',
    description: '혈당과 인슐린이 정상 수치로 돌아옵니다. 글루카곤이 분비되며 간의 글리코겐을 에너지로 전환하기 시작합니다.',
    icon: '📉',
    colorToken: 'phase-1',
    bgColor: '#F0FDF4',
    textColor: '#16A34A',
  },
  {
    id: 'glycogen-depletion',
    startHour: 6,
    endHour: 10,
    name: 'Glycogen Depletion',
    koreanName: '글리코겐 소진',
    description: '간의 글리코겐이 빠르게 소진됩니다. 지방세포에서 지방산이 분해되어 혈액으로 방출되기 시작합니다. 인슐린 저항성이 개선됩니다.',
    icon: '⚙️',
    colorToken: 'phase-2',
    bgColor: '#FFF7ED',
    textColor: '#C2410C',
  },
  {
    id: 'fat-burning',
    startHour: 10,
    endHour: 14,
    name: 'Fat Burning',
    koreanName: '지방 연소',
    description: '몸이 본격적으로 지방 연소 모드로 전환됩니다. AMPK 효소가 활성화되며 혈당이 식후 대비 약 20% 감소합니다.',
    icon: '🔥',
    colorToken: 'phase-3',
    bgColor: '#FEF3C7',
    textColor: '#D97706',
  },
  {
    id: 'ketosis',
    startHour: 14,
    endHour: 16,
    name: 'Ketosis',
    koreanName: '케토시스 진입',
    description: '간에서 케톤체를 생산하며 케토시스 상태에 진입합니다. 뇌가 포도당 대신 케톤을 에너지원으로 사용하며 집중력이 향상됩니다. 공복감이 오히려 줄어드는 효과가 나타납니다.',
    icon: '⚡',
    colorToken: 'phase-4',
    bgColor: '#FFFBEB',
    textColor: '#B45309',
  },
  {
    id: 'autophagy-start',
    startHour: 16,
    endHour: 20,
    name: 'Autophagy Begins',
    koreanName: '자가포식 시작',
    description: '2016년 노벨 생리의학상을 받은 자가포식(Autophagy)이 시작됩니다. 손상된 세포 소기관과 단백질을 분해·재활용하는 세포 청소가 본격화됩니다.',
    icon: '🔬',
    colorToken: 'phase-5',
    bgColor: '#F5F3FF',
    textColor: '#7C3AED',
  },
  {
    id: 'gluconeogenesis',
    startHour: 20,
    endHour: 30,
    name: 'Gluconeogenesis',
    koreanName: '포도당 신생합성',
    description: '글리코겐이 완전 소진되어 아미노산·글리세롤로 포도당을 새로 합성합니다. 자가포식 수치가 기저치 대비 약 300% 상승합니다.',
    icon: '🧬',
    colorToken: 'phase-6',
    bgColor: '#FDF4FF',
    textColor: '#9333EA',
  },
  {
    id: 'deep-autophagy',
    startHour: 30,
    endHour: 40,
    name: 'Deep Autophagy',
    koreanName: '깊은 자가포식',
    description: '미토파지(손상 미토콘드리아 제거)와 샤프론 매개 자가포식이 추가로 활성화됩니다. 염증 마커(IL-6, TNF-α)가 감소하며 알츠하이머 관련 단백질 제거에도 기여합니다.',
    icon: '🧹',
    colorToken: 'phase-7',
    bgColor: '#FFF1F2',
    textColor: '#E11D48',
  },
  {
    id: 'growth-hormone',
    startHour: 40,
    endHour: 60,
    name: 'Growth Hormone Surge',
    koreanName: '성장호르몬 급증',
    description: '인간 성장 호르몬(HGH)이 크게 증가합니다. 근육 보호·지방 분해·세포 재생이 촉진됩니다. IGF-1 수치는 감소하여 노화 위험 인자가 낮아집니다.',
    icon: '💪',
    colorToken: 'phase-8',
    bgColor: '#FFF7ED',
    textColor: '#EA580C',
  },
  {
    id: 'immune-regeneration',
    startHour: 60,
    endHour: 999,
    name: 'Immune Regeneration',
    koreanName: '면역 재생',
    description: '조혈 줄기세포가 활성화되어 노화된 면역 세포가 새것으로 교체됩니다. USC 연구(Cell Stem Cell, 2014)에 따르면 면역 시스템이 사실상 완전히 재생됩니다. 의학적 감독이 필요한 단계입니다.',
    icon: '🛡️',
    colorToken: 'phase-9',
    bgColor: '#F0FDF4',
    textColor: '#15803D',
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
