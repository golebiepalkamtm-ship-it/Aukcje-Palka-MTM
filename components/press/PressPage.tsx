'use client';

import { SmartImage } from '@/components/ui/SmartImage';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import GoldenCard from '@/components/ui/GoldenCard';

// Automatyczne wykrywanie gazet z folderów
const newspaperFolders = [
  {
    id: 1,
    name: 'Dobry Lot',
    path: '/press/articles/older/1/',
    cover: 'dobry-lot.jpg',
    images: ['dobry-lot-11.jpg', 'dobry-lot-21.jpg', 'dobry-lot-31.jpg', 'dobry-lot-41.jpg'],
    year: '2023',
  },
  {
    id: 2,
    name: 'Hodowca - Część 1',
    path: '/press/articles/older/2/',
    cover: 'Hodowca.jpg',
    images: ['Hodowca-1-001.jpg', 'Hodowca-2-001.jpg', 'Hodowca-3-001.jpg'],
    year: '2023',
  },
  {
    id: 3,
    name: 'Gazety Kolekcja',
    path: '/press/articles/older/3/',
    cover: 'Newspapers.jpg',
    images: [
      'Newspapers-1-708x1024.jpg',
      'Newspapers-1.jpg',
      'Newspapers-2.jpg',
      'Newspapers-3.jpg',
    ],
    year: '2023',
  },
  {
    id: 4,
    name: 'Hodowca 2014',
    path: '/press/articles/older/4/',
    cover: 'Hodowca2014m.jpg',
    images: ['Hodowca20142s (1).jpg', 'Hodowca20143s.jpg', 'Hodowca20144s.jpg'],
    year: '2014',
  },
];

