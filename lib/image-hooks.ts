import { useEffect, useState } from 'react';

/**
 * Hook for image preloading
 * @param src - Image source URL
 * @returns boolean indicating if image is preloaded
 */
export function useImagePreload(src: string): boolean {
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => setIsPreloaded(true);
    img.onerror = () => setIsPreloaded(false);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return isPreloaded;
}

/**
 * Hook for batch image preloading
 * @param srcs - Array of image source URLs
 * @returns object with preloadedCount, isAllPreloaded, and progress
 */
export function useBatchImagePreload(srcs: string[]): {
  preloadedCount: number;
  isAllPreloaded: boolean;
  progress: number;
} {
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [isAllPreloaded, setIsAllPreloaded] = useState(false);

  useEffect(() => {
    if (!srcs.length) return;

    let loadedCount = 0;
    const totalCount = srcs.length;

    const preloadImage = (src: string) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        setPreloadedCount(loadedCount);
        if (loadedCount === totalCount) {
          setIsAllPreloaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        setPreloadedCount(loadedCount);
        if (loadedCount === totalCount) {
          setIsAllPreloaded(true);
        }
      };
      img.src = src;
    };

    srcs.forEach(preloadImage);
  }, [srcs]);

  return { preloadedCount, isAllPreloaded, progress: preloadedCount / srcs.length };
}