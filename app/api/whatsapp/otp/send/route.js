import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { formatPhoneNumber, sendWhatsAppOtp, getWhatsAppStatus } from '@/lib/whatsapp';

const OTP_SECRET = process.env.OTP_SECRET || 'turnly_otp_secret_key_83921';

export async function POST(req) {
  try {
    const { slug, phone, businessName } = await req.json();

    if (!slug || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Business slug and phone number are required.',
      }, { status: 400 });
    }

    const cleanPhone = formatPhoneNumber(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.',
      }, { status: 400 });
    }

    // Check if the business's WhatsApp is connected and active
    const status = await getWhatsAppStatus(slug);
    if (status.state !== 'open') {
      return NextResponse.json({
        success: false,
        error: 'The business WhatsApp is currently offline. Please notify the counter staff.',
      }, { status: 400 });
    }

    // Generate secure 4-digit code (e.g. 1000 - 9999)
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Create HMAC signature: sha256(slug + cleanPhone + code + expiresAt, OTP_SECRET)
    const payload = `${slug}:${cleanPhone}:${code}:${expiresAt}`;
    const hash = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');

    // Send via WhatsApp
    const sendRes = await sendWhatsAppOtp({
      slug,
      phone: cleanPhone,
      code,
      businessName,
    });

    if (!sendRes.success) {
      return NextResponse.json({
        success: false,
        error: sendRes.error || 'Could not send WhatsApp code. Ensure this phone number is registered on WhatsApp.',
      }, { status: 400 });
    }

    // Mask phone for display: e.g. +91 98••••3210
    const maskedPhone = cleanPhone.length >= 10
      ? `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 4)}••••${cleanPhone.slice(-4)}`
      : cleanPhone;

    return NextResponse.json({
      success: true,
      hash,
      expiresAt,
      cleanPhone,
      maskedPhone,
    });
  } catch (err) {
    console.error('[OTP Send Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
