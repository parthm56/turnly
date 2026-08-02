'use client';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf9f6',
      color: '#18181b',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflowX: 'clip',
    }}>
      
      {/* ─── Top Navigation Bar ────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(250, 249, 246, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#18181b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            fontWeight: 900,
            fontSize: 20,
          }}>
            T
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em', color: '#18181b' }}>
            Turnly
          </span>
          <span style={{ fontSize: 10, background: 'rgba(16, 185, 129, 0.12)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 10px', borderRadius: 100, fontWeight: 700 }}>
            FREE PLATFORM
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/auth/login" style={{
            background: '#ececeb',
            color: '#18181b',
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: 100,
            transition: 'background 0.2s',
          }}>
            Staff Login
          </Link>
          <Link href="/auth/register" style={{
            background: '#18181b',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 800,
            padding: '10px 22px',
            borderRadius: 100,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.15s',
          }}>
            Register Business →
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '70px 20px 50px', textAlign: 'center' }}>
        
        {/* Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '6px 18px',
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 700,
          color: '#047857',
          marginBottom: 28,
        }}>
          <span>⚡ Native Lock-Screen Push & SMS Alert Engine</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(34px, 5.5vw, 64px)',
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: '-0.04em',
          color: '#18181b',
          marginBottom: 22,
          maxWidth: 920,
          margin: '0 auto 22px',
        }}>
          The Real-Time Virtual Queue Engine for <span style={{
            color: '#047857',
            textDecoration: 'underline',
            textDecorationColor: '#10b981',
            textUnderlineOffset: '6px',
          }}>Modern Businesses</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: '#52525b',
          lineHeight: 1.6,
          maxWidth: 720,
          margin: '0 auto 40px',
        }}>
          Eliminate physical wait lines, reduce walkouts by 40%, and notify guests instantly on their phone when it’s their turn — <strong>zero app download required.</strong>
        </p>

        {/* Hero Actions */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
          <Link href="/auth/register" style={{
            background: '#18181b',
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 800,
            padding: '16px 36px',
            borderRadius: 100,
            textDecoration: 'none',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 260,
          }}>
            Register Business (100% Free) →
          </Link>
          <Link href="/b/metro-care" style={{
            background: '#ececeb',
            color: '#18181b',
            fontSize: 16,
            fontWeight: 700,
            padding: '16px 30px',
            borderRadius: 100,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 220,
          }}>
            👀 View Live Demo Queue
          </Link>
        </div>

        {/* Live Interactive Console Preview Card (Light Paper Surface) */}
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.09)',
          borderRadius: 24,
          padding: '28px 24px',
          textAlign: 'left',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.07)',
          maxWidth: 960,
          margin: '0 auto',
        }}>
          {/* Console Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, pb: 16, borderBottom: '1px solid rgba(0, 0, 0, 0.06)', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#18181b', marginLeft: 4, fontFamily: 'monospace' }}>
                Turnly Staff Dispatch Console · Live Queue
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 12, color: '#047857', fontWeight: 800 }}>REALTIME SYNC ACTIVE</span>
            </div>
          </div>

          {/* Active Call Card */}
          <div style={{
            background: '#faf9f6',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                NOW SERVING / CALLED GUEST
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#18181b' }}>#104</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#18181b' }}>Sarah Jenkins</span>
                <span style={{ fontSize: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#047857', padding: '3px 10px', borderRadius: 100, fontWeight: 700 }}>
                  🔔 Phone Alert Active
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 300, flexWrap: 'wrap' }}>
              <button type="button" style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                flex: 1,
                minWidth: 130,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}>
                📢 Call Guest
              </button>
              <button type="button" style={{
                background: '#ececeb',
                color: '#18181b',
                border: 'none',
                padding: '12px 18px',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}>
                ✓ Mark Serving
              </button>
            </div>
          </div>

          {/* Grouped Waiting Queue Mockup */}
          <div style={{ background: '#f4f3ef', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: 16, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#18181b' }}>
                👥 Waiting Queue (Grouped by Party Size)
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 11, background: '#ececeb', color: '#52525b', padding: '3px 10px', borderRadius: 100, fontWeight: 700 }}>All Groups (3)</span>
                <span style={{ fontSize: 11, background: '#18181b', color: '#ffffff', padding: '3px 10px', borderRadius: 100, fontWeight: 700 }}>2 Persons (2)</span>
              </div>
            </div>

            {/* Party Group 2 Persons */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#047857', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👥 2 Persons Group</span>
                <span style={{ fontSize: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#047857', padding: '2px 8px', borderRadius: 100 }}>2 waiting</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#faf9f6', borderRadius: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 900, color: '#18181b', fontSize: 15 }}>#105</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#18181b' }}>Alex Rivera</span>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Party of 2</span>
                </div>
                <button type="button" style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: 100, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                  📢 Call Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Grid Section ──────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#18181b', letterSpacing: '-0.03em', marginBottom: 12 }}>
            Engineered for Instant Performance & Zero Lines
          </h2>
          <p style={{ fontSize: 16, color: '#52525b', maxWidth: 580, margin: '0 auto' }}>
            Everything your business needs to manage waiting guests seamlessly from any device.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          
          {/* Card 1 */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 20, padding: 26, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>
              📱
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>
              Lock-Screen Push Alerts
            </h3>
            <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.6, margin: 0 }}>
              Google FCM Admin SDK V1 integration sends high-urgency alerts that wake up phone screens even when Chrome is closed or locked.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 20, padding: 26, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>
              👥
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>
              Party-Size Grouped Queues
            </h3>
            <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.6, margin: 0 }}>
              Automatically group waiting guests by party size (1, 2, 4, 8+ persons) with flexible non-FIFO single-click dispatch controls.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 20, padding: 26, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>
              📲
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>
              Instant QR Guest Check-in
            </h3>
            <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.6, margin: 0 }}>
              Guests scan your business QR code, enter their party details, and receive an instant live-updating digital token.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 20, padding: 26, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>
              📊
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>
              Real-time Queue Analytics
            </h3>
            <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.6, margin: 0 }}>
              Track live wait times, daily guest throughput, peak traffic hours, and staff dispatch performance in real time.
            </p>
          </div>

        </div>
      </section>

      {/* ─── How Turnly Works Section ─────────────────────────────────── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 60px' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 24,
          padding: '40px 24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
        }}>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, color: '#18181b', textAlign: 'center', marginBottom: 36, letterSpacing: '-0.03em' }}>
            How Turnly Works in 3 Simple Steps
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#18181b', color: '#ffffff', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                1
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#18181b', marginBottom: 6 }}>Register Your Business</h4>
              <p style={{ fontSize: 13, color: '#52525b', margin: 0, lineHeight: 1.5 }}>
                Create your business queue link in under 30 seconds. No credit card required.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#18181b', color: '#ffffff', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                2
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#18181b', marginBottom: 6 }}>Guests Join via Phone</h4>
              <p style={{ fontSize: 13, color: '#52525b', margin: 0, lineHeight: 1.5 }}>
                Guests scan your QR code, enter party size, and step away freely without waiting in line.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#18181b', color: '#ffffff', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                3
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#18181b', marginBottom: 6 }}>Staff Calls Guests</h4>
              <p style={{ fontSize: 13, color: '#52525b', margin: 0, lineHeight: 1.5 }}>
                Click "Call Guest" to wake up their phone screen with an instant sound chime & alert notification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final Free Access CTA Banner ─────────────────────────────── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 80px', textAlign: 'center' }}>
        <div style={{
          background: '#ffffff',
          border: '2px solid #18181b',
          borderRadius: 24,
          padding: '48px 24px',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.06)',
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 900, color: '#18181b', marginBottom: 14, letterSpacing: '-0.03em' }}>
            Ready to Eliminate Wait Lines Today?
          </h2>
          <p style={{ fontSize: 16, color: '#52525b', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Join hundreds of modern businesses delivering smooth, zero-wait guest experiences. <strong>100% Free Platform.</strong>
          </p>

          <Link href="/auth/register" style={{
            background: '#18181b',
            color: '#ffffff',
            fontSize: 17,
            fontWeight: 900,
            padding: '16px 38px',
            borderRadius: 100,
            textDecoration: 'none',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.18)',
            display: 'inline-block',
          }}>
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* ─── Google AdSense Placement Above Footer ───────────────────── */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 20px' }}>
        <AdBanner />
      </div>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '32px 20px',
        textAlign: 'center',
        fontSize: 13,
        color: '#71717a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', fontWeight: 600 }}>
          <Link href="/privacy" style={{ color: '#52525b', textDecoration: 'none' }}>Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" style={{ color: '#52525b', textDecoration: 'none' }}>Terms of Service</Link>
          <span>·</span>
          <Link href="/contact" style={{ color: '#52525b', textDecoration: 'none' }}>Contact Support</Link>
        </div>
        <p style={{ margin: 0, fontSize: 12 }}>
          © {new Date().getFullYear()} Turnly Virtual Queue Engine. 100% Free Platform.
        </p>
      </footer>

    </div>
  );
}
