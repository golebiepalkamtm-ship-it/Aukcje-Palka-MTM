import { NextResponse } from 'next/server';

/**
 * FIXED: Security headers zgodnie ze specyfikacją
 * X-Frame-Options: DENY, X-Content-Type-Options: nosniff
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=()');
  return response;
}

/**
 * Helper do tworzenia odpowiedzi z security headers
 */
export function createSecureResponse(
  data: unknown,
  status: number = 200,
  headers: Record<string, string> = {}
): NextResponse {
  const response = NextResponse.json(data, { status, headers });
  return addSecurityHeaders(response);
}

