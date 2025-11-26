import type { Viewport } from 'next';
import './globals.css';
import './loading-animation.css';
import 'animate.css/animate.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ClientRootShell } from '@/components/layout/ClientRootShell';
import { metadata } from './metadata';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export { metadata };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="relative">
        <a
          href="#main"
          className="sr-only focus:not-sr-only absolute top-2 left-2 bg-yellow-500 text-black px-3 py-1 z-[9999] rounded-lg"
        >
          Pomiń nawigację (Skip to content)
        </a>
        <ClientRootShell enableLoadingOverlay={process.env.NEXT_PUBLIC_ENABLE_LOADING_OVERLAY !== 'false'}>
          {children}
        </ClientRootShell>
      </body>
    </html>
  );
}
