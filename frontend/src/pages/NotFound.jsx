import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-wide" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '70vh', 
      textAlign: 'center' 
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-error-bg)',
        color: 'var(--color-error)',
        marginBottom: '24px'
      }}>
        <ShieldAlert size={40} />
      </div>

      <h1 style={{ fontSize: '48px', marginBottom: '8px', fontWeight: 800 }}>404</h1>
      <h2 style={{ fontSize: '22px', marginBottom: '16px' }} className="text-gradient">Module Not Found</h2>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '420px', marginBottom: '32px', lineHeight: 1.5 }}>
        The page you are trying to access might have been moved, deleted, or you might not have authorization credentials.
      </p>

      <div style={{ display: 'flex', gap: 14 }}>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', gap: 6 }}>
          <Home size={16} />
          Return Home
        </Link>
        <Link to="/dashboard" className="btn btn-secondary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
