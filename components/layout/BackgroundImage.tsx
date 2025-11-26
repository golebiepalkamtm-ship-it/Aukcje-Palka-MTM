'use client';

import { useEffect, useState } from 'react';

export function BackgroundImage() {
  const [isMounted, setIsMounted] = useState(false);

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
      <img
        src="/pigeon-lofts-background.jpg"
        alt="Tło gołębnika Pałka MTM"
        className="fixed inset-0 w-full h-full object-cover object-top"
        style={{
          filter: 'brightness(0.65)',
          zIndex: 0,
        }}
      />
      {/* Ciemny overlay */}
      <div className="absolute inset-0 bg-black/20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', zIndex: 1 }}></div>
    </div>
  );
}

