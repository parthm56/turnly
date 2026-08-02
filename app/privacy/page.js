'use client';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="page-wrap" style={{ minHeight: '100vh', background: '#faf9f6', color: '#18181b', padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '40px 32px' }}>
        
        <Link href="/" style={{ fontSize: 13, color: '#047857', fontWeight: 700, textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>
          ← Back to Turnly Home
        </Link>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.03em' }}>Privacy Policy</h1>
        <p style={{ fontSize: 12, color: '#71717a', marginBottom: 28 }}>Last Updated: {new Date().toLocaleDateString()}</p>

        <div style={{ fontSize: 14, color: '#3f3f46', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>1. Information We Collect</h2>
            <p>
              Turnly ("we", "our", "us") operates the virtual queue management platform. When guests join a queue, we collect minimal information such as customer name, party size, phone number (optional), and web browser push tokens solely to provide real-time queue alerts.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>2. Advertising & Google AdSense Cookies</h2>
            <p>
              We use Google AdSense to serve advertisements on our platform. Google and third-party vendors use cookies to serve ads based on a user's prior visits to our website or other websites on the Internet.
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" style={{ color: '#047857', fontWeight: 700 }}>Google Ad Settings</a>.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>3. Data Protection & Security</h2>
            <p>
              We enforce strict XSS input sanitization, cryptographic password hashing, and encrypted database connections to protect user and queue data against unauthorized access.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>4. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy, please contact us via our <Link href="/contact" style={{ color: '#047857', fontWeight: 700 }}>Contact Page</Link>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
