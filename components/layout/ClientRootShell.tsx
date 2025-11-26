'use client';

import ClientProviders from '@/components/providers/ClientProviders';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { PropsWithChildren, useEffect, useState } from 'react';

type ClientRootShellProps = PropsWithChildren<{
  enableLoadingOverlay?: boolean;
}>;

export function ClientRootShell({ children, enableLoadingOverlay = true }: ClientRootShellProps) {
  const isProduction = typeof window !== 'undefined' && process.env.NODE_ENV === 'production';
  const [isLoading, setIsLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (!enableLoadingOverlay || isProduction) {
      setIsLoading(false);
      return;
    }

    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        setVideoEnded(true);
        setFadeOut(true);
        setTimeout(() => setIsLoading(false), 500);
      }
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [isLoading, enableLoadingOverlay, isProduction]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setTimeout(() => setFadeOut(true), 100);
  };

  const handleVideoError = () => {
    setVideoEnded(true);
    setFadeOut(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  useEffect(() => {
    if (fadeOut) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [fadeOut]);

  return (
    <ClientProviders>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <ToastProvider />

      {isClient && isLoading && (
        <div className="fixed inset-0 z-[10000] pointer-events-none" aria-hidden="true">
          <div
            className={`absolute inset-0 bg-white transition-opacity duration-[500ms] ease-in-out ${
              fadeOut ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {!videoEnded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                src="/loading-animation.mp4"
                autoPlay
                muted
                loop={false}
                onEnded={handleVideoEnd}
                onError={handleVideoError}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      )}
    </ClientProviders>
  );
}


