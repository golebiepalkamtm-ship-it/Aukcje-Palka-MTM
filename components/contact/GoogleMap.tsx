'use client';

import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import GoldenCard from '@/components/ui/GoldenCard';

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

// using shared GoldenCard from components/ui/GoldenCard for consistent styling

export default function GoogleMap() {
  const address = 'ul. Stawowa 6, 59-800 Lubań';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <section className="mb-20">
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
    </section>
  );
}
