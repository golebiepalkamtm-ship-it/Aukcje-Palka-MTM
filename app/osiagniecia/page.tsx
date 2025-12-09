// @ts-nocheck
'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { achievementsData } from '@/lib/achievements/data';
import GoldenCard from '@/components/ui/GoldenCard';
import './achievements-glow.css';

export default function AchievementsPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useLayoutEffect(() => {
    // Opóźnienie inicjalizacji efektów, aby dać czas na renderowanie komponentów React
    const initEffects = () => {
      const goldenCards = document.querySelectorAll('article.colored-glow-card');

      goldenCards.forEach(card => {
        // Efekt rotacji 3D
        const handleMouseMove = (e) => {
          const bentoRect = card.getBoundingClientRect();
          const bentoWidth = bentoRect.width;
          const bentoHeight = bentoRect.height;

          const centerX = bentoRect.left + bentoWidth / 2;
          const centerY = bentoRect.top + bentoHeight / 2;

          const mouseX = e.clientX - centerX;
          const mouseY = e.clientY - centerY;

          const rotateX = (+1) * (mouseY / (bentoHeight / 2)) * 10;
          const rotateY = (-1) * (mouseX / (bentoWidth / 2)) * 10;

          card.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        };

        const handleMouseLeave = () => {
          card.style.transform = `perspective(500px) rotateX(0deg) rotateY(0deg)`;
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    // Inicjalizuj efekty natychmiast
    initEffects();
  }, []);

  const years = Object.keys(achievementsData)
    .map(Number)
    .sort((a, b) => b - a);

    const categories = ['all', 'Oddział', 'Region', 'MP'];

  const filteredData = selectedYear
    ? { [selectedYear]: achievementsData[selectedYear] }
    : achievementsData;

  const filterByCategory = (achievements: any) => {
    const list: any[] = Array.isArray(achievements) ? achievements : Object.values(achievements as Record<string, any[]>).flat();
    if (selectedCategory === 'all') return list;
    return list.filter((ach) =>
      String(ach.category).toLowerCase().includes(selectedCategory.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-[0.5em] text-white/60 mb-6">
            Osiągnięcia
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Historia sukcesów hodowli PAŁKA MTM - od 2001 roku do dziś
          </p>
        </motion.section>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Year Filter */}
          <GoldenCard>
            <h3 className="text-lg font-semibold mb-3">Filtruj według roku:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedYear(null)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedYear === null
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Wszystkie lata
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedYear === year
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </GoldenCard>

          {/* Category Filter */}
          <GoldenCard>
            <h3 className="text-lg font-semibold mb-3">Filtruj według kategorii:</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {cat === 'all' ? 'Wszystkie' : cat}
                </button>
              ))}
            </div>
          </GoldenCard>
        </div>

        {/* Achievements List */}
        <div className="space-y-8">
          {Object.entries(filteredData)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
            .map(([year, achievements]) => {
              const filtered = filterByCategory(achievements);
              if (filtered.length === 0) return null;

              return (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Year Header Card */}
                  <GoldenCard className="mb-4">
                    <h2 className="text-3xl font-bold">{year}</h2>
                    <p className="text-white/80 mt-1">
                      {filtered.length} {filtered.length === 1 ? 'osiągnięcie' : 'osiągnięć'}
                    </p>
                  </GoldenCard>

                  {/* Achievements Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((achievement, index) => (
                      <motion.div
                        key={`${year}-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <GoldenCard>
                          {/* Category Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-200 border border-yellow-400/30 rounded-full text-sm font-medium">
                              {achievement.category}
                            </span>
                            {String(achievement?.title ?? '').includes('MISTRZ') && (
                              <span className="text-2xl" title="Mistrz">
                                🏆
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-bold mb-2">
                            {achievement.title}
                          </h3>

                          {/* Stats */}
                          <div className="space-y-2 text-sm">
                            {achievement.coefficient && (
                              <div className="flex justify-between text-white">
                                <span>Współczynnik:</span>
                                <span className="font-semibold text-yellow-200">
                                  {achievement.coefficient}
                                </span>
                              </div>
                            )}
                            {achievement.concourses && (
                              <div className="flex justify-between text-white">
                                <span>Konkursy:</span>
                                <span className="font-semibold text-yellow-200">
                                  {achievement.concourses}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Achievement Type Indicator */}
                          <div className="mt-4 pt-3 border-t border-white/20">
                            <div className="flex items-center gap-2">
                              {String(achievement?.title ?? '').includes('MISTRZ') && !String(achievement?.title ?? '').includes('V-ce') && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-200 rounded text-xs font-medium">
                                  Mistrz
                                </span>
                              )}
                              {String(achievement?.title ?? '').includes('V-ce') && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-200 border border-yellow-400/30 rounded text-xs font-medium">
                                  Wicemistrz
                                </span>
                              )}
                              {String(achievement?.title ?? '').includes('Przodownik') && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-200 rounded text-xs font-medium">
                                  Przodownik
                                </span>
                              )}
                            </div>
                          </div>
                        </GoldenCard>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Summary Statistics Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <GoldenCard>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Podsumowanie
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {years.length}
                </div>
                <div className="text-white/80 text-sm">Lat startów</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {(Object.values(achievementsData).flat() as any[]).length}
                </div>
                <div className="text-white/80 text-sm">Osiągnięć</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {
                    (Object.values(achievementsData).flat() as any[])
                      .filter((a) => String(a.title).includes('MISTRZ') && !String(a.title).includes('V-ce'))
                      .length
                  }
                </div>
                <div className="text-white/80 text-sm">Tytułów Mistrza</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {
                    (Object.values(achievementsData).flat() as any[])
                      .filter((a) => String(a.title).includes('V-ce'))
                      .length
                  }
                </div>
                <div className="text-white/80 text-sm">Wicemistrzostw</div>
              </div>
            </div>
          </GoldenCard>
        </motion.div>
      </div>
    </div>
  );
}
