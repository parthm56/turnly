// Turnly WhatsApp Integration via Evolution API (Baileys Engine)

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'https://turnly-evolution-api.onrender.com';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || 'turnly_evolution_secret_98234';

function getHeaders() {
  return {
    'apikey': EVOLUTION_KEY,
    'Content-Type': 'application/json',
  };
}

/**
 * Format phone numbers to international standard (E.164 without plus)
 * Handles inputs like "+91 98765-43210", "9876543210", etc.
 */
export function formatPhoneNumber(phone, defaultCountryCode = '91') {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;

  // If 10 digits provided, prefix with default country code (e.g. 91 for India)
  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }
  return digits;
}

/**
 * Check the connection status of a tenant's WhatsApp instance
 * Returns: { state: 'open' | 'connecting' | 'close' | 'not_found' }
 */
export async function getWhatsAppStatus(slug) {
  try {
    const res = await fetch(`${EVOLUTION_URL}/instance/connectionState/${slug}`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store',
    });

    if (res.status === 404) {
      return { state: 'not_found' };
    }

    if (!res.ok) {
      return { state: 'not_found', error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    // Evolution API returns: { instance: { state: 'open' | 'close' | 'connecting' } }
    const state = data?.instance?.state || data?.state || 'close';
    return { state };
  } catch (err) {
    console.error(`[WhatsApp] Status check failed for ${slug}:`, err.message);
    return { state: 'error', error: err.message };
  }
}

/**
 * Create or connect a WhatsApp instance for a tenant and return QR code
 */
export async function connectWhatsAppInstance(slug) {
  try {
    // 1. First check if instance already exists
    const status = await getWhatsAppStatus(slug);

    let qrcode = null;
    let pairingCode = null;

    if (status.state === 'not_found') {
      // 2. Create the instance with QR code enabled
      const createRes = await fetch(`${EVOLUTION_URL}/instance/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          instanceName: slug,
          token: slug,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });

      if (createRes.ok) {
        try {
          const createData = await createRes.json();
          qrcode = createData?.qrcode?.base64 || createData?.base64 || null;
          pairingCode = createData?.qrcode?.pairingCode || null;
        } catch (_) {}
      }
    }

    // 3. If qrcode is not yet in initial response, poll /instance/connect/{slug}
    // Baileys takes 1-3 seconds to negotiate handshake and emit QR code
    for (let attempt = 0; attempt < 5 && !qrcode; attempt++) {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      try {
        const connectRes = await fetch(`${EVOLUTION_URL}/instance/connect/${slug}`, {
          method: 'GET',
          headers: getHeaders(),
          cache: 'no-store',
        });

        if (connectRes.ok) {
          const connectData = await connectRes.json();
          qrcode = connectData?.base64 || connectData?.qrcode?.base64 || null;
          pairingCode = connectData?.pairingCode || connectData?.qrcode?.pairingCode || null;
        }
      } catch (err) {
        console.warn(`[WhatsApp] Connect attempt ${attempt + 1} failed:`, err.message);
      }
    }

    // Check latest state
    const currentStatus = await getWhatsAppStatus(slug);

    return {
      success: true,
      state: currentStatus.state || 'connecting',
      qrcode,
      pairingCode,
    };
  } catch (err) {
    console.error(`[WhatsApp] Connect failed for ${slug}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Disconnect / Logout a tenant's WhatsApp instance
 */
export async function disconnectWhatsAppInstance(slug) {
  try {
    const res = await fetch(`${EVOLUTION_URL}/instance/logout/${slug}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.error(`[WhatsApp] Disconnect failed for ${slug}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Send a WhatsApp text notification to a customer
 */
export async function sendWhatsAppNotification({ slug, phone, customerName, tokenNumber, businessName }) {
  const cleanPhone = formatPhoneNumber(phone);
  if (!cleanPhone) {
    return { success: false, error: 'Invalid phone number' };
  }

  const message = `🔔 *It's your turn!*\n\nHello *${customerName || 'Customer'}*,\nYour ticket *#${tokenNumber}* has been called at *${businessName || 'the counter'}*.\n\nPlease proceed to the counter now. Thank you!`;

  try {
    const res = await fetch(`${EVOLUTION_URL}/message/sendText/${slug}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        number: cleanPhone,
        text: message,
        options: {
          delay: 1200,
          presence: 'composing',
        },
      }),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data?.response?.message || data?.message || 'Send failed' };
    }
  } catch (err) {
    console.error(`[WhatsApp] Message dispatch error:`, err);
    return { success: false, error: err.message };
  }
}

