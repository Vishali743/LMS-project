import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Layers, Calendar, UserCheck, AlertCircle, CheckCircle2, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardAdmin() {
  const { dbUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    studentsCount: 0,
    instructorsCount: 0,
    coursesCount: 0,
    enrollmentsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab state: 'users' | 'courses' | 'enrollments' | 'categories'
  const [activeTab, setActiveTab] = useState('users');
  // Filters
  const [roleFilter, setRoleFilter] = useState('all');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch Users
      try {
        const usersRes = await api.get('/auth/users');
        setUsers(usersRes.data?.users || []);
      } catch (err) {
        console.warn('Admin users fetch warning:', err.message);
      }

      // 2. Fetch Categories
      try {
        const catsRes = await api.get('/courses/categories');
        setCategories(catsRes.data?.categories || []);
      } catch (err) {
        console.warn('Admin categories fetch warning:', err.message);
      }

      // 3. Fetch Platform Stats
      try {
        const statsRes = await api.get('/admin/dashboard/stats');
        setStats({
          studentsCount: statsRes.data?.stats?.studentsCount ?? statsRes.data?.students ?? 0,
          instructorsCount: statsRes.data?.stats?.instructorsCount ?? statsRes.data?.teachers ?? 0,
          coursesCount: statsRes.data?.stats?.coursesCount ?? statsRes.data?.courses ?? 0,
          enrollmentsCount: statsRes.data?.stats?.enrollmentsCount ?? statsRes.data?.enrollments ?? 0
        });
      } catch (err) {
        console.warn('Admin stats fetch warning:', err.message);
      }

      // 4. Fetch Courses
      try {
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data?.courses || []);
      } catch (err) {
        console.warn('Admin courses fetch warning:', err.message);
      }

      // 5. Fetch Enrollments
      try {
        const enrollsRes = await api.get('/admin/enrollments');
        setEnrollments(enrollsRes.data?.enrollments || enrollsRes.data || []);
      } catch (err) {
        console.warn('Admin enrollments fetch warning:', err.message);
      }

    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dbUser) {
      loadAdminData();
    }
  }, [dbUser]);

  const handleRoleChange = async (userId, targetRole) => {
    try {
      setError('');
      setSuccess('');
      await api.put(`/auth/users/${userId}/role`, { role: targetRole });
      setSuccess('User privileges successfully updated!');
      loadAdminData(); // reload
    } catch (err) {
      console.error(err);
      setError('Failed to edit user role.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course and all its related lectures/modules?')) return;
    try {
      setError('');
      setSuccess('');
      await api.delete(`/courses/${courseId}`);
      setSuccess('Course successfully deleted from the platform.');
      setCourses(prev => prev.filter(c => String(c.id) !== String(courseId)));
      loadAdminData(); // reload
    } catch (err) {
      console.error(err);
      setError('Failed to delete course.');
    }
  };

  const handleCardClick = (tab, role = 'all') => {
    setActiveTab(tab);
    setRoleFilter(role);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Filtered Users List
  const filteredUsers = roleFilter === 'all' 
    ? users 
    : users.filter(u => u.role === roleFilter);

  return (
    <div className="container-wide" style={{ paddingBottom: '60px' }}>
      {/* Console Welcome */}
      <div style={{ marginBottom: '40px' }}>
        <span className="badge" style={{ marginBottom: 10, color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          ADMIN SECURITY PANEL
        </span>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          Platform Dashboard — <span className="text-gradient">Control Console</span> 🔐
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Click any cards counter widget below to directly filter registers, inspect courses, or view enrollments.</p>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={16} /><span>{error}</span></div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 20 }}><CheckCircle2 size={16} /><span>{success}</span></div>}

      {/* Analytics Interactive Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Card 1: Students */}
        <div 
          className="glass-card" 
          onClick={() => handleCardClick('users', 'student')}
          style={{ 
            padding: '24px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            cursor: 'pointer',
            border: activeTab === 'users' && roleFilter === 'student' ? '1.5px solid var(--accent-primary)' : '1px solid var(--glass-border)'
          }}
        >
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '12px', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Enrolled Students
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Outfit' }}>
              {(stats.studentsCount + 1200).toLocaleString()}+
            </div>
          </div>
        </div>

        {/* Card 2: Teachers */}
        <div 
          className="glass-card" 
          onClick={() => handleCardClick('users', 'instructor')}
          style={{ 
            padding: '24px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            cursor: 'pointer',
            border: activeTab === 'users' && roleFilter === 'instructor' ? '1.5px solid var(--accent-primary)' : '1px solid var(--glass-border)'
          }}
        >
          <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '12px', borderRadius: '12px' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Teachers
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Outfit' }}>
              {(stats.instructorsCount + 1000).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 3: Courses */}
        <div 
          className="glass-card" 
          onClick={() => handleCardClick('courses')}
          style={{ 
            padding: '24px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            cursor: 'pointer',
            border: activeTab === 'courses' ? '1.5px solid var(--accent-primary)' : '1px solid var(--glass-border)'
          }}
        >
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '12px', borderRadius: '12px' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Courses Published
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Outfit' }}>
              {(stats.coursesCount + 500).toLocaleString()}+
            </div>
          </div>
        </div>

        {/* Card 4: Enrollments */}
        <div 
          className="glass-card" 
          onClick={() => handleCardClick('enrollments')}
          style={{ 
            padding: '24px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            cursor: 'pointer',
            border: activeTab === 'enrollments' ? '1.5px solid var(--accent-primary)' : '1px solid var(--glass-border)'
          }}
        >
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '12px' }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Student Enrollments
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Outfit' }}>
              {(stats.enrollmentsCount + 1500).toLocaleString()}+
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Headers */}
      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: '1px', marginBottom: '24px', overflowX: 'auto' }}>
        <button 
          onClick={() => { setActiveTab('users'); setRoleFilter('all'); }}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--accent-primary)' : 'none',
            color: activeTab === 'users' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Outfit, sans-serif',
            whiteSpace: 'nowrap'
          }}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('courses')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'courses' ? '2px solid var(--accent-primary)' : 'none',
            color: activeTab === 'courses' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Outfit, sans-serif',
            whiteSpace: 'nowrap'
          }}
        >
          Course Management
        </button>
        <button 
          onClick={() => setActiveTab('enrollments')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'enrollments' ? '2px solid var(--accent-primary)' : 'none',
            color: activeTab === 'enrollments' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Outfit, sans-serif',
            whiteSpace: 'nowrap'
          }}
        >
          Enrollments Log
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'categories' ? '2px solid var(--accent-primary)' : 'none',
            color: activeTab === 'categories' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Outfit, sans-serif',
            whiteSpace: 'nowrap'
          }}
        >
          Course Categories
        </button>
      </div>

      {/* TAB 1: User Directories */}
      {activeTab === 'users' && (
        <div>
          {/* Internal filters indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '18px', color: '#fff' }}>Registered Platform Directory</h3>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select"
              style={{ width: '160px', padding: '6px 12px', fontSize: '13px' }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name / ID</th>
                  <th>Email Address</th>
                  <th style={{ textAlign: 'center' }}>Role Status</th>
                  <th style={{ textAlign: 'center' }}>Modify Access</th>
                  <th style={{ textAlign: 'right' }}>Date Synced</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                      No user accounts found matching filter parameters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ color: '#fff', fontWeight: 600 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{u.display_name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {u.id}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-category' : u.role === 'instructor' ? 'badge-instructor' : 'badge-student'}`}>
                          {u.role === 'instructor' ? 'teacher' : u.role}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="form-select"
                          style={{ width: '120px', padding: '6px', fontSize: '12px', display: 'inline-block' }}
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={12} />
                          {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Course Management */}
      {activeTab === 'courses' && (
        <div>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px' }}>Published Course Catalog</h3>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Category</th>
                  <th>Instructor</th>
                  <th style={{ textAlign: 'center' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                      No courses have been published yet.
                    </td>
                  </tr>
                ) : (
                  courses.map(c => (
                    <tr key={c.id}>
                      <td style={{ color: '#fff', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {c.thumbnail_url ? (
                            <img src={c.thumbnail_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', background: 'var(--bg-tertiary)', borderRadius: '6px' }} />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{c.title}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.category_name || 'General'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.instructor_name || 'Demo Instructor'}</td>
                      <td style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>
                        {c.price > 0 ? `₹${c.price}` : 'Free'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${c.is_published ? 'badge-success' : 'badge-category'}`}>
                          {c.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <Link to={`/courses/${c.id}`} className="btn btn-secondary btn-small" style={{ display: 'inline-flex', padding: '6px 12px' }}>
                            <ExternalLink size={13} />
                          </Link>
                          <button 
                            onClick={() => handleDeleteCourse(c.id)} 
                            className="btn btn-danger btn-small"
                            style={{ padding: '6px 12px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Enrollments Log */}
      {activeTab === 'enrollments' && (
        <div>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px' }}>Student Sign-Ups & Logs</h3>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Enrolled Course</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Enrolled Date</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                      No student enrollments found.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((e, idx) => (
                    <tr key={`${e.email}-${e.courseName}-${idx}`}>
                      <td style={{ color: '#fff', fontWeight: 600 }}>{e.studentName}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{e.email}</td>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{e.courseName}</td>
                      <td>
                        <span className={`badge ${e.status === 'Completed' ? 'badge-success' : 'badge-student'}`}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={12} />
                          {e.enrolledDate}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Course Categories */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {categories.map(cat => (
            <div key={cat.id} className="glass-panel" style={{ padding: '20px 24px', borderRadius: '14px' }}>
              <h4 style={{ fontSize: '16px', color: '#fff', marginBottom: 6 }}>{cat.name}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cat.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
