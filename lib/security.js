/**
 * TURNLY — Security & Input Protection Utility
 * Provides XSS sanitization, injection prevention, password hashing, and email validation.
 */

// ─── XSS Protection: HTML Entity Encoding ─────────────────────────
export function sanitizeText(input) {
  if (typeof input !== 'string') return input ?? '';
  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ─── Injection Protection: Slug & Key Normalization ──────────────
export function sanitizeSlug(input) {
  if (typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Email Validation & Firebase Key Encoding ─────────────────────
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Firebase keys cannot contain '.', '#', '$', '[', or ']'
 */
export function encodeEmailKey(email) {
  const clean = sanitizeEmail(email);
  return clean.replace(/\./g, '_dot_').replace(/@/g, '_at_');
}

// ─── Password Cryptographic Hashing ───────────────────────────────
export function generateSalt() {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for SSR/Node environment
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function hashPassword(password, salt) {
  const text = `${salt}:${password}`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Simple fallback hash algorithm if SubtleCrypto is unavailable
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16);
}

// ─── Strong Password Rule Evaluator ───────────────────────────────
export function evaluatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: 'Empty',
      color: '#cbd5e1',
      checks: { length: false, uppercase: false, lowercase: false, number: false, special: false },
    };
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const passedCount = Object.values(checks).filter(Boolean).length;

  let label = 'Weak';
  let color = '#ef4444'; // Red

  if (passedCount === 5) {
    label = 'Strong';
    color = '#10b981'; // Green
  } else if (passedCount >= 3) {
    label = 'Medium';
    color = '#f59e0b'; // Amber
  }

  return { score: passedCount, label, color, checks };
}
