'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

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

export function AuthNavigation() {
  return (
    <nav className="absolute top-8 left-8 z-[1001] pointer-events-auto">
      <motion.div
        className="flex items-center gap-3"
        initial="hidden"
        animate="visible"
        style={{ perspective: '1000px' }}
      >
        {navItems.map((item) => (
          <motion.div 
            key={item.href}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: '0 60px 180px rgba(0, 0, 0, 0.95), 0 40px 120px rgba(0, 0, 0, 0.85), 0 20px 60px rgba(0, 0, 0, 0.8), 0 -8px 30px rgba(255, 255, 255, 0.4), inset 0 8px 0 rgba(255, 255, 255, 0.85), inset 0 -4px 0 rgba(0, 0, 0, 0.7), inset 0 4px 12px rgba(255, 255, 255, 0.4), inset 0 -2px 8px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.5)',
              filter: 'brightness(1.15)',
            }}
            transition={{ 
              opacity: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
              scale: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
              boxShadow: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
              filter: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 },
            }}
            style={{ 
              transformOrigin: 'center',
              transform: 'translateZ(180px) perspective(1000px)',
              willChange: 'transform, box-shadow',
              borderRadius: '1rem',
              overflow: 'hidden',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d'
            }}
          >
              <Link href={item.href as `/${string}`} className="glass-nav-button" title={item.title}>
                <i className={`${item.icon} relative z-10 text-3xl`}></i>
              <span className="relative z-10 text-sm">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </nav>
  );
}
