import { getFirebaseMessaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

export const VAPID_KEY = 'BHb0jrXzogelye8hIgFafrRTFZuIHp0du01Yt1LXaSbKR1USdY96LvytlWWrCYNp9RhdO8aZPAcyzLmPJgxyrz0';

export async function requestFcmToken() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Register Service Worker bypassing browser & CDN cache
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js?v=4', { updateViaCache: 'none' });
    if (registration) await registration.update().catch(() => {});
    await navigator.serviceWorker.ready;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    // Get FCM registration token for this device using VAPID key
    const fcmToken = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: VAPID_KEY,
    });

    return fcmToken;
  } catch (err) {
    console.warn('FCM registration skipped or failed:', err);
    return null;
  }
}

export async function listenForForegroundMessages(callback) {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}
