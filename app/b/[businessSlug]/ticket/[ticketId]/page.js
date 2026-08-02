'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessData } from '@/hooks/useHydratedStore';
import { cancelToken, clearTicketId, getPosition, saveFcmToken } from '@/lib/queueStore';
import { requestFcmToken } from '@/lib/pushNotifications';
import AdBanner from '@/components/AdBanner';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const STATUS_LABEL = {
  WAITING:   'Waiting in Line',
  CALLED:    "📣 It's Your Turn!",
  SERVING:   'Now Being Served',
  COMPLETED: 'Service Complete',
  NO_SHOW:   'Marked No-Show',
  CANCELLED: 'Cancelled',
};

const STATUS_CLASS = {
  WAITING:   'badge-waiting',
  CALLED:    'badge-called',
  SERVING:   'badge-serving',
  COMPLETED: 'badge-completed',
  NO_SHOW:   'badge-noshow',
  CANCELLED: 'badge-cancelled',
};

export default function TicketPage({ params }) {
  const slug     = params?.businessSlug;
  const ticketId = params?.ticketId;
  const router   = useRouter();

  const { business, loading } = useBusinessData(slug);

  const [notifPerm, setNotifPerm] = useState('default');
  const [hasAlerted, setHasAlerted] = useState(false);
  const [fcmRegistered, setFcmRegistered] = useState(false);

  useEffect(() => {
    if ('Notification' in window) setNotifPerm(Notification.permission);
  }, []);
  const notifBlocked = notifPerm !== 'granted';

  // Obtain & save FCM Push Token to Firebase Realtime DB for this user's device
  useEffect(() => {
    if (!slug || !ticketId || fcmRegistered) return;
    if ('Notification' in window && Notification.permission === 'granted') {
      requestFcmToken().then((token) => {
        if (token) {
          saveFcmToken(slug, ticketId, token);
          setFcmRegistered(true);
        }
      }).catch(() => {});
    }
  }, [slug, ticketId, notifPerm, fcmRegistered]);

  // Register Service Worker on mount bypassing browser & CDN cache
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js?v=4', { updateViaCache: 'none' })
        .then(reg => reg.update())
        .catch(() => {});
    }
  }, []);

  // Sound + Vibrate + Push Notification when CALLED (Fires ONLY ONCE per ticket)
  useEffect(() => {
    if (!business || !ticketId) return;
    const token = business.tokens?.find(t => t.id === ticketId);
    if (token?.status !== 'CALLED') return;

    // Check persistent storage so refreshing page doesn't re-trigger notification
    const key = `turnly_notified_${ticketId}`;
    if (sessionStorage.getItem(key) || localStorage.getItem(key) || hasAlerted) {
      return;
    }

    // Mark as notified persistently
    try {
      sessionStorage.setItem(key, '1');
      localStorage.setItem(key, '1');
    } catch (_) {}
    setHasAlerted(true);

    // 1. Phone Vibration
    if ('vibrate' in navigator) {
      try { navigator.vibrate([300, 100, 300, 100, 400]); } catch (_) {}
    }

    // 2. Audio Chime (Web Audio API)
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (_) {}

  }, [business, ticketId, hasAlerted]);

  if (loading) {
    return (
      <div className="page-wrap flex items-center justify-center min-h-screen">
        <p style={{ color: '#999' }}>Loading ticket…</p>
      </div>
    );
  }

  const token = business?.tokens?.find(t => t.id === ticketId);

  if (!token) {
    return (
      <div className="page-wrap flex items-center justify-center min-h-screen p-4">
        <div className="card p-8" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ticket Not Found</h2>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
            This ticket may have expired or the queue was reset.
          </p>
          <Link href={`/b/${slug}`} className="btn-primary" style={{ display: 'inline-block' }}>
            Join Queue Again
          </Link>
        </div>
      </div>
    );
  }

  const pos = getPosition(business.tokens, ticketId);
  const isCalled    = token.status === 'CALLED';
  const isWaiting   = token.status === 'WAITING';
  const isCompleted = token.status === 'COMPLETED';

  const handleQuit = async () => {
    if (!confirm('Are you sure you want to leave the queue?')) return;
    await cancelToken(slug, ticketId);
    clearTicketId(slug);
    router.push(`/b/${slug}`);
  };

  // Thank You screen
  if (isCompleted) {
    return (
      <div className="page-wrap flex flex-col items-center justify-center min-h-screen p-4">
        <div style={{ maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ width: '100%', textAlign: 'center', padding: '48px 32px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#064e3b', marginBottom: 8 }}>Thank You!</h1>
            <p style={{ fontSize: 15, color: '#065f46', lineHeight: 1.7 }}>
              Thank you for visiting <strong>{business?.name}</strong>.<br />Your service is complete. Have a great day!
            </p>
            <button className="btn-primary"
              style={{ marginTop: 28, background: '#1a5c3a' }}
              onClick={() => { clearTicketId(slug); router.push(`/b/${slug}`); }}>
              Done
            </button>
          </div>

          {/* Google AdSense Placement on Thank You Page */}
          <AdBanner />
        </div>
      </div>
    );
  }

  // No-Show or Cancelled screen
  if (token.status === 'NO_SHOW' || token.status === 'CANCELLED') {
    return (
      <div className="page-wrap flex flex-col items-center justify-center min-h-screen p-4">
        <div style={{ maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ width: '100%', textAlign: 'center', padding: '48px 32px', background: '#fef9c3', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>
              {token.status === 'NO_SHOW' ? '😔' : '👋'}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#713f12', marginBottom: 8 }}>
              {token.status === 'NO_SHOW' ? 'Marked as No-Show' : 'You Left the Queue'}
            </h1>
            <p style={{ fontSize: 14, color: '#92400e', lineHeight: 1.7, marginBottom: 0 }}>
              {token.status === 'NO_SHOW'
                ? 'Staff marked you as no-show. If this is a mistake, please approach the counter directly.'
                : 'You have left the queue. You can rejoin anytime below.'}
            </p>
            <button className="btn-primary"
              style={{ marginTop: 28, background: '#b45309' }}
              onClick={() => { clearTicketId(slug); router.push(`/b/${slug}`); }}>
              Rejoin Queue
            </button>
          </div>

          {/* Google AdSense Placement on No-Show / Cancelled Page */}
          <AdBanner />
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>

        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', margin: 0 }}>{business?.name}</p>

        {/* Token Card */}
        <div className="card" style={{
          padding: '40px 32px',
          textAlign: 'center',
          background: isCalled ? '#eff6ff' : '#fff',
          border: isCalled ? '2px solid #93c5fd' : '1px solid rgba(0,0,0,0.1)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', margin: '0 0 8px' }}>
            Your Token
          </p>
          <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, color: isCalled ? '#1d4ed8' : '#111', marginBottom: 16 }}>
            #{token.number}
          </div>
          <span className={`badge ${STATUS_CLASS[token.status]}`}>
            {STATUS_LABEL[token.status] || token.status}
          </span>

          {(isWaiting || isCalled) && (
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 32 }}>
              <div>
                <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px' }}>People ahead</p>
                <p style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>{pos.ahead}</p>
              </div>
              <div style={{ width: 1, background: 'rgba(0,0,0,0.1)' }} />
              <div>
                <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px' }}>Total waiting</p>
                <p style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>{pos.total}</p>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Name', token.customerName],
            ['Party Size', `${token.partySize} ${token.partySize === 1 ? 'person' : 'people'}`],
            token.phone ? ['Phone', token.phone] : null,
          ].filter(Boolean).map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#888' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* ─── Google AdSense Placement: Mid-Page Display Unit ────── */}
        <AdBanner />

        {/* Called Banner */}
        {isCalled && (
          <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 12, padding: '18px 20px', textAlign: 'center' }}>
            <p style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 16, margin: 0 }}>
              📣 Please proceed to the counter now!
            </p>
          </div>
        )}

        {/* Quit */}
        {isWaiting && (
          <div style={{ textAlign: 'center' }}>
            <button className="btn-danger" onClick={handleQuit}>Leave Queue</button>
          </div>
        )}

        {/* Notification blocked warning */}
        {notifBlocked && (isWaiting || isCalled) && (
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#92400e', margin: '0 0 4px' }}>
                Notifications are {notifPerm === 'denied' ? 'Blocked' : 'Not Enabled'}
              </p>
              <p style={{ fontSize: 12, color: '#92400e', margin: '0 0 10px', lineHeight: 1.5 }}>
                {notifPerm === 'denied'
                  ? 'You blocked notifications. Open your browser settings → site settings → allow notifications for this site.'
                  : "You won't get an alert when it's your turn. Enable notifications so we can ping you."}
              </p>
              {notifPerm !== 'denied' && (
                <button
                  onClick={() => Notification.requestPermission().then(p => { setNotifPerm(p); })}
                  style={{ fontSize: 12, fontWeight: 700, background: '#b45309', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
                  Enable Notifications
                </button>
              )}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', margin: 0 }}>
          Keep this page open for live updates &amp; notifications.
        </p>
      </div>
    </div>
  );
}
