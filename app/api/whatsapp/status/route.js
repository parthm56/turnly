import { NextResponse } from 'next/server';
import { getWhatsAppStatus } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
  }

  const result = await getWhatsAppStatus(slug);
  return NextResponse.json(result);
}
