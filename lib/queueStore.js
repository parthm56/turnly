/**
 * TURNLY — Firebase Realtime Database Queue Engine
 * All queue data lives in Firebase → works across ALL browsers and devices.
 * Only the customer's own ticket ID and staff session slug stay in localStorage.
 */
import { db } from './firebase';
import { ref, get, set, update, onValue, off } from 'firebase/database';
import {
  sanitizeText,
  sanitizeSlug,
  sanitizeEmail,
  isValidEmail,
  encodeEmailKey,
  generateSalt,
  hashPassword,
  evaluatePasswordStrength,
} from './security';

const TICKET_KEY = 'turnly_ticket_';

// ─── Business Registration ─────────────────────────────────────────
export async function registerBusiness(slugInput, nameInput, emailInput, passwordInput, categoryInput = '') {
  const slug = sanitizeSlug(slugInput);
  const name = sanitizeText(nameInput);
  const email = sanitizeEmail(emailInput);
  const category = sanitizeText(categoryInput);

  if (!slug || !name) {
    return { error: 'Business name and URL slug are required.' };
  }

  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid work email address.' };
  }

  const strength = evaluatePasswordStrength(passwordInput);
  if (strength.score < 4) {
    return { error: 'Password must be strong: at least 8 characters, with uppercase, lowercase, number, and special character.' };
  }

  // Check unique email in database index
  const emailKey = encodeEmailKey(email);
  const emailSnap = await get(ref(db, `emails/${emailKey}`));
  if (emailSnap.exists()) {
    return { error: 'This email is already registered. Please log in instead.' };
  }

  // Check unique slug in database
  const slugSnap = await get(ref(db, `businesses/${slug}`));
  if (slugSnap.exists()) {
    return { error: 'A business with this URL slug already exists. Choose a different slug.' };
  }

  // Cryptographically hash password with random salt
  const salt = generateSalt();
  const passwordHash = await hashPassword(passwordInput, salt);

  const businessData = {
    slug,
    name,
    email,
    category,
    passwordHash,
    passwordSalt: salt,
    queueState: 'OPEN',
    tokenCounter: 0,
    createdAt: Date.now(),
  };

  // Write business data and email index atomically
  await update(ref(db), {
    [`businesses/${slug}`]: businessData,
    [`emails/${emailKey}`]: slug,
  });

  return { slug, name, email, category };
}

// ─── Staff Login Authentication ────────────────────────────────────
export async function loginStaff(emailInput, passwordInput) {
  const email = sanitizeEmail(emailInput);
  if (!isValidEmail(email) || !passwordInput) {
    return { error: 'Invalid email or password.' };
  }

  const emailKey = encodeEmailKey(email);
  const emailSnap = await get(ref(db, `emails/${emailKey}`));
  if (!emailSnap.exists()) {
    return { error: 'Invalid email or password.' };
  }

  const slug = emailSnap.val();
  const businessSnap = await get(ref(db, `businesses/${slug}`));
  if (!businessSnap.exists()) {
    return { error: 'Invalid email or password.' };
  }

  const business = businessSnap.val();
  if (!business.passwordHash || !business.passwordSalt) {
    // Legacy account fallback check
    return { error: 'Account requires password reset. Please contact support.' };
  }

  const inputHash = await hashPassword(passwordInput, business.passwordSalt);
  if (inputHash !== business.passwordHash) {
    return { error: 'Invalid email or password.' };
  }

  return {
    slug: business.slug,
    name: business.name,
    email: business.email,
    category: business.category,
  };
}

// ─── Read Business (one-time) ──────────────────────────────────────
export async function getBusiness(slug) {
  const snap = await get(ref(db, `businesses/${slug}`));
  if (!snap.exists()) return null;
  return normalise(snap.val());
}

// ─── Real-time Subscription ────────────────────────────────────────
export function subscribeToBusiness(slug, callback) {
  if (!slug) return () => {};
  const r = ref(db, `businesses/${slug}`);
  const handler = (snap) => {
    callback(snap.exists() ? normalise(snap.val()) : null);
  };
  onValue(r, handler);
  return () => off(r, 'value', handler);
}

// Firebase stores tokens as an object {id: tokenObj}; normalise to array
function normalise(data) {
  if (!data) return null;
  return {
    ...data,
    tokens: data.tokens ? Object.values(data.tokens) : [],
  };
}

