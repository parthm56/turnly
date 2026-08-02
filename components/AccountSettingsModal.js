'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  updateBusinessProfile,
  updateStaffEmail,
  updateStaffPassword,
  deleteBusinessAccount,
} from '@/lib/queueStore';
import { evaluatePasswordStrength } from '@/lib/security';

export default function AccountSettingsModal({ business, isOpen, onClose }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'danger'

  // Profile state
  const [name, setName] = useState(business?.name || '');
  const [category, setCategory] = useState(business?.category || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Email state
  const [emailCurrentPass, setEmailCurrentPass] = useState('');
  const [newEmail, setNewEmail] = useState(business?.email || '');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Password state
  const [passCurrentPass, setPassCurrentPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Delete state
  const [deletePass, setDeletePass] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleteErr, setDeleteErr] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const passwordStrength = evaluatePasswordStrength(newPassword);

  if (!isOpen || !business) return null;

  // 1. Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setProfileLoading(true);
    try {
      const res = await updateBusinessProfile(business.slug, name, category);
      if (res?.error) setProfileErr(res.error);
      else setProfileMsg('Business profile updated successfully!');
    } catch (err) {
      setProfileErr('Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // 2. Change Email
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailMsg('');
    setEmailErr('');
    if (!emailCurrentPass) {
      setEmailErr('Please enter your current password.');
      return;
    }
    setEmailLoading(true);
    try {
      const res = await updateStaffEmail(business.slug, emailCurrentPass, newEmail);
      if (res?.error) {
        setEmailErr(res.error);
      } else {
        setEmailMsg('Email updated successfully!');
        setEmailCurrentPass('');
      }
    } catch (err) {
      setEmailErr('Failed to update email address.');
    } finally {
      setEmailLoading(false);
    }
  };

  // 3. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassErr('');
    if (!passCurrentPass) {
      setPassErr('Please enter your current password.');
      return;
    }
    if (passwordStrength.score < 4) {
      setPassErr('Please satisfy all strong password requirements below.');
      return;
    }
    setPassLoading(true);
    try {
      const res = await updateStaffPassword(business.slug, passCurrentPass, newPassword);
      if (res?.error) {
        setPassErr(res.error);
      } else {
        setPassMsg('Password updated successfully!');
        setPassCurrentPass('');
        setNewPassword('');
      }
    } catch (err) {
      setPassErr('Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  // 4. Delete Account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteErr('');
    if (!deletePass) {
      setDeleteErr('Please enter your password to authorize account deletion.');
      return;
    }
    if (confirmText.trim() !== 'DELETE') {
      setDeleteErr('Please type "DELETE" to confirm account deletion.');
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await deleteBusinessAccount(business.slug, deletePass);
      if (res?.error) {
        setDeleteErr(res.error);
      } else {
        onClose();
        router.push('/auth/register');
      }
    } catch (err) {
      setDeleteErr('Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

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
        maxWidth: 580,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#18181b' }}>⚙️ Business Account Settings</h2>
            <p style={{ fontSize: 12, color: '#666', margin: '2px 0 0' }}>Manage profile, security credentials, and account state</p>
          </div>
          <button onClick={onClose} style={{ background: '#f4f4f5', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '0 24px', background: '#fafaf9' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 18px',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid #18181b' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'profile' ? '#18181b' : '#71717a',
              cursor: 'pointer',
            }}
          >
            🏢 Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '12px 18px',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              borderBottom: activeTab === 'security' ? '2px solid #18181b' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'security' ? '#18181b' : '#71717a',
              cursor: 'pointer',
            }}
          >
            🔒 Security Credentials
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            style={{
              padding: '12px 18px',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              borderBottom: activeTab === 'danger' ? '2px solid #ef4444' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'danger' ? '#ef4444' : '#71717a',
              cursor: 'pointer',
            }}
          >
            ⚠️ Danger Zone
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: 24 }}>

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {profileMsg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 10, color: '#166534', fontSize: 13 }}>{profileMsg}</div>}
              {profileErr && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: 10, color: '#b91c1c', fontSize: 13 }}>{profileErr}</div>}

              <div>
                <label>Business Display Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={profileLoading} />
              </div>

              <div>
                <label>Category / Industry</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Healthcare, Salon, Restaurant" disabled={profileLoading} />
              </div>

              <div>
                <label>Queue URL Slug (Read Only)</label>
                <input type="text" value={business.slug} disabled style={{ background: '#f4f4f5', color: '#71717a' }} />
              </div>

              <button type="submit" className="btn-primary" disabled={profileLoading} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* CHANGE EMAIL SECTION */}
              <form onSubmit={handleChangeEmail} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: '#fafaf9', padding: 18, borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#18181b' }}>✉️ Change Work Email</h3>

                {emailMsg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 10, color: '#166534', fontSize: 13 }}>{emailMsg}</div>}
                {emailErr && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: 10, color: '#b91c1c', fontSize: 13 }}>{emailErr}</div>}

                <div>
                  <label>New Work Email</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required disabled={emailLoading} />
                </div>

                <div>
                  <label>Current Password (Authorization)</label>
                  <input type="password" placeholder="Enter current password" value={emailCurrentPass} onChange={(e) => setEmailCurrentPass(e.target.value)} required disabled={emailLoading} />
                </div>

                <button type="submit" className="btn-primary" disabled={emailLoading} style={{ alignSelf: 'flex-start' }}>
                  {emailLoading ? 'Updating Email...' : 'Update Email Address'}
                </button>
              </form>

              {/* CHANGE PASSWORD SECTION */}
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: '#fafaf9', padding: 18, borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#18181b' }}>🔑 Change Password</h3>

                {passMsg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 10, color: '#166534', fontSize: 13 }}>{passMsg}</div>}
                {passErr && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: 10, color: '#b91c1c', fontSize: 13 }}>{passErr}</div>}

                <div>
                  <label>Current Password</label>
                  <input type="password" placeholder="Enter current password" value={passCurrentPass} onChange={(e) => setPassCurrentPass(e.target.value)} required disabled={passLoading} />
                </div>

                <div>
                  <label>New Strong Password</label>
                  <input type="password" placeholder="Enter new strong password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={passLoading} />

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div style={{ marginTop: 8, padding: 10, background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#666' }}>New Password Strength:</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: passwordStrength.color }}>{passwordStrength.label} ({passwordStrength.score}/5)</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${(passwordStrength.score / 5) * 100}%`, height: '100%', background: passwordStrength.color, transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', fontSize: 10 }}>
                        <span style={{ color: passwordStrength.checks.length ? '#166534' : '#94a3b8' }}>{passwordStrength.checks.length ? '✓' : '○'} Min 8 chars</span>
                        <span style={{ color: passwordStrength.checks.uppercase ? '#166534' : '#94a3b8' }}>{passwordStrength.checks.uppercase ? '✓' : '○'} Uppercase (A-Z)</span>
                        <span style={{ color: passwordStrength.checks.lowercase ? '#166534' : '#94a3b8' }}>{passwordStrength.checks.lowercase ? '✓' : '○'} Lowercase (a-z)</span>
                        <span style={{ color: passwordStrength.checks.number ? '#166534' : '#94a3b8' }}>{passwordStrength.checks.number ? '✓' : '○'} Number (0-9)</span>
                        <span style={{ color: passwordStrength.checks.special ? '#166534' : '#94a3b8', gridColumn: 'span 2' }}>{passwordStrength.checks.special ? '✓' : '○'} Special char (!@#$%...)</span>
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary" disabled={passLoading} style={{ alignSelf: 'flex-start' }}>
                  {passLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>

            </div>
          )}

          {/* TAB 3: DANGER ZONE */}
          {activeTab === 'danger' && (
            <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#fef2f2', padding: 20, borderRadius: 14, border: '1px solid #fca5a5' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#991b1b' }}>🗑️ Delete Business Account</h3>
                <p style={{ fontSize: 13, color: '#7f1d1d', margin: '4px 0 0', lineHeight: 1.5 }}>
                  This action is <strong>permanent and irreversible</strong>. Deleting your business account will erase all active queue tokens, customer records, and credentials from the system.
                </p>
              </div>

              {deleteErr && <div style={{ background: '#ffffff', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: 10, color: '#b91c1c', fontSize: 13 }}>{deleteErr}</div>}

              <div>
                <label style={{ color: '#7f1d1d' }}>Enter Current Password</label>
                <input type="password" placeholder="Current password" value={deletePass} onChange={(e) => setDeletePass(e.target.value)} required disabled={deleteLoading} />
              </div>

              <div>
                <label style={{ color: '#7f1d1d' }}>Type "DELETE" to Confirm</label>
                <input type="text" placeholder="DELETE" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} required disabled={deleteLoading} />
              </div>

              <button type="submit" className="btn-danger" disabled={deleteLoading} style={{ alignSelf: 'flex-start', padding: '12px 24px', fontSize: 14, fontWeight: 800 }}>
                {deleteLoading ? 'Deleting Account...' : '🔥 Permanently Delete Account'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
