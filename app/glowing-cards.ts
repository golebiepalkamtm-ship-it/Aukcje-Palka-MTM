
// Globalny efekt glowing edges dla wszystkich kart - DOKŁADNIE z CodePen
// https://codepen.io/simeydotme/pen/RNWoPRj

export function initGlowingCards() {
  if (typeof window === 'undefined') return;

  const clamp = (value: number, min = 0, max = 100) =>
    Math.min(Math.max(value, min), max);

  const round = (value: number, precision = 3) =>
    parseFloat(value.toFixed(precision));

  const centerOfElement = (el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  };

  const pointerPositionRelativeToElement = (el: HTMLElement, e: PointerEvent) => {
    const pos = [e.clientX, e.clientY];
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = pos[0] - left;
    const y = pos[1] - top;
    const px = clamp((100 / width) * x);
    const py = clamp((100 / height) * y);
    return { pixels: [x, y], percent: [px, py] };
  };

  const angleFromPointerEvent = (dx: number, dy: number) => {
    let angleRadians = 0;
    let angleDegrees = 0;
    if (dx !== 0 || dy !== 0) {
      angleRadians = Math.atan2(dy, dx);
      angleDegrees = angleRadians * (180 / Math.PI) + 90;
      if (angleDegrees < 0) {
        angleDegrees += 360;
      }
    }
    return angleDegrees;
  };

  const distanceFromCenter = (el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = centerOfElement(el);
    return [x - cx, y - cy];
  };

  const closenessToEdge = (el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = centerOfElement(el);
    const [dx, dy] = distanceFromCenter(el, x, y);
    let k_x = Infinity;
    let k_y = Infinity;
    if (dx !== 0) {
      k_x = cx / Math.abs(dx);
    }
    if (dy !== 0) {
      k_y = cy / Math.abs(dy);
    }
    return clamp(1 / Math.min(k_x, k_y), 0, 1);
  };

  const cardUpdate = (card: HTMLElement, e: PointerEvent) => {
    const position = pointerPositionRelativeToElement(card, e);
    const [px, py] = position.pixels;
    const [perx, pery] = position.percent;
    const [dx, dy] = distanceFromCenter(card, px, py);
    const edge = closenessToEdge(card, px, py);
    const angle = angleFromPointerEvent(dx, dy);

    card.style.setProperty('--pointer-x', `${round(perx)}%`);
    card.style.setProperty('--pointer-y', `${round(pery)}%`);
    card.style.setProperty('--pointer-°', `${round(angle)}deg`);
    card.style.setProperty('--pointer-d', `${round(edge * 100)}`);
  };

  // Helper: animate a numeric CSS variable on an element
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInCubic = (t: number) => t * t * t;

  const animateNumber = (
    el: HTMLElement,
    varName: string,
    from: number,
    to: number,
    duration = 400,
    easing: (t: number) => number = easeOutCubic,
    unit = ''
  ) => {
    return new Promise<void>((resolve) => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const v = from + (to - from) * easing(t);
        const out = Number.isFinite(v) ? v : to;
        el.style.setProperty(varName, `${Math.round(out * 1000) / 1000}${unit}`);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  };

  // Play a short intro animation on a card to make the glow shimmer in
  const playAnimation = async (card: HTMLElement) => {
    try {
      // ensure vars exist
      card.style.setProperty('--pointer-d', '0');
      card.style.setProperty('--pointer-°', '0deg');

      // Stage 1: quick burst of distance
      await animateNumber(card, '--pointer-d', 0, 70, 450, easeOutCubic, '');

      // Stage 2: rotate the highlight a bit
      await animateNumber(card, '--pointer-°', 0, 45, 380, easeInCubic, 'deg');

      // Stage 3: settle down to a softer glow
      await animateNumber(card, '--pointer-d', 70, 24, 520, easeOutCubic, '');

      // Stage 4: return angle to 0
      await animateNumber(card, '--pointer-°', 45, 0, 420, easeOutCubic, 'deg');
    } catch (err) {
      // ignore animation errors
    }
  };

  // Znajdź wszystkie karty i elementy interaktywne
  const cards = document.querySelectorAll<HTMLElement>(
    '.card-glow-edge, .card-glass, .glass-container, .card, [class*="card"], [class*="glass"], .btn-primary, .btn-secondary, .glass-nav-button, input:not([type="checkbox"]):not([type="radio"]), textarea, select'
  );

  cards.forEach(card => {
    // Skip any card that is inside a no-hover container (admin override)
    if (card.closest && card.closest('.no-hover')) return;

    // Dodaj element .glow jeśli nie istnieje (z wyjątkiem input/textarea/select - dla nich opcjonalne)
    const isFormElement = card.tagName === 'INPUT' || card.tagName === 'TEXTAREA' || card.tagName === 'SELECT';

    if (!card.querySelector('.glow') && !isFormElement) {
      const glow = document.createElement('span');
      glow.className = 'glow';
      glow.setAttribute('aria-hidden', 'true');
      card.appendChild(glow);
    }

    card.addEventListener('pointermove', (e) => {
      cardUpdate(card, e as PointerEvent);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--pointer-d', '0');
    });
    // Set initial CSS vars and play intro animation
    card.style.setProperty('--pointer-d', '0');
    card.style.setProperty('--pointer-°', '0deg');
    void playAnimation(card);
  });

  // Observer dla dynamicznie dodanych kart
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          const newCards = node.querySelectorAll<HTMLElement>(
            '.card-glow-edge, .card-glass, .glass-container, .card, [class*="card"], [class*="glass"], .btn-primary, .btn-secondary, .glass-nav-button, input:not([type="checkbox"]):not([type="radio"]), textarea, select'
          );
          newCards.forEach(card => {
            // Skip cards that are inside a no-hover container
            if (card.closest && card.closest('.no-hover')) return;

            const isFormElement = card.tagName === 'INPUT' || card.tagName === 'TEXTAREA' || card.tagName === 'SELECT';

            if (!card.querySelector('.glow') && !isFormElement) {
              const glow = document.createElement('span');
              glow.className = 'glow';
              glow.setAttribute('aria-hidden', 'true');
              card.appendChild(glow);
            }

            card.addEventListener('pointermove', (e) => {
              cardUpdate(card, e as PointerEvent);
            });

            card.addEventListener('pointerleave', () => {
              card.style.setProperty('--pointer-d', '0');
            });
            // initial vars + intro animation for dynamically added cards
            card.style.setProperty('--pointer-d', '0');
            card.style.setProperty('--pointer-°', '0deg');
            void playAnimation(card);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