// ─── Queue State (OPEN / PAUSED / ENDED) ──────────────────────────
export async function setQueueState(slug, queueState) {
  const updates = { [`businesses/${slug}/queueState`]: queueState };
  if (queueState === 'ENDED') {
    updates[`businesses/${slug}/tokens`] = null;
    updates[`businesses/${slug}/tokenCounter`] = 0;
  }
  await update(ref(db), updates);
}

// ─── Customer: Join Queue ──────────────────────────────────────────
export async function joinQueue(slug, customerName, phone, partySize) {
  const snap = await get(ref(db, `businesses/${slug}`));
  if (!snap.exists()) return { error: 'Business not found' };
  const business = snap.val();
  if (business.queueState !== 'OPEN') return { error: 'QUEUE_CLOSED' };

  const newCounter = (business.tokenCounter || 0) + 1;
  const number = String(newCounter).padStart(3, '0');
  const id = `tk_${Date.now()}`;

  const cleanName = sanitizeText(customerName || '').toUpperCase();
  const cleanPhone = sanitizeText(phone || '');

  const token = {
    id,
    number,
    customerName: cleanName,
    phone: cleanPhone,
    partySize: parseInt(partySize) || 1,
    status: 'WAITING',
    createdAt: Date.now(),
    calledAt: null,
  };

  await update(ref(db), {
    [`businesses/${slug}/tokenCounter`]: newCounter,
    [`businesses/${slug}/tokens/${id}`]: token,
  });

  saveTicketId(slug, id);
  return token;
}

// ─── Staff: Call Customer (by token ID or next in queue) ───────────
export async function callCustomer(slug, targetTokenId = null) {
  const snap = await get(ref(db, `businesses/${slug}/tokens`));
  if (!snap.exists()) return null;

  const tokens = snap.val();
  let tokenId = targetTokenId;

  if (!tokenId) {
    const entry = Object.entries(tokens).find(([, t]) => t.status === 'WAITING');
    if (!entry) return null;
    tokenId = entry[0];
  }

  const businessSnap = await get(ref(db, `businesses/${slug}`));
  const businessObj = businessSnap.exists() ? businessSnap.val() : {};
  const businessName = businessObj.name || 'Your Queue';

  // Fetch LATEST token snapshot directly from DB to get fresh fcmToken
  const tokenSnap = await get(ref(db, `businesses/${slug}/tokens/${tokenId}`));
  if (!tokenSnap.exists()) return null;
  const latestToken = tokenSnap.val();

  await update(ref(db, `businesses/${slug}/tokens/${tokenId}`), {
    status: 'CALLED',
    calledAt: Date.now(),
  });

  // Send background push via proven /api/test-push GET pipeline (same as manual test that works on locked screen)
  if (latestToken?.fcmToken) {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://turnly-plum.vercel.app';
      const businessLogo = businessObj.logoUrl ? businessObj.logoUrl : `${origin}/logo.png`;
      const pushTitle = encodeURIComponent(`${businessName} — Your Turn!`);
      const pushBody = encodeURIComponent(`Token #${latestToken.number} — Please proceed to the counter now.`);
      const pushIcon = encodeURIComponent(businessLogo);
      const pushUrl = `${origin}/api/test-push?token=${encodeURIComponent(latestToken.fcmToken)}&title=${pushTitle}&body=${pushBody}&icon=${pushIcon}`;
      const res = await fetch(pushUrl);
      const data = await res.json();
      if (data.success) {
        console.log('[Turnly] Push sent successfully:', data.messageId);
      } else {
        console.error('[Turnly] Push failed:', data.error, data.code);
      }
    } catch (e) {
      console.error('[Turnly] Push fetch error:', e);
    }
  }

  return true;
}

export const callNext = callCustomer;

// ─── Staff: Update Token Status ────────────────────────────────────
export async function updateStatus(slug, tokenId, newStatus) {
  await update(ref(db, `businesses/${slug}/tokens/${tokenId}`), { status: newStatus });
}

// ─── Customer: Cancel / Quit Queue ────────────────────────────────
export async function cancelToken(slug, tokenId) {
  await update(ref(db, `businesses/${slug}/tokens/${tokenId}`), { status: 'CANCELLED' });
  clearTicketId(slug);
}

// ─── Customer: Save FCM Push Device Token ──────────────────────────
export async function saveFcmToken(slug, tokenId, fcmToken) {
  if (!slug || !tokenId || !fcmToken) return;
  await update(ref(db, `businesses/${slug}/tokens/${tokenId}`), { fcmToken });
}

// ─── Customer Ticket Persistence (localStorage) ───────────────────
export function getTicketId(slug) {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TICKET_KEY + slug);
}

export function saveTicketId(slug, id) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TICKET_KEY + slug, id);
}

