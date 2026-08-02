'use client';
import { useEffect, useState } from 'react';

export default function TestPushPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog(prev => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);

  useEffect(() => {
    // Load stored token
    const stored = localStorage.getItem('turnly_fcm_token');
    if (stored) { setToken(stored); addLog('Found stored FCM token in localStorage'); }
  }, []);

  const registerSW = async () => {
    try {
      addLog('Registering Service Worker...');
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js?v=4', { updateViaCache: 'none' });
      await reg.update();
      await navigator.serviceWorker.ready;
      addLog('✅ Service Worker registered & active');
      return reg;
    } catch (e) {
      addLog('❌ SW registration failed: ' + e.message);
      return null;
    }
  };

  const getToken = async () => {
    setStatus('Getting FCM token...');
    addLog('Requesting notification permission...');
    const perm = await Notification.requestPermission();
    addLog(`Permission: ${perm}`);
    if (perm !== 'granted') { addLog('❌ Permission denied'); return; }

    const reg = await registerSW();
    if (!reg) return;

    try {
      addLog('Importing Firebase Messaging...');
      const { initializeApp, getApps } = await import('firebase/app');
      const { getMessaging, getToken: getFCMToken } = await import('firebase/messaging');

      const firebaseConfig = {
        apiKey: "AIzaSyAEQg2HRWBPXOeCkdglTDbIAbuLg8MAjy8",
        authDomain: "turnly-ed288.firebaseapp.com",
        projectId: "turnly-ed288",
        storageBucket: "turnly-ed288.firebasestorage.app",
        messagingSenderId: "1029838170634",
        appId: "1:1029838170634:web:1dd683c9cf388110240df3",
      };
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const messaging = getMessaging(app);
      addLog('Getting FCM token...');
      const fcmToken = await getFCMToken(messaging, {
        serviceWorkerRegistration: reg,
        vapidKey: 'BHb0jrXzogelye8hIgFafrRTFZuIHp0du01Yt1LXaSbKR1USdY96LvytlWWrCYNp9RhdO8aZPAcyzLmPJgxyrz0',
      });
      if (fcmToken) {
        setToken(fcmToken);
        localStorage.setItem('turnly_fcm_token', fcmToken);
        addLog('✅ FCM token obtained: ' + fcmToken.substring(0, 30) + '...');
        setStatus('Token ready! Now lock your screen and click "Send Test Push"');
      } else {
        addLog('❌ No FCM token returned');
      }
    } catch (e) {
      addLog('❌ FCM error: ' + e.message);
    }
  };

  const sendTest = async () => {
    if (!token) { addLog('No token — get token first'); return; }
    setStatus('Sending test push via /api/test-push...');
    addLog('Calling /api/test-push with token...');
    try {
      const res = await fetch(`/api/test-push?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (data.success) {
        addLog('✅ Firebase Admin SDK sent push! Message ID: ' + data.messageId);
        setStatus('Push sent! NOW LOCK YOUR SCREEN — did notification arrive?');
      } else {
        addLog('❌ Push failed: ' + JSON.stringify(data));
        setStatus('Push failed — check error log below');
      }
    } catch (e) {
      addLog('❌ Fetch error: ' + e.message);
    }
  };

  return (
    <div style={{ fontFamily: 'monospace', padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>🔔 Push Notification Diagnostics</h1>
      <p style={{ color: '#555' }}>{status || 'Follow steps below to diagnose push'}</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={getToken}
          style={{ background: '#1a5c3a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          Step 1: Get FCM Token
        </button>
        <button onClick={sendTest}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          Step 2: Send Test Push
        </button>
      </div>

      {token && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, marginBottom: 16, wordBreak: 'break-all', fontSize: 11 }}>
          <strong>FCM Token:</strong><br />{token}
        </div>
      )}

      <div style={{ background: '#111', color: '#0f0', borderRadius: 8, padding: 16, fontSize: 12, minHeight: 200, maxHeight: 400, overflowY: 'auto' }}>
        {log.length === 0 ? <span style={{ color: '#666' }}>Logs will appear here...</span> : log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
