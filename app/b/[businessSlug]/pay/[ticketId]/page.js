'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessData } from '@/hooks/useHydratedStore';
import AdBanner from '@/components/AdBanner';

export const dynamic = 'force-dynamic';

/**
 * Order Queue only: the screen between "place your order" and the normal waiting
 * screen. It shows the token number the customer must quote at the counter, the
 * order total, and hands off to the usual ticket page as soon as the staff
 * confirm the order.
 */
export default function PaymentPage({ params }) {
  const slug = params?.businessSlug;
  const ticketId = params?.ticketId;
  const router = useRouter();
  const { business, loading } = useBusinessData(slug);

  const token = business?.tokens?.find(t => t.id === ticketId);
  const isOrderMode = business?.queueMode === 'order';
  const status = token?.status;

  // Leave as soon as this is no longer a brand-new order (staff confirmed it), or
  // if this page does not belong here at all — the waiting screen handles the rest.
  useEffect(() => {
    if (loading || !business) return;
    if (!isOrderMode || status !== 'WAITING') {
      router.replace(`/b/${slug}/ticket/${ticketId}`);
    }
  }, [loading, business, isOrderMode, status, slug, ticketId, router]);

  if (loading) {
    return (
      <div className="page-wrap flex items-center justify-center min-h-screen">
        <p style={{ color: '#999' }}>Loading…</p>
      </div>
    );
  }

  if (!business || !token || !isOrderMode) {
    return (
      <div className="page-wrap flex items-center justify-center min-h-screen">
        <p style={{ color: '#999' }}>Taking you to your order…</p>
      </div>
    );
  }

  const details = token.details || [];
  const total = details.reduce((sum, d) => sum + (Number(d.total) || 0) + (Number(d.price) || 0), 0);

  return (
    <div className="page-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>

        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', margin: 0 }}>{business.name}</p>

        {/* Token to quote at the counter */}
        <div className="card" style={{ padding: '32px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', margin: '0 0 8px' }}>
            Your Token
          </p>
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, color: '#111', marginBottom: 14 }}>
            #{token.number}
          </div>
          <p style={{ fontSize: 14, color: '#444', margin: 0, fontWeight: 600 }}>
            Show this token at the counter to pay
          </p>
          {total > 0 && (
            <div style={{ fontSize: 40, fontWeight: 900, color: '#1a5c3a', margin: '14px 0 0' }}>
              ₹{total}
            </div>
          )}
        </div>

        {/* What is being paid for */}
        {details.length > 0 && (
          <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {details.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                <span style={{ color: '#888' }}>{d.label}</span>
                <span style={{ fontWeight: 600, textAlign: 'right' }}>
                  {d.items
                    ? `${d.items.map(it => `${it.name} ×${it.qty}`).join(', ')}${d.total ? ` — ₹${d.total}` : ''}`
                    : `${d.value}${d.price ? ` — ₹${d.price}` : ''}`}
                </span>
              </div>
            ))}
            {total > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 10 }}>
                <span style={{ fontWeight: 700 }}>Total to pay</span>
                <span style={{ fontWeight: 800 }}>₹{total}</span>
              </div>
            )}
          </div>
        )}

        {/* What happens next */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>💵</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#1e3a8a', margin: '0 0 4px' }}>Pay at the counter</p>
            <p style={{ fontSize: 12, color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
              Staff will confirm your order next — you do not need to refresh. This page moves on by itself.
            </p>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ padding: '12px 20px', fontSize: 14, fontWeight: 700, background: '#16a34a' }}
          onClick={() => router.replace(`/b/${slug}/ticket/${ticketId}`)}>
          ✓ I&apos;ve Paid — Track My Order
        </button>

        <AdBanner />
      </div>
    </div>
  );
}
