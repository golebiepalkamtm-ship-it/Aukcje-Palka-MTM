'use client';

import { type YearData } from '@/lib/achievements/types';
import { X, Trophy, Medal, Award } from 'lucide-react';

interface Props {
  yearData: YearData | null;
  onClose: () => void;
}

function getTitleIcon(title: string) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('mistrz')) return <Trophy className="w-4 h-4 text-yellow-400" />;
  if (lowerTitle.includes('wicemistrz')) return <Medal className="w-4 h-4 text-gray-400" />;
  return <Award className="w-4 h-4 text-blue-400" />;
}

function getTitleColor(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('mistrz') && !lowerTitle.includes('wicemistrz')) {
    return 'text-yellow-400 font-bold';
  }
  if (lowerTitle.includes('wicemistrz')) return 'text-gray-300 font-semibold';
  return 'text-blue-400';
}

function getLevelStyle(level: string) {
  switch(level) {
    case 'MP': return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
    case 'Region V': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
    case 'Okręg': return 'bg-green-600/20 text-green-300 border-green-500/30';
    default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
  }
}

export default function AchievementDetailsPanel({ yearData, onClose }: Props) {
  if (!yearData) return null;
  
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] lg:w-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-black border-l border-gray-700 shadow-2xl overflow-y-auto z-30 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 p-6 flex items-center justify-between z-10">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight">{yearData.year}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-gray-300">
              {yearData.totalMasterTitles} {yearData.totalMasterTitles === 1 ? 'Tytuł' : 'Tytuły'} Mistrza
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-all hover:scale-110"
          aria-label="Zamknij"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6">
        {yearData.divisions.map((division, divIndex) => (
          <div 
            key={divIndex} 
            className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all"
          >
            {/* Division Header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-700/50">
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border ${getLevelStyle(division.level)}`}>
                {division.level}
              </div>
              <h3 className="text-lg font-bold text-white">{division.divisionName}</h3>
            </div>
            
            {/* Results */}
            <div className="space-y-3">
              {division.results.map((result, resIndex) => (
                <div 
                  key={resIndex}
                  className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg bg-gray-900/60 hover:bg-gray-900/80 transition-all border border-gray-800/50 hover:border-gray-700/50"
                >
                  {/* Category */}
                  <div className="col-span-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {result.category}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <div className="col-span-5 flex items-center gap-2">
                    {getTitleIcon(result.title)}
                    <span className={`text-sm ${getTitleColor(result.title)}`}>
                      {result.title}
                    </span>
                  </div>
                  
                  {/* Stats */}
                  <div className="col-span-4 flex flex-col items-end">
                    {result.coefficient !== null && (
                      <span className="text-xs font-mono text-gray-300">
                        {result.coefficient.toFixed(2)} <span className="text-gray-500">coeff</span>
                      </span>
                    )}
                    {result.concourses !== null && (
                      <span className="text-xs font-mono text-gray-400">
                        {result.concourses} <span className="text-gray-600">con</span>
                      </span>
                    )}
                    {result.note && (
                      <span className="text-xs text-orange-400 italic mt-1">
                        {result.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

