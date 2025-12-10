"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SmartImage } from "@/components/ui/SmartImage";

interface Champion {
  id: string;
  images: string[];
  pedigreeImage?: string;
  name?: string;
  achievements?: string[];
}

interface ChampionImage {
  championId: string;
  imageSrc: string;
  championIndex: number;
  imageIndex: number;
}

interface ChampionsCarouselProps {
  champions: Champion[];
}

export function ChampionsCarousel({ champions }: ChampionsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Przygotuj wszystkie zdjęcia z wszystkich championów
  const allImages: ChampionImage[] = champions.flatMap((champion, championIndex) =>
    champion.images.map((imageSrc, imageIndex) => ({
      championId: champion.id,
      imageSrc: imageSrc,
      championIndex,
      imageIndex,
    }))
  );

  console.log('ChampionsCarousel - Total champions:', champions.length);
  console.log('ChampionsCarousel - Total images:', allImages.length);
  console.log(
    'ChampionsCarousel - Champions data:',
    champions.map(c => ({ id: c.id, imagesCount: c.images.length }))
  );

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % allImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (allImages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white">Brak zdjęć championów do wyświetlenia.</p>
      </div>
    );
  }

  // Wybierz zdjęcia do wyświetlenia (aktualne + 4 po bokach = 5 łącznie)
  const getVisibleImages = () => {
    const visible: Array<{
      imageData: ChampionImage;
      champion: Champion;
      position: number;
      index: number;
      championIndex: number;
    }> = [];
    const total = allImages.length;

    // Jeśli mamy mniej niż 5 zdjęć, powtarzaj zdjęcia
    if (total === 0) return visible;

    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + total) % total;
      const imageData = allImages[index];
      const champion = champions[imageData.championIndex];

      visible.push({
        imageData,
        champion,
        position: i, // -2: far left, -1: left, 0: center, 1: right, 2: far right
        index,
        championIndex: imageData.championIndex,
      });
    }

    return visible;
  };

<<<<<<< HEAD
  const visibleImages = getVisibleImages();
=======
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ringAngle, setRingAngle] = useState(0);

  // Usunięto przewijanie muszką - zostawiono tylko scroll przyciskami

  const next = useCallback(() => {
    if (n <= 1) return;
    setRingAngle((a) => a - step); // Pełny krok do następnego gołębia
  }, [n, step]);

  const prev = useCallback(() => {
    if (n <= 1) return;
    setRingAngle((a) => a + step); // Pełny krok do poprzedniego gołębia
  }, [n, step]);
>>>>>>> 37190d0b63b671515d651f0bf7fbdd3ff16cc7a9

  // Track central champion when angle changes
  useEffect(() => {
    if (onCentralChampionChange && n > 0) {
      const idx = ((Math.round((-ringAngle) / step) % n) + n) % n;
      const centralChamp = champions[idx];
      onCentralChampionChange(centralChamp || null);
    }
  }, [ringAngle, step, n, champions, onCentralChampionChange]);

  // Get current central champion
  const currentCentralIndex = n > 0 ? ((Math.round((-ringAngle) / step) % n) + n) % n : 0;
  const currentCentralChampion = champions[currentCentralIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('[role="dialog"], input, textarea, select')) {
        return; // Don't interfere with dialogs or form elements
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev]);

  return (
<<<<<<< HEAD
    <div className="relative w-full max-w-[1800px] mx-auto px-2">

      {/* Carousel Container */}
=======
    <div
      className={`relative w-full max-w-[1600px] mx-auto px-4 -mt-4 ${className}`}
      role="region"
      aria-label="Karuzela championów gołębi pocztowych"
    >
      {/* Navigation arrows outside carousel */}
      {n > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-4 sm:p-5 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 bg-white/80 hover:bg-white text-gray-800 -ml-20 sm:-ml-24"
            type="button"
            aria-label="Poprzedni champion"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
          </button>

          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-4 sm:p-5 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 bg-white/80 hover:bg-white text-gray-800 -mr-20 sm:-mr-24"
            type="button"
            aria-label="Następny champion"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
          </button>
        </>
      )}

>>>>>>> 37190d0b63b671515d651f0bf7fbdd3ff16cc7a9
      <div
        className="relative h-[360px] sm:h-[420px] overflow-hidden pb-6"
        style={{
          perspective: '1500px',
          perspectiveOrigin: 'center center',
        }}
      >
