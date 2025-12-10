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

  const visibleImages = getVisibleImages();

  return (
    <div className="relative w-full max-w-[1800px] mx-auto px-2">

      {/* Carousel Container */}
      <div
        className="relative h-[360px] sm:h-[420px] overflow-hidden pb-6"
        style={{
          perspective: '1500px',
          perspectiveOrigin: 'center center',
        }}
      >
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
        )}
      </div>
    </div>
  );
}
