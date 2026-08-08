import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#0a0b10', 
        color: '#fff',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid rgba(255, 255, 255, 0.1)', 
            borderTop: '3px solid #6366f1', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login/student" replace />;
  }

  if (allowedRoles && dbUser && !allowedRoles.includes(dbUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
