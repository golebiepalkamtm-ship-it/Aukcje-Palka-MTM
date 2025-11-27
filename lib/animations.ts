/**
 * Wspólna konfiguracja animacji efektu wypukłości 3D
 * Używana na wszystkich stronach dla spójnego wyglądu kontenerów
 */
export const containerAnimation = {
  initial: { opacity: 0, scale: 0 },
  animate: { 
    opacity: 1, 
    scale: 1,
    boxShadow: '0 50px 150px rgba(0, 0, 0, 0.9), 0 30px 100px rgba(0, 0, 0, 0.7), 0 -5px 20px rgba(255, 255, 255, 0.3), inset 0 6px 0 rgba(255, 255, 255, 0.7), inset 0 -6px 0 rgba(0, 0, 0, 0.8), inset 0 3px 10px rgba(255, 255, 255, 0.3), inset 0 -3px 10px rgba(0, 0, 0, 0.6), 0 0 0 3px rgba(255, 255, 255, 0.4)',
    filter: 'brightness(1.15)',
  },
  transition: {
    opacity: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
    scale: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
    boxShadow: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
    filter: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
  },
  style: {
    transformOrigin: 'center',
    transform: 'translateZ(120px) perspective(1000px)',
    willChange: 'transform, box-shadow',
    borderRadius: '1rem',
    overflow: 'hidden',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '2px solid rgba(255, 255, 255, 0.9)',
    WebkitBackdropFilter: 'blur(2px)',
    backdropFilter: 'blur(2px)',
  } as React.CSSProperties,
};

