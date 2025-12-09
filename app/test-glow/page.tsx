
'use client';

import { GlowingEdgeCard } from '@/components/ui/GlowingEdgeCard';

export default function TestGlowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Test Glowing Edge Effect
        </h1>

        {/* Test 1: Podstawowa karta */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GlowingEdgeCard className="p-6 bg-gray-800/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-2">Karta #1</h2>
            <p className="text-gray-300">
              Przesuń myszką nad kartą, aby zobaczyć efekt świecących krawędzi.
            </p>
          </GlowingEdgeCard>

          <GlowingEdgeCard className="p-6 bg-gray-800/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-2">Karta #2</h2>
            <p className="text-gray-300">
              Efekt powinien śledzić pozycję kursora i tworzyć kolorowe świecenie.
            </p>
          </GlowingEdgeCard>

          <GlowingEdgeCard className="p-6 bg-gray-800/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-2">Karta #3</h2>
            <p className="text-gray-300">
              Świecenie powinno być najbardziej intensywne przy krawędziach.
            </p>
          </GlowingEdgeCard>
        </div>

        {/* Test 2: Różne czułości */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Różne czułości efektu:</h2>
          
          <GlowingEdgeCard 
            className="p-6 bg-gray-800/50 backdrop-blur-sm"
            glowSensitivity={10}
            colorSensitivity={20}
          >
            <h3 className="text-lg font-bold text-white mb-2">Wysoka czułość (10/20)</h3>
            <p className="text-gray-300">Efekt pojawia się wcześniej, dalej od krawędzi</p>
          </GlowingEdgeCard>

          <GlowingEdgeCard 
            className="p-6 bg-gray-800/50 backdrop-blur-sm"
            glowSensitivity={30}
            colorSensitivity={50}
          >
            <h3 className="text-lg font-bold text-white mb-2">Niska czułość (30/50)</h3>
            <p className="text-gray-300">Efekt pojawia się tylko bardzo blisko krawędzi</p>
          </GlowingEdgeCard>
        </div>

        {/* Test 3: Duża karta z zawartością */}
        <GlowingEdgeCard className="p-8 bg-gray-800/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Duża karta testowa</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-300">
            <div>
              <h3 className="font-bold text-white mb-2">Kolumna 1</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Kolumna 2</h3>
              <p>Sed do eiusmod tempor incididunt ut labore et dolore magna.</p>
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Przycisk 1
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Przycisk 2
            </button>
          </div>
        </GlowingEdgeCard>

        {/* Instrukcje debugowania */}
        <div className="mt-12 p-6 bg-yellow-900/20 border border-yellow-600 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">🔍 Jak sprawdzić czy działa:</h2>
          <ol className="list-decimal list-inside space-y-2 text-yellow-200">
            <li>Przesuń myszką nad dowolną kartą</li>
            <li>Powinieneś zobaczyć kolorowe świecenie przy krawędziach</li>
            <li>Świecenie powinno śledzić pozycję kursora</li>
            <li>Otwórz DevTools (F12) → Console i sprawdź czy nie ma błędów</li>
            <li>W DevTools → Elements sprawdź czy karty mają style CSS variables (--pointer-x, --pointer-y, --pointer-°, --pointer-d)</li>
          </ol>
        </div>

        {/* Debug info */}
        <div className="mt-8 p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Debug Info:</h2>
          <div className="space-y-2 text-gray-300 font-mono text-sm">
            <p>✓ GlowingEdgeCard component imported</p>
            <p>✓ CSS classes applied: .glowing-card-effect</p>
            <p>✓ Mouse tracking: onMouseMove & onMouseLeave</p>
            <p>✓ CSS variables: --pointer-x, --pointer-y, --pointer-°, --pointer-d</p>
          </div>
        </div>
      </div>
    </div>
  );
}
