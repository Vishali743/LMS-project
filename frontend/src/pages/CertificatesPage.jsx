import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Award, ArrowLeft, Printer, Download, Share2, 
  CheckCircle, Sparkles, X, CheckSquare, ShieldCheck
} from 'lucide-react';

export default function CertificatesPage() {
  const { dbUser } = useAuth();
  const navigate = useNavigate();
  const [completedEnrollments, setCompletedEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Verification Modal State
  const [activeVerifyCert, setActiveVerifyCert] = useState(null);

  useEffect(() => {
    async function loadCompletions() {
      try {
        setLoading(true);
        const response = await api.get('/enrollments/my');
        const completed = (response.data.enrollments || []).filter(e => e.completed_at !== null);
        setCompletedEnrollments(completed);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch completion records.');
      } finally {
        setLoading(false);
      }
    }
    if (dbUser) {
      loadCompletions();
    }
  }, [dbUser]);

  const triggerMockDownload = (fileName) => {
    setToastMessage(`Compiling high-resolution document for ${fileName}...`);
    setTimeout(() => {
      setToastMessage(`✓ Saved PDF file: ${fileName}`);
      setTimeout(() => setToastMessage(null), 3000);
    }, 1800);
  };

  const handleShareCert = (courseId, title) => {
    const shareUrl = `${window.location.origin}/verify/SKN-${courseId}-${dbUser?.id || '000'}`;
    navigator.clipboard.writeText(shareUrl);
    setToastMessage(`✓ Shareable verification link for ${title} copied to clipboard!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container-wide" style={{ paddingBottom: '80px' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-notification">
          <Sparkles size={16} style={{ color: 'var(--color-warning)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <span className="badge badge-student" style={{ marginBottom: 10 }}>CREDENTIAL ARCHIVE</span>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>My Completed Certificates</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View, print, and share credentials verifying your course completions.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {completedEnrollments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--glass-border)', maxWidth: '600px', margin: '0 auto' }}>
          <Award size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: 8 }}>No certificates earned yet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 24, lineHeight: 1.6 }}>
            You haven't completed any specializations yet. Finish all module lectures and pass the assessments to instantly generate your certificates.
          </p>
          <Link to="/dashboard/my-courses" className="btn btn-primary">Go to My Courses</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {completedEnrollments.map((item) => {
            const certId = `CERT-SKEIN-${item.course_id}-${dbUser?.id || '000'}`;
            const completionDateFormatted = new Date(item.completed_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div 
                key={item.course_id} 
                className="glass-panel feature-card" 
                style={{ 
                  borderRadius: '16px', 
                  border: '1px solid rgba(16, 185, 129, 0.25)', 
                  background: 'linear-gradient(135deg, rgba(26,28,38,0.7) 0%, rgba(16,185,129,0.01) 100%)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  height: '100%',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Award size={28} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 700, letterSpacing: '0.05em' }}>VERIFIED CREDENTIAL</span>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: 6 }}>{item.title}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Recipient: <strong style={{ color: '#fff' }}>{dbUser?.display_name}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Completed on: {completionDateFormatted}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    ID: {certId}
                  </div>
                </div>

                {/* Grid of actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--glass-border)', paddingTop: 16, marginTop: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button 
                      onClick={() => triggerMockDownload(`Certificate_${item.course_id}.pdf`)}
                      className="btn btn-secondary btn-small"
                      style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid var(--glass-border)', fontSize: '11px' }}
                    >
                      <Download size={12} /> Download
                    </button>
                    <button 
                      onClick={() => navigate(`/certificates/${item.course_id}`)}
                      className="btn btn-secondary btn-small"
                      style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid var(--glass-border)', fontSize: '11px' }}
                    >
                      <Printer size={12} /> Print View
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button 
                      onClick={() => handleShareCert(item.course_id, item.title)}
                      className="btn btn-secondary btn-small"
                      style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid var(--glass-border)', fontSize: '11px' }}
                    >
                      <Share2 size={12} /> Share URL
                    </button>
                    <button 
                      onClick={() => setActiveVerifyCert({
                        ...item,
                        certId,
                        date: completionDateFormatted
                      })}
                      className="btn btn-primary btn-small"
                      style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', fontSize: '11px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: 'none' }}
                    >
                      <CheckCircle size={12} /> Verify Seal
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Overlay Modal */}
      {activeVerifyCert && (
        <div className="modal-overlay" onClick={() => setActiveVerifyCert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center' }}>
            <button 
              onClick={() => setActiveVerifyCert(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <ShieldCheck size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: 6 }}>Academic Verification Approved</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 20 }}>This badge confirms credentials validity from the SkeinLMS certification pool.</p>

            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'left',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Student Name:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{dbUser?.display_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Verified Course:</span>
                <span style={{ color: '#fff', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{activeVerifyCert.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Graduation Date:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{activeVerifyCert.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Certificate ID:</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'monospace' }}>{activeVerifyCert.certId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓ COMPLETED</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveVerifyCert(null)}
              className="btn btn-secondary btn-small"
              style={{ width: '100%' }}
            >
              Close Verification
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
