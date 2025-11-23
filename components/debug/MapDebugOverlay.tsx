'use client';

import React, { useEffect, useState } from 'react';

type ParentMetrics =
  | {
      width: number;
      height: number;
      tag?: string;
      id?: string;
    }
  | 'no-parent';

type CanvasMetrics =
  | {
      width?: number;
      height?: number;
      styleWidth?: string;
      styleHeight?: string;
    }
  | 'no-canvas';

type OverlayMetrics = {
  window: { w: number; h: number };
  container: {
    width: number;
    height: number;
    top: number;
    left: number;
    position: string;
    display: string;
    zIndex: string;
  };
  parent: ParentMetrics;
  canvas: CanvasMetrics;
};

const initialMetrics: OverlayMetrics = {
  window: { w: 0, h: 0 },
  container: {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    position: 'static',
    display: 'block',
    zIndex: '0',
  },
  parent: 'no-parent',
  canvas: 'no-canvas',
};

export default function MapDebugOverlay({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLDivElement>;
}) {
  const [metrics, setMetrics] = useState<OverlayMetrics>(initialMetrics);

  useEffect(() => {
    const updateMetrics = () => {
      if (!targetRef.current) return;

      const el = targetRef.current;
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      const parent = el.parentElement;
      const parentRect = parent?.getBoundingClientRect();

      setMetrics({
        window: { w: window.innerWidth, h: window.innerHeight },
        container: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          position: computed.position,
          display: computed.display,
          zIndex: computed.zIndex,
        },
        parent: parentRect
          ? {
              width: parentRect.width,
              height: parentRect.height,
              tag: parent?.tagName,
              id: parent?.id,
            }
          : 'no-parent',
        canvas: el.querySelector('canvas')
          ? {
              width: el.querySelector('canvas')?.width,
              height: el.querySelector('canvas')?.height,
              styleWidth: el.querySelector('canvas')?.style.width,
              styleHeight: el.querySelector('canvas')?.style.height,
            }
          : 'no-canvas',
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);
    window.addEventListener('resize', updateMetrics);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateMetrics);
    };
  }, [targetRef]);

  return (
    <div className="fixed bottom-20 right-4 z-[9999] bg-black/90 text-green-400 p-4 font-mono text-xs border border-green-500/30 rounded max-w-sm shadow-2xl select-text pointer-events-auto cursor-text">
      <h3 className="font-bold border-b border-green-500/30 mb-2">DIAGNOSTYKA MAPY</h3>
      <pre className="select-text">{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
}

