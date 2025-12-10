'use client';

import React from 'react';
import type { YearAchievements } from '@/lib/achievements-parser';

interface Timeline3DProps {
  data: YearAchievements[];
  onYearSelect?: (year: number | null) => void;
}

export function Timeline3D({ data, onYearSelect }: Timeline3DProps) {
  return (
    <div className="timeline-3d">
      <p>Timeline3D component - placeholder</p>
      {/* TODO: Implement 3D timeline */}
    </div>
  );
}