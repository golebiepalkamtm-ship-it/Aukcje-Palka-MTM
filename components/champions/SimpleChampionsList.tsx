'use client';

import ImageModal from '@/components/ImageModal';
import { useEffect, useState } from 'react';
import { debug, isDev } from '@/lib/logger';
import { ChampionsCarousel } from './ChampionsCarousel';

interface Champion {
  id: string;
  images: string[];
  pedigreeImage?: string;
}

interface ChampionData {
  id?: string;
  images?: Array<string | { url?: string }>;
  pedigreeImage?: string;
}

export function SimpleChampionsList() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allImages, setAllImages] = useState<Array<{ src: string; alt: string }>>([]);
  const [selectedPedigreeImage, setSelectedPedigreeImage] = useState<string | null>(null);

  // Ładowanie championów z API
  useEffect(() => {
    const loadChampions = async () => {
      try {
        setIsLoading(true);
        if (isDev) debug('Fetching champions from API...');
        const response = await fetch('/api/champions/images');
        if (isDev) debug('API response status:', response.status);
        if (isDev) debug('API response ok:', response.ok);

        if (!response.ok) {
          throw new Error('Nie udało się pobrać danych championów');
        }

        const responseData = await response.json();
        if (isDev) debug('API response data:', responseData);
        const championsData = responseData.champions || [];
        if (isDev) debug('Champions data from API:', championsData);

        // Konwertuj dane z API na format Champion
        const championsList = championsData
          .map((championData: ChampionData) => {
            const apiImages = Array.isArray(championData.images) ? championData.images : [];
            if (isDev) debug('Raw API images for champion', championData.id, ':', apiImages); // Debug

            const gallery = apiImages
              .map((img: string | { url?: string }) => {
                if (typeof img === 'string') return img;
                if (typeof img === 'object' && img !== null) {
                  return String(img.url || '');
                }
                return '';
              })
              .filter(Boolean);

            // Sprawdź czy champion ma dane pedigree z API
            let pedigreeImage = '';
            const championWithPedigree = championData as {
              id: string;
              name?: string;
              ringNumber?: string;
              pedigree?: {
                images?: string[];
              };
            };

            if (isDev) debug('Champion data pedigree:', championWithPedigree.pedigree);

            if (
              championWithPedigree.pedigree?.images &&
              championWithPedigree.pedigree.images.length > 0
            ) {
              pedigreeImage = championWithPedigree.pedigree.images[0];
              if (isDev) debug('Using API pedigree image:', pedigreeImage);
            } else {
              // Fallback do domyślnej ścieżki
              pedigreeImage = `/champions/${championData.id}/pedigree/${championWithPedigree.ringNumber || 'pedigree'}.1.jpg`;
              if (isDev) debug('Using fallback pedigree image:', pedigreeImage);
            }

            if (isDev)
              debug(
                'Processed champion:',
                championData.id,
                'Gallery length:',
                gallery.length,
                'Gallery:',
                gallery
              ); // Debug
            if (isDev)
              debug(
                'Pedigree data for champion',
                championData.id,
                ':',
                championWithPedigree.pedigree
              ); // Debug
            if (isDev) debug('Final pedigreeImage:', pedigreeImage); // Debug

            return {
              id: String(championData.id || ''),
              images: gallery,
              pedigreeImage: pedigreeImage,
            };
          })
          .filter((c: Champion) => c && c.id);

        if (isDev) debug('Processed champions list:', championsList);
        if (isDev) debug('Champions list length:', championsList.length);

        setChampions(championsList);
        if (isDev) debug('Loaded champions:', championsList); // Debug

        // Przygotuj wszystkie zdjęcia do nawigacji w modalu
        const flatImages = championsList
          .flatMap((champion: Champion) =>
            champion.images.map(src => ({ src, alt: `Zdjęcie championa` }))
          )
          .slice(0, 20); // Ogranicz do 20, tak jak w renderowaniu

        setAllImages(flatImages);
      } catch (err) {
        console.error('Błąd podczas ładowania championów:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadChampions();
  }, []);

  const handleImageClick = (imageSrc: string, index: number) => {
    // Używamy lokalnego stanu zamiast kontekstu
    setSelectedImage({ src: imageSrc, alt: `Zdjęcie ${index + 1}` });
    setSelectedImageIndex(index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <span className="ml-4 text-white">Ładowanie championów...</span>
      </div>
    );
  }

  return (
    <>
      {/* Champions Carousel */}
      <ChampionsCarousel
        champions={champions}
        onImageClick={handleImageClick}
        onPedigreeClick={pedigreeImage => {
          if (isDev) debug('=== onPedigreeClick CALLED ===');
          if (isDev) debug('Pedigree image received:', pedigreeImage);
          if (isDev) debug('Setting selectedPedigreeImage to:', pedigreeImage);
          setSelectedPedigreeImage(pedigreeImage);
          if (isDev) debug('selectedPedigreeImage set successfully');
          if (isDev) debug('=== END onPedigreeClick ===');
        }}
      />

      {/* Image Modal - renderowany lokalnie */}
      {selectedImage && selectedImageIndex !== null && (
        <ImageModal
          image={{
            id: `champion-image-${selectedImageIndex}`,
            src: selectedImage.src,
            alt: selectedImage.alt,
          }}
          onClose={() => {
            setSelectedImage(null);
            setSelectedImageIndex(null);
          }}
          onPrevious={
            selectedImageIndex > 0
              ? () =>
                  handleImageClick(allImages[selectedImageIndex - 1].src, selectedImageIndex - 1)
              : undefined
          }
          onNext={
            selectedImageIndex < allImages.length - 1
              ? () =>
                  handleImageClick(allImages[selectedImageIndex + 1].src, selectedImageIndex + 1)
              : undefined
          }
          hasPrevious={selectedImageIndex > 0}
          hasNext={selectedImageIndex < allImages.length - 1}
          currentIndex={selectedImageIndex}
          totalImages={allImages.length}
        />
      )}

      {/* Pedigree Image Modal */}
      {selectedPedigreeImage && (
        <ImageModal
          image={{ id: 'pedigree-image', src: selectedPedigreeImage, alt: 'Rodowód championa' }}
          onClose={() => {
            if (isDev) debug('Closing pedigree modal');
            setSelectedPedigreeImage(null);
          }}
        />
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          <div>Selected Pedigree: {selectedPedigreeImage || 'none'}</div>
          <div>Champions loaded: {champions.length}</div>
        </div>
      )}
    </>
  );
}
