import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpg';
import { LogOut, User, PlusCircle, LayoutDashboard, Settings } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';


export default function Navbar() {
  const { dbUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err.message);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      zIndex: 1000,
      borderBottom: '1px solid var(--glass-border)'
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff' }}>
        <img 
          src={logoImg} 
          alt="Skein LMS Logo" 
          style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '8px', 
            objectFit: 'contain',
            backgroundColor: '#fff',
            padding: '2px',
            boxShadow: 'var(--shadow-glow)'
          }} 
        />
        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Skein<span className="text-gradient">LMS</span>
        </span>
      </Link>

      {/* Center Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link 
          to="/" 
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          style={{ textDecoration: 'none', color: isActive('/') ? '#fff' : 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}
        >
          Home
        </Link>
        <Link to="/courses" style={{ textDecoration: 'none', color: isActive('/courses') ? '#fff' : 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
          Catalog
        </Link>
        <Link to="/about" style={{ textDecoration: 'none', color: isActive('/about') ? '#fff' : 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
          About
        </Link>
        <Link to="/contact" style={{ textDecoration: 'none', color: isActive('/contact') ? '#fff' : 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
          Contact
        </Link>
      </div>

      {/* Right User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {dbUser && <NotificationDropdown />}
        {dbUser ? (
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)'
              }}
            >
              {dbUser.photo_url ? (
                <img src={dbUser.photo_url} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyStyle: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
                  {dbUser.display_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{dbUser.display_name}</span>
              <span className={`badge ${dbUser.role === 'admin' ? 'badge-category' : dbUser.role === 'instructor' ? 'badge-instructor' : 'badge-student'}`}>
                {dbUser.role}
              </span>
            </div>

            {/* User drop menu */}
            {dropdownOpen && (
              <div 
                className="glass-panel" 
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '200px',
                  borderRadius: '12px',
                  padding: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <Link 
                  to="/dashboard" 
                  onClick={() => setDropdownOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px' }}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                
                <Link 
                  to="/profile" 
                  onClick={() => setDropdownOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px' }}
                >
                  <User size={16} />
                  My Profile
                </Link>

                <Link 
                  to="/settings" 
                  onClick={() => setDropdownOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px' }}
                >
                  <Settings size={16} />
                  Settings
                </Link>

                <div className="divider" style={{ margin: '4px 0' }} />

                <button 
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', width: '100%' }}
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
              className="btn btn-primary btn-small"
              style={{ display: 'flex', gap: 6 }}
            >
              Sign In / Join
            </button>

            {/* Login Selection dropdown */}
            {loginDropdownOpen && (
              <div 
                className="glass-panel" 
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '180px',
                  borderRadius: '12px',
                  padding: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <Link 
                  to="/login/student" 
                  onClick={() => setLoginDropdownOpen(false)}
                  style={{ padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', display: 'block' }}
                >
                  Student Login
                </Link>
                <Link 
                  to="/login/teacher" 
                  onClick={() => setLoginDropdownOpen(false)}
                  style={{ padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', display: 'block' }}
                >
                  Teacher Login
                </Link>
                <Link 
                  to="/login/admin" 
                  onClick={() => setLoginDropdownOpen(false)}
                  style={{ padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-muted)', fontSize: '13px', display: 'block' }}
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
