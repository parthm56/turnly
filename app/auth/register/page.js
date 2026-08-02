'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerBusiness } from '@/lib/queueStore';
import { isValidEmail, sanitizeSlug, evaluatePasswordStrength } from '@/lib/security';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = evaluatePasswordStrength(password);

  const handleNameChange = (e) => {
    setName(e.target.value);
    setSlug(sanitizeSlug(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !slug.trim()) {
      setError('Business name and URL slug are required.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid work email address.');
      return;
    }

    if (strength.score < 4) {
      setError('Please choose a stronger password matching all rule requirements below.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerBusiness(
        slug.trim(),
        name.trim(),
        email.trim(),
        password,
        category.trim()
      );

      if (result?.error) {
        setError(result.error);
        return;
      }

      localStorage.setItem('turnly_staff_slug', result.slug);
      localStorage.setItem('turnly_staff_email', result.email);
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to connect to database. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap flex items-center justify-center min-h-screen p-4">
      <div className="card p-8 w-full max-w-md" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>Register Your Business</h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Create your secure virtual queue portal.</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#b91c1c', fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>Business Name</label>
            <input
              type="text"
              placeholder="e.g. Metro Care Clinic"
              value={name}
              onChange={handleNameChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label>Queue URL Slug</label>
            <input
              type="text"
              placeholder="metro-care"
              value={slug}
              onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
              required
              disabled={loading}
            />
            <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
              Customer Portal: <strong>turnly-plum.vercel.app/b/{slug || 'your-slug'}</strong>
            </p>
          </div>

          <div>
            <label>Work Email</label>
            <input
              type="email"
              placeholder="admin@metrocare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            {/* Live Password Strength Meter & Checklist */}
            {password && (
              <div style={{ marginTop: 10, padding: 12, background: '#fafaf9', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#666' }}>Password Strength:</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: strength.color }}>{strength.label} ({strength.score}/5)</span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${(strength.score / 5) * 100}%`, height: '100%', background: strength.color, transition: 'width 0.3s, background 0.3s' }} />
                </div>

                {/* Rules Checklist */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', fontSize: 11 }}>
                  <span style={{ color: strength.checks.length ? '#166534' : '#94a3b8', fontWeight: strength.checks.length ? 700 : 400 }}>
                    {strength.checks.length ? '✓' : '○'} Min 8 chars
                  </span>
                  <span style={{ color: strength.checks.uppercase ? '#166534' : '#94a3b8', fontWeight: strength.checks.uppercase ? 700 : 400 }}>
                    {strength.checks.uppercase ? '✓' : '○'} Uppercase (A-Z)
                  </span>
                  <span style={{ color: strength.checks.lowercase ? '#166534' : '#94a3b8', fontWeight: strength.checks.lowercase ? 700 : 400 }}>
                    {strength.checks.lowercase ? '✓' : '○'} Lowercase (a-z)
                  </span>
                  <span style={{ color: strength.checks.number ? '#166534' : '#94a3b8', fontWeight: strength.checks.number ? 700 : 400 }}>
                    {strength.checks.number ? '✓' : '○'} Number (0-9)
                  </span>
                  <span style={{ color: strength.checks.special ? '#166534' : '#94a3b8', fontWeight: strength.checks.special ? 700 : 400, gridColumn: 'span 2' }}>
                    {strength.checks.special ? '✓' : '○'} Special character (!@#$%...)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label>Category (optional)</label>
            <input
              type="text"
              placeholder="e.g. Healthcare, Restaurant, Salon"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating Account...' : 'Create Portal & Open Dashboard →'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: '#666', textAlign: 'center', margin: 0 }}>
          Already registered?{' '}
          <Link href="/auth/login" style={{ color: '#111', fontWeight: 700 }}>Staff Log In</Link>
        </p>
      </div>
    </div>
  );
}
