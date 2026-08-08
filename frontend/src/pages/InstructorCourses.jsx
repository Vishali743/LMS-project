import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  BookOpen, Search, Filter, SortAsc, LayoutGrid, 
  ArrowLeft, Edit, Trash, Settings, Eye, CheckCircle, 
  X, AlertCircle, BarChart, DollarSign, Star, Users
} from 'lucide-react';

export default function InstructorCourses() {
  const [searchParams] = useSearchParams();
  const filterQuery = searchParams.get('filter'); // 'published' etc.

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search / Filters / Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterQuery === 'published' ? 'published' : 'ALL'); // ALL, published, draft
  const [priceFilter, setPriceFilter] = useState('ALL'); // ALL, free, paid
  const [sortBy, setSortBy] = useState('recent'); // recent, title, enrollments, rating, price

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Analytics modal state
  const [activeAnalyticsCourse, setActiveAnalyticsCourse] = useState(null);

  const loadInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses/instructor/me');
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch authored courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstructorCourses();
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...courses];

    // 1. Search
    if (searchTerm.trim() !== '') {
      result = result.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // 2. Status Filter
    if (statusFilter === 'published') {
      result = result.filter(c => c.is_published === 1 || c.is_published === true);
    } else if (statusFilter === 'draft') {
      result = result.filter(c => c.is_published === 0 || c.is_published === false);
    }

    // 3. Price Filter
    if (priceFilter === 'free') {
      result = result.filter(c => parseFloat(c.price || 0) === 0);
    } else if (priceFilter === 'paid') {
      result = result.filter(c => parseFloat(c.price || 0) > 0);
    }

    // 4. Sort
    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'enrollments') {
      result.sort((a, b) => (b.student_count || 0) - (a.student_count || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => parseFloat(b.rating_avg || 0) - parseFloat(a.rating_avg || 0));
    } else if (sortBy === 'price') {
      result.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
    }

    setFilteredCourses(result);
    setCurrentPage(1); // Reset to first page on search/filter changes
  }, [searchTerm, statusFilter, priceFilter, sortBy, courses]);

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to delete the course "${title}"? This action is permanent.`)) return;
    try {
      await api.delete(`/courses/${courseId}`);
      setSuccess('Course deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
      loadInstructorCourses();
    } catch (err) {
      console.error(err);
      setError('Failed to delete the course.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

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
        <span className="badge badge-instructor" style={{ marginBottom: 10 }}>CURRICULUM ARCHIVE</span>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Authored Modules & Courses</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage course settings, edit syllabus elements, and monitor student analytics profiles.</p>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Filter and Sorting bar */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: '28px',
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
            placeholder="Search authored courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', margin: 0 }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
          <select 
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '150px', margin: 0, padding: '10px 14px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Price filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarSign size={14} style={{ color: 'var(--text-secondary)' }} />
          <select 
            className="form-select"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            style={{ width: '150px', margin: 0, padding: '10px 14px' }}
          >
            <option value="ALL">All Pricing</option>
            <option value="free">Free Courses</option>
            <option value="paid">Paid Courses</option>
          </select>
        </div>

        {/* Sorting filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SortAsc size={14} style={{ color: 'var(--text-secondary)' }} />
          <select 
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '170px', margin: 0, padding: '10px 14px' }}
          >
            <option value="recent">Recently Created</option>
            <option value="title">Course Title (A-Z)</option>
            <option value="enrollments">Most Enrolled</option>
            <option value="rating">Top Rated</option>
            <option value="price">Highest Price</option>
          </select>
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No authored courses match your query.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {currentItems.map(c => {
            const isPublished = c.is_published === 1 || c.is_published === true;
            const priceVal = parseFloat(c.price || 0);

            const placeholderGradient = `linear-gradient(135deg, 
              ${c.id % 3 === 0 ? '#4f46e5, #06b6d4' : c.id % 3 === 1 ? '#a855f7, #ec4899' : '#3b82f6, #8b5cf6'} 0%, 
              #0f172a 100%)`;

            return (
              <div 
                key={c.id} 
                className="glass-panel feature-card" 
                style={{ 
                  padding: '24px', 
                  borderRadius: '20px', 
                  display: 'grid', 
                  gridTemplateColumns: '180px 1fr', 
                  gap: 24,
                  alignItems: 'center'
                }}
              >
                {/* Thumbnail */}
                <div style={{ 
                  height: '110px', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  backgroundImage: c.thumbnail_url ? `url(${c.thumbnail_url})` : placeholderGradient,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid var(--glass-border)'
                }} />

                {/* Info and Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: 4 }}>{c.title}</h3>
                      <span className="badge badge-category" style={{ fontSize: '11px' }}>{c.category_name || 'Programming'}</span>
                    </div>

                    <span 
                      className={`badge ${isPublished ? 'badge-success' : 'badge-instructor'}`}
                      style={{ fontSize: '11px', textTransform: 'uppercase' }}
                    >
                      {isPublished ? '✓ Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Analytics Brief Row */}
                  <div style={{ display: 'flex', gap: 16, fontSize: '13px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span>{parseFloat(c.rating_avg || 4.5).toFixed(1)} Rating</span>
                    </div>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={14} />
                      <span>{c.student_count || 0} Scholars</span>
                    </div>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BookOpen size={14} />
                      <span>{c.lessons_count || 9} Lectures</span>
                    </div>
                    <span>•</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>
                      {priceVal === 0 ? 'Free' : `₹${priceVal.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  {/* Actions list */}
                  <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--glass-border)', paddingTop: 14, marginTop: 4, flexWrap: 'wrap' }}>
                    <Link to={`/courses/${c.id}/manage`} className="btn btn-primary btn-small" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Settings size={14} /> Manage Content
                    </Link>
                    <button 
                      onClick={() => setActiveAnalyticsCourse(c)}
                      className="btn btn-secondary btn-small" 
                      style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'none' }}
                    >
                      <BarChart size={14} /> View Analytics
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(c.id, c.title)}
                      className="btn btn-secondary btn-small" 
                      style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)', background: 'none' }}
                    >
                      <Trash size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20 }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="btn btn-secondary btn-small"
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                Previous
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="btn btn-secondary btn-small"
                disabled={currentPage === totalPages}
                style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analytics Modal overlay */}
      {activeAnalyticsCourse && (
        <div className="modal-overlay" onClick={() => setActiveAnalyticsCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', textAlign: 'center' }}>
            <button 
              onClick={() => setActiveAnalyticsCourse(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <BarChart size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: 4 }}>Course Performance Analytics</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 24 }}>Metrics sheet for: "{activeAnalyticsCourse.title}"</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 24
            }}>
              <div className="glass-panel" style={{ padding: 16, borderRadius: 12 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Total Students</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>{activeAnalyticsCourse.student_count || 0}</div>
              </div>
              <div className="glass-panel" style={{ padding: 16, borderRadius: 12 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Gross Earnings</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>
                  ₹{((activeAnalyticsCourse.student_count || 0) * parseFloat(activeAnalyticsCourse.price || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="glass-panel" style={{ padding: 16, borderRadius: 12 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Average Rating</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {parseFloat(activeAnalyticsCourse.rating_avg || 4.5).toFixed(1)} ★
                </div>
              </div>
              <div className="glass-panel" style={{ padding: 16, borderRadius: 12 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Course Status</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: activeAnalyticsCourse.is_published === 1 ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                  {activeAnalyticsCourse.is_published === 1 ? '✓ PUBLISHED' : 'DRAFT'}
                </div>
              </div>
            </div>

            <button onClick={() => setActiveAnalyticsCourse(null)} className="btn btn-secondary btn-small" style={{ width: '100%' }}>
              Close Performance Sheet
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
