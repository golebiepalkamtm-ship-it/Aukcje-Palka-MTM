'use client';

export function HeroSection() {
  return (
    <section className="text-center pt-64 flex flex-col min-h-[150vh]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col justify-center">
        {/* Tytuł - jednolita animacja fade-in-fwd */}
        <div className="fade-in-fwd" style={{ animationDelay: '0s' }}>
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-2">
            <div className="block">
              {'Pałka MTM'.split('').map((letter, index) => (
                <span key={index} className="hero-title-nav-style inline-block">
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
            </div>
            <div className="block mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              {'Mistrzowie Sprintu'.split('').map((letter, index) => (
                <span key={index} className="hero-title-nav-style inline-block">
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
            </div>
          </h1>
        </div>

        {/* Główny gołąb - jednolita animacja fade-in-fwd */}
        <div className="fade-in-fwd flex justify-center relative z-20 mt-0" style={{ animationDelay: '0s' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pigeon.gif"
            alt="Gołębie pocztowe w locie - Pałka MTM"
            width="600"
            height="600"
            style={{
              width: '600px',
              height: '600px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.3))',
            }}
          />
        </div>
      </div>
    </section>
  );
}
