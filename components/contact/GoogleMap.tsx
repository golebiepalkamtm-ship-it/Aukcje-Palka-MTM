'use client';

import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Scroll reveal hook from AchievementTimeline
const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(node);

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, []);

  return { ref, isVisible };
};

// Styled card component matching AchievementTimeline
interface GoldenCardProps {
  children: React.ReactNode;
  className?: string;
}

function GoldenCard({ children, className = '' }: GoldenCardProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div className="relative">
      {/* 3D Shadow layers */}
      {[...Array(11)].map((_, i) => {
        const layer = 11 - i;
        const offset = layer * 1.5;
        const opacity = Math.max(0.2, 0.7 - layer * 0.05);
        
        return (
          <div
            key={i}
            className="absolute inset-0 rounded-3xl border-2 backdrop-blur-sm"
            style={{
              borderColor: `rgba(0, 0, 0, ${opacity})`,
              backgroundColor: `rgba(0, 0, 0, ${opacity * 0.8})`,
              transform: `translateX(${offset}px) translateY(${offset / 2}px) translateZ(-${offset}px)`,
              zIndex: i + 1
            }}
            aria-hidden="true"
          />
        );
      })}

      <article
        ref={ref}
        className={`glass-morphism relative z-[12] w-full rounded-3xl border-2 p-6 text-white transition-all duration-[2000ms] overflow-hidden backdrop-blur-xl ${className} ${
          !isVisible ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          transform: !isVisible ? 'translateZ(-200px) scale(0.5)' : 'translateZ(0) scale(1)',
          transition: 'all 2000ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          background: 'linear-gradient(135deg, rgba(139, 117, 66, 1) 0%, rgba(133, 107, 56, 1) 25%, rgba(107, 91, 49, 1) 50%, rgba(89, 79, 45, 1) 75%, rgba(71, 61, 38, 1) 100%)',
          borderColor: 'rgba(218, 182, 98, 1)',
          boxShadow: '0 0 30px rgba(218, 182, 98, 1), 0 0 50px rgba(189, 158, 88, 1), 0 0 70px rgba(165, 138, 78, 0.8), inset 0 0 40px rgba(71, 61, 38, 0.5), inset 0 2px 0 rgba(218, 182, 98, 1), inset 0 -2px 0 rgba(61, 51, 33, 0.6)'
        }}
      >
        {/* Inner light effects */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{
            background: `
              radial-gradient(ellipse 800px 600px at 20% 30%, rgba(255, 245, 200, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse 600px 500px at 80% 70%, rgba(218, 182, 98, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 400px 300px at 50% 50%, rgba(255, 235, 180, 0.15) 0%, transparent 60%)
            `,
            backdropFilter: 'blur(80px)',
            mixBlendMode: 'soft-light',
            zIndex: 1
          }}
        />
        <div className="relative z-10">
          {children}
        </div>
      </article>
    </div>
  );
}

export default function GoogleMap() {
  const address = 'ul. Stawowa 6, 59-800 Lubań';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="mb-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
        {/* Mapa */}
        <GoldenCard className="p-0 overflow-hidden">
          <div className="aspect-[4/3] min-h-[620px] rounded-2xl overflow-hidden">
            <iframe
              src="https://maps.google.com/maps?q=ul.+Stawowa+6,+59-800+Lubań,+Poland&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa hodowli MTM Pałka - ul. Stawowa 6, Lubań"
            />
          </div>
        </GoldenCard>

        {/* Informacje o dojeździe */}
        <div className="space-y-8">
          <GoldenCard className="text-center lg:text-left">
            <h3 className="text-2xl font-bold text-gradient mb-4 flex items-center justify-center lg:justify-start">
              <MapPin className="w-6 h-6 mr-2 text-amber-300" />
              Jak do nas trafić
            </h3>
            <p className="text-white/80">
              Nasza hodowla znajduje się w Lubaniu, w sercu Dolnego Śląska. Zapraszamy do
              odwiedzenia nas po wcześniejszym umówieniu.
            </p>
          </GoldenCard>

          {/* Przyciski akcji */}
          <div className="space-y-6">
            <GoldenCard className="p-0">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-4"
              >
                <div className="flex items-center justify-center">
                  <MapPin className="w-5 h-5 mr-3 text-amber-300" />
                  <span className="text-white font-medium">Zobacz na mapie</span>
                  <ExternalLink className="w-4 h-4 ml-2 text-amber-300" />
                </div>
              </a>
            </GoldenCard>

            <GoldenCard className="p-0">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-4"
              >
                <div className="flex items-center justify-center">
                  <Navigation className="w-5 h-5 mr-3 text-amber-300" />
                  <span className="text-white font-medium">Pobierz trasę</span>
                  <ExternalLink className="w-4 h-4 ml-2 text-amber-300" />
                </div>
              </a>
            </GoldenCard>
          </div>

          {/* Dodatkowe informacje */}
          <GoldenCard className="mt-8">
            <h4 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/60 mb-4">Wskazówki dojazdu</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• Z centrum Lubania: 5 minut samochodem</li>
              <li>• Z Wrocławia: około 1 godziny</li>
              <li>• Z Jeleniej Góry: około 30 minut</li>
              <li>• Parking dostępny na miejscu</li>
              <li>• Wizyty tylko po wcześniejszym umówieniu</li>
            </ul>
          </GoldenCard>
        </div>
      </div>
    </motion.section>
  );
}
