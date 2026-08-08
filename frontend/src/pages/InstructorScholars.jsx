import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, Search, Filter, Mail, Award, CheckCircle, 
  X, Send, Sparkles, MessageSquare, BookOpen, Clock
} from 'lucide-react';

export default function InstructorScholars() {
  const [scholars, setScholars] = useState([]);
  const [filteredScholars, setFilteredScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [certFilter, setCertFilter] = useState('ALL'); // ALL, Issued, In Progress

  // Messaging Modal State
  const [activeMessageStudent, setActiveMessageStudent] = useState(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  useEffect(() => {
    async function loadScholars() {
      try {
        setLoading(true);
        const response = await api.get('/courses/instructor/students');
        setScholars(response.data.scholars || []);
        setFilteredScholars(response.data.scholars || []);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve enrolled scholars.');
      } finally {
        setLoading(false);
      }
    }
    loadScholars();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...scholars];

    // 1. Search (Student Name, Email, or Course Title)
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.student_name.toLowerCase().includes(q) || 
        s.email.toLowerCase().includes(q) ||
        s.course_title.toLowerCase().includes(q)
      );
    }

    // 2. Course Filter
    if (courseFilter !== 'ALL') {
      result = result.filter(s => s.course_title === courseFilter);
    }

    // 3. Certificate Filter
    if (certFilter !== 'ALL') {
      result = result.filter(s => s.certificate_status === certFilter);
    }

    setFilteredScholars(result);
  }, [searchTerm, courseFilter, certFilter, scholars]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageSubject || !messageBody) return;

    // Simulate sending email/message
    setSuccess(`✓ Message dispatched successfully to ${activeMessageStudent.student_name}!`);
    setActiveMessageStudent(null);
    setMessageSubject('');
    setMessageBody('');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Get unique courses list for filter dropdown
  const uniqueCourses = ['ALL', ...new Set(scholars.map(s => s.course_title).filter(Boolean))];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container-wide" style={{ paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <span className="badge badge-instructor" style={{ marginBottom: 10 }}>STUDENT DIRECTORY</span>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Enrolled Scholars</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track watch progress metrics, examine scores, and connect with students registered in your courses.</p>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {scholars.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--glass-border)', maxWidth: '600px', margin: '0 auto' }}>
          <Users size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: 8 }}>No students enrolled</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 24, lineHeight: 1.6 }}>
            No students are currently registered in your courses. Once scholars purchase or register for your authored modules, they will appear here.
          </p>
          <Link to="/dashboard/teacher" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      ) : (
        <div>
          {/* Filters Bar */}
          <div style={{
            display: 'flex',
            gap: 16,
            marginBottom: '32px',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '16px 20px'
          }}>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search scholars by name, email, or course..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px', margin: 0 }}
              />
            </div>

            {/* Course Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={14} style={{ color: 'var(--text-secondary)' }} />
              <select 
                className="form-select"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                style={{ width: '180px', margin: 0, padding: '10px 14px' }}
              >
                {uniqueCourses.map(c => (
                  <option key={c} value={c}>{c === 'ALL' ? 'All Courses' : c}</option>
                ))}
              </select>
            </div>

            {/* Certificate Status filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={14} style={{ color: 'var(--text-secondary)' }} />
              <select 
                className="form-select"
                value={certFilter}
                onChange={(e) => setCertFilter(e.target.value)}
                style={{ width: '160px', margin: 0, padding: '10px 14px' }}
              >
                <option value="ALL">All Progress</option>
                <option value="Issued">Completed (Issued)</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--glass-border)', padding: 0 }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.015)' }}>
                  <th style={{ padding: '18px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Scholar Details</th>
                  <th style={{ padding: '18px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Course Enrolled</th>
                  <th style={{ padding: '18px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Date Registered</th>
                  <th style={{ padding: '18px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Curriculum Progress</th>
                  <th style={{ padding: '18px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Best Quiz Score</th>
                  <th style={{ padding: '18px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScholars.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textTransform: 'none', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No scholars found matching your filter queries.
                    </td>
                  </tr>
                ) : (
                  filteredScholars.map((s, idx) => {
                    const initials = s.student_name?.charAt(0).toUpperCase() || 'S';
                    const avatarColor = `hsl(${(idx * 137) % 360}, 65%, 60%)`;
                    
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}>
                        {/* Name & Email */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: avatarColor,
                              color: '#000',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px'
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{s.student_name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Course */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ color: '#fff', fontWeight: 500 }}>{s.course_title}</div>
                        </td>

                        {/* Date Enrolled */}
                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={13} />
                            <span>{new Date(s.enrolled_at).toLocaleDateString()}</span>
                          </div>
                        </td>

                        {/* Progress */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ width: '150px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 4 }}>
                              <span>Progress</span>
                              <span style={{ fontWeight: 600, color: s.progress === 100 ? 'var(--color-success)' : 'var(--accent-primary)' }}>{s.progress}%</span>
                            </div>
                            <div className="progress-bar-container" style={{ margin: 0, height: '4px' }}>
                              <div 
                                className="progress-bar-fill" 
                                style={{ 
                                  width: `${s.progress}%`,
                                  backgroundColor: s.progress === 100 ? 'var(--color-success)' : 'var(--accent-primary)' 
                                }} 
                              />
                            </div>
                          </div>
                        </td>

                        {/* Quiz Score & Cert badge */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontWeight: 600, color: s.quiz_score > 0 ? '#fff' : 'var(--text-muted)' }}>
                              {s.quiz_score > 0 ? `${s.quiz_score}%` : 'N/A'}
                            </div>
                            {s.certificate_status === 'Issued' && (
                              <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Award size={10} /> Certified
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 24px' }}>
                          <button 
                            onClick={() => setActiveMessageStudent(s)}
                            className="btn btn-secondary btn-small"
                            style={{ display: 'inline-flex', gap: 6, alignItems: 'center', background: 'none' }}
                          >
                            <Mail size={12} /> Contact
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Messaging Modal overlay */}
      {activeMessageStudent && (
        <div className="modal-overlay" onClick={() => setActiveMessageStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button 
              onClick={() => setActiveMessageStudent(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <MessageSquare size={44} style={{ color: 'var(--accent-primary)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: 4 }}>Contact Scholar</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Sending secure dashboard alert notification to {activeMessageStudent.student_name}</p>
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '13px' }}>Recipient Email</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={activeMessageStudent.email}
                  disabled 
                  style={{ opacity: 0.6 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '13px' }}>Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter message subject..." 
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '13px' }}>Message Body</label>
                <textarea 
                  className="form-input" 
                  placeholder="Type your message text here..."
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  style={{ minHeight: '120px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setActiveMessageStudent(null)} className="btn btn-secondary btn-small">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-small" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Send size={12} /> Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
