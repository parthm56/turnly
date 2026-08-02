'use client';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="page-wrap" style={{ minHeight: '100vh', background: '#faf9f6', color: '#18181b', padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '40px 32px' }}>
        
        <Link href="/" style={{ fontSize: 13, color: '#047857', fontWeight: 700, textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>
          ← Back to Turnly Home
        </Link>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.03em' }}>Terms of Service</h1>
        <p style={{ fontSize: 12, color: '#71717a', marginBottom: 28 }}>Last Updated: {new Date().toLocaleDateString()}</p>

        <div style={{ fontSize: 14, color: '#3f3f46', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>1. Acceptance of Terms</h2>
            <p>
              By registering a business or joining a virtual queue on Turnly, you agree to comply with and be bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>2. Service Availability</h2>
            <p>
              Turnly provides real-time virtual queue engine tools free of charge. While we maintain 99.9% platform uptime, service is provided on an "as is" and "as available" basis.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>3. Business Account Security</h2>
            <p>
              Business owners are responsible for safeguarding their account email and password credentials. Account deletion and password updates can be performed directly inside the Staff Dashboard settings.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>4. Advertisements</h2>
            <p>
              Turnly displays sponsored advertisements provided by Google AdSense and authorized third-party ad networks. Users agree not to attempt to artificially inflate ad clicks or manipulate ad display units.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
