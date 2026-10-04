import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { formatPhoneNumber } from '@/lib/whatsapp';

const OTP_SECRET = process.env.OTP_SECRET || 'turnly_otp_secret_key_83921';

export async function POST(req) {
  try {
    const { slug, phone, code, hash, expiresAt } = await req.json();

    if (!slug || !phone || !code || !hash || !expiresAt) {
      return NextResponse.json({
        success: false,
        error: 'Missing verification parameters.',
      }, { status: 400 });
    }

    // Check expiration (5 min)
    if (Date.now() > Number(expiresAt)) {
      return NextResponse.json({
        success: false,
        error: 'Verification code has expired. Please request a new code.',
      }, { status: 400 });
    }

    const cleanPhone = formatPhoneNumber(phone);
    const cleanCode = String(code).trim();

    // Verify HMAC
    const payload = `${slug}:${cleanPhone}:${cleanCode}:${expiresAt}`;
    const expectedHash = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');

    if (hash !== expectedHash) {
      return NextResponse.json({
        success: false,
        error: 'Incorrect 4-digit verification code. Please check your WhatsApp and try again.',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      phone: cleanPhone,
    });
  } catch (err) {
    console.error('[OTP Verify Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
