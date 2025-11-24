'use client';

import { useEffect, useRef, useState } from 'react';

type AchievementTimelineEntry = {
  label: string;
  value: string;
};

type AchievementTimelineGroup = {
  title: string;
  entries: AchievementTimelineEntry[];
};

export type AchievementTimelineItem = {
  year: string;
  label: string;
  title: string;
  description: string;
  groups: AchievementTimelineGroup[];
};

interface AchievementTimelineProps {
  items: AchievementTimelineItem[];
  className?: string;
}

const mergeClasses = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(' ');

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

type TimelineCardProps = {
  item: AchievementTimelineItem;
  align: 'left' | 'right';
};

function TimelineCard({ item, align }: TimelineCardProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div className="relative md:grid md:grid-cols-2 md:gap-12 max-w-7xl mx-auto">
      <span
        aria-hidden="true"
        className="absolute left-4 top-8 z-20 h-5 w-5 -translate-x-1/2 rounded-full border border-white/40 bg-gradient-to-br from-white via-sky-200 to-blue-400 shadow-glow md:left-1/2"
      >
        <span className="absolute inset-0 rounded-full bg-white/20 blur-md" />
      </span>

      <article
        ref={ref}
        className={mergeClasses(
          'glass-morphism relative z-10 w-full p-8 pl-14 text-white',
          'before:absolute before:inset-0 before:skew-x-12 before:bg-white/10 before:opacity-0 before:transition-all before:duration-700 hover:before:animate-[shimmer_1.5s_infinite]',
          align === 'left'
            ? 'md:col-start-1 md:justify-self-end md:pr-16 md:text-right'
            : 'md:col-start-2 md:justify-self-start md:pl-16',
          // Jeśli niewidoczny, ustaw opacity-0 (żeby nie było go widać przed animacją).
          // Jeśli widoczny, dodaj animację fade-in-fwd.
          !isVisible && 'opacity-0',
          isVisible && 'fade-in-fwd'
        )}
      >
        <div className="flex flex-col gap-2 text-left md:text-inherit">
          <div
            className={mergeClasses(
              'flex flex-wrap items-baseline gap-3',
              align === 'left' ? 'md:justify-end' : 'md:justify-start'
            )}
          >
            <span className="text-2xl md:text-3xl font-bold text-gradient">{item.year}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 text-lg text-white/80 shadow-inner">
          {item.groups.map((group) => (
            <div
              key={`${item.year}-${group.title}`}
              className="rounded-xl border border-white/5 bg-black/20 p-5 shadow-soft"
            >
              <p className="text-base md:text-lg font-semibold uppercase tracking-[0.3em] text-white/60 mb-4">
                {group.title}
              </p>
              <ul className="space-y-2">
                {group.entries.map((entry) => {
                  const isMasterTitle = (group.title === 'MP' || group.title === 'Region V') &&
                    /mistrz/i.test(entry.value);
                  
                  return (
                    <li
                      key={`${item.year}-${group.title}-${entry.label}-${entry.value}`}
                      className={mergeClasses(
                        'flex flex-wrap items-baseline gap-2 text-lg md:text-xl',
                        isMasterTitle 
                          ? 'bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg px-3 py-2 text-yellow-100' 
                          : 'text-white/80'
                      )}
                    >
                      <span className={mergeClasses(
                        'font-semibold',
                        isMasterTitle ? 'text-yellow-200' : 'text-white'
                      )}>
                        {entry.label}
                      </span>
                      <span className={isMasterTitle ? 'text-yellow-100 font-bold' : 'text-white/70'}>
                        {entry.value}
                      </span>
                      {isMasterTitle && (
                        <span className="ml-2 text-yellow-400" aria-label="Tytuł mistrzowski">
                          👑
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export function AchievementTimeline({ items, className = '' }: AchievementTimelineProps) {
  return (
    <section
      className={mergeClasses(
        'relative isolate space-y-12 md:space-y-16',
        'before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-white/15 before:content-[""] md:before:left-1/2',
        className
      )}
    >
      {items.map((item, index) => (
        <TimelineCard key={item.year} item={item} align={index % 2 === 0 ? 'left' : 'right'} />
      ))}
    </section>
  );
}

export const achievementsTimelineData: AchievementTimelineItem[] = [
  {
    year: '2001',
    label: 'Chronologia 2001',
    title: 'Debiut dominacji Oddziału Lubań',
    description:
      'Start pasma sukcesów z tytułami Mistrza w kat. A i GMO oraz czołowymi lokatami w Okręgu Jelenia Góra.',
    groups: [
      {
        title: 'Oddział Lubań',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 235.77 coeff, 20 con' },
          { label: 'Kat B', value: 'I Wicemistrz, 503.62 coeff, 16 con' },
          { label: 'Kat GMO', value: 'Mistrz, - coeff, - con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'I Wicemistrz, 235.77 coeff, 20 con' },
          { label: 'Kat B', value: 'IX Przodownik, 503.62 coeff, 16 con' },
          { label: 'Kat GMO', value: 'I Wicemistrz, - coeff, - con' },
        ],
      },
    ],
  },
  {
    year: '2002',
    label: 'Chronologia 2002',
    title: 'Stabilizacja wyników w Oddziale',
    description:
      'Sezon ze stałą formą – komplet zwycięstw w Oddziale Lubań i kolejne podia w Okręgu oraz Regionie V.',
    groups: [
      {
        title: 'Oddział Lubań',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 501.52 coeff, 20 con' },
          { label: 'Kat GMO', value: 'II Wicemistrz, 40 coeff, - con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 501.52 coeff, 20 con' },
          { label: 'Kat GMO', value: 'Mistrz, 40 coeff, - con' },
        ],
      },
      {
        title: 'Region V',
        entries: [
          { label: 'Kat A', value: '50 Przodownik, 501.52 coeff, 20 con' },
          { label: 'Kat B', value: 'II Przodownik, 168.11 coeff, 16 con' },
        ],
      },
    ],
  },
  {
    year: '2003',
    label: 'Chronologia 2003',
    title: 'Rozszerzenie sukcesów na MP',
    description:
      'Mistrzowskie lokaty w kategoriach A–C oraz wysokie miejsca w Regionie V i Mistrzostwach Polski.',
    groups: [
      {
        title: 'Oddział Lubań',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 203.54 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 217.78 coeff, 16 con' },
          { label: 'Kat C', value: 'Mistrz, 71.99 coeff, 9 con' },
          { label: 'Kat GMO', value: 'Mistrz, 462.22 coeff, - con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 203.54 coeff, 20 con' },
          { label: 'Kat B', value: 'I Wicemistrz, 217.78 coeff, 16 con' },
          { label: 'Kat C', value: 'Mistrz, 71.99 coeff, 9 con' },
          { label: 'Kat GMO', value: 'VI Przodownik, 462.22 coeff, - con' },
        ],
      },
      {
        title: 'Region V',
        entries: [
          { label: 'Kat A', value: '10 Przodownik, 203.54 coeff, 20 con' },
          { label: 'Kat B', value: '49 Przodownik, 217.78 coeff, 16 con' },
          { label: 'Kat C', value: '2 Miejsce, 971.99 coeff, - con' },
          { label: 'Kat D', value: 'II Przodownik, - coeff, - con' },
          { label: 'Kat GMP', value: '11 Przodownik, 1066.26 coeff, - con' },
        ],
      },
      {
        title: 'MP',
        entries: [
          { label: 'Kat C', value: '13 Przodownik, 71.99 coeff, 9 con' },
          { label: 'Kat GMP', value: '28 Przodownik, 1066.26 coeff, - con' },
        ],
      },
    ],
  },
  {
    year: '2004',
    label: 'Chronologia 2004',
    title: 'Kontynuacja serii na region',
    description:
      'Oddział utrzymuje tytuły mistrzowskie, uzupełniając je o wysokie lokaty regionalne i krajowe.',
    groups: [
      {
        title: 'Oddział Lubań',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 180.91 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 196.07 coeff, 16 con' },
          { label: 'Kat GMO', value: 'I Wicemistrz, - coeff, - con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 180.91 coeff, 20 con' },
          { label: 'Kat B', value: 'I Przodownik, 196.07 coeff, 16 con' },
          { label: 'Kat GMO', value: 'I Przodownik, - coeff, - con' },
        ],
      },
      {
        title: 'Region V',
        entries: [
          { label: 'Kat A', value: '18 Przodownik, 180.91 coeff, 20 con' },
          { label: 'Kat D', value: '35 Przodownik, 839.32 coeff, - con' },
        ],
      },
      {
        title: 'MP',
        entries: [{ label: 'Kat A', value: '32 Przodownik, 180.91 coeff, 20 con' }],
      },
    ],
  },
  {
    year: '2005',
    label: 'Chronologia 2005',
    title: 'Dublet mistrzowski A+B',
    description:
      'Niewielka obsada, wielkie wyniki – podwójne mistrzostwo Oddziału i pierwsze miejsca w MP.',
    groups: [
      {
        title: 'Oddział Lubań',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 90.65 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 66.96 coeff, 16 con' },
          { label: 'Kat GMO', value: 'I Wicemistrz, - coeff, - con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 90.65 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 66.96 coeff, 16 con' },
          { label: 'Kat GMO', value: 'I Przodownik, - coeff, - con' },
        ],
      },
      {
        title: 'Region V',
        entries: [{ label: 'Kat A', value: 'II Wicemistrz, 90.65 coeff, 20 con' }],
      },
      {
        title: 'MP',
        entries: [
          { label: 'Kat A', value: 'I Przodownik, 90.65 coeff, 20 con' },
          { label: 'Kat B', value: 'V Przodownik, 66.96 coeff, 16 con' },
        ],
      },
    ],
  },
  {
    year: '2006',
    label: 'Chronologia 2006',
    title: 'Potrójne mistrzostwo Oddziału',
    description:
      'Wyniki w kategoriach A, B i GMO dały pełną kontrolę nad Oddziałem oraz mocne akcenty w regionie i MP.',
    groups: [
      {
        title: 'Oddział Lubań',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 240.15 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 183.25 coeff, 16 con' },
          { label: 'Kat GMO', value: 'Mistrz, 82.77 coeff, 15 con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 199.28 coeff, 20 con' },
          { label: 'Kat B', value: 'II Przodownik, 367.51 coeff, 16 con' },
          { label: 'Kat GMO', value: 'I Wicemistrz, 82.77 coeff, 15 con' },
        ],
      },
      {
        title: 'Region V',
        entries: [
          { label: 'Kat A', value: '18 Przodownik, 240.15 coeff, 20 con' },
          { label: 'Kat B', value: '24 Przodownik, 183.25 coeff, 16 con' },
          { label: 'Kat GMO', value: '3 Przodownik, 82.77 coeff, 15 con' },
        ],
      },
      {
        title: 'MP',
        entries: [{ label: 'Kat GMO', value: 'VI Przodownik, 82.77 coeff, 15 con' }],
      },
    ],
  },
  {
    year: '2007',
    label: 'Chronologia 2007',
    title: 'Skoncentrowane wyniki w kat. A',
    description:
      'Kolejny rok z mistrzostwem w kat. A i podium w MP, uzupełniony o dobre lokaty w regionie.',
    groups: [
      {
        title: 'Oddział Lubań',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 78.06 coeff, 20 con' },
          { label: 'Kat GMO', value: 'II Wicemistrz, - coeff, - con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [{ label: 'Kat A', value: 'Mistrz, 78.06 coeff, 20 con' }],
      },
      {
        title: 'Region V',
        entries: [{ label: 'Kat A', value: 'II Przodownik, 78.06 coeff, 20 con' }],
      },
      {
        title: 'MP',
        entries: [{ label: 'Kat A', value: 'I Przodownik, 78.06 coeff, 20 con' }],
      },
    ],
  },
  {
    year: '2008',
    label: 'Chronologia 2008',
    title: 'Oddział 092 – szeroki front medalowy',
    description:
      'Debiut oddziału 092 z mistrzostwem w kat. A i B oraz wysokimi pozycjami w Regionie V i MP.',
    groups: [
      {
        title: 'Oddział Lubań 092',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 49.88 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 158.27 coeff, 16 con' },
          { label: 'Kat GMP', value: 'I Wicemistrz, 49.88 coeff, - con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 49.88 coeff, 20 con' },
          { label: 'Kat B', value: 'II Wicemistrz, 158.27 coeff, 16 con' },
          { label: 'Kat GMP', value: 'I Wicemistrz, 49.88 coeff, - con' },
        ],
      },
      {
        title: 'Region V',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 49.88 coeff, 20 con' },
          { label: 'Kat B', value: 'XX Przodownik, 158.27 coeff, 16 con' },
          { label: 'Kat GMP', value: 'I Wicemistrz, 49.88 coeff, - con' },
          { label: 'Kat GMP (2)', value: '20 Przodownik, 158.27 coeff, - con' },
        ],
      },
      {
        title: 'MP',
        entries: [{ label: 'Kat A', value: '3 Przodownik, 49.88 coeff, 20 con' }],
      },
    ],
  },
  {
    year: '2009',
    label: 'Chronologia 2009',
    title: 'Łużyce Lubań – pełnia formy',
    description:
      'Seria tytułów MISTRZ* w kat. A i B oraz zwycięstwa młodych gołębi w oddziale i okręgu.',
    groups: [
      {
        title: 'Oddział Łużyce Lubań 0446',
        entries: [
          { label: 'Kat A', value: 'MISTRZ*, 82.33 coeff, 20 con' },
          { label: 'Kat B', value: 'MISTRZ*, 81.43 coeff, 16 con' },
          { label: 'Kat C', value: 'II/III V-ce MISTRZ*, 348.08 coeff, 9 con' },
          { label: 'Kat M', value: 'I V-ce MISTRZ*, 130.47 coeff, 6 con' },
          { label: 'Kat Młode', value: 'I V-ce MISTRZ*, 160.61 coeff, 15 con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'MISTRZ, 82.33 coeff, 20 con' },
          { label: 'Kat B', value: 'MISTRZ, 81.43 coeff, 16 con' },
          { label: 'Kat C', value: '16. Przodownik, 348.08 coeff, 9 con' },
          { label: 'Kat M', value: '1. Przodownik, 130.47 coeff, 6 con' },
          { label: 'Kat Młode', value: 'I V-ce MISTRZ, 160.61 coeff, 15 con' },
          { label: 'Generalne', value: 'I V-ce MISTRZ, 1401.99 coeff, 32 con' },
        ],
      },
    ],
  },
  {
    year: '2010',
    label: 'Chronologia 2010',
    title: 'Utrzymanie tempa w Łużycach',
    description:
      'Rok bogaty w tytuły MISTRZ* w kat. B, Młode i Roczne oraz pierwsze lokaty w okręgu.',
    groups: [
      {
        title: 'Oddział Łużyce Lubań 0446',
        entries: [
          { label: 'Kat A', value: 'I V-ce MISTRZ*, 293.79 coeff, 20 con' },
          { label: 'Kat B', value: 'MISTRZ*, 62.47 coeff, 16 con' },
          { label: 'Kat H', value: 'I V-ce MISTRZ*, 975.71 coeff, 18 con' },
          { label: 'Kat Młode', value: 'MISTRZ*, 245.86 coeff, 15 con' },
          { label: 'Kat Roczne', value: 'MISTRZ*, 1692.16 coeff, 34 con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'I V-ce MISTRZ, 293.79 coeff, 20 con' },
          { label: 'Kat B', value: 'MISTRZ, 62.47 coeff, 16 con' },
          { label: 'Kat H', value: 'II V-ce MISTRZ, 975.71 coeff, 18 con' },
          { label: 'Kat Młode', value: 'MISTRZ, 245.86 coeff, 15 con' },
          { label: 'Kat Roczne', value: '1. Przodownik, 1692.16 coeff, 34 con' },
        ],
      },
    ],
  },
  {
    year: '2011',
    label: 'Chronologia 2011',
    title: 'Komplet tytułów dorosłych i młodych',
    description:
      'Sezon totalny – mistrzostwa w kategoriach A–H, zwycięstwa generalne i najwyższe lokaty w regionie.',
    groups: [
      {
        title: 'Oddział Łużyce Lubań 0446',
        entries: [
          { label: 'Kat Total dorosłych', value: 'Mistrz, 611.73 coeff, 70 con' },
          { label: 'Kat A', value: 'Mistrz, 161.32 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 51.32 coeff, 16 con' },
          { label: 'Kat C', value: 'Mistrz, 84.07 coeff, 9 con' },
          { label: 'Kat M', value: 'Mistrz, 59.36 coeff, 6 con' },
          { label: 'Kat D', value: 'Mistrz, 296.71 coeff, - con' },
          { label: 'Kat H', value: 'Mistrz, 588.92 coeff, 18 con' },
          { label: 'Kat Roczne', value: 'Mistrz, 534.49 coeff, 20 con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'I V-ce MISTRZ, 161.32 coeff, 20 con' },
          { label: 'Kat B', value: 'MISTRZ, 51.32 coeff, 16 con' },
          { label: 'Kat C', value: 'MISTRZ, 84.07 coeff, 9 con' },
          { label: 'Kat D', value: 'MISTRZ, 296.71 coeff, 45 con' },
          { label: 'Kat E', value: 'II V-ce MISTRZ, 81.60 coeff, 6 con' },
          { label: 'Kat F', value: 'I V-ce MISTRZ, 243.05 coeff, 15 con' },
          { label: 'Kat G', value: '1. Przodownik, 1583.79 coeff, 34 con' },
          { label: 'Kat H', value: 'II V-ce MISTRZ, 588.92 coeff, 18 con' },
          { label: 'Generalne', value: 'I V-ce MISTRZ, 1417.76 coeff, 32 con' },
        ],
      },
      {
        title: 'Region V',
        entries: [
          { label: 'Kat A', value: '3 Przodownik, 161.32 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 51.32 coeff, 16 con' },
        ],
      },
    ],
  },
  {
    year: '2012',
    label: 'Chronologia 2012',
    title: 'Potrójna korona mistrzów',
    description:
      'Jedyny w swoim rodzaju sezon z mistrzostwami w maratonie, olimpijskiej i generalce młodych.',
    groups: [
      {
        title: 'Oddział Łużyce Lubań 0446',
        entries: [
          { label: 'Kat A', value: 'I Mistrz, 575.76 coeff, 20 con' },
          { label: 'Kat B', value: 'I Mistrz, 160.25 coeff, 16 con' },
          { label: 'Kat C', value: 'II Wicemistrz, 119.72 coeff, 9 con' },
          { label: 'Kat M Maraton', value: 'I Mistrz, 103.06 coeff, - con' },
          { label: 'Kat D', value: 'I Mistrz, 855.28 coeff, - con' },
          { label: 'Kat GMO', value: 'I Mistrz, 1409.58 coeff, - con' },
          { label: 'Kat H', value: 'I Mistrz, 887.54 coeff, - con' },
          { label: 'Kat Roczne', value: 'I Mistrz, 413.58 coeff, 20 con' },
          { label: 'Kat Olimpijskie', value: 'I Mistrz, 646.45 coeff, - con' },
          { label: 'Kat Total dorośli', value: 'I Mistrz, 1080.51 coeff, - con' },
          { label: 'Kat Total młodzi', value: 'II Wicemistrz, 150.62 coeff, - con' },
        ],
      },
      {
        title: 'MP',
        entries: [
          { label: 'Kat Maraton', value: '8 Przodownik, 648.45 coeff, - con' },
          { label: 'Kat Olimpijskie', value: '68 Przodownik, 847.37 coeff, - con' },
        ],
      },
    ],
  },
  {
    year: '2013',
    label: 'Chronologia 2013',
    title: 'Wyczyny młodych i GMP',
    description:
      'Kolejne mistrzostwa w kat. A–D, zwycięstwa młodych i mocne wejście do GMP w regionie oraz MP.',
    groups: [
      {
        title: 'Oddział Łużyce Lubań 0446',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 66.43 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 87.62 coeff, 16 con' },
          { label: 'Kat C', value: '1 Przodownik, 525.46 coeff, 9 con' },
          { label: 'Kat D', value: 'Mistrz, 679.51 coeff, 45 con' },
          { label: 'Kat GMO', value: 'II Wicemistrz, 1373.93 coeff, 32 con' },
          { label: 'Kat H', value: 'Mistrz, 338.68 coeff, 18 con' },
          { label: 'Kat Roczne', value: '3 Przodownik, 1025.61 coeff, 28 con' },
          { label: 'Kat Total młodzi', value: 'I Wicemistrz, 562.03 coeff, 25 con' },
          { label: 'Kat 5 najlepszych młodzi', value: 'Mistrz, 1139.02 coeff, 21 con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'Mistrz, - coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, - coeff, 16 con' },
          { label: 'Kat H', value: 'Mistrz, - coeff, 18 con' },
          { label: 'Kat Roczne', value: 'I Wicemistrz, - coeff, 20 con' },
        ],
      },
      {
        title: 'Region V',
        entries: [
          { label: 'Kat A', value: 'I Wicemistrz, - coeff, 20 con' },
          { label: 'Kat B', value: '1 Przodownik, - coeff, 16 con' },
          { label: 'Kat Roczne', value: '1 Przodownik, - coeff, 20 con' },
          { label: 'Kat D', value: '3 Przodownik, - coeff, 45 con' },
          { label: 'Kat GMP', value: '68 Przodownik, 1381.43 coeff, - con' },
        ],
      },
      {
        title: 'MP',
        entries: [
          { label: 'Kat A', value: 'II Wicemistrz, 66.43 coeff, 20 con' },
          { label: 'Kat B', value: '13 Przodownik, 685.69 coeff, 16 con' },
          { label: 'Kat Roczne', value: '9 Przodownik, 227.84 coeff, 20 con' },
        ],
      },
    ],
  },
  {
    year: '2014',
    label: 'Chronologia 2014',
    title: 'Mistrzostwo w każdej strukturze',
    description:
      'Ten sam wynik w Oddziale, Okręgu, Regionie i MP – kat. A i B wygrane na każdym poziomie.',
    groups: [
      {
        title: 'Oddział Łużyce Lubań 0446',
        entries: [
          { label: 'Kat A', value: 'I Mistrz, 116.13 coeff, 20 con' },
          { label: 'Kat B', value: 'I Mistrz, 661.38 coeff, 16 con' },
          { label: 'Kat C', value: '5 Przodownik, 362.76 coeff, 9 con' },
          { label: 'Kat D', value: 'I Mistrz, 557.24 coeff, - con' },
          { label: 'Kat H', value: 'I Mistrz, 577.48 coeff, - con' },
          { label: 'Kat Roczne', value: 'I Mistrz, 239.29 coeff, 20 con' },
          { label: 'Kat Lotniki', value: '2 Przodownik, 524.88 coeff, - con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [
          { label: 'Kat A', value: 'I Mistrz, 116.13 coeff, 20 con' },
          { label: 'Kat B', value: 'I Mistrz, 661.38 coeff, 16 con' },
        ],
      },
      {
        title: 'Region V',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 116.13 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 661.38 coeff, 16 con' },
        ],
      },
      {
        title: 'MP',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 116.13 coeff, 20 con' },
          { label: 'Kat B', value: 'Mistrz, 661.38 coeff, 16 con' },
          { label: 'Kat Klasa Sport A', value: '22 Miejsce, - coeff, 20 con' },
        ],
      },
    ],
  },
  {
    year: '2015',
    label: 'Chronologia 2015',
    title: 'Powtórka dominacji w kat. A',
    description:
      'Oddział, Region i MP zakończone mistrzostwem w kat. A oraz podium w kat. B ogólnopolskim.',
    groups: [
      {
        title: 'Oddział Łużyce Lubań 0446',
        entries: [
          { label: 'Kat A', value: 'I Mistrz, 86.77 coeff, 20 con' },
          { label: 'Kat B', value: 'I Mistrz, 237.95 coeff, 16 con' },
          { label: 'Kat C', value: 'I Mistrz, 199.65 coeff, 9 con' },
          { label: 'Kat D', value: 'I Mistrz, 520.82 coeff, 45 con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra',
        entries: [{ label: 'Kat A', value: 'Mistrz, 86.77 coeff, 20 con' }],
      },
      {
        title: 'Region V',
        entries: [{ label: 'Kat A', value: 'Mistrz, 86.77 coeff, 20 con' }],
      },
      {
        title: 'MP',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 86.77 coeff, 20 con' },
          { label: 'Kat B', value: '1 Przodownik, 71.68 coeff, 16 con' },
        ],
      },
    ],
  },
  {
    year: '2017',
    label: 'Chronologia 2017',
    title: 'Nowy Oddział Kwisa 0489',
    description:
      'Przeniesienie do Kwisy i natychmiastowe prowadzenie w kat. A oraz B na poziomie oddziału.',
    groups: [
      {
        title: 'Oddział Kwisa 0489',
        entries: [
          { label: 'Kat A', value: '1 Przodownik, 348.53 coeff, 20 con' },
          { label: 'Kat B', value: '1 Przodownik, 153.39 coeff, 16 con' },
        ],
      },
    ],
  },
  {
    year: '2018',
    label: 'Chronologia 2018',
    title: 'Seria zwycięstw młodych w Kwsia',
    description:
      'Mistrzostwa w kat. A i B oraz wyróżnienia dla młodych gołębi w całej Polsce.',
    groups: [
      {
        title: 'Oddział Kwisa 0489',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 29.38 coeff, 18 con' },
          { label: 'Kat B', value: 'Mistrz, 35.74 coeff, 15 con' },
          { label: 'Kat Total', value: 'XIII Przodownik, 942.69 coeff, 43 con' },
          {
            label: 'Kat Młode 5 gołębi',
            value: '57 miejsce, 239.98 pkt, 1018.135 coeff, 5 con',
          },
          {
            label: 'Kat Młode Główna',
            value: '59 miejsce, 109.32 pkt, 15.4 knk/km, 4 con',
          },
        ],
      },
    ],
  },
  {
    year: '2019',
    label: 'Chronologia 2019',
    title: 'Pełnia sukcesów młodzieżowych',
    description:
      'Oddział Kwisa zgarnia komplet pierwszych miejsc w GMP, Derby oraz klasyfikacji 5 gołębi.',
    groups: [
      {
        title: 'Oddział Kwisa 0489',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 82.76 coeff, - con' },
          { label: 'Kat B', value: 'Mistrz, 130.64 coeff, - con' },
          { label: 'Kat Młode GMP', value: '1 miejsce, 931.51 pkt, - con' },
          { label: 'Kat Młode Derby', value: '7 miejsce, 591.85 pkt, 2752.677 coeff, - con' },
          {
            label: 'Kat Młode 5 gołębi',
            value: '1 miejsce, 181.10 pkt, 2807.786 coeff, - con',
          },
          { label: 'Kat Młode Total', value: '1 miejsce, 109.88 pkt, 73.7% coeff, - con' },
        ],
      },
    ],
  },
  {
    year: '2020',
    label: 'Chronologia 2020',
    title: 'Nieuznane, ale rekordowe',
    description:
      'Pomimo nieuznania wyników, sezon pokazał mistrzowską formę w każdej strukturze rywalizacji.',
    groups: [
      {
        title: 'Oddział Kwisa 0489',
        entries: [
          { label: 'Kat A', value: 'Mistrz, 69.22 coeff, 18 con' },
          { label: 'Kat B', value: 'Mistrz, 82.03 coeff, 15 con' },
          { label: 'Kat C', value: 'Mistrz, 561.95 coeff, 9 con' },
          { label: 'Kat D', value: 'Mistrz, 713.20 coeff, 42 con' },
        ],
      },
      {
        title: 'Okręg Jelenia Góra (nieuznane)',
        entries: [
          { label: 'Kat A', value: '3 Przodownik, 69.22 coeff, 18 con' },
          { label: 'Kat B', value: 'I V-ce Mistrz, 81.30 coeff, 15 con' },
          { label: 'Kat C', value: '2 Przodownik, 561.95 coeff, 9 con' },
          { label: 'Kat D', value: 'Mistrz, 713.20 coeff, 42 con' },
        ],
      },
      {
        title: 'Region V (nieuznane)',
        entries: [
          { label: 'Kat A', value: 'I V-ce Mistrz, 63.82 coeff, 18 con' },
          { label: 'Kat B', value: 'I V-ce Mistrz, 70.75 coeff, 15 con' },
          { label: 'Kat C', value: '12 Przodownik, 561.95 coeff, 9 con' },
          { label: 'Kat D', value: '7 Przodownik, 713.20 coeff, 42 con' },
        ],
      },
      {
        title: 'MP (nieuznane)',
        entries: [
          { label: 'Kat A', value: 'I V-ce Mistrz, 63.82 coeff, 18 con' },
          { label: 'Kat B', value: 'I V-ce Mistrz, 70.75 coeff, 15 con' },
          { label: 'Kat C', value: '~70 Przodownik, 561.95 coeff, 9 con' },
          { label: 'Kat D', value: '~50 Przodownik, 713.20 coeff, 42 con' },
        ],
      },
    ],
  },
  {
    year: '2023',
    label: 'Chronologia 2023',
    title: 'Powrót marki Pałka MTM',
    description:
      'Najświeższe sukcesy Oddziału Kwisa – mistrzostwo kat. A i wicemistrzostwo kat. B pod marką Pałka MTM.',
    groups: [
      {
        title: 'Oddział Kwisa 0489',
        entries: [
          { label: 'Kat A', value: 'MISTRZ Pałka MTM, 184.75 coeff, 18 con' },
          { label: 'Kat B', value: 'I V-ce MISTRZ Pałka MTM, 286.13 coeff, 15 con' },
        ],
      },
    ],
  },
  {
    year: '2024',
    label: 'Chronologia 2024',
    title: 'Aktualny sezon zwycięzców',
    description:
      'Najświeższe rezultaty utrzymują wysokie loty – podwójne mistrzostwo Oddziału w kat. A i B.',
    groups: [
      {
        title: 'Oddział Kwisa 0489',
        entries: [
          { label: 'Kat A', value: 'MISTRZ Pałka MTM, 124.53 coeff, 18 con' },
          { label: 'Kat B', value: 'MISTRZ Pałka MTM, 245.78 coeff, 15 con' },
        ],
      },
    ],
  },
];

export function AchievementTimelineDemo() {
  return (
    <div className="section-padding container-responsive">
      <AchievementTimeline items={achievementsTimelineData} />
    </div>
  );
}

