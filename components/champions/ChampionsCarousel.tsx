"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Champion {
  id: string;
  images: string[];
  pedigreeImage?: string;
  name?: string;
  achievements?: string[];
}

interface ChampionsCarouselProps {
  champions: Champion[];
  onImageClick: (imageSrc: string, index: number, sourceEl: HTMLElement) => void;
  onPedigreeClick: (pedigreeImage: string) => void;
  onCentralChampionChange?: (champion: Champion | null) => void;
  className?: string;
}

const FALLBACK_URLS = [
  "https://farm9.staticflickr.com/8461/8048823381_0fbc2d8efb.jpg",
  "https://farm7.staticflickr.com/6217/6216951796_e50778255c.jpg",
  "https://farm7.staticflickr.com/6083/6055581292_d94c2d90e3.jpg",
];

export const ChampionsCarousel = memo(function ChampionsCarousel({
  champions,
  onImageClick,
  onPedigreeClick,
  onCentralChampionChange,
  className = "",
}: ChampionsCarouselProps) {
  const items = useMemo(() => {
    const imgs: { src: string; title: string; desc: string }[] = [];
    for (const c of champions) {
      if (Array.isArray(c.images)) {
        for (const s of c.images) {
          if (typeof s === "string" && s) {
            imgs.push({ src: s, title: c.name || `Champion ${c.id}`, desc: c.achievements?.[0] || "" });
          }
        }
      }
    }
    if (imgs.length === 0) {
      return FALLBACK_URLS.map((u, i) => ({ src: u, title: `Image ${i + 1}`, desc: "" }));
    }
    return imgs;
  }, [champions]);

  const n = items.length || 1;
  const radius = 50; // vw
  const cardW = 18; // vw - ZWIĘKSZONE, aby powiększyć zdjęcia
  const step = 360 / n;
  const MOUSE_SENSITIVITY = 0.15;
  const ROTATE_STEP_MULT = 1;
  const TRANSITION_STYLE = "transform 0.45s cubic-bezier(0.2,0.8,0.2,1)";

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

      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{
          height: "100vh",
          perspective: "1200px",
          transformStyle: "preserve-3d",
          background: "transparent",
        }}
      >
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
                style={{
                  top: 0,
                  left: 0,
                  width: `${cardW}vw`,
                  minWidth: 220,
                  maxWidth: 420,
                  height: "auto",
                  transformOrigin: `50% 50% -${radius}vw`,
                  transform: `translate3d(-50%,-50%,0) rotate3d(0,1,0,${rotate}deg)`,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                  cursor: "pointer",
                }}
                onClick={(e) => onImageClick(item.src, i, e.currentTarget as HTMLElement)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onImageClick(item.src, i, e.currentTarget as HTMLElement)
                  }
                }}
                aria-label={`Zdjęcie champion ${item.title || i + 1}`}
                role="button"
              >
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
        )}
      </div>
    </div>
  );
});
