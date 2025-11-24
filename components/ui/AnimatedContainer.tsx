'use client';

import { containerAnimation } from '@/lib/animations';
import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  whileInView?: boolean;
  viewport?: { once?: boolean; margin?: string };
  style?: React.CSSProperties;
}

/**
 * AnimatedContainer - Komponent wrapper z efektem wypukłości 3D
 * Opakowuje UnifiedCard lub inne komponenty, dodając efekt wypukłości jak na stronie kontakt
 */
export function AnimatedContainer({
  children,
  className = '',
  delay = 0,
  whileInView = true,
  viewport = { once: true },
  style,
}: AnimatedContainerProps) {
  const transition = {
    ...containerAnimation.transition,
    opacity: { 
      ...containerAnimation.transition.opacity, 
      delay: containerAnimation.transition.opacity.delay + delay 
    },
    scale: { 
      ...containerAnimation.transition.scale, 
      delay: containerAnimation.transition.scale.delay + delay 
    },
    boxShadow: { 
      ...containerAnimation.transition.boxShadow, 
      delay: containerAnimation.transition.boxShadow.delay + delay 
    },
    filter: { 
      ...containerAnimation.transition.filter, 
      delay: containerAnimation.transition.filter.delay + delay 
    },
  };

  const motionProps: MotionProps = whileInView
    ? {
        initial: containerAnimation.initial,
        whileInView: containerAnimation.animate,
        transition,
        viewport,
      }
    : {
        initial: containerAnimation.initial,
        animate: containerAnimation.animate,
        transition,
      };

  return (
    <motion.div
      {...motionProps}
      style={{ ...containerAnimation.style, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

