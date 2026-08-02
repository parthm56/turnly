'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-wrap" style={{ minHeight: '100vh', background: '#faf9f6', color: '#18181b', padding: '40px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '40px 32px' }}>
        
        <Link href="/" style={{ fontSize: 13, color: '#047857', fontWeight: 700, textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>
          ← Back to Turnly Home
        </Link>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.03em' }}>Contact Turnly Support</h1>
        <p style={{ fontSize: 13, color: '#71717a', marginBottom: 28 }}>Have a question or need assistance with your queue account?</p>

        {submitted ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 24, borderRadius: 14, textAlign: 'center', color: '#166534' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Message Received!</h3>
            <p style={{ fontSize: 13, margin: 0 }}>Thank you for reaching out. Our support team will get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Your Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div>
              <label>Your Email</label>
              <input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <label>Message</label>
              <textarea rows={4} placeholder="How can we help you?" value={message} onChange={e => setMessage(e.target.value)} required />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
              Send Message →
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
