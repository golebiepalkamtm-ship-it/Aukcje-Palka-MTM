const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...existing code...

  // Podstawowa konfiguracja Next.js
  reactStrictMode: true,

  // Wyłącz problematyczne funkcje
  generateEtags: false,
  poweredByHeader: false,

  // Egzekwuj ESLint i TypeScript podczas build
  eslint: {
    ignoreDuringBuilds: false, // ✅ Włączone dla bezpieczeństwa
  },

  typescript: {
    ignoreBuildErrors: false, // ✅ Włączone dla bezpieczeństwa
  },

  // Remove problematic browser-only packages from transpilePackages
  // transpilePackages: ['jsdom', 'parse5', 'isomorphic-dompurify'],

  // Eksperymentalne funkcje
  experimental: {
    instrumentationHook: true,
  },

  // Ustawienia dla stabilności na Windows
  ...(process.env.NODE_ENV === 'development' && {
    // Stabilny build ID
    generateBuildId: () => 'dev-build-stable',
    // Ogranicz skanowanie do folderu projektu
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
    },
    // Wyłącz logowanie 404 dla znanych przypadków
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
    // Wycisz Watchpack errors - są ignorowane przez watchOptions
  }),

  // Konfiguracja Webpack zostanie zastosowana po opakowaniu przez wtyczki (PWA, Sentry)

  // Optymalizacja cache - wyłącz w dev
  ...(process.env.NODE_ENV === 'production' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),

  // Włącz kompresję tylko w production
  compress: process.env.NODE_ENV === 'production',

  // Redirects
  async redirects() {
    const redirects = [
      // Prometheus metrics redirect dla kompatybilności
      {
        source: '/metrics',
        destination: '/api/metrics',
        permanent: false,
      },
    ];

    // HTTPS redirect w produkcji
    if (process.env.NODE_ENV === 'production') {
      redirects.push({
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://:path*',
        permanent: true,
      });
    }

    return redirects;
  },

  // Headers bezpieczeństwa
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Optymalizacja obrazów - Next.js 15 format
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.buymeacoffee.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false, // Enable optimization in production
  },
};

module.exports = nextConfig;

// Injected content via Sentry wizard below

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts' },
    },
    {
      urlPattern: /^\/_next\/image\?/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'next-image' },
    },
    {
      urlPattern: /^\/api\/.*$/i,
      handler: 'NetworkFirst',
      method: 'GET',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
      },
    },
  ],
});

const { withSentryConfig } = require('@sentry/nextjs');

// Zastosuj modyfikacje webpack PO opakowaniu konfiguracji przez wtyczki
let finalConfig = withPWA(nextConfig);

// Zachowaj oryginalną funkcję webpack (jeśli istnieje), aby ją rozszerzyć
const originalWebpack = finalConfig.webpack;

finalConfig.webpack = (config, options) => {
  // Uruchom oryginalną konfigurację webpack z wtyczek
  if (typeof originalWebpack === 'function') {
    config = originalWebpack(config, options);
  }

  // --- POCZĄTEK NASZYCH MODYFIKACJI ---

  // 1. Ignoruj ostrzeżenia o krytycznych zależnościach (Sentry, Prisma, OpenTelemetry)
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    { module: /@prisma\/instrumentation/ },
    { module: /require-in-the-middle/ },
    { module: /@opentelemetry\/instrumentation/ },
    { message: /Critical dependency: the request of a dependency is an expression/ },
  ];

  // 2. Napraw błędy Watchpack na Windows przez ignorowanie plików systemowych
  if (options.dev) {
    config.watchOptions = {
      ...config.watchOptions,
      poll: process.env.WATCHPACK_POLLING === 'true' ? 1000 : false,
      ignored: [
        ...(config.watchOptions.ignored || []),
        /pagefile\.sys/,
        /swapfile\.sys/,
        /hiberfil\.sys/,
        /System Volume Information/,
        /\$RECYCLE\.BIN/,
      ],
    };
  }

  // 3. Zachowaj pozostałe, ważne części oryginalnej konfiguracji webpack
  if (!options.isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
  }

  config.externals = [...(config.externals || []), '@prisma/client', 'firebase-admin', 'redis'];

  // --- KONIEC NASZYCH MODYFIKACJI ---

  return config;
};

// Eksportuj finalną konfigurację, opakowaną w Sentry w środowisku produkcyjnym
if (process.env.NODE_ENV === 'production') {
  module.exports = withSentryConfig(finalConfig, {
    org: 'mtmpalka',
    project: 'javascript-nextjs',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    disableLogger: true,
    automaticVercelMonitors: true,
  });
} else {
  module.exports = finalConfig;
}
