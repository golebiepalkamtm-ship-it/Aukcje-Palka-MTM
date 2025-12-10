"use client";

import React from 'react';

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlowingCard({ children, className = '' }: GlowingCardProps) {
  return (
    <div
      className={`card ${className}`}
      style={{
        '--pads': '40px',
        '--color-sens': 'calc(var(--glow-sens) + 20)',
        '--pointer-°': '45deg',
        position: 'relative',
        borderRadius: '1.768em',
        isolation: 'isolate',
        transform: 'translate3d(0, 0, 0.01px)',
        border: '1px solid rgb(255 255 255 / 25%)',
        background: 'var(--card-bg)',
        backgroundRepeat: 'no-repeat',
        // Dodajemy złote tło zamiast przezroczystego
        backgroundImage: 'linear-gradient(135deg, rgba(139, 117, 66, 1) 0%, rgba(133, 107, 56, 1) 25%, rgba(107, 91, 49, 1) 50%, rgba(89, 79, 45, 1) 75%, rgba(71, 61, 38, 1) 100%)',
        boxShadow: '0 12px 0 rgba(218,182,98,1), 0 28px 40px rgba(218,182,98,0.28)'
      } as React.CSSProperties}
    >
      <span className="glow"></span>
      <div className="inner" style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  );
}