<<<<<<< HEAD
        <AnimatePresence>
          {visibleImages.map(({ imageData, champion, position, index }) => (
            <motion.div
              key={`${imageData.championId}-${imageData.imageIndex}-${index}`}
              className={`absolute inset-0 flex items-start justify-center pt-2 ${
                position === 0 ? 'z-30' : position === -1 || position === 1 ? 'z-20' : 'z-10'
              }`}
              initial={{
                opacity: 0,
                x: position * 24 + '%',
                rotateY: position * -45,
                scale: position === 0 ? 1 : Math.abs(position) === 1 ? 0.85 : 0.75,
                filter: Math.abs(position) >= 2 ? 'blur(2px)' : 'blur(0px)',
                z: position === 0 ? 100 : Math.abs(position) === 1 ? 50 : 0,
              }}
              animate={{
                opacity: position === 0 ? 1 : Math.abs(position) === 1 ? 0.9 : 0.8,
                x: position * 24 + '%',
                rotateY: position * -45,
                scale: position === 0 ? 1 : Math.abs(position) === 1 ? 0.85 : 0.75,
                filter: Math.abs(position) >= 2 ? 'blur(1px)' : 'blur(0px)',
                z: position === 0 ? 100 : Math.abs(position) === 1 ? 50 : 0,
              }}
              exit={{ opacity: 0, x: position * 24 + '%', rotateY: position * -45, scale: 0.8, z: 0 }}
              transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.8 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Champion Card */}
              <motion.div
                className={`relative overflow-hidden cursor-pointer`}
=======
        <div
          id="imgs"
          className="absolute"
          style={{
            top: "35%", // Przesunięcie wyżej dla lepszego wycentrowania
            left: "50%",
            transformStyle: "preserve-3d",
            transformOrigin: `0 0 -${radius}vw`,
            transform: `translate(-50%,-50%) rotate3d(0,1,0,${ringAngle}deg)`,
            transition: TRANSITION_STYLE,
          }}
        >
          <div
            className="pointer-events-none"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 900,
              height: 900,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 30%, transparent 40%)",
              filter: "blur(3px)",
            }}
          />

          {items.map((item, i) => {
            const rotate = step * i;
            return (
              <div
                key={`${item.src}-${i}`}
                className="absolute focus:outline-none focus:ring-4 focus:ring-blue-500"
                tabIndex={0}
>>>>>>> 37190d0b63b671515d651f0bf7fbdd3ff16cc7a9
                style={{
                  width: position === 0 ? '480px' : position === -1 || position === 1 ? '360px' : '260px',
                  height: position === 0 ? '360px' : position === -1 || position === 1 ? '270px' : '195px',
                  transform: `translateZ(${position === 0 ? '50px' : Math.abs(position) === 1 ? '25px' : '0px'})`,
                  boxShadow: position === 0
                    ? '0 10px 30px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.1)'
                    : position === -1 || position === 1
                      ? '0 8px 20px rgba(0,0,0,0.2), 0 0 10px rgba(255,255,255,0.05)'
                      : '0 5px 15px rgba(0,0,0,0.1), 0 0 5px rgba(255,255,255,0.02)',
                }}
                whileHover={{
                  scale: position === 0 ? 1.03 : 0.96,
                  boxShadow: position === 0
                    ? '0 15px 40px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.15)'
                    : '0 10px 25px rgba(0,0,0,0.3), 0 0 15px rgba(255,255,255,0.08)',
                  transition: { duration: 0.25 },
                }}
                onClick={e => {
                  if (position === 0) {
                    // Emituj zdarzenie DOM zamiast oczekiwać callbacku w props
                    const detail = {
                      imageSrc: imageData.imageSrc,
                      index,
                      championIndex: imageData.championIndex,
                      sourceEl: e.currentTarget as HTMLElement,
                    };
                    try {
                      window.dispatchEvent(new CustomEvent('championImageClick', { detail }));
                      console.log('Dispatched championImageClick', detail);
                    } catch (err) {
                      console.warn('Could not dispatch championImageClick', err);
                    }
                  } else if (position !== 0) {
                    goToSlide(index);
                  }
                }}
              >
<<<<<<< HEAD
                {/* Champion Image */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <SmartImage
                    src={imageData.imageSrc}
                    alt={`Champion ${champion.id} - Zdjęcie ${imageData.imageIndex + 1}`}
                    width={0}
                    height={0}
                    fitMode="cover"
                    aspectRatio="auto"
                    className={`w-full h-full transition-all duration-500 ${position === 0 ? 'grayscale-0 brightness-100' : 'grayscale brightness-75'}`}
                    sizes="100vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
=======
                <img
                  src={item.src}
                  alt={item.title || `Champion ${i + 1}`}
                  data-testid="champion-image"
                  style={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: "4/3",
                    objectFit: "cover",
                    boxSizing: "border-box",
                    padding: 8,
                    display: "block",
                    borderRadius: 12,
                    filter: "brightness(1)",
                    boxShadow: "0 2px 32px rgba(0,0,0,.7)",
                    border: "2px solid #fff",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            );
          })}
        </div>



        {/* RODOWÓD Button - positioned above progress dots */}
        {currentCentralChampion?.pedigreeImage && (
          <button
            onClick={() => onPedigreeClick(currentCentralChampion.pedigreeImage!)}
            className="absolute top-[50%] -translate-y-1/2 left-1/2 -translate-x-1/2 z-30 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            type="button"
          >
            RODOWÓD
          </button>
        )}

        {/* Progress Dots - positioned slightly below RODOWÓD button */}
        {n > 1 && (
          <div
            className="absolute top-[60%] left-1/2 -translate-x-1/2 z-30 flex space-x-2"
            role="tablist"
            aria-label="Wskaźniki pozycji w karuzeli championów"
          >
            {Array.from({ length: n }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  const targetAngle = -step * i;
                  setRingAngle(targetAngle);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  Math.abs(currentCentralIndex - i) < 0.5
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                role="tab"
                aria-label={`Przejdź do zdjęcia ${i + 1}`}
                aria-selected={Math.abs(currentCentralIndex - i) < 0.5}
                type="button"
              />
            ))}
          </div>
>>>>>>> 37190d0b63b671515d651f0bf7fbdd3ff16cc7a9
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
});
>>>>>>> 37190d0b63b671515d651f0bf7fbdd3ff16cc7a9
