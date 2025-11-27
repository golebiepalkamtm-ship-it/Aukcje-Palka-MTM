'use client';

import { motion } from 'framer-motion';
import { memo, ReactNode } from 'react';

interface UnifiedCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | '3d' | 'floating' | 'gradient';
  glow?: boolean;
  hover?: boolean;
  delay?: number;
}

export const UnifiedCard = memo(function UnifiedCard({
  children,
  className = '',
  variant = 'default',
  glow = false,
  hover = true,
  delay = 0,
}: Omit<UnifiedCardProps, 'intensity'>) {
  const variantClasses = {
    default: 'card',
    glass: 'card-glass',
    '3d': 'card-3d',
    floating: 'card-floating',
    gradient: 'card-gradient',
  };

  return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ 
          opacity: 1, 
          scale: 1,
        }}
        viewport={{ once: true }}
        whileHover={
          hover
            ? {
                transition: { duration: 0.3 },
              }
            : {}
        }
        transition={{
          opacity: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: delay + 0.3 },
          scale: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: delay + 0.3 },
        }}
        className={`
          ${variantClasses[variant]}
          ${glow ? 'animate-glow3D' : ''}
          ${hover ? 'unified-card-hover-highlight' : ''}
          ${className}
          card-glow-effect
        `}
        style={{ 
          position: 'relative', 
          overflow: 'hidden',
          transformOrigin: 'center',
        }}
        onMouseMove={e => {
          const card = e.currentTarget;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--card-glow-x', `${x}px`);
          card.style.setProperty('--card-glow-y', `${y}px`);
        }}
      >
        <div className="card-glow-animated-border" aria-hidden="true" />
        {children}
      </motion.div>
  );
});
