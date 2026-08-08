import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Award } from 'lucide-react';

export default function FeatureCertificates() {
  return (
    <div className="container-wide" style={{ maxWidth: '850px', paddingBottom: '60px' }}>
      <Link to="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '14px',
        marginBottom: '32px',
        transition: 'var(--transition-fast)'
      }} className="btn-back">
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge badge-category" style={{ marginBottom: 12, color: 'var(--color-success)', backgroundColor: 'var(--color-success-bg)' }}>CORE FEATURE</span>
        <h1 style={{ fontSize: '36px', marginBottom: 12 }} className="text-gradient">Verified Certificates</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          Instantly generate official graduation diplomas with custom authentication seals upon course completion.
        </p>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', marginBottom: '40px', lineHeight: '1.6' }}>
        <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={22} style={{ color: 'var(--color-success)' }} />
          Verifiable Academic Achievements
        </h3>
        
        <p style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>
          Once all module checkboxes are completed and syllabus requirements have been met, you will instantly unlock a shareable, high-resolution graduation certificate. Each certificate is stamped with a verification ID prefix (`CERT-SKEIN-XX`) to guarantee credibility.
        </p>

        {/* Sample Certificate Mockup inside page body */}
        <div style={{
          backgroundColor: '#f8fafc',
          backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          padding: '40px 30px',
          borderRadius: '16px',
          border: '8px double #d97706',
          color: '#0f172a',
          fontFamily: 'Outfit, sans-serif',
          textAlign: 'center',
          position: 'relative',
          marginBottom: '40px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Certificate headers */}
          <Award size={48} style={{ color: '#d97706', margin: '0 auto 12px', display: 'block' }} />
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#1e293b',
            margin: '0 0 6px 0',
            letterSpacing: '1px'
          }}>
            Certificate of Completion
          </h2>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            THIS OFFICIAL CREDENTIAL VERIFIES THAT
          </span>
          
          {/* Student Name */}
          <h3 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#0f172a',
            borderBottom: '1.5px solid #cbd5e1',
            paddingBottom: '10px',
            maxWidth: '360px',
            margin: '12px auto 16px'
          }}>
            Jane Doe
          </h3>

          <p style={{
            fontSize: '12px',
            color: '#475569',
            maxWidth: '480px',
            margin: '0 auto 24px',
            lineHeight: 1.5
          }}>
            has successfully fulfilled all curriculum requirements, watch lectures, and passed evaluations for the module specialization course:
          </p>

          {/* Course Title */}
          <h4 style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#1e3a8a',
            margin: '0 0 32px 0'
          }}>
            Full-Stack React & Node Specialization
          </h4>

          {/* Certificate signatures and date */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            maxWidth: '500px',
            margin: '0 auto 12px',
            alignItems: 'end'
          }}>
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block' }}>SkeinLMS Board of Trustees</span>
              <span style={{ fontSize: '9px', color: '#64748b' }}>Authorized Verification Seal</span>
            </div>
            
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block' }}>
                {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span style={{ fontSize: '9px', color: '#64748b' }}>Date of Graduation</span>
            </div>
          </div>
          
          <div style={{ position: 'absolute', bottom: 10, right: 15, fontSize: '9px', color: '#64748b' }}>
            ID: CERT-SKEIN-SAMPLE-101
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: 12, color: '#fff' }}>Earn your graduation scroll!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 20 }}>Study, check lessons, and complete course modules to claim your diploma.</p>
          <Link to="/courses" className="btn btn-primary">Browse Catalog</Link>
        </div>
      </div>
    </div>
  );
}
