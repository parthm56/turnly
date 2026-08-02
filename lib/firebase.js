import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAEQg2HRWBPXOeCkdglTDbIAbuLg8MAjy8",
  authDomain: "turnly-ed288.firebaseapp.com",
  databaseURL: "https://turnly-ed288-default-rtdb.firebaseio.com",
  projectId: "turnly-ed288",
  storageBucket: "turnly-ed288.firebasestorage.app",
  messagingSenderId: "1029838170634",
  appId: "1:1029838170634:web:1dd683c9cf388110240df3",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);

export async function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
}
