import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await resetPassword(email);
      setSuccess('A password reset link has been dispatched to your email inbox directory.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to dispatch password recovery link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        {/* Lock Graphic */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <KeyRound size={28} />
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 800,
          textAlign: 'center',
          color: '#fff',
          marginBottom: '8px',
          fontFamily: 'Outfit, sans-serif'
        }}>
          Reset Password
        </h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '13px',
          marginBottom: '32px',
          lineHeight: 1.5
        }}>
          Specify your registered email address and we'll dispatch a link to securely recover your account.
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}><AlertCircle size={16} /><span>{error}</span></div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 20 }}><CheckCircle2 size={16} /><span>{success}</span></div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                style={{ paddingLeft: '40px' }}
                required 
              />
              <Mail 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '24px' }}
            disabled={loading}
          >
            {loading ? 'Dispatching link...' : 'Send Recovery Email'}
          </button>
        </form>

        <div className="divider" style={{ marginBottom: '24px' }} />

        {/* Back navigation options */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: '13px' }}>
          <Link to="/login/student" style={{ color: 'var(--accent-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={14} />
            Student Sign In
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <Link to="/login/teacher" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
            Teacher Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
