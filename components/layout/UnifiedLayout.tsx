'use client';

import { UserStatus } from '@/components/auth/UserStatus';
import { Footer } from '@/components/layout/Footer';
import { LogoGlow } from '@/components/layout/LogoGlow';
import { VerificationBanner, VerificationIndicator } from '@/components/ui/VerificationIndicator';
import { BackgroundImage } from '@/components/layout/BackgroundImage';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode, memo, useEffect, useRef } from 'react';

type GlowRef<T extends HTMLElement> = React.RefObject<T> | React.MutableRefObject<T | null>;

const useCardGlow = <T extends HTMLElement>(cardRef: GlowRef<T>) => {
  useEffect(() => {
    const $card = cardRef.current;
    if (!$card) return;

    const centerOfElement = ($el: HTMLElement) => {
      const { width, height } = $el.getBoundingClientRect();
      return [width / 2, height / 2];
    };

    const pointerPositionRelativeToElement = ($el: HTMLElement, e: MouseEvent) => {
      const pos = [e.clientX, e.clientY];
      const { left, top, width, height } = $el.getBoundingClientRect();
      const x = pos[0] - left;
      const y = pos[1] - top;
      const px = Math.min(Math.max((100 / width) * x, 0), 100);
      const py = Math.min(Math.max((100 / height) * y, 0), 100);
      return { pixels: [x, y], percent: [px, py] };
    };

    const angleFromPointerEvent = ($el: HTMLElement, dx: number, dy: number) => {
      let angleDegrees = 0;
      if (dx !== 0 || dy !== 0) {
        const angleRadians = Math.atan2(dy, dx);
        angleDegrees = angleRadians * (180 / Math.PI) + 90;
        if (angleDegrees < 0) {
          angleDegrees += 360;
        }
      }
      return angleDegrees;
    };

    const distanceFromCenter = ($card: HTMLElement, x: number, y: number) => {
      const [cx, cy] = centerOfElement($card);
      return [x - cx, y - cy];
    };

    const closenessToEdge = ($card: HTMLElement, x: number, y: number) => {
      const [cx, cy] = centerOfElement($card);
      const [dx, dy] = distanceFromCenter($card, x, y);
      let k_x = Infinity;
      let k_y = Infinity;
      if (dx !== 0) {
        k_x = cx / Math.abs(dx);
      }
      if (dy !== 0) {
        k_y = cy / Math.abs(dy);
      }
      return Math.min(Math.max(1 / Math.min(k_x, k_y), 0), 1);
    };

    const round = (value: number, precision = 3) => parseFloat(value.toFixed(precision));

    const cardUpdate = (e: MouseEvent) => {
      const position = pointerPositionRelativeToElement($card, e);
      const [px, py] = position.pixels;
      const [dx, dy] = distanceFromCenter($card, px, py);
      const edge = closenessToEdge($card, px, py);
      const angle = angleFromPointerEvent($card, dx, dy);
      
      $card.style.setProperty('--pointer-x', `${round(position.percent[0])}%`);
      $card.style.setProperty('--pointer-y', `${round(position.percent[1])}%`);
      $card.style.setProperty('--pointer-°', `${round(angle)}deg`);
      $card.style.setProperty('--pointer-d', `${round(edge * 100)}`);
      $card.classList.remove('animating');
    };

    $card.addEventListener('pointermove', cardUpdate);

    return () => {
      $card.removeEventListener('pointermove', cardUpdate);
    };
  }, [cardRef]);
};

const navItems = [
  { href: '/', icon: 'fas fa-home', title: 'Strona Główna', label: 'Strona Główna' },
  { href: '/auctions', icon: 'fas fa-gavel', title: 'Aukcje', label: 'Aukcje' },
  { href: '/achievements', icon: 'fas fa-crown', title: 'Nasze Osiągnięcia', label: 'Osiągnięcia' },
  { href: '/champions', icon: 'fas fa-trophy', title: 'Championy', label: 'Championy' },
  { href: '/breeder-meetings', icon: 'fas fa-users', title: 'Spotkania', label: 'Spotkania' },
  { href: '/references', icon: 'fas fa-star', title: 'Referencje', label: 'Referencje' },
  { href: '/press', icon: 'fas fa-newspaper', title: 'Prasa', label: 'Prasa' },
  { href: '/about', icon: 'fas fa-info-circle', title: 'O nas', label: 'O Nas' },
  { href: '/contact', icon: 'fas fa-envelope', title: 'Kontakt', label: 'Kontakt' },
];