export function clearTicketId(slug) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TICKET_KEY + slug);
}

// ─── Position helper (works on tokens array) ──────────────────────
export function getPosition(tokens, tokenId) {
  const waiting = tokens.filter(t => t.status === 'WAITING');
  const idx = waiting.findIndex(t => t.id === tokenId);
  return { ahead: idx < 0 ? 0 : idx, total: waiting.length };
}

// ─── Staff Account Management Operations ───────────────────────────

/**
 * 1. Update Business Profile (Name & Category)
 */
export async function updateBusinessProfile(slug, nameInput, categoryInput = '') {
  const name = sanitizeText(nameInput);
  const category = sanitizeText(categoryInput);

  if (!name) {
    return { error: 'Business name cannot be empty.' };
  }

  await update(ref(db, `businesses/${slug}`), { name, category });
  return { success: true, name, category };
}

/**
 * 2. Change Staff Work Email (with strict uniqueness check)
 */
export async function updateStaffEmail(slug, currentPassword, newEmailInput) {
  const newEmail = sanitizeEmail(newEmailInput);

  if (!isValidEmail(newEmail)) {
    return { error: 'Please enter a valid work email address.' };
  }

  const snap = await get(ref(db, `businesses/${slug}`));
  if (!snap.exists()) {
    return { error: 'Business account not found.' };
  }

  const business = snap.val();

  // Verify current password
  const verifyHash = await hashPassword(currentPassword, business.passwordSalt);
  if (verifyHash !== business.passwordHash) {
    return { error: 'Current password is incorrect.' };
  }

  // If email is unchanged
  if (business.email && sanitizeEmail(business.email) === newEmail) {
    return { success: true, message: 'Email unchanged.' };
  }

  // Check if new email is occupied by another user
  const newEmailKey = encodeEmailKey(newEmail);
  const existingSnap = await get(ref(db, `emails/${newEmailKey}`));
  if (existingSnap.exists() && existingSnap.val() !== slug) {
    return { error: 'This email address is already in use by another account. Please use a different email address.' };
  }

  const updates = {};

  // Delete old email index
  if (business.email) {
    const oldEmailKey = encodeEmailKey(business.email);
    updates[`emails/${oldEmailKey}`] = null;
  }

  // Set new email index and update business email
  updates[`emails/${newEmailKey}`] = slug;
  updates[`businesses/${slug}/email`] = newEmail;

  await update(ref(db), updates);

  if (typeof window !== 'undefined') {
    localStorage.setItem('turnly_staff_email', newEmail);
  }

  return { success: true, email: newEmail };
}

/**
 * 3. Change Staff Password (with strong password evaluation)
 */
export async function updateStaffPassword(slug, currentPassword, newPasswordInput) {
  const strength = evaluatePasswordStrength(newPasswordInput);
  if (strength.score < 4) {
    return { error: 'New password must be strong: at least 8 characters, with uppercase, lowercase, number, and special character.' };
  }

  const snap = await get(ref(db, `businesses/${slug}`));
  if (!snap.exists()) {
    return { error: 'Business account not found.' };
  }

  const business = snap.val();

  // Verify current password
  const verifyHash = await hashPassword(currentPassword, business.passwordSalt);
  if (verifyHash !== business.passwordHash) {
    return { error: 'Current password is incorrect.' };
  }

  // Generate new salt & hash
  const newSalt = generateSalt();
  const newHash = await hashPassword(newPasswordInput, newSalt);

  await update(ref(db, `businesses/${slug}`), {
    passwordHash: newHash,
    passwordSalt: newSalt,
  });

  return { success: true };
}

/**
 * 4. Permanent Account Deletion
 */
export async function deleteBusinessAccount(slug, currentPassword) {
  const snap = await get(ref(db, `businesses/${slug}`));
  if (!snap.exists()) {
    return { error: 'Business account not found.' };
  }

  const business = snap.val();

  // Verify current password
  const verifyHash = await hashPassword(currentPassword, business.passwordSalt);
  if (verifyHash !== business.passwordHash) {
    return { error: 'Current password is incorrect.' };
  }

  const updates = {};

  // Delete email index
  if (business.email) {
    const emailKey = encodeEmailKey(business.email);
    updates[`emails/${emailKey}`] = null;
  }

  // Delete business node
  updates[`businesses/${slug}`] = null;

  await update(ref(db), updates);

  if (typeof window !== 'undefined') {
    localStorage.removeItem('turnly_staff_slug');
    localStorage.removeItem('turnly_staff_email');
  }

  return { success: true };
}
