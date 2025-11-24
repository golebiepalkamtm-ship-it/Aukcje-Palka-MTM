const path = require('path');

const instrumentationAliases = {
  '@prisma/instrumentation': path.resolve(__dirname, 'lib/stubs/prisma-instrumentation-stub.ts'),
  'require-in-the-middle': path.resolve(__dirname, 'lib/stubs/require-in-the-middle-stub.ts'),
  '@opentelemetry/instrumentation': path.resolve(
    __dirname,
    'lib/stubs/opentelemetry-instrumentation-stub.ts'
  ),
};

const ASSET_CDN_BASE_URL = (process.env.NEXT_PUBLIC_ASSET_BASE_URL || '').replace(/\/$/, '');
const ASSET_PROXY_ROOTS = [
  '/uploads',
  '/champions',
  '/press',
  '/models',
  '/golden-pair',
  '/meetings%20with%20breeders',
];

const buildAssetRewrites = () =>
  ASSET_CDN_BASE_URL
    ? ASSET_PROXY_ROOTS.map(root => ({
        source: `${root}/:path*`,
        destination: `${ASSET_CDN_BASE_URL}${root}/:path*`,
      }))
    : [];

/** @type {import('next').NextConfig} */
const LONG_TERM_CACHE = 'public, max-age=31536000, immutable';
const EDGE_CACHE = 'public, s-maxage=31536000, max-age=31536000, immutable';

