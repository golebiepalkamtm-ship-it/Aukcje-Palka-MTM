'use client';

import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="text-center pt-24 pb-8 min-h-[40vh] flex flex-col justify-start gap-2 relative z-[1002]" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto px-4">
        {/* Tytuł i opis */}
        <div className="mb-1 mt-0 relative z-[1002]">
          {/* Światło do góry nagłówka */}
          <div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl h-12 opacity-50 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 80% at center, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.4) 40%, rgba(255, 255, 255, 0.1) 70%, rgba(255, 255, 255, 0) 100%)',
              filter: 'blur(1px)',
              zIndex: 1000,
            }}
          />
          {/* Delikatne białe światło do nagłówka */}
          <div
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full max-w-3xl h-16 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at center, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 30%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0) 100%)',
              filter: 'blur(2px)',
              zIndex: 1000,
            }}
          />
          {/* Dodatkowe światło otaczające nagłówek */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-32 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at center, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0) 100%)',
              filter: 'blur(8px)',
              zIndex: 1001,
            }}
          />

          {/* Subtelny cień na poziomie 500 */}
          <div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 100% at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.25) 40%, rgba(0, 0, 0, 0.15) 70%, rgba(0, 0, 0, 0) 100%)',
              filter: 'blur(6px)',
              zIndex: 500,
              opacity: 0.8,
            }}
          />
          <div
            className="flex flex-col items-center relative z-[1003]"
            suppressHydrationWarning
          >
            <div className="relative z-[1003]">
              <h1
                className="page-title relative inline-block font-extrabold uppercase tracking-[0.12em] mb-2"
                style={{
                  fontSize: 'clamp(2rem, 7vw, 5rem)',
                  lineHeight: '0.85',
                  color: '#6b6b6b',
                  zIndex: 1003,
                  WebkitTextStroke: '1px rgba(0, 0, 0, 0.8)',
                  filter: 'drop-shadow(0 -1px 6px rgba(255, 255, 255, 0.7)) drop-shadow(0 -2px 10px rgba(255, 255, 255, 0.6)) drop-shadow(0 -3px 14px rgba(255, 255, 255, 0.5)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.9)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.8)) drop-shadow(0 16px 32px rgba(0, 0, 0, 0.7)) drop-shadow(0 24px 48px rgba(0, 0, 0, 0.6))',
                  textShadow: '0 -1px 6px rgba(255, 255, 255, 0.7), 0 -2px 12px rgba(255, 255, 255, 0.7), 0 -3px 18px rgba(255, 255, 255, 0.6), 0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4), 0 0 45px rgba(255, 255, 255, 0.3), 0 6px 12px rgba(0, 0, 0, 0.9), 0 10px 20px rgba(0, 0, 0, 0.8), 0 16px 32px rgba(0, 0, 0, 0.7), 0 24px 48px rgba(0, 0, 0, 0.6)',
                }}
                suppressHydrationWarning
              >
                Pałka MTM
              </h1>
              {/* Cień za napisem Pałka MTM */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 80% 120% at center, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 25%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.3) 70%, rgba(0, 0, 0, 0) 100%)',
                  filter: 'blur(16px)',
                  zIndex: 1002,
                  marginTop: '0.5rem',
                }}
              />
              <div
                className="absolute inset-0 bg-white/20 blur-3xl rounded-lg opacity-60 pointer-events-none"
                style={{
                  width: '120%',
                  height: '120%',
                  left: '-10%',
                  top: '-10%',
                  zIndex: 1001,
                }}
              />
              {/* Światła na górnych częściach liter */}
              <div className="absolute top-0 left-0 right-0 h-1 flex justify-around items-start pointer-events-none">
                <div className="w-1 h-1 bg-white rounded-full opacity-90 blur-[0.5px] animate-pulse" style={{boxShadow: '0 0 4px rgba(255,255,255,0.9)'}}></div>
                <div className="w-1 h-1 bg-white rounded-full opacity-80 blur-[0.5px]" style={{boxShadow: '0 0 3px rgba(255,255,255,0.8)'}}></div>
                <div className="w-1 h-1 bg-white rounded-full opacity-85 blur-[0.5px] animate-pulse" style={{boxShadow: '0 0 5px rgba(255,255,255,0.85)'}}></div>
                <div className="w-1 h-1 bg-white rounded-full opacity-75 blur-[0.5px]" style={{boxShadow: '0 0 3px rgba(255,255,255,0.7)'}}></div>
                <div className="w-1 h-1 bg-white rounded-full opacity-90 blur-[0.5px] animate-pulse" style={{boxShadow: '0 0 4px rgba(255,255,255,0.9)'}}></div>
              </div>
            </div>
            <div className="relative z-[1003]">
              <h2
                className="page-title relative inline-block font-extrabold uppercase tracking-[0.12em] mb-2"
                style={{
                  fontSize: 'clamp(2rem, 7vw, 5rem)',
                  lineHeight: '0.85',
                  color: '#6b6b6b',
                  zIndex: 1003,
                  WebkitTextStroke: '1px rgba(0, 0, 0, 0.8)',
                  filter: 'drop-shadow(0 -1px 4px rgba(255, 255, 255, 0.5)) drop-shadow(0 -2px 6px rgba(255, 255, 255, 0.4)) drop-shadow(0 -3px 8px rgba(255, 255, 255, 0.3))',
                  textShadow: '0 -1px 4px rgba(255, 255, 255, 0.5), 0 -2px 8px rgba(255, 255, 255, 0.4), 0 -3px 12px rgba(255, 255, 255, 0.3), 0 0 10px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2)',
                }}
                suppressHydrationWarning
              >
                Mistrzowie Sprintu
              </h2>
              <div
                className="absolute inset-0 bg-white/20 blur-3xl rounded-lg opacity-60 pointer-events-none"
                style={{
                  width: '120%',
                  height: '120%',
                  left: '-10%',
                  top: '-10%',
                  zIndex: 1001,
                }}
              />
              {/* Światła na górnych częściach liter */}
              <div className="absolute top-0 left-0 right-0 h-1 flex justify-around items-start pointer-events-none">
                <div className="w-1 h-1 bg-white rounded-full opacity-85 blur-[0.5px]" style={{boxShadow: '0 0 4px rgba(255,255,255,0.85)'}}></div>
                <div className="w-1 h-1 bg-white rounded-full opacity-90 blur-[0.5px] animate-pulse" style={{boxShadow: '0 0 5px rgba(255,255,255,0.9)'}}></div>
                <div className="w-1 h-1 bg-white rounded-full opacity-80 blur-[0.5px] animate-pulse" style={{boxShadow: '0 0 3px rgba(255,255,255,0.8)'}}></div>
                <div className="w-1 h-1 bg-white rounded-full opacity-88 blur-[0.5px]" style={{boxShadow: '0 0 4px rgba(255,255,255,0.88)'}}></div>
                <div className="w-1 h-1 bg-white rounded-full opacity-75 blur-[0.5px] animate-pulse" style={{boxShadow: '0 0 3px rgba(255,255,255,0.75)'}}></div>
                <div className="w-1 h-1 bg-white rounded-full opacity-92 blur-[0.5px]" style={{boxShadow: '0 0 4px rgba(255,255,255,0.92)'}}></div>
              </div>
            </div>
          </div>
          {/* Światło między nagłówkiem a tekstem */}
          <div className="mt-4 mb-4 relative">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/15 via-white/5 to-transparent blur-sm opacity-60 pointer-events-none"></div>
          </div>
          <div className="mt-6 relative z-[1003]">
            <p
              className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] leading-relaxed relative z-[1003]"
              style={{
                textShadow: '0 1px 4px rgba(255, 255, 255, 0.3), 0 2px 8px rgba(255, 255, 255, 0.2), 0 0 12px rgba(255, 255, 255, 0.1)'
              }}
            >
              Pasja, tradycja i nowoczesność w hodowli gołębi pocztowych. Tworzymy historię polskiego
              sportu gołębiarskiego.
            </p>
            {/* Światło pod tekstem */}
            <div className="absolute inset-x-0 -bottom-2 h-8 opacity-40 pointer-events-none blur-sm"
                 style={{
                   background: 'radial-gradient(ellipse 50% 60% at center, rgba(255, 255, 255, 0.6) 20%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100%)',
                   zIndex: 999,
                 }} />
          </div>
        </div>

        {/* Główny gołąb - wyśrodkowany pod tekstem z oświetleniem scenicznym */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.9 }}
          className="flex justify-center relative z-[1003] mt-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pigeon.gif"
            alt="Gołębie pocztowe w locie - Pałka MTM"
            width="440"
            height="440"
            style={{
              width: '440px',
              height: '440px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.3))',
            }}
          />
        </motion.div>

      </div>
    </section>
  );
}