export function PressPage() {
  const [selectedImagePair, setSelectedImagePair] = useState<{
    left: string;
    right: string;
    folderId: number;
  } | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isNewspaperOpen, setIsNewspaperOpen] = useState(false);
  const [currentNewspaperImages, setCurrentNewspaperImages] = useState<string[]>([]);

  // Obsługa klawiatury dla modala
  useEffect(() => {
    // Sprawdź czy jesteśmy w przeglądarce
    if (typeof document === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImagePair && e.key === 'Escape') {
        setSelectedImagePair(null);
      }
    };

    if (selectedImagePair) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImagePair]);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section
        className="relative z-10 pt-44 pb-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold uppercase tracking-[0.5em] text-white/60 mb-6">
            Prasa i Media
          </h1>
          <p
            className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto"
          >
            Opinie hodowców o naszych gołębiach, artykuły, wywiady i materiały prasowe o hodowli MTM
            Pałka
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* DVD Section - na górze */}
          <section className="mb-20">
            <GoldenCard className="glass-morphism relative z-[12] w-full rounded-3xl border-2 p-8 sm:p-12 lg:p-16 xl:p-20 2xl:p-24 text-white backdrop-blur-xl">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 2xl:gap-20 items-stretch w-full">
                {/* Okładka DVD (dopasowana do proporcji pudełka DVD) */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Subtelniejsze białe podświetlenie ZA ramką (nieprzycinane) */}
                    <div className="absolute -inset-4 -z-10 pointer-events-none blur-2xl shadow-2xl shadow-white/50" />

                    {/* Kontener okładki z rozjaśnioną ramką i 3D shading */}
                    <div className="relative w-full max-w-[260px] sm:max-w-[300px] md:max-w-[320px] aspect-[2/3] rounded-xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.55)] transition-all duration-500 group border border-neutral-700 bg-neutral-900">
                      <SmartImage
                        src="/press/articles/older/movie-cover.jpg"
                        alt="Okładka DVD - Film o hodowli MTM Pałka"
                        width={300}
                        height={450}
                        fitMode="contain"
                        aspectRatio="portrait"
                        className="w-full h-full object-contain"
                        onError={() => {
                          console.error('Błąd ładowania okładki DVD');
                        }}
                      />

                      {/* Spine (grzbiet) i plastikowa ramka dla realizmu */}
                      <div className="pointer-events-none absolute inset-0">
                        {/* Spine po lewej */}
                        <div className="absolute left-0 top-0 h-full w-[6%] bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
                        {/* Krawędź grzbietu (pozioma po prawej dla efektu grubości pudełka) */}
                        <div className="absolute right-0 top-0 h-full w-[10px] bg-gradient-to-l from-black/35 via-black/15 to-transparent" />
                        {/* Dolna krawędź (cień jak na półce) */}
                        <div className="absolute bottom-0 left-0 w-full h-[10px] bg-gradient-to-t from-black/45 via-black/20 to-transparent" />
                        {/* Plastikowa ramka */}
                        <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
                        <div className="absolute inset-0 rounded-xl shadow-[inset_0_10px_22px_rgba(255,255,255,0.12),inset_0_-10px_20px_rgba(0,0,0,0.35)]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Film YouTube */}
                <div className="flex justify-center">
                  <div className="relative w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] h-full rounded-xl overflow-hidden shadow-2xl">
                    <iframe
                      src="https://www.youtube.com/embed/utXkaMWyZfk"
                      title="Film o hodowli MTM Pałka"
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </GoldenCard>
          </section>

          {/* Gazety Grid - na dole */}
          <section className="mb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-full mx-auto">
              {newspaperFolders.map((folder, index) => (
                <div
                  key={folder.id}
                  className="aspect-[3/4] w-full"
                >
                  <div
                    onClick={() => {
                      console.log('Kliknięto kontener dla folderu:', folder.name, 'ID:', folder.id);
                      setSelectedImagePair({
                        left: folder.cover,
                        right: folder.images[0] || folder.cover,
                        folderId: folder.id,
                      });
                      setCurrentNewspaperImages(folder.images);
                      setIsNewspaperOpen(false);
                      setCurrentPageIndex(0);
                    }}
                    className="w-full h-full cursor-pointer overflow-hidden relative rounded-lg border-2 border-white/20 transition-all duration-300 hover:border-white hover:shadow-[0_0_60px_20px_rgba(255,255,255,1),0_0_100px_30px_rgba(255,255,255,0.7)] group"
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                    <SmartImage
                      src={`/press/articles/older/${folder.id}/${folder.cover}`}
                      alt={`Okładka ${folder.name}`}
                      width={300}
                      height={400}
                      fitMode="contain"
                      aspectRatio="portrait"
                      className="w-full h-full object-contain"
                      onError={() => {
                        console.error(
                          'Błąd ładowania obrazu:',
                          `/press/articles/older/${folder.id}/${folder.cover}`
                        );
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Modal dla zdjęć - poza layout */}
      {selectedImagePair && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="relative w-full h-full bg-transparent flex items-center justify-center">
            <button
              onClick={() => {
                setSelectedImagePair(null);
                setIsNewspaperOpen(false);
                setCurrentPageIndex(0);
              }}
              title="Zamknij (ESC)"
              className="absolute top-6 right-6 z-20 w-12 h-12 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Strzałka do otwierania gazety */}
            {!isNewspaperOpen && currentNewspaperImages.length > 0 && (
              <button
                onClick={() => setIsNewspaperOpen(true)}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 w-16 h-16 bg-blue-500/90 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl group"
                title="Otwórz gazetę"
              >
                <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            )}

            {/* Nawigacja między stronami */}
            {isNewspaperOpen && currentNewspaperImages.length > 0 && (
              <>
                <button
                  onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 2))}
                  disabled={currentPageIndex === 0}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-gray-500/90 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl"
                  title="Poprzednie strony"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPageIndex(
                      Math.min(currentNewspaperImages.length - 2, currentPageIndex + 2)
                    )
                  }
                  disabled={currentPageIndex >= currentNewspaperImages.length - 2}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-gray-500/90 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl"
                  title="Następne strony"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Okładka lub Strony gazety */}
            {!isNewspaperOpen ? (
              // Okładka gazety
              <div className="w-auto h-auto max-w-[85vw] max-h-[85vh]">
                <SmartImage
                  src={`/press/articles/older/${selectedImagePair.folderId}/${selectedImagePair.left}`}
                  alt="Okładka gazety"
                  width={800}
                  height={1200}
                  fitMode="contain"
                  aspectRatio="portrait"
                  className="w-auto h-full max-h-[85vh] rounded-lg shadow-2xl"
                />
              </div>
            ) : (
              // Strony gazety - 2 obok siebie
              <div className="flex gap-6 w-full h-full items-center justify-center px-4">
                {/* Lewa strona */}
                <div className="flex-1 max-w-[42vw] max-h-[85vh]">
                  <SmartImage
                    src={`/press/articles/older/${selectedImagePair.folderId}/${currentNewspaperImages[currentPageIndex] || selectedImagePair.left}`}
                    alt={`Strona ${currentPageIndex + 1}`}
                    width={800}
                    height={1200}
                    fitMode="contain"
                    aspectRatio="portrait"
                    className="w-full h-full max-h-[85vh] rounded-lg shadow-2xl"
                  />
                </div>

                {/* Prawa strona */}
                {currentNewspaperImages[currentPageIndex + 1] && (
                  <div className="flex-1 max-w-[42vw] max-h-[85vh]">
                    <SmartImage
                      src={`/press/articles/older/${selectedImagePair.folderId}/${currentNewspaperImages[currentPageIndex + 1]}`}
                      alt={`Strona ${currentPageIndex + 2}`}
                      width={800}
                      height={1200}
                      fitMode="contain"
                      aspectRatio="portrait"
                      className="w-full h-full max-h-[85vh] rounded-lg shadow-2xl"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Wskaźnik stron */}
            {isNewspaperOpen && currentNewspaperImages.length > 0 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                {Array.from(
                  { length: Math.ceil(currentNewspaperImages.length / 2) },
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPageIndex(index * 2)}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        Math.floor(currentPageIndex / 2) === index
                          ? 'bg-blue-500 scale-125 shadow-lg'
                          : 'bg-gray-400 hover:bg-gray-300'
                      }`}
                      title={`Strony ${index * 2 + 1}-${index * 2 + 2}`}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
