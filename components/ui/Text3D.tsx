'use client';

import { ReactNode } from 'react';

interface Text3DProps {
  children: ReactNode;
  className?: string;
  variant?: 'gradient' | 'glow' | 'neon' | 'shimmer';
  intensity?: 'low' | 'medium' | 'high';
  animate?: boolean;
  hover?: boolean;
}

export function Text3D({
  children,
  className = '',
  variant = 'gradient',
  intensity = 'medium',
  animate = true,
  hover = true,
}: Text3DProps) {
  const variantClasses = {
    gradient: 'text-gradient',
    glow: 'text-glow',
    neon: 'neon-glow',
    shimmer: 'animate-shimmer3D',
  };

  return (
    <span
      className={`
        ${variantClasses[variant]}
        ${hover ? 'hover-3d-tilt' : ''}
        transform-3d perspective-1000
        ${className}
      `}
    >
      {children}
    </span>
  );
}
