'use client';

import { useEffect } from 'react';
import { initGlowingCards } from '../glowing-cards';

export default function AboutMePage() {
  useEffect(() => {
    // Inicjalizuj efekt dla kart na tej stronie po zamontowaniu komponentu
    initGlowingCards();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">O mnie</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Przykład 1: Karta z informacjami */}
        <div className="glowing-card bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="glowing-card-content p-6">
            <h2 className="text-2xl font-semibold mb-4">Moja Pasja</h2>
            <p className="text-gray-300">
              Gołębie pocztowe to nie tylko hobby, to styl życia. Od lat poświęcam
              się hodowli, selekcji i treningowi najlepszych ptaków, które
              osiągają czołowe wyniki na arenie krajowej i międzynarodowej.
            </p>
          </div>
        </div>

        {/* Przykład 2: Karta ze zdjęciem */}
        <div className="glowing-card bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <div className="glowing-card-content">
            <img
              src="/images/champion-pigeon.jpg"
              alt="Gołąb czempion"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}