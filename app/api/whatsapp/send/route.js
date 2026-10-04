import { NextResponse } from 'next/server';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { slug, phone, customerName, tokenNumber, businessName } = body;

    if (!slug || !phone) {
      return NextResponse.json({ error: 'Missing slug or phone parameter' }, { status: 400 });
    }

    const result = await sendWhatsAppNotification({
      slug,
      phone,
      customerName,
      tokenNumber,
      businessName,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