interface UnifiedLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  showBackground?: boolean;
  className?: string;
  contentPaddingTop?: 'default' | 'compact';
}

export const UnifiedLayout = memo(function UnifiedLayout({
  children,
  showNavigation = true,
  showFooter = true,
  showBackground = true,
  className = '',
  contentPaddingTop = 'default',
}: UnifiedLayoutProps) {
  // Stała wartość - nie może się zmieniać między SSR a CSR
  const mainPaddingTopClass = contentPaddingTop === 'compact' ? 'pt-12' : 'pt-32';

  return (
    <div className={`min-h-[120vh] flex flex-col ${className} relative overflow-x-hidden`}>
      {/* Tło strony ze zdjęciem gołębnika - renderowane tylko po hydratacji */}
      {showBackground && <BackgroundImage />}

      {/* SEKCJA 1: Górna - Logo i Nawigacja */}
      <div className="relative z-[1000] h-32 flex-shrink-0">
        <div className="absolute inset-0">
        {/* Logo w lewym górnym rogu */}
          <div className="absolute top-4 left-8 fade-in-fwd w-fit origin-center" style={{ animationDelay: '0.1s' }}>
          <LogoGlow />
        </div>

        {/* Navigation Menu */}
        {showNavigation && (
          <>
              <nav className="absolute top-8 left-[360px] pointer-events-auto">
              <motion.div 
                className="flex items-center gap-3"
                initial="hidden"
                animate="visible"
                style={{ perspective: '1000px' }}
              >
                  {navItems.map((item) => {
                    const NavButton = memo(function NavButton() {
                      const cardRef = useRef<HTMLDivElement>(null);
                      useCardGlow(cardRef);

                      return (
                  <motion.div 
                          ref={cardRef}
                    key={item.href}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 10px 30px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(0, 0, 0, 0.3), 0 -4px 15px rgba(255, 255, 255, 0.3), inset 0 8px 0 rgba(255, 255, 255, 0.85), inset 0 -2px 0 rgba(0, 0, 0, 0.2), inset 0 4px 12px rgba(255, 255, 255, 0.4), inset 0 -1px 4px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(255, 255, 255, 0.4)',
                            filter: 'brightness(1.2)',
                    }}
                    transition={{ 
                      opacity: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
                      scale: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
                      boxShadow: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
                      filter: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
                    }}
                          className="achievement-card"
                    style={{ 
                      transformOrigin: 'center',
                      transform: 'translateZ(180px) perspective(1000px)',
                      willChange: 'transform, box-shadow',
                      borderRadius: '1rem',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                            transformStyle: 'preserve-3d',
                            position: 'relative',
                            isolation: 'isolate',
                            overflow: 'visible',
                    }}
                  >
                          <div className="glow" />
                          <div style={{ overflow: 'hidden', borderRadius: '1rem', position: 'relative', zIndex: 1 }}>
                      <Link
                        href={item.href as `/${string}`}
                              className="glass-nav-button relative z-10"
                        title={item.title}
                        onClick={() => {
                          /* console.log('Clicked:', item.href) */
                        }}
                      >
                        <i className={`${item.icon} relative z-10 text-3xl`}></i>
                      <span className="relative z-10 text-sm">{item.label}</span>
                    </Link>
                          </div>
                  </motion.div>
                      );
                    });

                    return <NavButton key={item.href} />;
                  })}
              </motion.div>
            </nav>

            {/* User Status w prawym górnym rogu */}
              <div className="absolute top-8 right-6 pointer-events-auto">
              <div className="flex flex-col items-end space-y-2">
                <UserStatus />
                <VerificationIndicator />
              </div>
            </div>
          </>
        )}
        </div>
      </div>

      {/* SEKCJA 2: Środkowa - Główna zawartość (nagłówek, gołąb) */}
      <div className="flex-grow relative z-10">
          {/* Globalny baner weryfikacji - widoczny na każdej podstronie jeśli użytkownik wymaga akcji */}
        <div className={`max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 pt-4 pb-0`} suppressHydrationWarning>
            <VerificationBanner />
          </div>
          {children}
        </div>

      {/* SEKCJA 3: Footer */}
      {showFooter && (
        <div className="relative z-20 mt-auto flex-shrink-0">
          <Footer />
      </div>
      )}
    </div>
  );
});
