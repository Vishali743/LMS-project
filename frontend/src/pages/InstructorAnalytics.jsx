import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, Loader2, Award, FileText, CheckCircle2, 
  HelpCircle, AlertCircle, TrendingUp, BarChart2, Star, Users 
} from 'lucide-react';

export default function InstructorAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'quizzes'; // 'quizzes' or 'assignments'

  const [courses, setCourses] = useState([]);
  const [scholars, setScholars] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Authored courses
      let courseList = [];
      try {
        const courseRes = await api.get('/courses/instructor/me');
        courseList = courseRes.data?.courses || [];
        setCourses(courseList);
      } catch (err) {
        console.warn('Courses load warning:', err.message);
      }

      // 2. Scholars progress
      try {
        const scholarsRes = await api.get('/courses/instructor/students');
        setScholars(scholarsRes.data?.students || []);
      } catch (err) {
        console.warn('Scholars load warning:', err.message);
      }

      // 3. Instructor Submissions (batch endpoint with loop fallback)
      try {
        const allSubsRes = await api.get('/assignments/instructor/all-submissions');
        setSubmissions(allSubsRes.data?.submissions || []);
      } catch (err) {
        console.warn('Batch submissions load warning, trying per-course fallback:', err.message);
        let allSubs = [];
        for (const c of courseList) {
          try {
            const subRes = await api.get(`/assignments/course/${c.id}/submissions`);
            allSubs = allSubs.concat(subRes.data?.submissions || []);
          } catch (subErr) {
            console.warn('Submissions load warning for course:', c.id);
          }
        }
        setSubmissions(allSubs);
      }

    } catch (err) {
      console.error('Error loading instructor analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // --- 1. Quiz Analytics Computations ---
  const quizScores = scholars.map(s => s.quiz_score || 0).filter(s => s > 0);
  const quizAvg = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 85;
  const quizMax = quizScores.length > 0 ? Math.max(...quizScores) : 100;
  const quizMin = quizScores.length > 0 ? Math.min(...quizScores) : 60;
  const quizPassCount = quizScores.filter(s => s >= 70).length;
  const quizPassPercent = quizScores.length > 0 ? Math.round((quizPassCount / quizScores.length) * 100) : 100;

  // Mock quiz question analysis data
  const questionAnalysis = [
    { text: 'Which design pattern is core for connection pooling?', rate: 92, category: 'Database Systems' },
    { text: 'What is the correct command for staging git index edits?', rate: 85, category: 'Version Control' },
    { text: 'True/False: Redux states can be mutated in pure selectors.', rate: 76, category: 'State Management' },
  ];

  // --- 2. Assignment Analytics Computations ---
  const gradedSubs = submissions.filter(s => s.graded_at !== null);
  const assScores = gradedSubs.map(s => s.points_earned || 0);
  const assAvg = assScores.length > 0 ? Math.round(assScores.reduce((a, b) => a + b, 0) / assScores.length) : 88;
  const assMax = assScores.length > 0 ? Math.max(...assScores) : 100;
  const assMin = assScores.length > 0 ? Math.min(...assScores) : 60;
  const pendingGradingCount = submissions.filter(s => s.graded_at === null).length;

  // Chart data
  const linePoints = [
    { x: 30, y: 150, val: 65 },
    { x: 110, y: 120, val: 78 },
    { x: 190, y: 90, val: 85 },
    { x: 270, y: 110, val: 72 },
    { x: 350, y: 60, val: 94 }
  ];

  return (
    <div className="container-wide" style={{ paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '30px', color: '#fff' }}>Curriculum Analytics Center</h1>
        </div>

        {/* Tab Toggle buttons */}
        <div className="glass-panel" style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10 }}>
          <button
            onClick={() => setSearchParams({ tab: 'quizzes' })}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'quizzes' ? 'var(--accent-primary)' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Quizzes Analytics
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'assignments' })}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'assignments' ? 'var(--accent-primary)' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Assignments Analytics
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      {activeTab === 'quizzes' ? (
        // --- QUIZ PERFORMANCE VIEW ---
        <div>
          {/* Quick stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Average Quiz Score</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{quizAvg}%</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Highest Score</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)' }}>{quizMax}%</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Lowest Score</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-error)' }}>{quizMin}%</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Pass Percentage</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{quizPassPercent}%</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
            {/* Score Chart */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
                Quiz Score Distribution Chart
              </h3>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
                <svg width="400" height="200" style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '10px' }}>
                  <line x1="20" y1="40" x2="380" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="20" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="20" y1="160" x2="380" y2="160" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  <line x1="20" y1="180" x2="380" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

                  {/* Draw scores line */}
                  {linePoints.map((p, idx) => {
                    if (idx === linePoints.length - 1) return null;
                    const next = linePoints[idx + 1];
                    return (
                      <line 
                        key={idx}
                        x1={p.x} y1={200 - (p.val * 1.6)}
                        x2={next.x} y2={200 - (next.val * 1.6)}
                        stroke="var(--accent-primary)"
                        strokeWidth="2.5"
                      />
                    );
                  })}

                  {/* Circles */}
                  {linePoints.map((p, idx) => (
                    <g key={idx}>
                      <circle 
                        cx={p.x} cy={200 - (p.val * 1.6)} r="4.5"
                        fill="#fff" stroke="var(--accent-primary)" strokeWidth="2"
                      />
                      <text 
                        x={p.x} y={185 - (p.val * 1.6)}
                        fill="var(--text-secondary)" fontSize="9" fontWeight="bold" textAnchor="middle"
                      >
                        {p.val}%
                      </text>
                      <text x={p.x} y="194" fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                        Module {idx + 1}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Question-wise analysis */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: 20 }}>
                Question-Wise Clear Analysis
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {questionAnalysis.map((q, idx) => (
                  <div key={idx} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{q.category}</span>
                      <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{q.rate}% Pass Rate</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#fff', lineHeight: 1.4 }}>{q.text}</p>
                    <div className="progress-bar-container" style={{ margin: '8px 0 0 0', height: '4px' }}>
                      <div className="progress-bar-fill" style={{ width: `${q.rate}%`, backgroundColor: 'var(--color-success)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // --- ASSIGNMENT PERFORMANCE VIEW ---
        <div>
          {/* Quick stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Average Marks</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{assAvg}%</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Highest Marks</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)' }}>{assMax}%</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Lowest Marks</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-error)' }}>{assMin}%</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Pending Review</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{pendingGradingCount} tasks</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
            {/* Submission trends chart */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart2 size={16} style={{ color: 'var(--accent-primary)' }} />
                Weekly Submissions Performance
              </h3>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
                <svg width="400" height="200" style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '10px' }}>
                  <line x1="20" y1="40" x2="380" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="20" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="20" y1="160" x2="380" y2="160" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  <line x1="20" y1="180" x2="380" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

                  {/* Draw bars */}
                  {[
                    { x: 40, h: 110, label: 'Week 1', val: 75 },
                    { x: 120, h: 130, label: 'Week 2', val: 88 },
                    { x: 200, h: 140, label: 'Week 3', val: 95 },
                    { x: 280, h: 90, label: 'Week 4', val: 60 },
                    { x: 360, h: 120, label: 'Week 5', val: 82 }
                  ].map((bar, idx) => (
                    <g key={idx}>
                      <rect 
                        x={bar.x} y={180 - bar.h} width="28" height={bar.h}
                        fill="url(#assBarGrad)" rx="3"
                      />
                      <text 
                        x={bar.x + 14} y={170 - bar.h}
                        fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle"
                      >
                        {bar.val}%
                      </text>
                      <text x={bar.x + 14} y="194" fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                        {bar.label}
                      </text>
                    </g>
                  ))}

                  <defs>
                    <linearGradient id="assBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-primary)" />
                      <stop offset="100%" stopColor="var(--accent-secondary)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* General metrics */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: 20 }}>
                Grading Completion Stats
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Graded Weekly Assignments:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{gradedSubs.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pending Weekly Submissions:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{pendingGradingCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Submissions Count:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{submissions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
