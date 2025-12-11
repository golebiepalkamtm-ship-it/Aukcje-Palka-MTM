'use client';

import { useMemo } from 'react';
import { Timeline3D } from '@/components/3D/Timeline3D';
import type { YearAchievements } from '@/lib/achievements-parser';

type NewJourneyMapProps = {
  data: YearAchievements[];
  onYearSelect?: (year: number | null) => void;
};

export default function NewJourneyMap({ data, onYearSelect }: NewJourneyMapProps) {
  const normalizedData = useMemo(
    () => [...data].sort((a, b) => a.year - b.year),
    [data],
  );

  return (
    <div className="relative h-full w-full">
      <Timeline3D data={normalizedData} onYearSelect={onYearSelect} />
    </div>
  );
}

