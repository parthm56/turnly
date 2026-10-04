'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessData } from '@/hooks/useHydratedStore';
import { setQueueState, callCustomer, updateStatus } from '@/lib/queueStore';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import WhatsAppSettingsModal from '@/components/WhatsAppSettingsModal';

const STATUS_CLASS = {
  WAITING: 'badge-waiting',
  CALLED: 'badge-called',
  SERVING: 'badge-serving',
  COMPLETED: 'badge-completed',
  NO_SHOW: 'badge-noshow',
  CANCELLED: 'badge-cancelled',
};

export default function DashboardPage() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState('checking');

  useEffect(() => {
    const s = localStorage.getItem('turnly_staff_slug');
    if (!s) { router.push('/auth/login'); return; }
    setSlug(s);
  }, [router]);

  const { business, loading } = useBusinessData(slug);

  if (!slug || loading) {
    return (
      <div className="page-wrap flex items-center justify-center min-h-screen">
        <p style={{ color: '#999', fontSize: 14 }}>Connecting to Firebase…</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="page-wrap flex items-center justify-center min-h-screen">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#999', fontSize: 14, marginBottom: 16 }}>Business not found in database.</p>
          <button className="btn-primary" onClick={() => router.push('/auth/register')}>Register Business</button>
        </div>
      </div>
    );
  }

  const tokens = business.tokens || [];
  const waiting  = tokens.filter(t => t.status === 'WAITING');
  const active   = tokens.filter(t => t.status === 'CALLED' || t.status === 'SERVING');
  const done     = tokens.filter(t => ['COMPLETED', 'NO_SHOW', 'CANCELLED'].includes(t.status));
  const queueUrl = typeof window !== 'undefined' ? `${window.location.origin}/b/${slug}` : '';

  // Group waiting list by party size (number of persons)
  const groupedWaiting = waiting.reduce((acc, token) => {
    const size = token.partySize || 1;
    if (!acc[size]) acc[size] = [];
    acc[size].push(token);
    return acc;
  }, {});

  const sortedPartySizes = Object.keys(groupedWaiting).map(Number).sort((a, b) => a - b);
  const displayPartySizes = selectedGroup === 'all'
    ? sortedPartySizes
    : sortedPartySizes.filter(size => String(size) === String(selectedGroup));

  const checkWhatsApp = async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/whatsapp/status?slug=${slug}`);
      const data = await res.json();
      setWhatsAppStatus(data.state || 'close');
    } catch (_) {
      setWhatsAppStatus('close');
    }
  };

  useEffect(() => {
    if (slug) checkWhatsApp();
  }, [slug]);

  const act = async (fn) => {
    setActionLoading(true);
    try { await fn(); } finally { setActionLoading(false); }
  };

  return (
    <div className="page-wrap" style={{ minHeight: '100vh', background: '#f8f7f4' }}>
      {/* Top Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{business.name}</h1>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Dispatch Console · /b/{slug}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href={`/b/${slug}`} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: '#1a5c3a', fontWeight: 600, textDecoration: 'none' }}>
            Customer Portal ↗
          </a>
          <button className="btn-secondary" style={{
            padding: '8px 16px',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: whatsAppStatus === 'open' ? '#f0fdf4' : '#fff',
            borderColor: whatsAppStatus === 'open' ? '#86efac' : 'rgba(0,0,0,0.1)',
            color: whatsAppStatus === 'open' ? '#166534' : 'inherit',
            fontWeight: whatsAppStatus === 'open' ? 700 : 500,
          }}
            onClick={() => setIsWhatsAppOpen(true)}>
            <span>💬</span>
            <span>{whatsAppStatus === 'open' ? 'WhatsApp Connected' : 'Connect WhatsApp'}</span>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: whatsAppStatus === 'open' ? '#22c55e' : whatsAppStatus === 'connecting' ? '#eab308' : '#cbd5e1',
              display: 'inline-block',
            }} />
          </button>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setIsSettingsOpen(true)}>
            ⚙️ Account Settings
          </button>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12 }}
            onClick={() => {
              localStorage.removeItem('turnly_staff_slug');
              localStorage.removeItem('turnly_staff_email');
              router.push('/auth/login');
            }}>
            Logout
          </button>
        </div>
      </div>

      {/* Account Settings Modal */}
      <AccountSettingsModal
        business={business}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* WhatsApp Settings Modal */}
      <WhatsAppSettingsModal
        business={business}
        isOpen={isWhatsAppOpen}
        onClose={() => {
          setIsWhatsAppOpen(false);
          checkWhatsApp();
        }}
      />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Queue State Controls */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Queue Status</p>
              <span className={`badge badge-${business.queueState?.toLowerCase() || 'open'}`}>
                {business.queueState || 'OPEN'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn-secondary"
                disabled={actionLoading}
                style={{ padding: '10px 20px', fontSize: 13, background: business.queueState === 'OPEN' ? '#d1fae5' : undefined }}
                onClick={() => act(() => setQueueState(slug, 'OPEN'))}>
                ▶ Start Queue
              </button>
              <button className="btn-secondary"
                disabled={actionLoading}
                style={{ padding: '10px 20px', fontSize: 13, background: business.queueState === 'PAUSED' ? '#fef9c3' : undefined }}
                onClick={() => act(() => setQueueState(slug, 'PAUSED'))}>
                ⏸ Stop Queue
              </button>
              <button className="btn-danger"
                disabled={actionLoading}
                onClick={() => {
                  if (confirm('End queue? This clears all tokens for today.'))
                    act(() => setQueueState(slug, 'ENDED'));
                }}>
                ■ End Queue
              </button>
            </div>
          </div>
        </div>

        {/* Dispatch Panel */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Dispatch Console</h2>
              <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0 0' }}>Manage currently called & active customers</p>
            </div>
          </div>

          {/* Waiting customers with Push Ready badge in queue list */}
          {active.length > 0 ? active.map(t => (
            <div key={t.id}
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 22, fontWeight: 900, marginRight: 12 }}>#{t.number}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{t.customerName}</span>
                <span style={{ fontSize: 13, color: '#666', marginLeft: 8 }}>
                  Party of {t.partySize}{t.phone ? ` · ${t.phone}` : ''}
                </span>
                {t.fcmToken && (
                  <span style={{ marginLeft: 8, fontSize: 11, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                    🔔 Phone Alert
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {t.status === 'CALLED' && (
                  <button className="btn-secondary" disabled={actionLoading} style={{ padding: '8px 16px', fontSize: 12 }}
                    onClick={() => act(() => updateStatus(slug, t.id, 'SERVING'))}>
                    Start Serving
                  </button>
                )}
                <button className="btn-primary" disabled={actionLoading}
                  style={{ padding: '8px 16px', fontSize: 12, background: '#1a5c3a' }}
                  onClick={() => act(() => updateStatus(slug, t.id, 'COMPLETED'))}>
                  ✓ Done
                </button>
                <button className="btn-danger" disabled={actionLoading}
                  onClick={() => act(() => updateStatus(slug, t.id, 'NO_SHOW'))}>
                  ✗ No Show
                </button>
              </div>
            </div>
          )) : (
            <p style={{ color: '#999', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              No customer currently called. Click "Call Customer" next to any waiting customer below.
            </p>
          )}
        </div>

        {/* Waiting List Grouped by Party Size */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              Waiting Queue <span style={{ fontWeight: 400, color: '#888', fontSize: 15 }}>({waiting.length} total guests)</span>
            </h2>

            {/* Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#666' }}>Filter Group:</label>
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.15)',
                  background: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#111',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Groups ({waiting.length})</option>
                {sortedPartySizes.map(num => {
                  const count = groupedWaiting[num]?.length || 0;
                  return (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Person' : 'Persons'} ({count} waiting)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Interactive Group Filter Pills */}
          {waiting.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedGroup('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 100,
                  border: selectedGroup === 'all' ? '2px solid #1a5c3a' : '1px solid rgba(0,0,0,0.12)',
                  background: selectedGroup === 'all' ? '#1a5c3a' : '#f5f5f4',
                  color: selectedGroup === 'all' ? '#fff' : '#444',
                  fontSize: 12,
                  fontWeight: selectedGroup === 'all' ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                All Groups ({waiting.length})
              </button>
              {sortedPartySizes.map(size => {
                const count = groupedWaiting[size].length;
                const isSelected = String(selectedGroup) === String(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedGroup(String(size))}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 100,
                      border: isSelected ? '2px solid #1a5c3a' : '1px solid rgba(0,0,0,0.12)',
                      background: isSelected ? '#1a5c3a' : '#f5f5f4',
                      color: isSelected ? '#fff' : '#444',
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    👥 {size} {size === 1 ? 'Person' : 'Persons'} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {waiting.length === 0 ? (
            <p style={{ color: '#999', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Queue is empty.</p>
          ) : displayPartySizes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 16px', background: '#fafaf9', borderRadius: 12, border: '1px border rgba(0,0,0,0.06)' }}>
              <p style={{ color: '#555', fontSize: 14, margin: '0 0 10px', fontWeight: 600 }}>
                No guests currently waiting in the {selectedGroup} {selectedGroup === '1' ? 'person' : 'persons'} group.
              </p>
              <button
                type="button"
                onClick={() => setSelectedGroup('all')}
                style={{ background: 'none', border: 'none', color: '#1a5c3a', fontWeight: 700, cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
              >
                Show All Groups
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {displayPartySizes.map(size => {
                const groupTokens = groupedWaiting[size];
                return (
                  <div key={size} style={{ background: '#fafaf9', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>👥</span>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#1a5c3a' }}>
                          {size} {size === 1 ? 'Person Group' : 'Persons Group'}
                        </h3>
                        <span style={{ fontSize: 11, background: '#e7f5ed', color: '#166534', fontWeight: 700, padding: '2px 10px', borderRadius: 100 }}>
                          {groupTokens.length} waiting
                        </span>
                      </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 540 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <th style={{ textAlign: 'left', padding: '6px 12px' }}>#</th>
                            <th style={{ textAlign: 'left', padding: '6px 12px' }}>Token</th>
                            <th style={{ textAlign: 'left', padding: '6px 12px' }}>Customer Name</th>
                            <th style={{ textAlign: 'left', padding: '6px 12px' }}>Phone</th>
                            <th style={{ textAlign: 'left', padding: '6px 12px' }}>Party</th>
                            <th style={{ textAlign: 'left', padding: '6px 12px' }}>Status</th>
                            <th style={{ textAlign: 'right', padding: '6px 12px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupTokens.map((t, i) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: '#fff' }}>
                              <td style={{ padding: '10px 12px', color: '#888' }}>{i + 1}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 800, fontSize: 16 }}>{t.number}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                                {t.customerName}
                                {t.fcmToken && (
                                  <span style={{ marginLeft: 8, fontSize: 11, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                                    🔔 Phone Alert
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#666' }}>{t.phone || '—'}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 700 }}>{t.partySize} {t.partySize === 1 ? 'person' : 'persons'}</td>
                              <td style={{ padding: '10px 12px' }}><span className={`badge ${STATUS_CLASS[t.status]}`}>{t.status}</span></td>
                              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                <button className="btn-primary" disabled={business.queueState !== 'OPEN' || actionLoading}
                                  style={{ padding: '6px 14px', fontSize: 12, background: '#1a5c3a' }}
                                  onClick={() => act(() => callCustomer(slug, t.id))}>
                                  📢 Call Guest
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card Stack View */}
                    <div className="mobile-card-view">
                      {groupTokens.map((t, i) => (
                        <div key={t.id} style={{
                          background: '#ffffff',
                          border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: 12,
                          padding: '14px 16px',
                          marginBottom: 10,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontWeight: 900, fontSize: 18, color: '#111' }}>#{t.number}</span>
                              <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{t.customerName}</span>
                            </div>
                            <span className={`badge ${STATUS_CLASS[t.status]}`}>{t.status}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#555', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                            <div>
                              👥 <strong>{t.partySize} {t.partySize === 1 ? 'person' : 'persons'}</strong> {t.phone ? ` · 📞 ${t.phone}` : ''}
                            </div>
                            {t.fcmToken && (
                              <span style={{ fontSize: 11, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                                🔔 Phone Alert
                              </span>
                            )}
                          </div>

                          <button className="btn-primary" disabled={business.queueState !== 'OPEN' || actionLoading}
                            style={{ width: '100%', padding: '10px 16px', fontSize: 13, background: '#1a5c3a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            onClick={() => act(() => callCustomer(slug, t.id))}>
                            📢 Call Guest
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Today */}
        {done.length > 0 && (
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              Completed Today <span style={{ fontWeight: 400, color: '#888', fontSize: 15 }}>({done.length})</span>
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', color: '#888', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px' }}>Token</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {done.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{t.number}</td>
                    <td style={{ padding: '10px 12px' }}>{t.customerName}</td>
                    <td style={{ padding: '10px 12px' }}><span className={`badge ${STATUS_CLASS[t.status]}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
