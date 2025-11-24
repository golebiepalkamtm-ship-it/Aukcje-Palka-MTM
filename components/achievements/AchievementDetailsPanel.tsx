'use client';

import { Fragment } from 'react';
import { X } from 'lucide-react';
import type { YearData } from '@/lib/achievements/types';

type AchievementDetailsPanelProps = {
  yearData: YearData | null;
  onClose: () => void;
};

export default function AchievementDetailsPanel({
  yearData,
  onClose,
}: AchievementDetailsPanelProps) {
  if (!yearData) {
    return null;
  }

  return (
    <aside className="pointer-events-none absolute right-8 top-1/2 z-50 w-[400px] max-w-[90vw] -translate-y-1/2 rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-white shadow-2xl backdrop-blur-xl">
      <div className="pointer-events-auto flex items-center justify-between">
        <div>
          <p className="text-4xl font-bold uppercase tracking-[0.5em] text-white/60">
            Rok
          </p>
          <h2 className="text-gradient text-3xl font-semibold">{yearData.year}</h2>
          <p className="text-sm text-white/70">Mistrzowskie rekordy Palka MTM</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="pointer-events-auto mt-6 max-h-[60vh] space-y-4 overflow-y-auto pr-2">
        {yearData.divisions.map((division) => (
          <div
            key={`${yearData.year}-${division.level}-${division.divisionName}`}
            className="rounded-2xl border border-white/5 bg-black/40 p-4 shadow-inner"
          >
            <p className="text-4xl font-bold uppercase tracking-[0.5em] text-white/60">
              {division.level}
            </p>
            <p className="text-lg font-semibold text-white">{division.divisionName}</p>

            <dl className="mt-3 space-y-3 text-sm text-white/80">
              {division.results.map((result, index) => (
                <Fragment
                  key={`${division.level}-${division.divisionName}-${result.category}-${index}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                        {result.category}
                      </p>
                      <p className="font-medium text-white">{result.title}</p>
                    </div>
                    <div className="text-right text-xs text-white/60">
                      {typeof result.coefficient === 'number' && (
                        <p>Coeff: {result.coefficient.toFixed(2)}</p>
                      )}
                      {typeof result.concourses === 'number' && <p>Konk.: {result.concourses}</p>}
                    </div>
                  </div>
                  {result.note && (
                    <p className="text-xs text-white/50">Notatka: {result.note}</p>
                  )}
                </Fragment>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </aside>
  );
}

