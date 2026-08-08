import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, HelpCircle, ShieldAlert } from 'lucide-react';

export default function FeatureAssessments() {
  return (
    <div className="container-wide" style={{ maxWidth: '800px', paddingBottom: '60px' }}>
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
        <span className="badge badge-instructor" style={{ marginBottom: 12 }}>CORE FEATURE</span>
        <h1 style={{ fontSize: '36px', marginBottom: 12 }} className="text-gradient">Instant Assessments</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          Evaluate your understanding with interactive quizzes built and graded directly on the backend.
        </p>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', marginBottom: '40px', lineHeight: '1.6' }}>
        <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Award size={22} style={{ color: 'var(--accent-secondary)' }} />
          Self-paced Quiz Evaluations
        </h3>
        
        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
          Assessments are vital to lock in what you study. Skein LMS features a dynamic assessment system where instructors build multi-choice questions. Once submitted, questions are verified server-side, and results are cached inside user databases.
        </p>

        {/* Mock Question Preview */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '32px', background: 'rgba(255,255,255,0.01)' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>MOCK QUESTION PREVIEW</span>
          <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: '16px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <HelpCircle size={18} style={{ color: 'var(--accent-primary)', minWidth: 18, marginTop: 2 }} />
            Which of the following database models does Skein LMS utilize to run backend operations?
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '13px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>
              A) MongoDB (NoSQL Document Store)
            </div>
            <div style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--accent-primary)', fontSize: '13px', background: 'rgba(99, 102, 241, 0.05)', color: '#fff', fontWeight: 500 }}>
              B) MySQL (Relational Async Database Pool) - ✔ SELECTED ANSWER
            </div>
            <div style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '13px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>
              C) PostgreSQL (Object-Relational)
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: 12, color: '#fff' }}>Test your skills!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 20 }}>Unlock modules and attempt real quizzes when signed into your student account.</p>
          <Link to="/courses" className="btn btn-primary">Browse Catalog</Link>
        </div>
      </div>
    </div>
  );
}
