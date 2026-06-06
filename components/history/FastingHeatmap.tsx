'use client';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import type { HeatmapDay } from '@/types';

interface Props {
  data: HeatmapDay[];
}

export function FastingHeatmap({ data }: Props) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - 1);

  return (
    <div className="w-full max-w-sm">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">단식 기록</h3>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-hidden">
        <CalendarHeatmap
          startDate={startDate}
          endDate={today}
          values={data}
          classForValue={value => {
            if (!value || value.count === 0) return 'color-empty';
            return 'color-filled';
          }}
          showWeekdayLabels
        />
      </div>
      <style>{`
        .react-calendar-heatmap .color-empty { fill: #F3F4F6; }
        .react-calendar-heatmap .color-filled { fill: #58CC02; }
        .react-calendar-heatmap text { font-size: 8px; fill: #9CA3AF; }
      `}</style>
    </div>
  );
}
