'use client';

import { useEffect, useMemo, useState } from 'react';

import { buildAssetCdnUrl } from '@/lib/asset-proxy';

export function BackgroundImage() {
  const [isMounted, setIsMounted] = useState(false);
  const backgroundSrc = useMemo(
    () => buildAssetCdnUrl('/pigeon-lofts-background.jpg') ?? '/pigeon-lofts-background.jpg',
    []
  );

  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== 'undefined') {
      document.body.classList.add('no-background');
      return () => {
        document.body.classList.remove('no-background');
      };
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full z-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {backgroundSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundSrc}
          alt="Tło gołębnika Pałka MTM"
          className="fixed inset-0 w-full h-full object-cover object-top"
          style={{
            filter: 'brightness(0.65)',
            zIndex: 0,
          }}
        />
      )}
      {/* Ciemny overlay */}
      <div className="absolute inset-0 bg-black/20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', zIndex: 1 }}></div>
    </div>
  );
}