const nextConfig = {
  // Podstawowa konfiguracja Next.js
  reactStrictMode: true,

  poweredByHeader: false,

  // Egzekwuj ESLint i TypeScript podczas build
  // Dla Firebase App Hosting - wyłączone ESLint żeby build się udał
  eslint: {
    ignoreDuringBuilds: true, // Wyłączone dla Firebase App Hosting
  },

  typescript: {
    ignoreBuildErrors: false, // ✅ Włączone dla bezpieczeństwa
  },

  // Remove problematic browser-only packages from transpilePackages
  // transpilePackages: ['jsdom', 'parse5', 'isomorphic-dompurify'],

  // Output mode dla Firebase App Hosting
  output: 'standalone',

  experimental: {
    instrumentationHook: true,
    optimizePackageImports: [
      'lucide-react',
      'lodash-es',
      'date-fns',
      '@headlessui/react',
      '@radix-ui/react-popover',
      '@radix-ui/react-dialog',
    ],
    optimizeServerReact: true,
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '4mb',
    },
    reactCompiler: true,
    turbo: {
      rules: {
        '*.ts': { loaders: ['swc'] },
        '*.tsx': { loaders: ['swc'] },
      },
    },
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

    // HTTPS redirect w produkcji (TYLKO jeśli nie jesteśmy na Vercel - Vercel robi to automatycznie)
    // Vercel automatycznie obsługuje HTTPS, więc ten redirect może powodować problemy
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
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
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'strict-dynamic' 'unsafe-inline' https: http:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https://res.cloudinary.com https://cdn.pixabay.com https://cdn.buymeacoffee.com https://palkamtm.pl https://www.palkamtm.pl https://*.us-east4.hosted.app https://storage.googleapis.com https://firebasestorage.googleapis.com",
      "connect-src 'self' https://palkamtm.pl https://www.palkamtm.pl https://*.firebaseio.com https://firebasestorage.googleapis.com https://identitytoolkit.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=self, geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: LONG_TERM_CACHE },
          { key: 'CDN-Cache-Control', value: EDGE_CACHE },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: LONG_TERM_CACHE },
          { key: 'CDN-Cache-Control', value: EDGE_CACHE },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: LONG_TERM_CACHE },
          { key: 'CDN-Cache-Control', value: EDGE_CACHE },
        ],
      },
      {
        source: '/(.*\\.(?:js|css|ico|gif|svg|png|jpg|jpeg|webp|avif|mp4|woff|woff2|ttf|otf))',
        headers: [
          { key: 'Cache-Control', value: LONG_TERM_CACHE },
          { key: 'CDN-Cache-Control', value: EDGE_CACHE },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return buildAssetRewrites();
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
      // Produkcyjna domena palkamtm.pl
      {
        protocol: 'https',
        hostname: 'palkamtm.pl',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.palkamtm.pl',
        port: '',
        pathname: '/**',
      },
      // Firebase App Hosting
      {
        protocol: 'https',
        hostname: '*.us-east4.hosted.app',
        port: '',
        pathname: '/**',
      },
      // Firebase Storage
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
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
    unoptimized: true, // Wyłączone dla Firebase App Hosting (standalone mode)
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
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

// NIE używamy withSentryConfig - powoduje podwójną inicjalizację Sentry
// Używamy tylko manual setup przez instrumentation-client.ts
// const { withSentryConfig } = require('@sentry/nextjs');

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

  // 1. W development - zignoruj moduły instrumentation używając IgnorePlugin
  // To eliminuje webpack warnings poprzez całkowite pominięcie tych modułów
  if (options.isServer) {
    const webpack = require('webpack');

    config.plugins = [
      ...(config.plugins || []),
      new webpack.IgnorePlugin({
        resourceRegExp: /@prisma\/instrumentation/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /require-in-the-middle/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /@opentelemetry\/instrumentation/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /@sentry\/node\/.*\/integrations\/tracing\/(prisma|postgresjs)/,
      }),
    ];

    config.resolve.alias = {
      ...config.resolve.alias,
      ...instrumentationAliases,
    };
  }

  if (options.dev && options.isServer) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib/sentry-helpers': path.resolve(__dirname, 'lib/stubs/sentry-helpers-stub.ts'),
      '@sentry/nextjs': path.resolve(__dirname, 'lib/stubs/sentry-stub.ts'),
      '@sentry/node': path.resolve(__dirname, 'lib/stubs/sentry-stub.ts'),
    };
  }

  // 2. Konfiguracja dla React Three Fiber - musi być po stronie klienta
  if (!options.isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
  }

  // 3. Ignoruj wszystkie ostrzeżenia o critical dependencies (działa w dev i production)
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    // Wycisz wszystkie ostrzeżenia o critical dependencies z OpenTelemetry/Prisma instrumentation
    { module: /@prisma\/instrumentation/ },
    { module: /require-in-the-middle/ },
    { module: /@opentelemetry\/instrumentation/ },
    { module: /@sentry\/node/ },
    { message: /Critical dependency: the request of a dependency is an expression/ },
    { message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/ },
    // Wycisz wszystkie ostrzeżenia z node_modules (instrumentation)
    (warning) => {
      return (
        warning.module?.resource?.includes('node_modules') &&
        (warning.message?.includes('Critical dependency') ||
          warning.message?.includes('require function is used'))
      );
    },
  ];

  // 3. Wycisz ostrzeżenia w stats (dodatkowa warstwa tłumienia)
  config.stats = {
    ...config.stats,
    warningsFilter: [
      /Critical dependency/,
      /require function is used/,
      /@prisma\/instrumentation/,
      /require-in-the-middle/,
      /@opentelemetry\/instrumentation/,
      /@sentry\/node/,
    ],
  };

  // 4. Napraw błędy Watchpack na Windows przez ignorowanie plików systemowych
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

  // 5. Zachowaj pozostałe, ważne części oryginalnej konfiguracji webpack
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

// Eksportuj finalną konfigurację
// UWAGA: NIE używamy withSentryConfig - powoduje podwójną inicjalizację Sentry
// Używamy tylko manual setup przez instrumentation-client.ts i sentry.server.config.ts
// withSentryConfig automatycznie inicjalizuje Sentry po stronie klienta, co powoduje konflikt
// z instrumentation-client.ts, który też inicjalizuje Sentry
module.exports = finalConfig;

// UWAGA: Jeśli potrzebujesz automatycznego uploadu source maps do Sentry,
// możesz użyć Sentry CLI w CI/CD pipeline zamiast withSentryConfig
