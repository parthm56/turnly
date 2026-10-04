'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessData } from '@/hooks/useHydratedStore';
import { getTicketId, joinQueue, saveFcmToken } from '@/lib/queueStore';
import { requestFcmToken, requestNotificationPermission } from '@/lib/pushNotifications';
import AdBanner from '@/components/AdBanner';

export const dynamic = 'force-dynamic';

export default function CustomerPortal({ params }) {
  const router = useRouter();
  const slug = params?.businessSlug;
  const { business, loading } = useBusinessData(slug);

  const [name, setName]           = useState('');
  const [phone, setPhone]         = useState('');
  const [partySize, setPartySize] = useState(1);
  const [error, setError]         = useState('');
  const [joining, setJoining]     = useState(false);
  const [checked, setChecked]     = useState(false);

  // Notification state: 'default' | 'granted' | 'denied' | 'unsupported'
  const [notifState, setNotifState] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('Notification' in window)) {
        setNotifState('unsupported');
      } else {
        setNotifState(Notification.permission);
      }
    }
  }, []);

  // Auto-redirect if customer already has an active ticket
  useEffect(() => {
    if (loading || !business || checked) return;
    setChecked(true);
    const id = getTicketId(slug);
    if (id) {
      const tok = business.tokens?.find(t => t.id === id);
      if (tok && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(tok.status)) {
        router.replace(`/b/${slug}/ticket/${id}`);
      }
    }
  }, [loading, business, slug, router, checked]);

  const handleRequestPermission = async () => {
    try {
      const res = await requestNotificationPermission();
      setNotifState(res);
      // Pre-fetch and cache FCM token immediately on permission grant
      if (res === 'granted') {
        try {
          const token = await requestFcmToken();
          if (token) localStorage.setItem('turnly_fcm_token', token);
        } catch (_) {}
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="page-wrap flex items-center justify-center min-h-screen">
        <p style={{ color: '#999' }}>Loading…</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="page-wrap flex items-center justify-center min-h-screen p-4">
        <div className="card p-8" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Queue Not Found</h2>
          <p style={{ fontSize: 14, color: '#888' }}>
            No business registered at <strong>/b/{slug}</strong>.<br />
            Please scan the correct QR code.
          </p>
        </div>
      </div>
    );
  }

  const waiting = business.tokens?.filter(t => t.status === 'WAITING').length || 0;
  const isOpen = business.queueState === 'OPEN';

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setJoining(true);

    try {
      const numPartySize = Math.max(1, parseInt(partySize, 10) || 1);
      const result = await joinQueue(slug, name, phone, numPartySize);
      if (result?.error === 'QUEUE_CLOSED') { setError('Queue is currently stopped. Please wait.'); return; }
      if (result?.error) { setError(result.error); return; }

      // Use cached FCM token (pre-fetched on permission grant) or fetch fresh one
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          let fcmToken = localStorage.getItem('turnly_fcm_token');
          if (!fcmToken) fcmToken = await requestFcmToken();
          if (fcmToken) {
            if (fcmToken) localStorage.setItem('turnly_fcm_token', fcmToken);
            await saveFcmToken(slug, result.id, fcmToken);
            console.log('[Turnly] FCM token saved to Firebase:', fcmToken.substring(0, 20) + '...');
          } else {
            console.warn('[Turnly] No FCM token available on join');
          }
        } catch (e) {
          console.error('[Turnly] FCM token save error:', e);
        }
      }

      router.push(`/b/${slug}/ticket/${result.id}`);
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="page-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Business Info */}
        <div className="card" style={{ padding: '24px 28px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>{business.name}</h1>
          {business.category && <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px' }}>{business.category}</p>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#555' }}>
              {waiting} {waiting === 1 ? 'person' : 'people'} waiting
            </span>
            <span className={`badge badge-${isOpen ? 'open' : 'paused'}`}>
              {isOpen ? 'Queue Open' : business.queueState === 'ENDED' ? 'Queue Ended' : 'Queue Paused'}
            </span>
          </div>
        </div>

        {/* Queue Closed */}
        {!isOpen && (
          <div className="card" style={{ padding: 28, textAlign: 'center', background: '#fef9c3', border: '1px solid #fde68a' }}>
            <p style={{ fontSize: 28, margin: '0 0 8px' }}>⏸</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Queue is Closed</h2>
            <p style={{ fontSize: 13, color: '#713f12' }}>
              Staff has stopped accepting new guests. Please wait or check back shortly.
            </p>
          </div>
        )}

        {/* Join Form */}
        {isOpen && (
          <div className="card" style={{ padding: '24px 28px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Join the Queue</h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>Fill in your details to receive a digital token.</p>

            {/* Notification Permission Card */}
            {notifState === 'default' && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🔔</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#1e3a8a', margin: '0 0 4px' }}>
                      Get notified when it's your turn!
                    </p>
                    <p style={{ fontSize: 12, color: '#1e40af', margin: '0 0 10px', lineHeight: 1.4 }}>
                      Tap the button below to enable notifications so you don't miss your call.
                    </p>
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Enable Notifications Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {notifState === 'granted' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#166534', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>✓</span>
                <span style={{ fontWeight: 600 }}>Notifications enabled — you'll be alerted when called.</span>
              </div>
            )}

            {notifState === 'denied' && (
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400e', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>⚠️</span>
                <div>
                  <strong>Notifications Blocked</strong>
                  <p style={{ margin: '4px 0 0', lineHeight: 1.5 }}>
                    Notifications are disabled in your browser settings. You can still join, but please keep your screen open to see when it's your turn.
                  </p>
                </div>
              </div>
            )}

            {notifState === 'unsupported' && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#475569', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>ℹ️</span>
                <div>
                  <strong>Push Notifications Not Supported</strong>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                    Push notifications are not supported on this browser (on iOS, tap Share → Add to Home Screen to enable). You can still join — keep your screen open for live alerts &amp; audio.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label>Your Full Name *</label>
                <input type="text" placeholder="e.g. Sarah Jenkins" value={name}
                  onChange={e => setName(e.target.value)} required disabled={joining} />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>WhatsApp Mobile #</span>
                  <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '1px 6px', borderRadius: 4 }}>Optional</span>
                </label>
                <input type="tel" placeholder="e.g. 9876543210" value={phone}
                  onChange={e => setPhone(e.target.value)} disabled={joining} />
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>
                  💬 Receive an instant WhatsApp alert when your turn is called.
                </p>
              </div>

              <div>
                <label>Number of Persons *</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={partySize}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setPartySize('');
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) setPartySize(parsed);
                      }
                    }}
                    onBlur={() => {
                      if (partySize === '' || parseInt(partySize, 10) < 1) {
                        setPartySize(1);
                      }
                    }}
                    required
                    disabled={joining}
                    style={{
                      width: 100,
                      fontSize: 16,
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.18)',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
                    {Number(partySize) === 1 ? 'person' : 'persons'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button key={n} type="button"
                      onClick={() => setPartySize(n)}
                      disabled={joining}
                      style={{
                        padding: '6px 12px', borderRadius: 8,
                        border: partySize === n ? '2px solid #111' : '1px solid rgba(0,0,0,0.12)',
                        background: partySize === n ? '#111' : '#fafaf9',
                        color: partySize === n ? '#fff' : '#444',
                        fontWeight: partySize === n ? 700 : 500, fontSize: 12, cursor: 'pointer',
                      }}>
                      {n} {n === 1 ? 'Person' : 'Persons'}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={joining} style={{ marginTop: 4 }}>
                {joining ? 'Joining...' : 'Join Queue →'}
              </button>
            </form>
          </div>
        )}

        {/* Google AdSense Unit Below Check-in Form */}
        <AdBanner />
      </div>
    </div>
  );
}
