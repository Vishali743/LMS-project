import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ArrowLeft, FileText, UploadCloud, CheckCircle, 
  Award, HelpCircle, Save, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function AssignmentsPage() {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();
  const { dbUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]); // Student submission queue (Instructor view)
  const [mySubmissions, setMySubmissions] = useState([]); // Student's own submissions
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isInstructor = dbUser?.role === 'instructor' || dbUser?.role === 'admin';

  // Toggle tab for instructors
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'grading'

  // Submit Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  // Grading State
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [gradePoints, setGradePoints] = useState(100);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Course configuration parameters for new assignment
  const [sections, setSections] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignMaxPoints, setAssignMaxPoints] = useState(100);

  // Edit Assignment State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);

  const loadAssignmentsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data.course);
      setSections(courseRes.data.sections);

      // Load assignments
      const assignRes = await api.get(`/assignments/course/${id}`);
      setAssignments(assignRes.data.assignments || []);

      if (isInstructor) {
        // Load grading queue
        const subsRes = await api.get(`/assignments/course/${id}/submissions`);
        setSubmissions(subsRes.data.submissions || []);
      } else {
        // Load student submissions
        const mySubsRes = await api.get(`/assignments/course/${id}/my`);
        setMySubmissions(mySubsRes.data.submissions || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dbUser) {
      loadAssignmentsData();
    }
  }, [id, dbUser, isInstructor]);

  // Handle student submit
  const openSubmitPanel = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
    const prevSub = mySubmissions.find(s => s.assignment_id === assignmentId);
    setSubmissionText(prevSub?.submission_text || '');
    setSubmissionUrl(prevSub?.file_url || '');
    setShowSubmitModal(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await api.post(`/assignments/${selectedAssignmentId}/submit`, {
        submissionText,
        fileUrl: submissionUrl
      });
      setSuccess('Your coursework was successfully uploaded!');
      setShowSubmitModal(false);
      loadAssignmentsData();
    } catch (err) {
      console.error(err);
      setError('Failed to submit coursework.');
    }
  };

  // Handle Instructor grading
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await api.post(`/assignments/grade/${gradingSubmissionId}`, {
        pointsEarned: parseInt(gradePoints),
        feedback: gradeFeedback
      });
      setSuccess('Grade saved successfully.');
      setGradingSubmissionId(null);
      loadAssignmentsData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Grading submission failed.');
    }
  };

  // Handle Instructor create assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedSectionId || !assignTitle) return;
    try {
      setError('');
      setSuccess('');
      await api.post(`/assignments/section/${selectedSectionId}`, {
        title: assignTitle,
        description: assignDesc,
        max_points: parseInt(assignMaxPoints)
      });
      setSuccess('Coursework assignment created.');
      setShowCreateModal(false);
      setAssignTitle('');
      setAssignDesc('');
      loadAssignmentsData();
    } catch (err) {
      console.error(err);
      setError('Failed to create assignment guidelines.');
    }
  };

  // Open Edit Modal with prefilled values
  const openEditPanel = (item) => {
    setEditingAssignmentId(item.id);
    setSelectedSectionId(item.section_id);
    setAssignTitle(item.title);
    setAssignDesc(item.description);
    setAssignMaxPoints(item.max_points);
    setShowEditModal(true);
  };

  // Handle Instructor edit assignment submission
  const handleEditAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!assignTitle) return;
    try {
      setError('');
      setSuccess('');
      await api.put(`/assignments/${editingAssignmentId}`, {
        title: assignTitle,
        description: assignDesc,
        max_points: parseInt(assignMaxPoints)
      });
      setSuccess('Coursework assignment guidelines updated.');
      setShowEditModal(false);
      setAssignTitle('');
      setAssignDesc('');
      loadAssignmentsData();
    } catch (err) {
      console.error(err);
      setError('Failed to update assignment guidelines.');
    }
  };

  // Handle Instructor delete assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment guidelines? All associated student submissions will be permanently deleted.')) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await api.delete(`/assignments/${assignmentId}`);
      setSuccess('Assignment deleted successfully.');
      loadAssignmentsData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete assignment.');
    }
  };

  if (loading && !showSubmitModal && !gradingSubmissionId && !showCreateModal) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container-wide">
      {/* breadcrumb */}
      <button 
        onClick={() => navigate(isInstructor ? `/courses/${id}/manage` : `/courses/${id}`)} 
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
        Back to Course Panel
      </button>

      {course && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: 6 }}>Assignments: {course.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Review projects, read instructions, and view feedback evaluation scores.</p>
          </div>
          
          {isInstructor && (
            <button onClick={() => {
              if (sections.length > 0) {
                setSelectedSectionId(sections[0].id);
              }
              setShowCreateModal(true);
            }} className="btn btn-primary">
              Create Assignment
            </button>
          )}
        </div>
      )}

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 20 }} onClick={() => setSuccess('')}>{success}</div>}

      {/* Tab headings for Instructor */}
      {isInstructor && (
        <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: '1px', marginBottom: '24px' }}>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`btn ${activeTab === 'tasks' ? 'btn-primary btn-small' : 'btn-secondary btn-small'}`}
            style={{ borderRadius: '20px' }}
          >
            Assignment Outlines
          </button>
          <button 
            onClick={() => setActiveTab('grading')}
            className={`btn ${activeTab === 'grading' ? 'btn-primary btn-small' : 'btn-secondary btn-small'}`}
            style={{ borderRadius: '20px' }}
          >
            Submissions Queue ({submissions.filter(s => s.points_earned === null).length})
          </button>
        </div>
      )}

      {/* --- TAB VIEW 1: TASK OUTLINES (STUDENTS OR INSTRUCTORS VIEW) --- */}
      {(!isInstructor || activeTab === 'tasks') && (
        <div>
          {assignments.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', borderRadius: '16px', textAlign: 'center' }}>
              <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
              <p style={{ color: 'var(--text-secondary)' }}>No assignments have been posted for this course syllabus yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {assignments.map(item => {
                // Find student submission if student
                const sub = mySubmissions.find(s => s.assignment_id === item.id);
                const hasSubmitted = sub !== undefined;
                const isGraded = sub?.points_earned !== null;

                return (
                  <div key={item.id} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 220px', gap: '30px', alignItems: 'center' }}>
                    <div>
                      <span className="badge badge-category" style={{ marginBottom: 8 }}>Module: {item.section_title}</span>
                      <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: 8 }}>{item.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{item.description}</p>
                    </div>

                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Max Weight</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>{item.max_points} Points</div>
                      
                      {/* Dynamic Action if Student */}
                      {!isInstructor && (
                        <div>
                          {hasSubmitted ? (
                            <div style={{ fontSize: '12px', marginBottom: 10 }}>
                              {isGraded ? (
                                <div style={{ color: 'var(--color-success)', fontWeight: 'bold', display: 'flex', gap: 4, justifyStyle: 'center', justifyContent: 'center' }}>
                                  <Award size={14} />
                                  <span>Score: {sub.points_earned} / {item.max_points}</span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--color-warning)' }}>Awaiting evaluation</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>Pending submission</span>
                          )}

                          <button onClick={() => openSubmitPanel(item.id)} className="btn btn-secondary btn-small" style={{ width: '100%' }}>
                            {hasSubmitted ? 'Edit submission' : 'Upload answer'}
                          </button>
                        </div>
                      )}

                      {/* Dynamic Actions if Instructor */}
                      {isInstructor && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <button onClick={() => openEditPanel(item)} className="btn btn-secondary btn-small" style={{ width: '100%' }}>
                            Edit Outline
                          </button>
                          <button 
                            onClick={() => handleDeleteAssignment(item.id)} 
                            className="btn btn-secondary btn-small" 
                            style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            Delete Task
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB VIEW 2: INSTRUCTOR GRADING QUEUE --- */}
      {isInstructor && activeTab === 'grading' && (
        <div className="glass-panel" style={{ borderRadius: '16px', padding: 10 }}>
          {submissions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: '30px', textAlign: 'center' }}>No student coursework submissions filed yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Student</th>
                    <th style={{ padding: '12px 16px' }}>Assignment Task</th>
                    <th style={{ padding: '12px 16px' }}>Uploaded Answers</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Grade Rating</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => {
                    const isGraded = sub.points_earned !== null;
                    return (
                      <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600 }}>{sub.student_name}</td>
                        <td style={{ padding: '12px 16px' }}>{sub.assignment_title}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '240px', overflow: 'hidden' }}>
                            <span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{sub.submission_text}</span>
                            {sub.file_url && (
                              <a href={sub.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '11px', textDecoration: 'none' }}>
                                View Link
                              </a>
                            )}
                          </div>
                        </td>
                        
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {isGraded ? (
                            <span className="badge badge-success">{sub.points_earned} / {sub.max_points}</span>
                          ) : (
                            <span className="badge badge-student" style={{ color: 'var(--color-warning)', backgroundColor: 'var(--color-warning-bg)' }}>Awaiting Grade</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button 
                            onClick={() => {
                              setGradingSubmissionId(sub.id);
                              setGradePoints(sub.points_earned || sub.max_points);
                              setGradeFeedback(sub.feedback || '');
                            }}
                            className="btn btn-primary btn-small"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            {isGraded ? 'Edit Grade' : 'Grade Submission'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- ADD / EDIT SUBMISSION MODAL (STUDENT) --- */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', borderRadius: '16px', padding: '30px', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Upload Coursework Submission</h3>
            
            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label className="form-label">Written Answer Text</label>
                <textarea 
                  className="form-textarea" 
                  value={submissionText} 
                  onChange={(e) => setSubmissionText(e.target.value)} 
                  placeholder="Paste your essay responses, code snippet summaries, or answers here..." 
                  style={{ minHeight: '120px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">External Resource URL (Github repository / Google Doc Link / Image link)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={submissionUrl} 
                  onChange={(e) => setSubmissionUrl(e.target.value)} 
                  placeholder="e.g. https://github.com/your-username/react-lms" 
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowSubmitModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">File Submission</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- GRADING EVALUATION MODAL (INSTRUCTOR) --- */}
      {gradingSubmissionId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '30px', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Evaluate Student Coursework</h3>
            
            <form onSubmit={handleGradeSubmit}>
              <div className="form-group">
                <label className="form-label">Points Awarded</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={gradePoints} 
                  onChange={(e) => setGradePoints(e.target.value)} 
                  min="0"
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Written Feedback Review</label>
                <textarea 
                  className="form-textarea" 
                  value={gradeFeedback} 
                  onChange={(e) => setGradeFeedback(e.target.value)} 
                  placeholder="e.g. Great code structures! Double check React useEffect cleanups..." 
                  style={{ minHeight: '100px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setGradingSubmissionId(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Evaluation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE ASSIGNMENT MODAL (INSTRUCTOR) --- */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', padding: '30px', backgroundColor: 'var(--bg-secondary)', overflowY: 'auto', maxHeight: '90vh' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Create Assignment Guidelines</h3>
            
            <form onSubmit={handleCreateAssignment}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Target Section Module *</label>
                  <select className="form-select" value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} required>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Points Weight *</label>
                  <input type="number" className="form-input" value={assignMaxPoints} onChange={(e) => setAssignMaxPoints(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Build a Responsive Grid Layout" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} required />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Instructions Description</label>
                <textarea className="form-textarea" placeholder="Describe the coursework requirements, deliverables, and guidelines..." value={assignDesc} onChange={(e) => setAssignDesc(e.target.value)} style={{ minHeight: '120px' }} />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT ASSIGNMENT MODAL (INSTRUCTOR) --- */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', padding: '30px', backgroundColor: 'var(--bg-secondary)', overflowY: 'auto', maxHeight: '90vh' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Edit Assignment Guidelines</h3>
            
            <form onSubmit={handleEditAssignmentSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Target Section Module *</label>
                  <select className="form-select" value={selectedSectionId} disabled style={{ opacity: 0.6 }}>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Points Weight *</label>
                  <input type="number" className="form-input" value={assignMaxPoints} onChange={(e) => setAssignMaxPoints(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Build a Responsive Grid Layout" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} required />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Instructions Description</label>
                <textarea className="form-textarea" placeholder="Describe the coursework requirements, deliverables, and guidelines..." value={assignDesc} onChange={(e) => setAssignDesc(e.target.value)} style={{ minHeight: '120px' }} />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => {
                  setShowEditModal(false);
                  setAssignTitle('');
                  setAssignDesc('');
                }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
