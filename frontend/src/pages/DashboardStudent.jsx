import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { 
  BookOpen, Award, Layers, Search, LayoutGrid, CheckCircle, 
  TrendingUp, PlayCircle, Star, Calendar, CheckSquare, Clock
} from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function DashboardStudent() {
  const { dbUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dashboard logs and notifications
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  
  // Accumulated student progress stats
  const [overallStats, setOverallStats] = useState({
    completedLessons: 0,
    totalLessons: 0,
    completedQuizzes: 0,
    totalQuizzes: 0,
    completedAssignments: 0,
    totalAssignments: 0,
    currentWeek: 1
  });

  const [assignmentStats, setAssignmentStats] = useState({
    upcoming: 0,
    overdue: 0,
    submitted: 0,
    pending: 0,
    avgMarks: 85,
    feedbackLogs: 0,
    totalCount: 3
  });

  useEffect(() => {
    if (!dbUser) return;

    const isMockConfig = !import.meta.env.VITE_FIREBASE_API_KEY || 
                          import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' ||
                          import.meta.env.VITE_FIREBASE_API_KEY.includes('your_');

    let unsubscribeNotif = null;
    let unsubscribeAct = null;
    let unsubscribeEnrollments = null;

    if (!isMockConfig && dbUser.firebase_uid && !dbUser.firebase_uid.startsWith('mock-')) {
      // 1. Listen to real-time notifications
      const notifQuery = query(
        collection(db, 'notifications'),
        where('user_id', '==', dbUser.firebase_uid),
        orderBy('created_at', 'desc')
      );
      unsubscribeNotif = onSnapshot(notifQuery, (snapshot) => {
        const list = [];
        snapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setNotifications(list.slice(0, 5));
      }, (err) => {
        console.error('Failed to listen to notifications:', err);
      });

      // 2. Listen to real-time activities
      const actQuery = query(
        collection(db, 'recent_activities'),
        where('user_id', '==', dbUser.firebase_uid),
        orderBy('created_at', 'desc')
      );
      unsubscribeAct = onSnapshot(actQuery, (snapshot) => {
        const list = [];
        snapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setActivities(list);
      }, (err) => {
        console.error('Failed to listen to activities:', err);
      });

      // 3. Listen to enrollments & assignments reminders
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('student_id', '==', dbUser.firebase_uid)
      );
      unsubscribeEnrollments = onSnapshot(enrollmentsQuery, (snapshot) => {
        const courseIds = [];
        snapshot.forEach(d => {
          courseIds.push(d.data().course_id);
        });

        if (courseIds.length > 0) {
          const assignQuery = query(
            collection(db, 'assignments'),
            orderBy('due_date', 'asc')
          );
          onSnapshot(assignQuery, (assignSnapshot) => {
            const list = [];
            assignSnapshot.forEach(doc => {
              const data = doc.data();
              if (courseIds.includes(data.course_id)) {
                list.push({
                  id: doc.id,
                  title: data.title,
                  due_date: data.due_date,
                  course_title: data.course_title || 'Course Core Modules',
                  section_title: data.section_title || 'General Module'
                });
              }
            });
            setReminders(list.slice(0, 5));
          });
        }
      });
    }

    async function loadEnrollments() {
      try {
        setLoading(true);
        
        // If in mock config, populate notifications, activities and reminders from API
        if (isMockConfig || !dbUser.firebase_uid || dbUser.firebase_uid.startsWith('mock-')) {
          const dashboardRes = await api.get('/dashboard/student');
          const dData = dashboardRes.data || {};
          setActivities(dData.activities || []);
          setNotifications(dData.notifications || []);
          setReminders(dData.reminders || []);
        }

        const response = await api.get('/enrollments/my');
        const list = response.data.enrollments || [];
        setEnrollments(list);

        // Fetch detailed progress stats for each enrolled course
        let compLessons = 0, totLessons = 0, compQuizzes = 0, totQuizzes = 0, compAss = 0, totAss = 0;
        let activeW = 1;

        let totalPointsEarned = 0;
        let gradedCount = 0;
        let submitted = 0;
        let pending = 0;
        let feedbackLogs = 0;
        let totalAssCount = 0;

        for (const item of list) {
          try {
            const pRes = await api.get(`/progress/course/${item.course_id}`);
            const pData = pRes.data;
            
            compLessons += pData.stats?.completedLessons || 0;
            totLessons += pData.stats?.totalLessons || 0;
            compQuizzes += pData.stats?.completedQuizzesCount || 0;
            totQuizzes += pData.stats?.totalQuizzesCount || 0;
            compAss += pData.stats?.completedAssignmentsCount || 0;
            totAss += pData.stats?.totalAssignmentsCount || 0;

            const aRes = await api.get(`/assignments/course/${item.course_id}/my`);
            const subList = aRes.data.submissions || [];
            totalAssCount += subList.length;

            subList.forEach(sub => {
              if (sub.is_draft) {
                pending++;
              } else if (sub.points_earned !== null) {
                submitted++;
                totalPointsEarned += sub.points_earned;
                gradedCount++;
                feedbackLogs++;
              } else {
                submitted++;
              }
            });
          } catch (pErr) {
            console.error('Failed to load details for course:', item.course_id, pErr);
          }
        }

        setOverallStats({
          completedLessons: compLessons,
          totalLessons: totLessons || 9,
          completedQuizzes: compQuizzes,
          totalQuizzes: totQuizzes || 3,
          completedAssignments: compAss,
          totalAssignments: totAss || 3,
          currentWeek: activeW
        });

        setAssignmentStats({
          submitted,
          pending,
          avgMarks: gradedCount > 0 ? Math.round((totalPointsEarned / (gradedCount * 100)) * 100) : 85,
          feedbackLogs,
          totalCount: totalAssCount
        });

      } catch (err) {
        console.error(err);
        setError('Failed to load enrolled courses.');
      } finally {
        setLoading(false);
      }
    }

    loadEnrollments();

    return () => {
      if (unsubscribeNotif) unsubscribeNotif();
      if (unsubscribeAct) unsubscribeAct();
      if (unsubscribeEnrollments) unsubscribeEnrollments();
    };
  }, [dbUser]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const completedCourses = enrollments.filter(e => e.completed_at !== null);

  // Overall progress percentage
  const totalTasks = overallStats.totalLessons + overallStats.totalQuizzes + overallStats.totalAssignments;
  const completedTasks = overallStats.completedLessons + overallStats.completedQuizzes + overallStats.completedAssignments;
  const overallProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Circular progress dimensions
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgressPercent / 100) * circumference;

  return (
    <div className="container-wide" style={{ paddingBottom: '60px' }}>
      
      {/* Greeting Header */}
      <div style={{ marginBottom: '40px' }}>
        <span className="badge badge-student" style={{ marginBottom: 10 }}>STUDENT CONSOLE</span>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          Welcome back, <span className="text-gradient">{dbUser?.display_name || 'Scholar'}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track week-by-week unlocking syllabus parameters, submit weekly assignments, and check grades.</p>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', marginBottom: '40px' }}>
        
        {/* Left Column (Profile & Circular Progress) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Student Profile Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: 0, textAlign: 'left' }}>Student Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Student ID</span>
                <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '14px', fontFamily: 'Courier New, monospace' }}>
                  {dbUser?.student_code || 'STU-PENDING'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Email Address</span>
                <div style={{ color: '#fff', wordBreak: 'break-all' }}>{dbUser?.email || 'N/A'}</div>
              </div>
              {dbUser?.specialization && (
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Specialization</span>
                  <div style={{ color: '#fff' }}>{dbUser.specialization}</div>
                </div>
              )}
              {dbUser?.learning_goals && (
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Learning Goals</span>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{dbUser.learning_goals}</div>
                </div>
              )}
            </div>
          </div>

          {/* Left Circular Ring Panel */}
          <div className="glass-panel" style={{ padding: '30px 24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: 24 }}>Overall Syllabus Progress</h3>
          
          <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: 24 }}>
            <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
              {/* Back Ring */}
              <circle 
                cx="65" cy="65" r={radius} 
                fill="transparent" 
                stroke="rgba(255,255,255,0.02)" 
                strokeWidth="8" 
              />
              {/* Active Ring */}
              <circle 
                cx="65" cy="65" r={radius} 
                fill="transparent" 
                stroke="url(#progressRingGrad)" 
                strokeWidth="8" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <defs>
                <linearGradient id="progressRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="var(--accent-secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '22px',
              fontWeight: 800,
              fontFamily: 'Outfit',
              color: '#fff'
            }}>
              {overallProgressPercent}%
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', borderTop: '1px solid var(--glass-border)', paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Active Week:</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>Week {overallStats.currentWeek}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Completed Lectures:</span>
              <span style={{ color: '#fff' }}>{overallStats.completedLessons} / {overallStats.totalLessons}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Completed Quizzes:</span>
              <span style={{ color: '#fff' }}>{overallStats.completedQuizzes} / {overallStats.totalQuizzes}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Completed Assignments:</span>
              <span style={{ color: '#fff' }}>{overallStats.completedAssignments} / {overallStats.totalAssignments}</span>
            </div>
          </div>

          {enrollments.length > 0 && (
            <Link 
              to={`/courses/${enrollments[0].course_id}/play`}
              className="btn btn-primary btn-small"
              style={{ width: '100%', marginTop: 24, textDecoration: 'none', display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}
            >
              <PlayCircle size={14} /> Continue Learning
            </Link>
          )}
        </div>
        </div>
 
        {/* Right Dashboard Checklist Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Quick Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            <Link to="/dashboard/my-courses" className="glass-panel feature-card" style={{ padding: '20px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '10px', borderRadius: '10px' }}>
                <Layers size={20} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>My Courses</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{enrollments.length}</div>
              </div>
            </Link>

            <Link to="/dashboard/certificates" className="glass-panel feature-card" style={{ padding: '20px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '10px', borderRadius: '10px' }}>
                <Award size={20} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Certificates</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{completedCourses.length}</div>
              </div>
            </Link>

            <Link to="/dashboard/analytics" className="glass-panel feature-card" style={{ padding: '20px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '10px', borderRadius: '10px' }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Analytics</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: 2 }}>View Stats →</div>
              </div>
            </Link>
          </div>

          {/* Remaining Tasks Checklist Card */}
          <div className="glass-panel" style={{ padding: '24px 30px', borderRadius: '20px', flex: 1 }}>
            <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
              Remaining Weekly Checklist Tasks
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                {overallStats.completedLessons === overallStats.totalLessons ? (
                  <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                ) : (
                  <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                )}
                <div>
                  <h4 style={{ fontSize: '13px', color: '#fff' }}>Lecture Video Playlists</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {overallStats.totalLessons - overallStats.completedLessons} lectures remaining to be completed.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                {overallStats.completedQuizzes === overallStats.totalQuizzes ? (
                  <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                ) : (
                  <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                )}
                <div>
                  <h4 style={{ fontSize: '13px', color: '#fff' }}>Assessments & Quizzes</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {overallStats.totalQuizzes - overallStats.completedQuizzes} quizzes remaining to clear passing parameters.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                {overallStats.completedAssignments === overallStats.totalAssignments ? (
                  <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                ) : (
                  <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                )}
                <div>
                  <h4 style={{ fontSize: '13px', color: '#fff' }}>Weekly Assignments Submissions</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {overallStats.totalAssignments - overallStats.completedAssignments} assignment deliverables pending submit guidelines.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Status Monitor Card */}
          <div className="glass-panel" style={{ padding: '24px 30px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
              Assignment Performance Monitor
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Upcoming</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{assignmentStats.upcoming}</div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Overdue</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-error)' }}>{assignmentStats.overdue}</div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Submitted</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-success)' }}>{assignmentStats.submitted}</div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Pending Review</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{assignmentStats.pending}</div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Avg Score</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{assignmentStats.avgMarks}%</div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Feedback Received</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{assignmentStats.feedbackLogs}</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Notifications, Reminders & Activity Log Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        
        {/* Unread Notifications Panel */}
        <div className="glass-panel" style={{ padding: '24px 30px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '6px', borderRadius: '8px', display: 'inline-flex' }}>
              <Clock size={16} />
            </span>
            Recent Notifications
          </h3>
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No notifications found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
              {notifications.slice(0, 5).map(n => (
                <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: n.read ? 'var(--text-secondary)' : '#fff', fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assignment Reminders & Due Dates */}
        <div className="glass-panel" style={{ padding: '24px 30px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '6px', borderRadius: '8px', display: 'inline-flex' }}>
              <Calendar size={16} />
            </span>
            Assignment Deadlines
          </h3>
          {reminders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No upcoming deadlines.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
              {reminders.map(rem => (
                <div key={rem.id} style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{rem.course_title}</span>
                    <span style={{ color: '#f59e0b' }}>Due: {new Date(rem.due_date).toLocaleDateString()}</span>
                  </div>
                  <h4 style={{ fontSize: '13px', color: '#fff', margin: 0 }}>{rem.title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Log */}
        <div className="glass-panel" style={{ padding: '24px 30px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '6px', borderRadius: '8px', display: 'inline-flex' }}>
              <TrendingUp size={16} />
            </span>
            Recent Activities
          </h3>
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No activity logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
              {activities.map(act => (
                <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{act.description}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(act.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Enrolled courses listing */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={20} className="text-gradient" />
          Active Courses
        </h2>

        {error && <div className="alert alert-error">{error}</div>}

        {enrollments.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
            <LayoutGrid size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <h3 style={{ fontSize: '16px', marginBottom: 6 }}>No active enrollments</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 20 }}>Visit our courses directory to find specialized topics.</p>
            <Link to="/courses" className="btn btn-primary btn-small">Browse Course Catalog</Link>
          </div>
        ) : (
          <div className="courses-grid">
            {enrollments.map(item => (
              <CourseCard key={item.course_id} course={item} viewType="student" />
            ))}
          </div>
        )}
      </div>

      {/* Certificates Section */}
      {completedCourses.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Award size={20} style={{ color: 'var(--color-success)' }} />
            Earned Certificates
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {completedCourses.map(item => (
              <div key={item.course_id} className="glass-panel" style={{
                padding: '20px 24px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Award size={28} style={{ color: 'var(--color-success)' }} />
                  <div>
                    <h4 style={{ fontSize: '16px', color: '#fff' }}>{item.title} Certification</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completed on {new Date(item.completed_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <Link 
                  to={`/certificates/${item.course_id}`} 
                  className="btn btn-primary btn-small"
                  style={{ textDecoration: 'none' }}
                >
                  View Certificate Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
