"use client";

import { useEffect } from 'react';

export default function EnableGlowEffects() {
  useEffect(() => {
    try {
      // Add class to body to force CSS glow effects (overrides touch-device disabling)
      document.body.classList.add('force-glow');
    } catch (e) {
      // ignore in non-DOM environments
    }

    return () => {
      try {
        document.body.classList.remove('force-glow');
      } catch (e) {}
    };
  }, []);

  return null;
}
