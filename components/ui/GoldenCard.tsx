"use client";

import React, { useState } from 'react';

interface GoldenCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GoldenCard({ children, className = '' }: GoldenCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className={`colored-glow-card relative w-full rounded-3xl p-8 text-white overflow-hidden ${className}`}
      style={{
        /* always keep the golden background on the card */
        background: 'linear-gradient(135deg, rgba(218,182,98,1) 0%, rgba(200,160,80,1) 25%, rgba(180,140,60,1) 50%, rgba(160,120,40,1) 75%, rgba(140,100,20,1) 100%)',
        boxShadow: '0 12px 0 rgba(218,182,98,1), 0 28px 40px rgba(218,182,98,0.28)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* lightweight colored glow overlay - does not change the card background, only adds light */}
      {isHovered && (
        <div
          aria-hidden="true"
          className="glow-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '1.5rem',
            pointerEvents: 'none',
            zIndex: 8,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,120,90,0.22) 0%, transparent 45%), radial-gradient(circle at 80% 50%, rgba(120,160,255,0.18) 0%, transparent 45%), radial-gradient(circle at 50% 20%, rgba(120,255,160,0.16) 0%, transparent 45%)',
            mixBlendMode: 'screen',
            opacity: 0.9,
            transition: 'opacity 220ms ease'
          }}
        />
      )}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-8%',
          left: '-18%',
          width: '70%',
          height: '28%',
          transform: 'rotate(-18deg)',
          borderRadius: '999px',
          pointerEvents: 'none',
          zIndex: 12,
          background: 'linear-gradient(90deg, rgba(218,182,98,0.85) 0%, rgba(218,182,98,0.35) 40%, rgba(218,182,98,0) 65%)',
          filter: 'blur(6px)',
          mixBlendMode: 'screen',
          opacity: 0.95
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-12%',
          right: '-25%',
          width: '75%',
          height: '25%',
          transform: 'rotate(12deg)',
          borderRadius: '70% 30% 70% 30%',
          pointerEvents: 'none',
          zIndex: 12,
          background: 'radial-gradient(ellipse at 25% 75%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0) 100%)',
          filter: 'blur(6px)',
          mixBlendMode: 'screen',
          opacity: 0.6
        }}
      />

      {/* Glass shine effect */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          right: '5%',
          height: '3px',
          pointerEvents: 'none',
          zIndex: 13,
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 15%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.95) 85%, rgba(255,255,255,0) 100%)',
          filter: 'blur(0.5px)',
          mixBlendMode: 'screen',
          opacity: 0.9
        }}
      />

      {/* Additional glow effect */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '8%',
          right: '8%',
          width: '12px',
          height: '12px',
          pointerEvents: 'none',
          zIndex: 14,
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
          filter: 'blur(2px)',
          mixBlendMode: 'screen',
          opacity: 0.8
        }}
      />

      {/* Colored glow layer (used by CSS + JS to render colored gradient on hover) */}
      <div className="glow" aria-hidden="true" />

      {/* Effect containers */}
      <div id="glow-container" aria-hidden="true" />
      <div id="bento-container" aria-hidden="true" />

      <div className="relative z-10">{children}</div>
    </article>
  );
}
