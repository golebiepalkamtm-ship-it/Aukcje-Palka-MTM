import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFirebaseAuth } from '@/lib/firebase-auth'

export async function POST(request: NextRequest) {
  const authResult = await requireFirebaseAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { decodedToken } = authResult

  const body = await request.json().catch(() => ({}))
  const code: string | undefined = body.code
  if (!code) return NextResponse.json({ error: 'Brak kodu' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: decodedToken.uid },
    select: { phoneVerificationCode: true, phoneVerificationExpires: true, role: true },
  })
  if (!user) return NextResponse.json({ error: 'Użytkownik nie znaleziony' }, { status: 404 })

  if (!user.phoneVerificationCode || !user.phoneVerificationExpires)
    return NextResponse.json({ error: 'Brak aktywnego kodu' }, { status: 400 })

  if (new Date(user.phoneVerificationExpires).getTime() < Date.now())
    return NextResponse.json({ error: 'Kod wygasł' }, { status: 400 })

  if (user.phoneVerificationCode !== code)
    return NextResponse.json({ error: 'Nieprawidłowy kod' }, { status: 400 })

  await prisma.user.update({
    where: { id: decodedToken.uid },
    data: {
      isPhoneVerified: true,
      isProfileVerified: true,
      role: 'USER_FULL_VERIFIED',
      phoneVerificationCode: null,
      phoneVerificationExpires: null,
    },
  })

  const res = NextResponse.json({ success: true })
  // UX cookie: poziom 3 odblokowany
  res.cookies.set('level3-ok', '1', { path: '/', maxAge: 60 * 60 * 24, sameSite: 'lax' })
  return res
}


