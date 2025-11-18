'use client';

import { useEffect, useRef } from 'react';

// Typy dla biblioteki LiquidBackground
interface LiquidApp {
  loadImage: (url: string) => void;
  liquidPlane: {
    material: {
      metalness: number;
      roughness: number;
    };
    uniforms: {
      displacementScale: {
        value: number;
      };
    };
  };
  setRain: (enabled: boolean) => void;
}

declare global {
  interface Window {
    LiquidBackground?: (canvas: HTMLCanvasElement) => LiquidApp;
    liquidBackgroundInitialized?: boolean;
  }
}

// Global flag aby uniknąć podwójnej inicjalizacji
let scriptLoaded = false;

/**
 * LiquidBackground - Efekt płynnego tła 3D z Three.js
 * Wykorzystuje bibliotekę threejs-components z CDN
 * UWAGA: Wyłączone w production - powoduje błędy i blokuje renderowanie
 */
export function LiquidBackground() {
  // Wszystkie React Hooks MUSZĄ być na górze, przed jakimkolwiek early return
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Wyłącz w production - powoduje problemy z liquid1.min.js
  // Sprawdź czy jesteśmy w przeglądarce i czy LiquidBackground jest włączony
  const enableLiquidBackground =
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_ENABLE_LIQUID_BACKGROUND === 'true';

  useEffect(() => {
    // Jeśli LiquidBackground jest wyłączony, nie rób nic
    if (!enableLiquidBackground) {
      return;
    }

    // Jeśli nie jesteśmy w przeglądarce, nie rób nic (już sprawdzone wyżej, ale dla pewności)
    if (typeof window === 'undefined' || !canvasRef.current || scriptLoaded) {
      return;
    }

    scriptLoaded = true;
    const canvas = canvasRef.current;

    // Obsługa błędów - ukryj canvas jeśli wystąpi błąd
    const hideCanvasOnError = () => {
      if (canvas) {
        canvas.style.display = 'none';
      }
    };

    // Dodaj script do head - tylko raz
    const script = document.createElement('script');
    script.type = 'module';
    script.id = 'liquid-background-script';
    
    // Obsługa błędów ładowania skryptu
    script.onerror = () => {
      console.warn('LiquidBackground: Failed to load script');
      hideCanvasOnError();
      scriptLoaded = false;
    };

    script.innerHTML = `
      (async () => {
        try {
          // Import biblioteki z obsługą błędów
          const LiquidBackgroundModule = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js')
            .catch((importError) => {
              console.warn('LiquidBackground: Failed to import library:', importError);
              throw importError;
            });
          
          const LiquidBackground = LiquidBackgroundModule.default || LiquidBackgroundModule;
          
          const canvas = document.getElementById('liquid-canvas');
          if (!canvas || window.liquidBackgroundInitialized) return;
          
          window.liquidBackgroundInitialized = true;
          
          try {
            const app = LiquidBackground(canvas);
            
            // Obsługa błędów ładowania obrazu - loadImage może zwracać Promise
            // WAŻNE: loadImage może rejectować Promise z Event object - musimy to obsłużyć
            // Używamy Promise.resolve() aby upewnić się, że zawsze mamy Promise do obsługi
            try {
              const loadImageResult = app.loadImage('/pigeon-lofts-background.jpg');
              
              // Obsłuż zarówno Promise jak i zwykłe wartości
              Promise.resolve(loadImageResult)
                .then(() => {
                  // Obraz załadowany pomyślnie (lub nie zwrócono Promise)
                })
                .catch((imageError) => {
                  // Obsłuż wszystkie błędy - w tym Event objects z Promise rejection
                  // Event objects są często używane przez biblioteki do sygnalizowania błędów
                  if (imageError instanceof Event) {
                    console.warn('LiquidBackground: Image load failed (Event):', imageError.type);
                  } else {
                    console.warn('LiquidBackground: Failed to load image:', imageError);
                  }
                  // Zostaw domyślny obraz jeśli loadImage się nie uda
                  // NIE crashuj aplikacji - to tylko efekt wizualny
                });
            } catch (imageError) {
              // Synchronny błąd - ignoruj, zostaw domyślny obraz
              console.warn('LiquidBackground: Image load error (sync):', imageError);
            }
          
            // Zwiększony kontrast i kolory - więcej metallic, mniej roughness
            if (app.liquidPlane?.material) {
              app.liquidPlane.material.metalness = 0.6;
              app.liquidPlane.material.roughness = 0.4;
              
              // Dodaj emissive light - bardzo przygaszone
              if (app.liquidPlane.material.emissive) {
                app.liquidPlane.material.emissive.setRGB(0.0, 0.0, 0.0);
                app.liquidPlane.material.emissiveIntensity = 0.0;
              }
            }
            
            if (app.liquidPlane?.uniforms?.displacementScale) {
              app.liquidPlane.uniforms.displacementScale.value = 2.5;
            }
            
            if (app.setRain) {
              app.setRain(false);
            }
            
            // Dopasuj kamerę - przesuń w górę aby pokazać kafle nad dachem gołębnika
            if (app.camera) {
              app.camera.position.z = 2.4;
              app.camera.position.y = 0.4;
              app.camera.updateProjectionMatrix();
            }
            
            // Zwiększ skalę płaszczyzny i przesuń w dół aby kafle były widoczne
            if (app.liquidPlane) {
              app.liquidPlane.scale.set(2.4, 2.4, 1);
              app.liquidPlane.position.y = -0.2;
            }
          } catch (initError) {
            console.warn('LiquidBackground initialization error:', initError);
            if (canvas) {
              canvas.style.display = 'none';
            }
          }
        } catch (importError) {
          console.warn('LiquidBackground: Failed to import library:', importError);
          const canvas = document.getElementById('liquid-canvas');
          if (canvas) {
            canvas.style.display = 'none';
          }
        }
      })();
    `;

    document.head.appendChild(script);

    return () => {
      // Cleanup przy unmount całego komponentu
      const existingScript = document.getElementById('liquid-background-script');
      if (existingScript?.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      scriptLoaded = false;
      window.liquidBackgroundInitialized = false;
    };
  }, [enableLiquidBackground]);

  // Early return PO hookach - to jest OK
  if (!enableLiquidBackground || typeof window === 'undefined') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <canvas
        ref={canvasRef}
        id="liquid-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          filter: 'contrast(1.3) saturate(1.4) brightness(0.5)',
        }}
      />
    </div>
  );
}

