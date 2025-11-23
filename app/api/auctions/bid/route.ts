export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DEPRECATED: Ta route jest przestarzała. Używaj /api/auctions/[id]/bids zamiast tego.
 * 
 * Ta route jest utrzymywana dla wstecznej kompatybilności, ale wszystkie nowe implementacje
 * powinny używać POST /api/auctions/{auctionId}/bids z payload'em { amount: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auctionId, amount } = body;

    if (!auctionId || !amount) {
      return NextResponse.json(
        { error: 'Auction ID i kwota są wymagane' },
        { status: 400 }
      );
    }

    // Przekieruj do nowego route'u
    const newUrl = new URL(`/api/auctions/${auctionId}/bids`, request.url);
    const forwardedRequest = new NextRequest(newUrl, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ amount }),
    });

    // Użyj fetch aby przesłać żądanie do nowego route'u
    const response = await fetch(forwardedRequest);
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}
