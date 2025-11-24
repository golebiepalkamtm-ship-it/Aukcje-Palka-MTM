'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { achievementsData } from '@/lib/achievements/data';
import AchievementDetailsPanel from '@/components/achievements/AchievementDetailsPanel';
import type { YearAchievements } from '@/lib/achievements-parser';

// Dynamiczny import nowej mapy
const NewJourneyMap = dynamic(() => import('@/components/achievements/NewJourneyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-white text-xl font-semibold animate-pulse">
        Ładowanie Mapbox Journey...
      </div>
    </div>
  ),
});

export default function AchievementsStageOnePage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const timelineData: YearAchievements[] = useMemo(() => {
    return achievementsData.map(yearData => ({
      year: yearData.year,
      achievements: yearData.divisions.flatMap(div =>
        div.results.map(result => ({
          category: result.category || div.level,
          title: result.title || `${div.level} - ${result.category || ''}`,
          place: result.title || '',
          coeff: result.coefficient?.toString() || '-',
          kon: result.concourses?.toString() || '-',
        }))
      ),
    }));
  }, []);

  const selectedYearData = selectedYear
    ? achievementsData.find(d => d.year === selectedYear) ?? null
    : null;

  return (
    <div 
      className="fixed inset-0 w-screen h-screen bg-black overflow-hidden z-[9999]"
      style={{ zoom: 1 / 0.7 }}
    >
      {/* Nowa Mapa 3D */}
      <div className="absolute inset-0 w-full h-full z-10">
        <NewJourneyMap data={timelineData} onYearSelect={setSelectedYear} />
      </div>

      {/* Panel Szczegółów - Używamy tego samego bo jest dobry, ale podpinamy pod nową logikę */}
      <AchievementDetailsPanel 
        yearData={selectedYearData} 
        onClose={() => setSelectedYear(null)} 
      />
      
      {!selectedYear && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white text-sm pointer-events-none">
          Kliknij punkt na trasie, aby zobaczyć szczegóły
        </div>
      )}
    </div>
  );
}
