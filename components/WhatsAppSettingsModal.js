'use client';
import { useState, useEffect, useCallback } from 'react';

export default function WhatsAppSettingsModal({ business, isOpen, onClose }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'open' | 'connecting' | 'close' | 'not_found'
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
          // Format base64 properly if needed
          const formattedQr = data.qrcode.startsWith('data:image')
            ? data.qrcode
            : `data:image/png;base64,${data.qrcode}`;
          setQrCode(formattedQr);
          setStatus('connecting');
        } else if (data.state === 'open') {
          setStatus('open');
          setSuccessMsg('WhatsApp is already connected and active!');
        }
      } else {
        setError(data.error || 'Failed to start WhatsApp connection.');
      }
    } catch (err) {
      setError('Connection failed. Make sure your WhatsApp server is running.');
    } finally {
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
                      background: '#16a34a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                    {loading ? 'Initializing WhatsApp…' : '📲 Connect WhatsApp (Scan QR Code)'}
                  </button>
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
