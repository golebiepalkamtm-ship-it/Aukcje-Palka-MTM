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

    // Użyj bezpośredniego dynamicznego importu zamiast wstrzykiwania <script> z innerHTML.
    // To jest czytelniejsze i unika niebezpiecznego tworzenia skryptów w runtime.
    scriptLoaded = true;
    const canvas = canvasRef.current;

    const hideCanvasOnError = () => {
      if (canvas) canvas.style.display = 'none';
    };

    let mounted = true;

    // Create a module script element that loads the library from CDN.
    const cdnUrl = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
    const scriptEl = document.createElement('script');
    scriptEl.type = 'module';
    scriptEl.src = cdnUrl;
    scriptEl.id = 'liquid-background-cdn';

    scriptEl.onerror = () => {
      console.warn('LiquidBackground: Failed to load script from CDN');
      hideCanvasOnError();
      scriptLoaded = false;
    };

    scriptEl.onload = () => {
      if (!mounted) return;
      const LiquidBackground = (window as unknown as { LiquidBackground: unknown }).LiquidBackground as unknown;
      const canvasEl = document.getElementById('liquid-canvas') as HTMLCanvasElement | null;
      if (!canvasEl || window.liquidBackgroundInitialized) return;
      if (typeof LiquidBackground !== 'function') {
        console.warn('LiquidBackground: global initializer not found after script load');
        hideCanvasOnError();
        return;
      }

      window.liquidBackgroundInitialized = true;

      try {
        const app = LiquidBackground(canvasEl);

        try {
          const loadImageResult = app.loadImage?.('/pigeon-lofts-background.jpg');
          if (loadImageResult !== undefined) {
            Promise.resolve(loadImageResult).catch((imageError: unknown) => {
              if (imageError instanceof Event) {
                console.warn('LiquidBackground: Image load failed (Event):', imageError.type);
              } else {
                console.warn('LiquidBackground: Failed to load image:', imageError);
              }
            });
          }
        } catch (imageError) {
          console.warn('LiquidBackground: Image load error (sync):', imageError);
        }

        if (app.liquidPlane?.material) {
          app.liquidPlane.material.metalness = 0.6;
          app.liquidPlane.material.roughness = 0.4;
          if (app.liquidPlane.material.emissive?.setRGB) {
            app.liquidPlane.material.emissive.setRGB(0.0, 0.0, 0.0);
            app.liquidPlane.material.emissiveIntensity = 0.0;
          }
        }

        if (app.liquidPlane?.uniforms?.displacementScale) {
          app.liquidPlane.uniforms.displacementScale.value = 2.5;
        }

        if (typeof app.setRain === 'function') {
          app.setRain(false);
        }

        if (app.camera) {
          app.camera.position.z = 2.4;
          app.camera.position.y = 0.4;
          app.camera.updateProjectionMatrix?.();
        }

        if (app.liquidPlane) {
          app.liquidPlane.scale?.set?.(2.4, 2.4, 1);
          if (app.liquidPlane.position) app.liquidPlane.position.y = -0.2;
        }
      } catch (initError) {
        console.warn('LiquidBackground initialization error:', initError);
        hideCanvasOnError();
      }
    };

    document.head.appendChild(scriptEl);

    return () => {
      mounted = false;
      scriptLoaded = false;
      window.liquidBackgroundInitialized = false;
      const existing = document.getElementById('liquid-background-cdn');
      if (existing?.parentNode) existing.parentNode.removeChild(existing);
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

