import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: 'Missing phoneNumber or message' }, { status: 400 });
    }

    // Simulate sending SMS (replace with actual SMS service logic)
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);

    return NextResponse.json({ success: true, message: 'SMS sent successfully' });
  } catch (error) {
    console.error('Error in send-sms route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
