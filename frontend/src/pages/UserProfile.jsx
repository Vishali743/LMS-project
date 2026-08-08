import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Shield, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function UserProfile() {
  const { dbUser, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(dbUser?.display_name || '');
  const [photoUrl, setPhotoUrl] = useState(dbUser?.photo_url || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!displayName) return setError('Name is required.');
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.post('/auth/sync', { displayName, photoUrl });
      await refreshProfile();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-wide" style={{ maxWidth: '640px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>User Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View your credentials and update your profile details.</p>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={16} /><span>{error}</span></div>}
      {success && <div className="alert alert-success"><CheckCircle2 size={16} /><span>{success}</span></div>}

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Profile Card Summary */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {dbUser?.photo_url ? (
            <img src={dbUser.photo_url} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyStyle: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>
              {dbUser?.display_name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '22px', marginBottom: 6 }}>{dbUser?.display_name}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} />{dbUser?.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={14} />
                <span>Account Role: <strong className="text-gradient" style={{ textTransform: 'uppercase' }}>{dbUser?.role}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleUpdate} className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Edit Details</h3>
          
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)' }} />
              <input type="text" className="form-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ paddingLeft: '38px' }} disabled={loading} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Avatar Photo URL</label>
            <input type="url" className="form-input" placeholder="https://..." value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} disabled={loading} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }} disabled={loading}>
            <Save size={16} />
            {loading ? 'Saving updates...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
