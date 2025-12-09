'use client';

import { memo, ReactNode } from 'react';

interface UnifiedCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | '3d' | 'floating' | 'gradient';
  glow?: boolean;
  noTransparency?: boolean;
  hover?: boolean;
  delay?: number;
  intensity?: number;
  glowingEdges?: boolean;
  edgeGlowIntensity?: number;
}

export const UnifiedCard = memo(function UnifiedCard({
  children,
  className = '',
  variant = 'default',
  glow = false,
  hover = true,
  delay = 0,
  intensity = 0.7,
  glowingEdges = false,
  edgeGlowIntensity = 0.5,
  noTransparency = false,
}: UnifiedCardProps) {
  const variantClasses = {
    default: 'card',
    glass: 'card-glass',
    '3d': 'card-3d',
    floating: 'card-floating',
    gradient: 'card-gradient',
  };

  return (
    <div
      className={`
        ${glow ? 'animate-glow3D' : ''}
        ${hover ? 'unified-card-hover-highlight' : ''}
        ${className}
        rounded-3xl p-6
      `}
      style={{
        position: 'relative',
        overflow: 'hidden',
        // DOKŁADNIE jak w AchievementTimeline - złoty gradient
        background: noTransparency
          ? 'linear-gradient(135deg, #8B7542 0%, #856B38 25%, #6B5B31 50%, #594F2D 75%, #473D26 100%)'
          : 'linear-gradient(135deg, rgba(139, 117, 66, 0.4) 0%, rgba(133, 107, 56, 0.35) 25%, rgba(107, 91, 49, 0.32) 50%, rgba(89, 79, 45, 0.3) 75%, rgba(71, 61, 38, 0.28) 100%)',
        // Jasny fallback kolor, żeby blend-modey nie mogły całkowicie przyciemnić tła
        backgroundColor: noTransparency ? '#8B7542' : 'transparent',
        backgroundBlendMode: 'normal',
        // DOKŁADNIE jak w AchievementTimeline - złota ramka
        border: '2px solid rgba(218, 182, 98, 1)',
        borderRadius: '1.5rem',
        boxShadow: '0 0 20px rgba(218, 182, 98, 1), 0 0 35px rgba(189, 158, 88, 0.8), 0 0 50px rgba(165, 138, 78, 0.5), inset 0 0 40px rgba(71, 61, 38, 0.15), inset 0 2px 0 rgba(218, 182, 98, 0.6), inset 0 -2px 0 rgba(61, 51, 33, 0.4)',
        backdropFilter: noTransparency ? 'none' : 'blur(16px)',
        WebkitBackdropFilter: noTransparency ? 'none' : 'blur(16px)',
      }}
    >
      {!noTransparency && <div className="card-glow-animated-border" aria-hidden="true" />}
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
});
