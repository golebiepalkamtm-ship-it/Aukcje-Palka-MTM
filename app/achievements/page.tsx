'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { achievementsData } from '@/lib/achievements/data';
import AchievementDetailsPanel from '@/components/achievements/AchievementDetailsPanel';
import { Trophy, Calendar, Award, Info } from 'lucide-react';

const AchievementsTimeline3D = dynamic(
  () => import('@/components/achievements/AchievementsTimeline3D'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl font-semibold animate-pulse">
          Inicjalizacja 3D...
        </div>
      </div>
    )
  }
);

export default function AchievementsPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  const selectedYearData = selectedYear 
    ? achievementsData.find(d => d.year === selectedYear) ?? null
    : null;
  
  const totalMasterTitles = achievementsData.reduce((sum, y) => sum + y.totalMasterTitles, 0);
  const yearsActive = achievementsData.length;
  const topYear = [...achievementsData].sort((a, b) => b.totalMasterTitles - a.totalMasterTitles)[0];
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-400" />
                Osiągnięcia Hodowlane
              </h1>
              <p className="text-gray-300 mt-2 text-lg">Pałka MTM • 2001-2024</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      {!selectedYear && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-md px-8 py-4 rounded-2xl border border-gray-700/50 shadow-xl">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-gray-200 font-medium">
              Kliknij na rok aby zobaczyć szczegóły • Obróć widok przeciągając myszką
            </p>
          </div>
        </div>
      )}
      
      {/* 3D Timeline */}
      <div className="absolute inset-0 z-10">
        <AchievementsTimeline3D onYearSelect={setSelectedYear} />
      </div>
      
      {/* Details Panel */}
      <AchievementDetailsPanel 
        yearData={selectedYearData} 
        onClose={() => setSelectedYear(null)}
      />
      
      {/* Stats Cards */}
      <div className="absolute bottom-8 left-8 z-20 space-y-4">
        {/* Total Masters */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-md p-5 rounded-xl border border-yellow-500/30 shadow-xl min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">
              Tytuły Mistrza
            </span>
          </div>
          <div className="text-4xl font-bold text-white">
            {totalMasterTitles}
          </div>
        </div>
        
        {/* Years Active */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-md p-5 rounded-xl border border-blue-500/30 shadow-xl min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Lata Kariery
            </span>
          </div>
          <div className="text-4xl font-bold text-white">
            {yearsActive}
          </div>
        </div>
        
        {/* Top Year */}
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-md p-5 rounded-xl border border-purple-500/30 shadow-xl min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Najlepszy Rok
            </span>
          </div>
          <div className="text-3xl font-bold text-white flex items-baseline gap-2">
            {topYear.year}
            <span className="text-sm text-gray-400 font-normal">
              ({topYear.totalMasterTitles} tytułów)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

