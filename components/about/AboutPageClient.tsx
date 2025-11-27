'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { Text3D } from '@/components/ui/Text3D';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';

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

export default function AboutPageClient() {
  const cardRef = useRef<HTMLDivElement>(null);
  useCardGlow(cardRef);
  return (
    <>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="relative z-10 -mt-28 sm:-mt-20 pb-6 px-4 sm:px-6 lg:px-8"
      >
        <div className="w-full mx-auto">
          <PageHeader
            title="O nas"
            subtitle="Poznaj historię i pasję stojącą za hodowlą gołębi pocztowych MTM Pałka"
            className="text-4xl md:text-5xl"
            subtitleClassName="text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
          />
        </div>
      </motion.section>

      {/* Content Sections */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Historia MTM Pałka */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div ref={cardRef} className="achievement-card" style={{ position: 'relative', isolation: 'isolate', overflow: 'visible' }}>
              <div className="glow" />
              <div className="relative z-10" style={{ overflow: 'hidden', borderRadius: '1rem' }}>
                <UnifiedCard variant="glass" glow={false} className="p-12">
              <Text3D
                variant="gradient"
                intensity="medium"
                className="text-3xl md:text-4xl font-bold mb-8 text-center"
              >
                MTM Pałka: Gdzie Rodzinna Pasja Spotyka Mistrzostwo Sprintu
              </Text3D>

              <div className="prose prose-lg max-w-none text-white/90 leading-relaxed">
                <p className="mb-6">
                  Witamy w świecie MTM Pałka – hodowli gołębi pocztowych, której fundamentem jest
                  historia trzech pokoleń, a siłą napędową bezgraniczna miłość do lotu. W sercu
                  Dolnego Śląska, pod niebem Lubania, od ponad czterdziestu pięciu lat piszemy sagę,
                  w której precyzja genetyki łączy się z siłą rodzinnych więzi. Nasza nazwa to
                  symbol jedności – Mariusz, Tadeusz, Marcin Pałka – ojciec i synowie, których
                  połączyła wspólna pasja.
                </p>

                <p className="mb-6">
                  Specjalizujemy się w tym, co najtrudniejsze i najbardziej ekscytujące: w lotach
                  sprinterskich. Dla nas gołębiarstwo to sztuka strategii, intuicji i codziennej,
                  ciężkiej pracy.
                </p>

                <h3 className="text-2xl font-bold text-blue-200 mb-4 mt-8">
                  Filozofia Mistrza: Ojciec Założyciel Tadeusz Pałka
                </h3>
                <p className="mb-6">
                  U steru naszej hodowli od samego początku, czyli od lat 80., stoi Tadeusz Pałka –
                  patriarcha, mentor i wizjoner. To on wpoił nam filozofię, że prawdziwego hodowcę
                  poznaje się nie po zasobności portfela, lecz po oddaniu. Przez 365 dni w roku
                  jesteśmy dla naszych ptaków weterynarzami, dietetykami i trenerami.
                </p>
                <p className="mb-6">
                  Tadeusz mawia: &quot;Ptaki to czują&quot;, a wyniki, które osiągamy, są tego
                  najlepszym dowodem. Jego dekady doświadczenia to kapitał, na którym budujemy nasze
                  dzisiejsze sukcesy.
                </p>

                <h3 className="text-2xl font-bold text-cyan-200 mb-4 mt-8">
                  Siła Pokoleń: Energia, Która Zmieniła Wszystko
                </h3>
                <p className="mb-6">
                  Prawdziwy przełom nastąpił, gdy do Tadeusza dołączyli synowie, wnosząc nową
                  energię i odwagę do działania. To właśnie Mariusz Pałka, jego prawa ręka, wraz z
                  ojcem na przełomie wieków zrewolucjonizował naszą hodowlę. Import elitarnych
                  gołębi z linii Janssen, Vandenabeele czy od mistrzów jak Gerhard Peters, nasycił
                  nasze stado genem zwycięzców i nadał mu niezrównaną szybkość.
                </p>
                <p className="mb-6">
                  Dziś tę misję kontynuuje Marcin Pałka, który od dziecka związany jest z
                  gołębnikiem. Jego precyzja w logistyce i organizacji lotów zapewnia, że każdy
                  start naszych podopiecznych jest przygotowany perfekcyjnie. To dzięki tej synergii
                  pokoleń MTM Pałka stało się synonimem &quot;mistrzów sprintu&quot;.
                </p>

                <h3 className="text-2xl font-bold text-blue-300 mb-4 mt-8">
                  W Cieniu Skrzydeł: Historia, Która Daje Nam Siłę
                </h3>
                <p className="mb-6">
                  Nasza droga nie była usłana wyłącznie sukcesami. 29 stycznia 2006 roku tragedia na
                  Międzynarodowych Targach Katowickich na zawsze zabrała nam Mariusza. Jego odejście
                  pozostawiło pustkę, ale jego pasja i marzenia stały się naszym największym
                  zobowiązaniem. Tadeusz, jako lider rodziny, przekuł niewyobrażalny ból w
                  determinację, by dziedzictwo syna trwało w każdym locie i każdym kolejnym
                  pokoleniu mistrzów z naszego gołębnika.
                </p>
                <p className="mb-6">
                  Adrenalina towarzysząca oczekiwaniu na powrót stada to dziś coś więcej niż sport –
                  to hołd dla pamięci i symbol niezłomności.
                </p>

                <h3 className="text-2xl font-bold text-cyan-300 mb-4 mt-8">
                  Tradycja w Nowoczesnym Wydaniu: MTM Pałka Dziś
                </h3>
                <p className="mb-6">
                  Dziś MTM Pałka to hodowla, która z szacunkiem patrzy w przeszłość, ale odważnie
                  spogląda w przyszłość.
                </p>
                <p className="mb-6">
                  Elitarne Pochodzenie: Nasz gołębnik jest domem dla potomków legendarnych
                  sprinterów, a ich jakość potwierdzają hodowcy w całej Polsce.
                </p>
                <p className="mb-8">
                  Zapraszamy do poznania naszej historii i naszych skrzydlatych atletów. MTM Pałka
                  to więcej niż hodowla – to dowód, że największe sukcesy rodzą się z serca,
                  wytrwałości i rodzinnych więzi.
                </p>
              </div>
                </UnifiedCard>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
