import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { sessionInfo, code } = await req.json();

    if (!sessionInfo || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        {
          status: 400,
        }
      );
    }

    try {
      const auth = getAdminAuth();
      if (!auth) {
        return NextResponse.json(
          { error: 'Serwis tymczasowo niedostępny. Spróbuj ponownie później.' },
          { status: 503 }
        );
      }
      const result = await auth.verifySessionCookie(sessionInfo);
      return NextResponse.json({ success: true, uid: result.uid });
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      return NextResponse.json(
        { error: 'Invalid verification code' },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error('Error processing SMS verify request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
