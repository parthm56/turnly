'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginStaff } from '@/lib/queueStore';
import { isValidEmail } from '@/lib/security';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid work email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginStaff(email.trim(), password);

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
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>Staff Login</h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Sign in with your registered work email and password.</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#b91c1c', fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: '#666', textAlign: 'center', margin: 0 }}>
          New business?{' '}
          <Link href="/auth/register" style={{ color: '#111', fontWeight: 700 }}>Register Here</Link>
        </p>
      </div>
    </div>
  );
}
