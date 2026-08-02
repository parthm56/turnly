// Tenant Business Session Store

const SESSION_KEY = 'turnly_active_merchant_session';

export function getActiveMerchantSession() {
  if (typeof window === 'undefined') return { slug: 'apex-dental', name: 'APEX DENTAL CLINIC' };
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      const defaultSession = { slug: 'apex-dental', name: 'APEX DENTAL CLINIC' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(defaultSession));
      return defaultSession;
    }
    return JSON.parse(raw);
  } catch (e) {
    return { slug: 'apex-dental', name: 'APEX DENTAL CLINIC' };
  }
}

export function setActiveMerchantSession(businessData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(businessData));
  } catch (e) {
    console.error('Failed to set merchant session:', e);
  }
}

export function registerNewBusiness(businessName, category = 'General') {
  if (typeof window === 'undefined') return { slug: 'apex-dental', name: businessName };

  const { getStoredState, saveStoredState } = require('./queueStore');
  const state = getStoredState();

  const slug = businessName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');

  if (!state.businesses[slug]) {
    state.businesses[slug] = {
      slug,
      name: businessName.trim().toUpperCase(),
      category,
      welcomeMessage: `Welcome to ${businessName}! Please join our virtual queue.`,
      logoText: businessName.substring(0, 6).toUpperCase(),
      themeAccent: 'cyan',
      operatingStatus: 'OPEN',
      queues: {
        'general-queue': {
          id: 'general-queue',
          name: 'MAIN RECEPTION QUEUE',
          code: 'A',
          avgServeTimeMinutes: 5,
          currentTokenNumber: 0,
          counters: [
            { id: 'c1', name: 'COUNTER 01', staff: 'OPERATOR 1', activeToken: null }
          ],
          tokens: []
        }
      }
    };
    saveStoredState(state);
  }

  const session = { slug, name: businessName.trim().toUpperCase() };
  setActiveMerchantSession(session);
  return session;
}

export function registerTenant(businessName, category = 'General', email = '') {
  return registerNewBusiness(businessName, category);
}
