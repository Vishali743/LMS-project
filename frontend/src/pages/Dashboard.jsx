import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { BookOpen, Award, Layers, Users, PlusCircle, Layout } from 'lucide-react';

export default function Dashboard() {
  const { dbUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isInstructor = dbUser?.role === 'instructor';

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        if (isInstructor) {
          // Fetch courses created by this instructor
          const response = await api.get('/courses/instructor/me');
          setCourses(response.data?.courses || []);
        } else {
          // Fetch courses enrolled by this student
          const response = await api.get('/enrollments/my');
          setCourses(response.data?.enrollments || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    if (dbUser) {
      loadDashboardData();
    }
  }, [dbUser, isInstructor]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Calculate statistics
  const totalCourses = courses.length;
  const completedCourses = isInstructor 
    ? 0 
    : courses.filter(c => c.completed_at !== null).length;
    
  const totalStudentsEnrolled = isInstructor 
    ? courses.reduce((acc, c) => acc + (c.student_count || 0), 0)
    : 0;

  return (
    <div className="container-wide">
      {/* Welcome Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
            Hello, <span className="text-gradient">{dbUser?.display_name || 'Scholar'}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isInstructor 
              ? 'Manage your content, view student enrollments, and check quizzes.' 
              : 'Track your education modules and resume your active classes.'}
          </p>
        </div>
        
        {isInstructor && (
          <Link to="/courses/new" className="btn btn-primary">
            <PlusCircle size={18} />
            Create New Course
          </Link>
        )}
      </div>

      {/* Stats Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '12px', borderRadius: '12px' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isInstructor ? 'Active Courses' : 'Enrolled Courses'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Outfit' }}>{totalCourses}</div>
          </div>
        </div>

        {!isInstructor && (
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '12px', borderRadius: '12px' }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Completed Courses
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Outfit' }}>{completedCourses}</div>
            </div>
          </div>
        )}

        {isInstructor && (
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '12px', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Students
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Outfit' }}>{totalStudentsEnrolled}</div>
            </div>
          </div>
        )}
      </div>

      {/* Courses Area */}
      <div>
        <h2 style={{ fontSize: '22px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={20} className="text-gradient" />
          {isInstructor ? 'Courses You Teach' : 'Your Learning Portal'}
        </h2>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {courses.length === 0 ? (
          <div className="glass-panel" style={{
            padding: '48px',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px dashed var(--glass-border)'
          }}>
            <Layout size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No courses to display</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              {isInstructor 
                ? 'Create a course, establish lessons/modules, and share it with students.' 
                : 'Browse the course catalog and enroll in software, design, or marketing modules.'}
            </p>
            {isInstructor ? (
              <Link to="/courses/new" className="btn btn-primary">
                Create Your First Course
              </Link>
            ) : (
              <Link to="/" className="btn btn-primary">
                Browse Courses Catalog
              </Link>
            )}
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <CourseCard 
                key={course.course_id || course.id} 
                course={course} 
                viewType={isInstructor ? 'instructor' : 'student'} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
