import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { 
  BookOpen, Users, PlusCircle, LayoutList, Award, 
  AlertCircle, DollarSign, Star, ShieldCheck, CheckCircle,
  FileText, CheckSquare, Clock, Send, BarChart2, X
} from 'lucide-react';

export default function DashboardTeacher() {
  const { dbUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [scholars, setScholars] = useState([]);
  
  // Grading queue state
  const [pendingQueue, setPendingQueue] = useState([]);
  const [gradedCount, setGradedCount] = useState(0);
  const [avgAssScore, setAvgAssScore] = useState(88);
  const [avgQuizScore, setAvgQuizScore] = useState(85);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected student progress details modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Grading form state
  const [gradingAssId, setGradingAssId] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch authored courses
      try {
        const courseRes = await api.get('/courses/instructor/me');
        const courseList = courseRes.data?.courses || [];
        setCourses(courseList);
      } catch (err) {
        console.warn('Instructor courses fetch warning:', err.message);
      }

      // 2. Fetch enrolled scholars
      let scholarsList = [];
      try {
        const scholarsRes = await api.get('/courses/instructor/students');
        scholarsList = scholarsRes.data?.students || [];
        setScholars(scholarsList);
      } catch (err) {
        console.warn('Instructor scholars fetch warning:', err.message);
      }

      // 3. Fetch submissions for all instructor courses
      try {
        const allSubsRes = await api.get('/assignments/instructor/all-submissions');
        const subs = allSubsRes.data?.submissions || [];
        
        let pending = [];
        let graded = [];
        let totalAssScore = 0;

        subs.forEach(s => {
          if (s.graded_at) {
            graded.push(s);
            totalAssScore += s.points_earned;
          } else {
            pending.push(s);
          }
        });

        setPendingQueue(pending);
        setGradedCount(graded.length);
        
        if (graded.length > 0) {
          setAvgAssScore(Math.round(totalAssScore / graded.length));
        }
      } catch (err) {
        console.warn('Instructor submissions fetch warning:', err.message);
      }

      if (scholarsList.length > 0) {
        const quizScores = scholarsList.map(s => s.quiz_score || 0);
        const validQuizzes = quizScores.filter(s => s > 0);
        if (validQuizzes.length > 0) {
          setAvgQuizScore(Math.round(validQuizzes.reduce((a, b) => a + b, 0) / validQuizzes.length));
        }
      }
    } catch (err) {
      console.error('Error loading instructor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dbUser) {
      loadDashboardData();
    }
  }, [dbUser]);

  const handleGradeSubmission = async (submissionId) => {
    if (!gradeInput) return;
    try {
      setSubmittingGrade(true);
      await api.put(`/assignments/submission/${submissionId}/grade`, {
        pointsEarned: parseInt(gradeInput),
        feedback: feedbackInput
      });
      
      setSuccess('✓ Grade assigned successfully!');
      setGradingAssId(null);
      setGradeInput('');
      setFeedbackInput('');
      
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      setError('Failed to grade assignment submission.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const totalStudents = courses.reduce((sum, c) => sum + (c.student_count || 0), 0);
  const publishedCourses = courses.filter(c => c.is_published === 1 || c.is_published === true).length;
  const totalRevenue = courses.reduce((sum, c) => sum + (c.student_count || 0) * parseFloat(c.price || 0), 0);
  const avgRating = courses.length > 0 
    ? (courses.reduce((sum, c) => sum + parseFloat(c.rating_avg || 4.5), 0) / courses.length).toFixed(1)
    : '4.5';

  return (
    <div className="container-wide" style={{ paddingBottom: '80px' }}>
      
      {/* Header banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <span className="badge badge-instructor" style={{ marginBottom: 10 }}>INSTRUCTOR CONSOLE</span>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
            Instructor Dashboard — <span className="text-gradient">{dbUser?.display_name}</span> 🖥️
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Publish lectures, review weekly student submissions, and manage grading marks sheets.</p>
        </div>

        <Link to="/courses/new" className="btn btn-primary" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <PlusCircle size={18} />
          Create New Course
        </Link>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: 24 }}>{success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}><AlertCircle size={16} /><span>{error}</span></div>}

      {/* Primary Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        
        {/* Card 1: Enrolled Scholars */}
        <Link to="/instructor/students" className="glass-panel feature-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '12px', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Enrolled Scholars</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{totalStudents}</div>
          </div>
        </Link>

        {/* Card 2: Pending Assignments */}
        <Link to="/instructor/assignments?tab=pending" className="glass-panel feature-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ backgroundColor: 'rgba(255, 51, 68, 0.1)', color: 'var(--accent-primary)', padding: '12px', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pending Assignments</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{pendingQueue.length}</div>
          </div>
        </Link>

        {/* Card 3: Graded Submissions */}
        <Link to="/instructor/assignments?tab=graded" className="glass-panel feature-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Graded Submissions</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{gradedCount}</div>
          </div>
        </Link>

        {/* Card 4: Avg Quiz Score */}
        <Link to="/instructor/analytics?tab=quizzes" className="glass-panel feature-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '12px', borderRadius: '12px' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg Quiz Score</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{avgQuizScore}%</div>
          </div>
        </Link>

        {/* Card 5: Avg Assignment Score */}
        <Link to="/instructor/analytics?tab=assignments" className="glass-panel feature-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '12px', borderRadius: '12px' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg Assignment Score</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{avgAssScore}%</div>
          </div>
        </Link>

      </div>

      {/* Main Sections Row: Grading Queue & Scholars Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px', flexWrap: 'wrap' }}>
        
        {/* Grading Queue Card */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
            Pending Weekly Assignments Grading Queue
          </h3>

          {pendingQueue.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No submissions pending review.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pendingQueue.map(sub => (
                <div key={sub.id} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{sub.student_name || 'Scholar'}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    Task: <strong>{sub.assignment_title || 'Weekly Assignment'}</strong>
                  </div>
                  
                  {sub.file_url && (
                    <div style={{ marginBottom: 12 }}>
                      <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-small" style={{ display: 'inline-flex', gap: 6, textDecoration: 'none' }}>
                        Download Attachment
                      </a>
                    </div>
                  )}

                  {gradingAssId === sub.id ? (
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Grade (0-100)" 
                          value={gradeInput}
                          onChange={(e) => setGradeInput(e.target.value)}
                          style={{ width: '120px' }}
                        />
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Feedback comments..." 
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => setGradingAssId(null)} className="btn btn-secondary btn-small">Cancel</button>
                        <button onClick={() => handleGradeSubmission(sub.id)} className="btn btn-primary btn-small" disabled={submittingGrade}>
                          Submit Grade
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setGradingAssId(sub.id); setGradeInput(''); setFeedbackInput(''); }} className="btn btn-primary btn-small">
                      Grade Deliverable
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Class Progress Card */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} style={{ color: 'var(--accent-primary)' }} />
            Students Syllabus Progress List
          </h3>

          {scholars.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No scholars enrolled yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {scholars.slice(0, 5).map((student, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedStudent(student)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 8, 
                    padding: '12px 14px', 
                    borderRadius: '10px', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{student.student_name}</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{student.course_progress || 0}% Progress</span>
                  </div>
                  <div className="progress-bar-container" style={{ margin: 0, height: '4px' }}>
                    <div className="progress-bar-fill" style={{ width: `${student.course_progress || 0}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>Course: {student.course_title}</span>
                    <span>Quiz Avg: {student.quiz_score || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Authored Courses grid */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={20} className="text-gradient" />
          Authored Modules
        </h2>

        {courses.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--glass-border)', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '16px', marginBottom: 6 }}>No courses created yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 20 }}>Launch a new online curriculum syllabus to start teaching.</p>
            <Link to="/courses/new" className="btn btn-primary btn-small">Create Course</Link>
          </div>
        ) : (
          <div className="courses-grid" style={{ marginTop: 0 }}>
            {courses.map(course => (
              <CourseCard key={course.id} course={course} viewType="instructor" />
            ))}
          </div>
        )}
      </div>

      {/* Student Progress Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay" style={{ zIndex: 2000 }} onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedStudent(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: 6, fontFamily: 'Outfit' }}>
              {selectedStudent.student_name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Email: {selectedStudent.student_email || 'scholar@skeinlms.com'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Enrolled Course:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{selectedStudent.course_title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Overall Progress:</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{selectedStudent.progress || selectedStudent.course_progress || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Syllabus Week:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>Week {selectedStudent.current_week || 1}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Completed Lectures:</span>
                <span style={{ color: '#fff' }}>{selectedStudent.completed_lessons || 0} / {selectedStudent.total_lessons || 9}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Completed Quizzes:</span>
                <span style={{ color: '#fff' }}>{selectedStudent.completed_quizzes || 0} / {selectedStudent.total_quizzes || 3}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Completed Assignments:</span>
                <span style={{ color: '#fff' }}>{selectedStudent.completed_assignments || 0} / {selectedStudent.total_assignments || 3}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Quiz Average Score:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{selectedStudent.quiz_score || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Enrollment Date:</span>
                <span style={{ color: '#fff' }}>{new Date(selectedStudent.enrolled_at || Date.now()).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last Active Time:</span>
                <span style={{ color: '#fff' }}>{selectedStudent.last_active || 'Today'}</span>
              </div>
            </div>

            <button onClick={() => setSelectedStudent(null)} className="btn btn-secondary btn-small" style={{ width: '100%', marginTop: 24 }}>
              Dismiss Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
