import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Search, Filter, SortAsc, LayoutGrid, 
  ArrowLeft, ArrowRight, Play, Award, Clock
} from 'lucide-react';

export default function MyCourses() {
  const { dbUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering / Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent'); // recent, title, progress-high, progress-low

  useEffect(() => {
    async function loadMyEnrollments() {
      try {
        setLoading(true);
        const response = await api.get('/enrollments/my');
        setEnrollments(response.data.enrollments || []);
        setFilteredEnrollments(response.data.enrollments || []);
      } catch (err) {
        console.error('Error loading enrolled courses:', err);
        setEnrollments([]);
        setFilteredEnrollments([]);
      } finally {
        setLoading(false);
      }
    }
    if (dbUser) {
      loadMyEnrollments();
    }
  }, [dbUser]);

  // Handle Search, Filter & Sort whenever states change
  useEffect(() => {
    let result = [...enrollments];

    // 1. Search Filter
    if (searchTerm.trim() !== '') {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(item => 
        item.category_name?.toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    // 3. Sorting
    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at));
    } else if (sortBy === 'progress-high') {
      result.sort((a, b) => {
        const aPct = a.total_lessons > 0 ? (a.completed_lessons / a.total_lessons) : 0;
        const bPct = b.total_lessons > 0 ? (b.completed_lessons / b.total_lessons) : 0;
        return bPct - aPct;
      });
    } else if (sortBy === 'progress-low') {
      result.sort((a, b) => {
        const aPct = a.total_lessons > 0 ? (a.completed_lessons / a.total_lessons) : 0;
        const bPct = b.total_lessons > 0 ? (b.completed_lessons / b.total_lessons) : 0;
        return aPct - bPct;
      });
    }

    setFilteredEnrollments(result);
  }, [searchTerm, selectedCategory, sortBy, enrollments]);

  // Extract unique categories from enrollments
  const categories = ['ALL', ...new Set((enrollments.map(e => e.category_name).filter(Boolean)))];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container-wide" style={{ paddingBottom: '80px' }}>
      
      {/* Title Header */}
      <div style={{ marginBottom: '32px' }}>
        <span className="badge badge-student" style={{ marginBottom: 10 }}>LEARNING CENTER</span>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>My Enrolled Courses</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Resume your curriculum tracks, review course materials, and check your watch progress.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {enrollments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--glass-border)', maxWidth: '600px', margin: '0 auto' }}>
          <LayoutGrid size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: 8 }}>No enrolled courses</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 24, lineHeight: 1.6 }}>
            You haven't registered for any course specializations yet. Explore our curriculum catalog to enroll and start learning.
          </p>
          <Link to="/courses" className="btn btn-primary">Browse Course Catalog</Link>
        </div>
      ) : (
        <div>
          {/* Filters and sorting Row */}
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
                placeholder="Search my courses by title..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px', margin: 0 }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
              <select 
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '180px', margin: 0, padding: '10px 14px' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SortAsc size={14} style={{ color: 'var(--text-secondary)' }} />
              <select 
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: '180px', margin: 0, padding: '10px 14px' }}
              >
                <option value="recent">Recently Enrolled</option>
                <option value="title">Course Title (A-Z)</option>
                <option value="progress-high">Progress: High to Low</option>
                <option value="progress-low">Progress: Low to High</option>
              </select>
            </div>
          </div>

          {/* Grid listing */}
          {filteredEnrollments.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No courses match your active search filters.
            </div>
          ) : (
            <div className="courses-grid" style={{ marginTop: 0 }}>
              {filteredEnrollments.map((item) => {
                const progressPercent = item.total_lessons > 0 
                  ? Math.round((item.completed_lessons / item.total_lessons) * 100) 
                  : 0;

                const placeholderGradient = `linear-gradient(135deg, 
                  ${item.course_id % 3 === 0 ? '#4f46e5, #06b6d4' : item.course_id % 3 === 1 ? '#a855f7, #ec4899' : '#3b82f6, #8b5cf6'} 0%, 
                  #0f172a 100%)`;

                return (
                  <div key={item.course_id} className="glass-card course-card">
                    {/* Thumbnail */}
                    <div style={{ overflow: 'hidden', borderRadius: '10px', height: '160px', position: 'relative' }}>
                      <div style={{
                        backgroundImage: item.thumbnail_url ? `url(${item.thumbnail_url})` : placeholderGradient,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '100%',
                        width: '100%',
                        transition: 'transform 0.5s ease'
                      }} />
                      {item.category_name && (
                        <span className="badge badge-category" style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(10,11,16,0.85)', backdropFilter: 'blur(4px)' }}>
                          {item.category_name}
                        </span>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="course-card-body">
                      <h3 className="course-card-title" style={{ fontSize: '17px', color: '#fff', marginBottom: 6 }}>{item.title}</h3>
                      <p className="course-card-instructor" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12 }}>
                        By {item.instructor_name || 'Expert Faculty'}
                      </p>

                      {/* Stats brief */}
                      <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)', fontSize: '11px', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          <span>12 Hours Total</span>
                        </div>
                        <span>•</span>
                        <div>Enrolled: {new Date(item.enrolled_at).toLocaleDateString()}</div>
                      </div>

                      {/* Progress widgets */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 4 }}>
                          <span>{item.completed_lessons || 0} of {item.total_lessons || 6} lessons</span>
                          <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{progressPercent}%</span>
                        </div>
                        <div className="progress-bar-container" style={{ margin: 0 }}>
                          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                        <Link 
                          to={`/courses/${item.course_id}/play`}
                          className="btn btn-primary btn-small"
                          style={{ width: '100%', display: 'flex', gap: 6, justifyContent: 'center' }}
                        >
                          Resume Learning
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
