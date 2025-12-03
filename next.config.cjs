const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateEtags: false,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  ...(process.platform === 'win32' || process.env.WATCHPACK_POLLING === 'true') && {
    watchOptions: {
      poll: 100,
      aggregateTimeout: 0,
      ...(process.env.WATCHPACK_POLLING === 'false' && { poll: false }),
    },
  },

  experimental: process.env.NODE_ENV === 'production' ? { instrumentationHook: true } : {},

  ...(process.env.NODE_ENV === 'development' && {
    generateBuildId: () => 'dev-build-stable',
    onDemandEntries: { maxInactiveAge: 60 * 1000, pagesBufferLength: 5 },
    logging: { fetches: { fullUrl: true } },
  }),

  ...(process.env.NODE_ENV === 'production' && {
    onDemandEntries: { maxInactiveAge: 25 * 1000, pagesBufferLength: 2 },
  }),

  compress: process.env.NODE_ENV === 'production',

  async redirects() {
    const redirects = [
      { source: '/metrics', destination: '/api/metrics', permanent: false },
    ];
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      redirects.push({
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://:path*',
        permanent: true,
      });
    }
    return redirects;
  },

  async headers() {
    const headers = [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
    if (process.env.NODE_ENV === 'development') {
      headers.push({
        source: '/(.*)',
        headers: [{ key: 'Strict-Transport-Security', value: 'max-age=0' }],
      });
    }
    return headers;
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/m-t-m-62972.firebasestorage.app/**' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.firebasestorage.app', pathname: '/**' },
      { protocol: 'https', hostname: 'palkamtm.pl', pathname: '/**' },
      { protocol: 'https', hostname: 'www.palkamtm.pl', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.pixabay.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.buymeacoffee.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.us-east4.hosted.app', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      // Dodatkowe wzorce dla Firebase Storage
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/*' },
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/*/*' },
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/*/*/*' },
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/*/*/*/*' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
};

module.exports = nextConfig;

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

let finalConfig = withPWA(nextConfig);

finalConfig.webpack = (config, options) => {
  const webpack = require('webpack');

  if (options.dev) {
    config.plugins = [
      ...(config.plugins || []),
      new webpack.IgnorePlugin({ resourceRegExp: /@prisma\/instrumentation/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /require-in-the-middle/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /@opentelemetry\/instrumentation/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /@sentry\/node\/.*\/integrations\/tracing\/(prisma|postgresjs)/ }),
    ];

    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib/sentry-helpers': path.resolve(__dirname, 'lib/stubs/sentry-helpers-stub.ts'),
      '@sentry/nextjs': path.resolve(__dirname, 'lib/stubs/sentry-stub.ts'),
      '@sentry/node': path.resolve(__dirname, 'lib/stubs/sentry-stub.ts'),
      '@prisma/instrumentation': path.resolve(__dirname, 'lib/stubs/prisma-instrumentation-stub.ts'),
      'require-in-the-middle': path.resolve(__dirname, 'lib/stubs/require-in-the-middle-stub.ts'),
      '@opentelemetry/instrumentation': path.resolve(__dirname, 'lib/stubs/opentelemetry-instrumentation-stub.ts'),
    };
  }

  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    { module: /@prisma\/instrumentation/ },
    { module: /require-in-the-middle/ },
    { module: /@opentelemetry\/instrumentation/ },
    { module: /@sentry\/node/ },
    { message: /Critical dependency/ },
    (warning) => warning.module?.resource?.includes('node_modules') &&
      (warning.message?.includes('Critical dependency') || warning.message?.includes('require function is used')),
  ];

  config.plugins = [
    ...(config.plugins || []),
    new webpack.IgnorePlugin({ resourceRegExp: /require-in-the-middle/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /@opentelemetry\/instrumentation/ }),
  ];

  config.stats = {
    ...config.stats,
    warningsFilter: [/Critical dependency/, /require function is used/, /@prisma\/instrumentation/, /require-in-the-middle/, /@opentelemetry\/instrumentation/, /@sentry\/node/],
  };

  if (!options.isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
  }

  config.externals = [...(config.externals || []), '@prisma/client', 'firebase-admin', 'redis'];

  return config;
};

module.exports = finalConfig;
