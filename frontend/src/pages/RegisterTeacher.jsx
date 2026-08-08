import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Key, AlertCircle } from 'lucide-react';

export default function RegisterTeacher() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName || !email || !password) {
      return setError('Please fill in all inputs.');
    }
    try {
      setError('');
      setLoading(true);
      await register(email, password, displayName, 'instructor');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="badge badge-instructor" style={{ marginBottom: 8 }}>INSTRUCTOR PORTAL</span>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }} className="text-gradient">Teacher Register</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Register to create and manage courses</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Dr. Samuel Vance" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="samuel@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="Min 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }}
            disabled={loading}
          >
            Register As Teacher
            <UserPlus size={18} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already registered? </span>
          <Link to="/login/teacher" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </div>

        {/* Sandbox toggle */}
        <div style={{ marginTop: '28px', padding: '16px', borderRadius: '12px', border: '1px dashed var(--glass-border)', textAlign: 'center' }}>
          <button type="button" className="btn btn-secondary btn-small" onClick={() => { setDisplayName('Test Teacher'); setEmail('instructor@skeinlms.com'); setPassword('password123'); }} style={{ width: '100%', fontSize: '11px' }}>
            Sandbox Autofill Register
          </button>
        </div>
      </div>
    </div>
  );
}
