import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Award, ArrowLeft, Printer, ShieldAlert } from 'lucide-react';

export default function Certificates() {
  const { courseId } = useParams();
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCompletionDetails() {
      try {
        setLoading(true);
        setError('');
        // Load course details
        const courseRes = await api.get(`/courses/${courseId}`);
        setCourse(courseRes.data.course);

        // Load student enrollment status to confirm completion
        const enrollRes = await api.get('/enrollments/my');
        const userEnrollment = enrollRes.data.enrollments.find(e => e.course_id === parseInt(courseId));

        if (!userEnrollment) {
          setError('Access Denied: You are not enrolled in this course.');
        } else if (userEnrollment.completed_at === null) {
          setError('Access Denied: You must complete all sections and lectures to unlock this certificate.');
        } else {
          setEnrollment(userEnrollment);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to verify course completion records.');
      } finally {
        setLoading(false);
      }
    }
    if (dbUser) {
      loadCompletionDetails();
    }
  }, [courseId, dbUser]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 0' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: 16, margin: '0 auto 16px' }} />
        <h2 style={{ marginBottom: 12 }}>Certificate Locked</h2>
        <div className="alert alert-error" style={{ fontSize: '14px', marginBottom: 20 }}>{error}</div>
        <Link to={`/courses/${courseId}`} className="btn btn-secondary">Return to Syllabus</Link>
      </div>
    );
  }

  const certId = `CERT-SKEIN-${courseId}-${dbUser?.id || '000'}`;

  return (
    <div className="container-wide" style={{ maxWidth: '900px', paddingBottom: '60px' }}>
      {/* breadcrumb */}
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '14px'
        }}
        className="no-print"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Certificate Frame wrapper */}
      <div className="print-area" style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(circle, #f1f5f9 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        padding: '60px',
        borderRadius: '8px',
        border: '12px double #d97706',
        color: '#0f172a',
        fontFamily: 'Outfit, sans-serif',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}>
        
        {/* Certificate Watermark Seals */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          border: '4px dashed rgba(217, 119, 6, 0.08)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '-40px',
          width: '180px',
          height: '180px',
          border: '4px dashed rgba(217, 119, 6, 0.08)',
          borderRadius: '50%'
        }} />

        {/* Certificate headers */}
        <Award size={64} style={{ color: '#d97706', margin: '0 auto 20px', display: 'block' }} />
        
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '36px',
          fontWeight: 800,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#1e293b',
          marginBottom: '10px'
        }}>
          Certificate of Completion
        </h1>
        
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '40px'
        }}>
          This official credential verifies that
        </p>

        {/* Student Name */}
        <h2 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '40px',
          fontWeight: 700,
          color: '#0f172a',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '16px',
          maxWidth: '480px',
          margin: '0 auto 24px'
        }}>
          {dbUser?.display_name}
        </h2>

        <p style={{
          fontSize: '15px',
          color: '#475569',
          maxWidth: '540px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          has successfully fulfilled all curriculum requirements, watch lectures, and passed evaluations for the module specialization course:
        </p>

        {/* Course Title */}
        <h3 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#1e3a8a',
          marginBottom: '48px'
        }}>
          {course?.title}
        </h3>

        {/* Certificate signatures and date */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          maxWidth: '600px',
          margin: '0 auto 36px',
          alignItems: 'end'
        }}>
          <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block' }}>SkeinLMS Board of Trustees</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Authorized Verification Seal</span>
          </div>
          
          <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block' }}>
              {enrollment && new Date(enrollment.completed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Date of Graduation</span>
          </div>
        </div>

        {/* Verification Id */}
        <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.5px' }}>
          Verification ID: <strong>{certId}</strong>
        </div>
      </div>

      {/* Printing controls */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }} className="no-print">
        <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', gap: 8 }}>
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      {/* Printing specific styling rules */}
      <style>{`
        @media print {
          body {
            background-color: #fff !important;
            color: #000 !important;
          }
          .main-content {
            padding: 0 !important;
          }
          nav, .no-print {
            display: none !important;
          }
          .print-area {
            box-shadow: none !important;
            border: 12px double #d97706 !important;
            border-radius: 0 !important;
            width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>

    </div>
  );
}
