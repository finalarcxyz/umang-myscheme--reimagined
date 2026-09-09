import { NextResponse } from 'next/server';
import { resolveIntent } from '@/lib/intent/resolve';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, locale } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text field is required and must be a string' }, { status: 400 });
    }

    const intent = await resolveIntent(text, locale);
    return NextResponse.json(intent);
  } catch (error) {
    console.error('API Error in /api/resolve-intent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
