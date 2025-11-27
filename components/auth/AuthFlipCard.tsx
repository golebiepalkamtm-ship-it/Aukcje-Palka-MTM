'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import FirebaseAuthForm from './FirebaseAuthForm';
import './AuthFlipCard.css';

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

type AuthMode = 'login' | 'register';

interface AuthFlipCardProps {
  initialMode?: AuthMode;
}

export function AuthFlipCard({ initialMode }: AuthFlipCardProps) {
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  useCardGlow(cardRef);

  // Ustal domyślny tryb na podstawie props, query params lub pathname
  const getInitialMode = (): AuthMode => {
    // 1. Props ma najwyższy priorytet
    if (initialMode) return initialMode;

    // 2. Query param ?mode=register
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') return 'register';

    // 3. Domyślnie register (użytkownik klika "Zarejestruj się")
    return 'register';
  };

  const [mode, setMode] = useState<AuthMode>(getInitialMode());

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  // Nasłuchuj na weryfikację emaila w innej karcie
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'email-verified') {
        toast.success('🎉 Email został zweryfikowany! Twoje konto jest aktywne.', {
          duration: 5000,
          position: 'top-center',
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Wyłącz drugi toast - został już pokazany przez storage event
  // useEffect(() => {
  //   if (dbUser?.emailVerified && user?.emailVerified) {
  //     const hasShownToast = sessionStorage.getItem('email-verified-toast-shown')
  //     if (!hasShownToast) {
  //       toast.success('✅ Twój email jest zweryfikowany! Możesz teraz korzystać z pełnych funkcji.', {
  //         duration: 6000,
  //         position: 'top-center',
  //       })
  //       sessionStorage.setItem('email-verified-toast-shown', 'true')
  //     }
  //   }
  // }, [dbUser?.emailVerified, user?.emailVerified])

  return (
    <div className="auth-flip-container">
      {/* Main flip card content */}
      {/* ✨ Dekoracyjne tło geometryczne */}
      <div className="auth-flip-background">
        <div className="geometric-grid"></div>
        <div className="floating-elements">
          <div className="float-1"></div>
          <div className="float-2"></div>
          <div className="float-3"></div>
        </div>
      </div>

      {/* 🔄 Główna karta flipująca 3D */}
      <div ref={cardRef} className={`achievement-card auth-flip-card ${mode === 'register' ? 'flipped' : ''}`} style={{ position: 'relative', isolation: 'isolate', overflow: 'visible' }}>
        <div className="glow" />
        {/* STRONA 1: Logowanie */}
        <div className="auth-flip-face auth-flip-front">
          <div className="auth-flip-content">
            <h2 className="auth-flip-title">Zaloguj się</h2>
            <p className="auth-flip-subtitle">Witaj z powrotem w świecie gołębi</p>
            <div className="auth-flip-form-wrapper">
              <FirebaseAuthForm initialMode="signin" hideAuthModeToggle={true} minimal={true} />
            </div>
            <div className="auth-flip-footer">
              <p className="auth-flip-toggle-label">Nie masz konta?</p>
              <button className="auth-flip-toggle-btn" onClick={toggleMode} type="button">
                Zarejestruj się →
              </button>
            </div>
          </div>
        </div>

        {/* STRONA 2: Rejestracja */}
        <div className="auth-flip-face auth-flip-back">
          <div className="auth-flip-content">
            <h2 className="auth-flip-title">Utwórz konto</h2>
            <p className="auth-flip-subtitle">Dołącz do naszej społeczności</p>
            <div className="auth-flip-form-wrapper">
              <FirebaseAuthForm initialMode="signup" hideAuthModeToggle={true} minimal={true} />
            </div>
            <div className="auth-flip-footer">
              <p className="auth-flip-toggle-label">Masz już konto?</p>
              <button className="auth-flip-toggle-btn" onClick={toggleMode} type="button">
                ← Zaloguj się
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📍 Wskaźnik stanu (którą stronę widzisz) */}
      <div className="auth-flip-indicator">
        <span className={`indicator-dot ${mode === 'login' ? 'active' : ''}`}></span>
        <span className={`indicator-dot ${mode === 'register' ? 'active' : ''}`}></span>
      </div>
    </div>
  );
}

export default AuthFlipCard;
