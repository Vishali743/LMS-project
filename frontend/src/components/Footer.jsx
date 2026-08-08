import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--glass-border)',
      padding: '60px 40px 30px 40px',
      marginTop: '80px',
      color: 'var(--text-secondary)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div className="container-wide" style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
        gap: '40px',
        marginBottom: '40px',
        flexWrap: 'wrap'
      }}>
        {/* Brand Info */}
        <div>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: 800,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '20px'
          }}>
            <img 
              src={logoImg} 
              alt="Skein LMS Logo" 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '6px', 
                objectFit: 'contain',
                backgroundColor: '#fff',
                padding: '2px'
              }} 
            />
            <span>Skein<span className="text-gradient">LMS</span></span>
          </Link>
          <p style={{ fontSize: '13px', lineHeight: 1.6, maxWidth: '280px' }}>
            Next-generation Online Learning Management System enabling scholars to specialize and instructors to build digital courses concurrently.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '14px', fontFamily: 'Outfit', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Navigation
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '13px' }}>
            <li><Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link></li>
            <li><Link to="/courses" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>All Courses</Link></li>
            <li><Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About Us</Link></li>
            <li><Link to="/contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact Us</Link></li>
          </ul>
        </div>

        {/* Roles Portals */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '14px', fontFamily: 'Outfit', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Portals
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '13px' }}>
            <li><Link to="/login/student" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Student Login</Link></li>
            <li><Link to="/login/teacher" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Instructor Login</Link></li>
            <li><Link to="/login/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Admin Console</Link></li>
          </ul>
        </div>

        {/* Community / Contact info */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '14px', fontFamily: 'Outfit', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Connect with us
          </h4>
          <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
            Have questions or suggestion notes? Connect with our developer community channels.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} aria-label="Github">
              <Github size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid var(--glass-border)',
        paddingTop: '30px',
        display: 'flex',
        justifyContent: 'between',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          &copy; {new Date().getFullYear()} SkeinLMS. All rights reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Crafted with <Heart size={12} style={{ color: 'var(--color-error)' }} /> for professional learning.
        </div>
      </div>
    </footer>
  );
}
