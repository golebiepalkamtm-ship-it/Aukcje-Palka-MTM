'use client';

import { SimpleChampionsList } from './SimpleChampionsList';

interface Champion {
  id: string;
  images: string[];
  pedigreeImage?: string;
  name?: string;
}

interface ChampionProfileProps {
  champion: Champion;
}

export function ChampionProfile({ champion }: ChampionProfileProps) {
  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          {champion.name || `Champion ${champion.id}`}
        </h1>
        <SimpleChampionsList
          onPedigreeClick={(img) => {
            // Handle pedigree click if needed
          }}
        />
      </div>
    </div>
  );
}

