import { NextRequest, NextResponse } from 'next/server';

// Trasy wymagające autoryzacji (TYLKO konkretne ścieżki, nie całe prefixy)
const protectedRoutes = ['/dashboard', '/admin', '/seller', '/profile', '/settings'];
// Podtrasy /auctions wymagające autoryzacji
const protectedAuctionRoutes = ['/auctions/create', '/auctions/bid', '/auctions/my-bids', '/auctions/my-auctions'];

// Wymogi poziomów dla części tras (proste routingi po prefixie)
const level2Routes = ['/profile'];
const level3Routes = ['/auctions/create', '/seller', '/auctions/bid'];

// Trasy wymagające uprawnień administratora
const adminRoutes = ['/admin'];

// Funkcja sprawdzająca czy request jest HTTPS
function isHttps(request: NextRequest): boolean {
  return (
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.headers.get('x-forwarded-protocol') === 'https' ||
    request.url.startsWith('https://')
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignoruj znane przypadki, które mogą generować 404 (nie loguj ich)
  const silentPaths = [
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/apple-touch-icon.png',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/site.webmanifest',
    '/metrics', // Prometheus może próbować
  ];

  // Nie loguj 404 dla znanych ścieżek
  if (silentPaths.some(path => pathname === path || pathname.startsWith(path))) {
    // Przekieruj /metrics do /api/metrics
    if (pathname === '/metrics') {
      return NextResponse.redirect(new URL('/api/metrics', request.url), 302);
    }
    // Dla innych - pozwól przejść dalej bez logowania
    return NextResponse.next();
  }

  // Wymuszenie HTTPS w produkcji (TYLKO jeśli nie jesteśmy na Vercel - Vercel robi to automatycznie)
  // Vercel automatycznie obsługuje HTTPS, więc ten redirect może powodować problemy
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL && !isHttps(request)) {
    const httpsUrl = `https://${request.headers.get('host')}${pathname}${request.url.split('?')[1] ? '?' + request.url.split('?')[1] : ''}`;
    return NextResponse.redirect(httpsUrl, 301);
  }

  // Sprawdź czy trasa wymaga autoryzacji
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Sprawdź czy to chroniona podtrasa /auctions
  const isProtectedAuctionRoute = protectedAuctionRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (!isProtectedRoute && !isProtectedAuctionRoute) {
    return NextResponse.next();
  }

  try {
    // Preferuj nagłówek Authorization: Bearer <token>, w przeciwnym razie użyj ciasteczka
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const cookieToken = request.cookies.get('firebase-auth-token')?.value;
    const bearerToken =
      authHeader && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.substring(7)
        : undefined;
    const token = bearerToken || cookieToken;

    if (!token) {
      const loginUrl = new URL('/auth/register', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // FIXED: Rzeczywista weryfikacja poziomów użytkownika z bazy danych zamiast cookies
    // Importujemy funkcje weryfikacji (dynamic import aby uniknąć problemów z Edge Runtime)
    const { verifyFirebaseToken } = await import('@/lib/firebase-auth');
    const { prisma } = await import('@/lib/prisma');
    
    // FIXED: Utwórz request z tokenem w nagłówku Authorization dla weryfikacji
    const requestWithAuth = new Request(request.url, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        authorization: `Bearer ${token}`,
      },
    });
    const nextRequestWithAuth = new NextRequest(requestWithAuth);
    
    const decodedToken = await verifyFirebaseToken(nextRequestWithAuth);
    if (!decodedToken) {
      const loginUrl = new URL('/auth/register', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Pobierz użytkownika z bazy danych
    const user = await prisma.user.findFirst({
      where: { firebaseUid: decodedToken.uid },
      select: { role: true },
    });

    if (!user) {
      const loginUrl = new URL('/auth/register', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // FIXED: Sprawdź poziom 2 (USER_EMAIL_VERIFIED) dla /profile
    if (level2Routes.some(p => pathname.startsWith(p))) {
      const hasLevel2Access =
        user.role === 'USER_EMAIL_VERIFIED' ||
        user.role === 'USER_FULL_VERIFIED' ||
        user.role === 'ADMIN';
      
      if (!hasLevel2Access) {
        const url = new URL('/auth/register', request.url);
        url.searchParams.set('needs', 'email');
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }

    // FIXED: Sprawdź poziom 3 (USER_FULL_VERIFIED) dla /auctions/create, /seller
    if (level3Routes.some(p => pathname.startsWith(p))) {
      const hasLevel3Access = user.role === 'USER_FULL_VERIFIED' || user.role === 'ADMIN';
      
      if (!hasLevel3Access) {
        const url = new URL('/profile', request.url);
        url.searchParams.set('needs', 'sms');
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Middleware authentication error:', err instanceof Error ? err.message : err);

    // W przypadku błędu, przekieruj do rejestracji
    const loginUrl = new URL('/auth/register', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'AuthenticationError');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
};
