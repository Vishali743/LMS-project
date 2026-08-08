import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Award, Calendar, Mail, UserCheck } from 'lucide-react';

export default function Gradebook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGradeData() {
      try {
        setLoading(true);
        const [courseRes, gradesRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/quizzes/course/${id}/grades`)
        ]);
        setCourse(courseRes.data.course);
        setGrades(gradesRes.data.grades || []);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve gradebook records.');
      } finally {
        setLoading(false);
      }
    }
    loadGradeData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container-wide" style={{ maxWidth: '1000px' }}>
      {/* Header back */}
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
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {course && (
        <div style={{ marginBottom: '32px' }}>
          <span className="badge badge-instructor" style={{ marginBottom: 8 }}>Instructor Console</span>
          <h1 style={{ fontSize: '28px', marginBottom: 6 }}>Gradebook: {course.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Review scores and quiz attempts submitted by enrolled students.</p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* Grade list tables */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', padding: '10px' }}>
        {grades.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Award size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No records found</h3>
            <p style={{ fontSize: '14px' }}>Either no students have enrolled in this course, or no quizzes have been attempted yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Student</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Assessment Title</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'center' }}>Graded Score</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'center' }}>Accuracy %</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Submit Date</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((row, idx) => {
                  const hasAttempted = row.quiz_score !== null;
                  const scorePercent = hasAttempted 
                    ? Math.round((row.quiz_score / row.max_score) * 100) 
                    : 0;

                  return (
                    <tr 
                      key={idx} 
                      style={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)', 
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.01)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Student details */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontWeight: 600, color: '#fff' }}>{row.display_name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={12} />
                            {row.email}
                          </span>
                        </div>
                      </td>

                      {/* Quiz name */}
                      <td style={{ padding: '16px 20px', color: 'var(--text-primary)' }}>
                        {row.quiz_title || 'N/A'}
                      </td>

                      {/* Score numerical */}
                      <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 'bold' }}>
                        {hasAttempted ? (
                          <span style={{ color: '#fff' }}>
                            {row.quiz_score} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '12px' }}>/ {row.max_score}</span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400, fontSize: '13px' }}>Unattempted</span>
                        )}
                      </td>

                      {/* Score percentage badge */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        {hasAttempted ? (
                          <span className={`badge ${scorePercent >= 70 ? 'badge-success' : 'badge-student'}`} style={{ fontSize: '11px' }}>
                            {scorePercent}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {hasAttempted ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, float: 'right' }}>
                            <Calendar size={12} />
                            {new Date(row.attempted_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
