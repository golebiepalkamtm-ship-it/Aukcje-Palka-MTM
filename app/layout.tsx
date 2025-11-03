// Sentry configs are loaded conditionally in their own files
// Import them here only in production to avoid webpack warnings in dev
const isProduction = process.env.NODE_ENV === 'production'
if (isProduction) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@/sentry.client.config')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@/sentry.server.config')
}
import ClientProviders from '@/components/providers/ClientProviders';
import { ToastProvider } from '@/components/providers/ToastProvider';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
  ),
  title: 'Palka Auctions: Mistrzowie Sprintu Gołębie Pocztowe…',
  description: 'Ekskluzywna platforma aukcyjna dla hodowcow golebi pocztowych',
  authors: [
    {
      name: 'Palka MTM - Mistrzowie Sprintu',
      url: 'https://palka.mtm.pl',
    },
  ],
  icons: {
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Palka MTM - Mistrzowie Sprintu',
    description: 'Ekskluzywna platforma aukcyjna dla hodowcow golebi pocztowych',
    type: 'website',
    locale: 'pl_PL',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Palka MTM - Mistrzowie Sprintu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Palka MTM - Mistrzowie Sprintu',
    description: 'Ekskluzywna platforma aukcyjna dla hodowcow golebi pocztowych',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* apple-touch-icon is also defined in metadata.icons.apple - Next.js will generate it automatically */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          precedence="default"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-900 text-white relative bg-cover bg-top bg-no-repeat bg-fixed pigeon-lofts-background">
        <a
          href="#main"
          className="sr-only focus:not-sr-only absolute top-2 left-2 bg-yellow-500 text-black px-3 py-1 z-[9999] rounded-lg"
        >
          Pomiń nawigację (Skip to content)
        </a>
        <ClientProviders>
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <ToastProvider />
        </ClientProviders>
      </body>
    </html>
  );
}
