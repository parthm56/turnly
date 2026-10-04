'use client';
import { useState, useEffect, useCallback } from 'react';
import { setBusinessOtpRequirement } from '@/lib/queueStore';

export default function WhatsAppSettingsModal({ business, isOpen, onClose }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'open' | 'connecting' | 'close' | 'not_found'
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [requireOtp, setRequireOtp] = useState(Boolean(business?.requireOtp));
  const [savingOtp, setSavingOtp] = useState(false);

  // Sync requireOtp when business prop updates
  useEffect(() => {
    setRequireOtp(Boolean(business?.requireOtp));
  }, [business?.requireOtp]);

  // Test message state
  const [testPhone, setTestPhone] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState('');

  const slug = business?.slug;

  const checkStatus = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/whatsapp/status?slug=${slug}`);
      const data = await res.json();
      setStatus(data.state || 'close');
      if (data.state === 'open') {
        setQrCode(null);
      }
    } catch (_) {
      setStatus('close');
    }
  }, [slug]);

  // Initial status check on modal open
  useEffect(() => {
    if (isOpen && slug) {
      checkStatus();
    }
  }, [isOpen, slug, checkStatus]);

  // Poll status while QR code is displayed
  useEffect(() => {
    if (!isOpen || status === 'open' || !qrCode) return;

    const interval = setInterval(() => {
      checkStatus();
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, status, qrCode, checkStatus]);

  if (!isOpen || !business) return null;

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.qrcode) {
          const formattedQr = data.qrcode.startsWith('data:image')
            ? data.qrcode
            : `data:image/png;base64,${data.qrcode}`;
          setQrCode(formattedQr);
          setStatus('connecting');
          setLoading(false);
          return;
        } else if (data.state === 'open') {
          setStatus('open');
          setSuccessMsg('WhatsApp is already connected and active!');
          setLoading(false);
          return;
        }

        // If instance was created but QR is still generating, poll for it
        setStatus('connecting');
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const pollRes = await fetch('/api/whatsapp/connect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug }),
            });
            const pollData = await pollRes.json();
            if (pollData.qrcode) {
              clearInterval(pollInterval);
              const formattedQr = pollData.qrcode.startsWith('data:image')
                ? pollData.qrcode
                : `data:image/png;base64,${pollData.qrcode}`;
              setQrCode(formattedQr);
              setStatus('connecting');
              setLoading(false);
            } else if (pollData.state === 'open') {
              clearInterval(pollInterval);
              setStatus('open');
              setSuccessMsg('WhatsApp is already connected and active!');
              setLoading(false);
            } else if (attempts >= 8) {
              clearInterval(pollInterval);
              setLoading(false);
              setError('QR code took too long to generate. Please click Connect WhatsApp again.');
            }
          } catch (_) {
            if (attempts >= 8) {
              clearInterval(pollInterval);
              setLoading(false);
              setError('Failed to reach WhatsApp service. Please try again in a moment.');
            }
          }
        }, 2500);
      } else {
        setError(data.error || 'Failed to start WhatsApp connection.');
        setLoading(false);
      }
    } catch (err) {
      setError('Connection failed. Make sure your WhatsApp server is running.');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp? Your customers will not receive WhatsApp alerts until you reconnect.')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      setStatus('close');
      setQrCode(null);
      setSuccessMsg('WhatsApp disconnected successfully.');
    } catch (err) {
      setError('Failed to disconnect WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) return;
    setTestSending(true);
    setTestResult('');
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          phone: testPhone,
          customerName: 'Test Customer',
          tokenNumber: 'A-01',
          businessName: business.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult('✅ Test WhatsApp alert delivered successfully!');
      } else {
        setTestResult(`❌ Failed: ${data.error || 'Could not send message'}`);
      }
    } catch (err) {
      setTestResult('❌ Network error sending test message');
    } finally {
      setTestSending(false);
    }
  };

  const handleToggleOtp = async () => {
    if (!isConnected) {
      setError('Please connect your WhatsApp above before enabling OTP verification.');
      return;
    }
    const nextVal = !requireOtp;
    setSavingOtp(true);
    setError('');
    setSuccessMsg('');
    try {
      await setBusinessOtpRequirement(slug, nextVal);
      setRequireOtp(nextVal);
      setSuccessMsg(
        nextVal
          ? '🔒 WhatsApp OTP verification is now ACTIVE! Customers must verify their phone to join.'
          : '✓ WhatsApp OTP verification disabled. Customers can now join instantly.'
      );
    } catch (err) {
      setError('Failed to update verification setting. Please try again.');
    } finally {
      setSavingOtp(false);
    }
  };

  const isConnected = status === 'open';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 540,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>💬</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#18181b' }}>WhatsApp Notifications</h2>
              <p style={{ fontSize: 12, color: '#666', margin: '2px 0 0' }}>Alert customers on WhatsApp when their turn arrives</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f4f4f5', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Connection Status Indicator */}
          <div style={{
            background: isConnected ? '#f0fdf4' : '#fafaf9',
            border: `1px solid ${isConnected ? '#bbf7d0' : '#e4e4e7'}`,
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: isConnected ? '#22c55e' : status === 'connecting' ? '#eab308' : '#a1a1aa',
                boxShadow: isConnected ? '0 0 8px #22c55e' : 'none',
              }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#18181b' }}>
                  {isConnected ? 'WhatsApp Connected & Active' : status === 'connecting' ? 'Awaiting QR Code Scan…' : 'WhatsApp Disconnected'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#71717a' }}>
                  {isConnected
                    ? 'Customers with phone numbers will automatically receive alerts'
                    : 'Link your business WhatsApp to send notifications'}
                </p>
              </div>
            </div>

            {isConnected && (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#dc2626',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}>
                Disconnect
              </button>
            )}
          </div>

          {/* OTP Verification Toggle Card */}
          <div style={{
            background: requireOtp && isConnected ? '#f0fdf4' : '#fafaf9',
            border: `1px solid ${requireOtp && isConnected ? '#bbf7d0' : '#e4e4e7'}`,
            borderRadius: 14,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <strong style={{ fontSize: 14, color: '#18181b' }}>Queue Join Verification (WhatsApp OTP)</strong>
                {requireOtp && isConnected && (
                  <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '1px 8px', borderRadius: 100, fontWeight: 700 }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#71717a', lineHeight: 1.5 }}>
                {isConnected
                  ? (requireOtp
                      ? 'Customers must verify a 4-digit WhatsApp code to join. Zero fake tokens or typos.'
                      : 'Disabled. Customers enter their number and join immediately with 0 friction.')
                  : 'Connect WhatsApp above to activate customer phone verification for your queue.'}
              </p>
            </div>

            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: 50,
              height: 28,
              cursor: isConnected && !savingOtp ? 'pointer' : 'not-allowed',
              opacity: isConnected ? 1 : 0.5,
              flexShrink: 0,
            }}>
              <input
                type="checkbox"
                checked={requireOtp && isConnected}
                disabled={!isConnected || savingOtp}
                onChange={handleToggleOtp}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: requireOtp && isConnected ? '#16a34a' : '#cbd5e1',
                borderRadius: 34,
                transition: '0.3s',
              }}>
                <span style={{
                  position: 'absolute',
                  height: 22,
                  width: 22,
                  left: requireOtp && isConnected ? 25 : 3,
                  bottom: 3,
                  background: '#ffffff',
                  borderRadius: '50%',
                  transition: '0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }} />
              </span>
            </label>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: 10, color: '#b91c1c', fontSize: 13 }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 10, color: '#166534', fontSize: 13 }}>
              {successMsg}
            </div>
          )}

          {/* STATE 1: NOT CONNECTED -> QR FLOW */}
          {!isConnected && (
            <div>
              {!qrCode ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <style>{`
                    @keyframes waSpin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                  <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.5, marginBottom: 16 }}>
                    Connect your WhatsApp number using WhatsApp Web (Linked Devices). Your personal number is not shared—messages will be sent on behalf of <strong>{business.name}</strong>.
                  </p>
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="btn-primary"
                    style={{
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 700,
                      background: loading ? '#64748b' : '#16a34a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: loading ? 'wait' : 'pointer',
                    }}>
                    {loading ? '⏳ Generating WhatsApp QR…' : '📲 Connect WhatsApp (Scan QR Code)'}
                  </button>

                  {loading && (
                    <div style={{ marginTop: 20, padding: '14px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      <div style={{
                        width: 20,
                        height: 20,
                        border: '3px solid #cbd5e1',
                        borderTopColor: '#16a34a',
                        borderRadius: '50%',
                        animation: 'waSpin 0.8s linear infinite',
                      }} />
                      <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                        Connecting to WhatsApp server & generating QR code…
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                    Scan with WhatsApp on your phone:
                  </p>

                  {/* QR Image */}
                  <div style={{ background: '#ffffff', padding: 12, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      style={{ width: 220, height: 220, display: 'block' }}
                    />
                  </div>

                  <div style={{ textAlign: 'left', fontSize: 12, color: '#475569', lineHeight: 1.6, maxWidth: 360 }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700 }}>Instructions:</p>
                    <ol style={{ margin: 0, paddingLeft: 18 }}>
                      <li>Open <strong>WhatsApp</strong> on your mobile phone.</li>
                      <li>Tap <strong>Menu (⋮)</strong> on Android or <strong>Settings</strong> on iPhone.</li>
                      <li>Tap <strong>Linked Devices</strong> → <strong>Link a Device</strong>.</li>
                      <li>Point your phone camera at this QR code.</li>
                    </ol>
                  </div>

                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
                    ⏳ Auto-refreshing status... This screen will close as soon as you scan.
                  </p>

                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
                    Regenerate QR Code
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STATE 2: CONNECTED -> TEST DISPATCH */}
          {isConnected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, background: '#fafaf9', padding: 18, borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: '#18181b' }}>🧪 Send a Test WhatsApp Alert</h3>
                <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0' }}>
                  Enter your mobile number to test the automated turn alert message
                </p>
              </div>

              {testResult && (
                <div style={{
                  background: testResult.startsWith('✅') ? '#f0fdf4' : '#fee2e2',
                  border: `1px solid ${testResult.startsWith('✅') ? '#bbf7d0' : '#fca5a5'}`,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  color: testResult.startsWith('✅') ? '#166534' : '#b91c1c',
                }}>
                  {testResult}
                </div>
              )}

              <form onSubmit={handleSendTest} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210 or +91..."
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 13 }}
                  disabled={testSending}
                />
                <button
                  type="submit"
                  disabled={testSending || !testPhone.trim()}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: '#16a34a' }}>
                  {testSending ? 'Sending…' : 'Send Test Alert'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

