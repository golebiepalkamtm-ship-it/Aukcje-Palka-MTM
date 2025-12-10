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
<<<<<<< HEAD
    <div className="container mx-auto px-4 pt-4 pb-8">
      {/* Champion Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Champion {champion.id}
=======
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          {champion.name || `Champion ${champion.id}`}
>>>>>>> 37190d0b63b671515d651f0bf7fbdd3ff16cc7a9
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

