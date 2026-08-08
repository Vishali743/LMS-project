import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter both email and password.');
    }
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to auto-fill for testing/demonstration
  const handleQuickFill = (role) => {
    if (role === 'student') {
      setEmail('student@skeinlms.com');
      setPassword('password123');
    } else {
      setEmail('instructor@skeinlms.com');
      setPassword('password123');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '20px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }} className="text-gradient">Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in to continue your learning journey</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
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
            {loading ? 'Signing in...' : 'Sign In'}
            <LogIn size={18} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>

        {/* Developer Sandbox Quick Fill Buttons */}
        <div style={{ 
          marginTop: '32px', 
          padding: '16px', 
          borderRadius: '12px', 
          border: '1px dashed var(--glass-border)',
          backgroundColor: 'rgba(255, 255, 255, 0.01)'
        }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', marginBottom: '10px' }}>
            Dev Sandbox Quick-Fill
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-small" 
              onClick={() => handleQuickFill('student')}
              style={{ flex: 1, fontSize: '11px', padding: '6px' }}
            >
              Fill Student
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-small" 
              onClick={() => handleQuickFill('instructor')}
              style={{ flex: 1, fontSize: '11px', padding: '6px' }}
            >
              Fill Instructor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
