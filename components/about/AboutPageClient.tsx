'use client';

import { Text3D } from '@/components/ui/Text3D';
import GoldenCard from '@/components/ui/GoldenCard';
import { useEffect, useRef } from 'react';

export default function AboutPageClient() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const $card = cardRef.current;
    if (!$card) return;

    const centerOfElement = ($el: HTMLElement) => {
      const { left, top, width, height } = $el.getBoundingClientRect();
      return [width / 2, height / 2];
    };

    const pointerPositionRelativeToElement = ($el: HTMLElement, e: PointerEvent) => {
      const pos = [e.clientX, e.clientY];
      const { left, top, width, height } = $el.getBoundingClientRect();
      const x = pos[0] - left;
      const y = pos[1] - top;
      const px = clamp((100 / width) * x);
      const py = clamp((100 / height) * y);
      return { pixels: [x, y], percent: [px, py] };
    };

    const angleFromPointerEvent = (_$el: HTMLElement, dx: number, dy: number) => {
      let angleRadians = 0;
      let angleDegrees = 0;
      if (dx !== 0 || dy !== 0) {
        angleRadians = Math.atan2(dy, dx);
        angleDegrees = angleRadians * (180 / Math.PI) + 90;
        if (angleDegrees < 0) angleDegrees += 360;
      }
      return angleDegrees;
    };

    const distanceFromCenter = ($el: HTMLElement, x: number, y: number) => {
      const [cx, cy] = centerOfElement($el);
      return [x - cx, y - cy];
    };

    const closenessToEdge = ($el: HTMLElement, x: number, y: number) => {
      const [cx, cy] = centerOfElement($el);
      const [dx, dy] = distanceFromCenter($el, x, y);
      let k_x = Infinity;
      let k_y = Infinity;
      if (dx !== 0) k_x = cx / Math.abs(dx);
      if (dy !== 0) k_y = cy / Math.abs(dy);
      return clamp((1 / Math.min(k_x, k_y)), 0, 1);
    };

    const round = (value: number, precision = 3) => parseFloat(value.toFixed(precision));

    const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

    const cardUpdate = (e: PointerEvent) => {
      const position = pointerPositionRelativeToElement($card, e);
      const [px, py] = position.pixels;
      const [perx, pery] = position.percent;
      const [dx, dy] = distanceFromCenter($card, px, py);
      const edge = closenessToEdge($card, px, py);
      const angle = angleFromPointerEvent($card, dx, dy);

      $card.style.setProperty('--pointer-x', `${round(perx)}%`);
      $card.style.setProperty('--pointer-y', `${round(pery)}%`);
      $card.style.setProperty('--pointer-°', `${round(angle)}deg`);
      $card.style.setProperty('--pointer-d', `${round(edge * 100)}`);

      $card.classList.remove('animating');
    };

    $card.addEventListener('pointermove', cardUpdate);

    // Animation helpers (original CodePen)
    function easeOutCubic(x: number) {
      return 1 - Math.pow(1 - x, 3);
    }
    function easeInCubic(x: number) {
      return x * x * x;
    }

    function animateNumber(options: any) {
      const {
        startValue = 0,
        endValue = 100,
        duration = 1000,
        delay = 0,
        onUpdate = () => {},
        ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
        onStart = () => {},
        onEnd = () => {},
      } = options;

      const startTime = performance.now() + delay;

      function update() {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const t = Math.min(elapsed / duration, 1);
        const easedValue = startValue + (endValue - startValue) * ease(t);
        onUpdate(easedValue);
        if (t < 1) requestAnimationFrame(update);
        else if (t >= 1) onEnd();
      }

      setTimeout(() => {
        onStart();
        requestAnimationFrame(update);
      }, delay);
    }

    // Play intro animation (same angles as CodePen)
    const angleStart = 110;
    const angleEnd = 465;
    $card.style.setProperty('--pointer-°', `${angleStart}deg`);
    $card.classList.add('animating');

    animateNumber({
      ease: easeOutCubic,
      duration: 500,
      onUpdate: (v: number) => $card.style.setProperty('--pointer-d', String(v)),
    });

    animateNumber({
      ease: easeInCubic,
      delay: 0,
      duration: 1500,
      endValue: 50,
      onUpdate: (v: number) => {
        const d = (angleEnd - angleStart) * (v / 100) + angleStart;
        $card.style.setProperty('--pointer-°', `${d}deg`);
      },
    });

    animateNumber({
      ease: easeOutCubic,
      delay: 1500,
      duration: 2250,
      startValue: 50,
      endValue: 100,
      onUpdate: (v: number) => {
        const d = (angleEnd - angleStart) * (v / 100) + angleStart;
        $card.style.setProperty('--pointer-°', `${d}deg`);
      },
    });

    animateNumber({
      ease: easeInCubic,
      duration: 1500,
      delay: 2500,
      startValue: 100,
      endValue: 0,
      onUpdate: (v: number) => $card.style.setProperty('--pointer-d', String(v)),
      onEnd: () => $card.classList.remove('animating'),
    });

    const introTimer = window.setTimeout(() => {}, 0);

    return () => {
      $card.removeEventListener('pointermove', cardUpdate);
      window.clearTimeout(introTimer);
    };
  }, []);

  // Define gradient animation for dynamic hover effect
  const gradientAnimation = `
    @keyframes gradientBG {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  // Update hover effect to include gradient animation
  const hoverEffect = `
    .glowing-card-effect:hover {
      background: radial-gradient(circle at var(--pointer-x, 50%) var(--pointer-y, 50%), rgba(255, 255, 255, 0.8), transparent 70%);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 0, 150, 0.4), 0 0 60px rgba(0, 150, 255, 0.3);
    }
    ${gradientAnimation}
  `;

  // Inject hover effect styles into the document
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = hoverEffect;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Inject animation styles into the document
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = gradientAnimation;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Subtle glowing gradient style applied to the card; used in JSX below
  const glowingGradientStyle: React.CSSProperties = {
    background:
      'linear-gradient(45deg, rgba(255,154,158,0.04) 0%, rgba(250,208,196,0.03) 25%, rgba(161,140,209,0.03) 50%, rgba(203,240,255,0.02) 75%, rgba(255,214,165,0.03) 100%)',
    backgroundSize: '400% 400%',
    animation: 'gradientBG 12s ease infinite',
  };

  // Attach theme toggle listeners for the sun/moon icons inside the card
  useEffect(() => {
    const $card = cardRef.current;
    if (!$card) return;

    const $moon = $card.querySelector('.moon');
    const $sun = $card.querySelector('.sun');
    const $app = document.querySelector('#app');

    const onMoon = () => {
      document.body.classList.remove('light');
      if ($app) $app.classList.remove('light');
    };

    const onSun = () => {
      document.body.classList.add('light');
      if ($app) $app.classList.add('light');
    };

    if ($moon) $moon.addEventListener('click', onMoon);
    if ($sun) $sun.addEventListener('click', onSun);

    return () => {
      if ($moon) $moon.removeEventListener('click', onMoon);
      if ($sun) $sun.removeEventListener('click', onSun);
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative z-10 pt-44 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto text-center">
          <h1 className="text-4xl font-bold uppercase tracking-[0.5em] text-white/60 mb-6">O nas</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Poznaj historię i pasję stojącą za hodowlą gołębi pocztowych MTM Pałka
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Historia MTM Pałka */}
          <section className="mb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <GoldenCard className="p-6">
                <div ref={cardRef} className="w-full" style={{ ...glowingGradientStyle }}>
                  <Text3D
                    variant="gradient"
                    intensity="medium"
                    className="text-3xl md:text-4xl font-bold mb-6 text-center"
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

                    <div className="mb-8">
                      <h3 className="text-2xl font-bold uppercase tracking-[0.3em] text-white/60 mb-4">
                        Filozofia Mistrza: Ojciec Założyciel Tadeusz Pałka
                      </h3>
                      <p className="mb-4 text-white/80">
                        U steru naszej hodowli od samego początku, czyli od lat 80., stoi Tadeusz Pałka –
                        patriarcha, mentor i wizjoner. To on wpoił nam filozofię, że prawdziwego hodowcę
                        poznaje się nie po zasobności portfela, lecz po oddaniu. Przez 365 dni w roku
                        jesteśmy dla naszych ptaków weterynarzami, dietetykami i trenerami.
                      </p>
                      <p className="text-white/80">
                        Tadeusz mawia: &quot;Ptaki to czują&quot;, a wyniki, które osiągamy, są tego
                        najlepszego dowodem. Jego dekady doświadczenia to kapitał, na którym budujemy nasze
                        dzisiejsze sukcesy.
                      </p>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-2xl font-bold uppercase tracking-[0.3em] text-white/60 mb-4">
                        Siła Pokoleń: Energia, Która Zmieniła Wszystko
                      </h3>
                      <p className="mb-4 text-white/80">
                        Prawdziwy przełom nastąpił, gdy do Tadeusza dołączyli synowie, wnosząc nową
                        energię i odwagę do działania. To właśnie Mariusz Pałka, jego prawa ręka, wraz z
                        ojcem na przełomie wieków zrewolucjonizował naszą hodowlę. Import elitarnych
                        gołębi z linii Janssen, Vandenabeele czy od mistrzów jak Gerhard Peters, nasycił
                        nasze stado genem zwycięzców i nadał mu niezrównaną szybkość.
                      </p>
                      <p className="text-white/80">
                        Dziś tę misję kontynuuje Marcin Pałka, który od dziecka związany jest z
                        gołębnikiem. Jego precyzja w logistyce i organizacji lotów zapewnia, że każdy
                        start naszych podopiecznych jest przygotowany perfekcyjnie. To dzięki tej synergii
                        pokoleń MTM Pałka stało się synonimem &quot;mistrzów sprintu&quot;.
                      </p>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-2xl font-bold uppercase tracking-[0.3em] text-white/60 mb-4">
                        W Cieniu Skrzydeł: Historia, Która Daje Nam Siłę
                      </h3>
                      <p className="mb-4 text-white/80">
                        Nasza droga nie była usłana wyłącznie sukcesami. 29 stycznia 2006 roku tragedia na
                        Międzynarodowych Targach Katowickich na zawsze zabrała nam Mariusza. Jego odejście
                        pozostawiło pustkę, ale jego pasja i marzenia stały się naszym największym
                        zobowiązaniem. Tadeusz, jako lider rodziny, przekuł niewyobrażalny ból w
                        determinację, by dziedzictwo syna trwało w każdym locie i każdym kolejnym
                        pokoleniu mistrzów z naszego gołębnika.
                      </p>
                      <p className="text-white/80">
                        Adrenalina towarzysząca oczekiwaniu na powrót stada to dziś coś więcej niż sport –
                        to hołd dla pamięci i symbol niezłomności.
                      </p>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-2xl font-bold uppercase tracking-[0.3em] text-white/60 mb-4">
                        Tradycja w Nowoczesnym Wydaniu: MTM Pałka Dziś
                      </h3>
                      <p className="mb-4 text-white/80">
                        Dziś MTM Pałka to hodowla, która z szacunkiem patrzy w przeszłość, ale odważnie
                        spogląda w przyszłość.
                      </p>
                      <p className="mb-4 text-white/80">
                        Elitarne Pochodzenie: Nasz gołębnik jest domem dla potomków legendarnych
                        sprinterów, a ich jakość potwierdzają hodowcy w całej Polsce.
                      </p>
                      <p className="text-white/80">
                        Zapraszamy do poznania naszej historii i naszych skrzydeł atletów. MTM Pałka
                        to więcej niż hodowla – to dowód, że największe sukcesy rodzą się z serca,
                        wytrwałości i rodzinnych więzi.
                      </p>
                    </div>
                  </div>
                </div>
              </GoldenCard>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
