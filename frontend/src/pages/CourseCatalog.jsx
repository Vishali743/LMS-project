import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { Search, Sparkles, BookOpen, Sliders, RotateCcw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="glass-card course-card" style={{ height: '340px', display: 'flex', flexDirection: 'column', gap: 15, padding: 15 }}>
      <div className="skeleton-line" style={{ height: '150px', width: '100%', borderRadius: '10px' }} />
      <div className="skeleton-line" style={{ height: '24px', width: '80%' }} />
      <div className="skeleton-line" style={{ height: '16px', width: '50%' }} />
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton-line" style={{ height: '20px', width: '30%' }} />
        <div className="skeleton-line" style={{ height: '32px', width: '40%', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

export default function CourseCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract URL params with fallbacks
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const levelParam = searchParams.get('level') || '';
  const priceParam = searchParams.get('price') || '';
  const ratingParam = searchParams.get('rating') || '';
  const durationParam = searchParams.get('duration') || '';
  const sortByParam = searchParams.get('sortBy') || 'latest';
  const pageParam = parseInt(searchParams.get('page') || '1');

  // Local state
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local filter states syncing to UI
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedLevel, setSelectedLevel] = useState(levelParam);
  const [selectedPrice, setSelectedPrice] = useState(priceParam);
  const [selectedRating, setSelectedRating] = useState(ratingParam);
  const [selectedDuration, setSelectedDuration] = useState(durationParam);
  const [selectedSort, setSelectedSort] = useState(sortByParam);

  const limitPerPage = 12;

  // Sync state with URL params change
  useEffect(() => {
    setSearchQuery(searchParam);
    setSelectedCategory(categoryParam);
    setSelectedLevel(levelParam);
    setSelectedPrice(priceParam);
    setSelectedRating(ratingParam);
    setSelectedDuration(durationParam);
    setSelectedSort(sortByParam);
  }, [searchParam, categoryParam, levelParam, priceParam, ratingParam, durationParam, sortByParam]);

  // Load Data
  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        setError('');
        
        // 1. Fetch categories list
        const catRes = await api.get('/courses/categories');
        setCategories(catRes.data.categories || []);

        // 2. Fetch courses list
        const params = {
          page: pageParam,
          limit: limitPerPage,
          sortBy: sortByParam,
          search: searchParam || undefined,
          categoryId: categoryParam || undefined,
          level: levelParam || undefined,
          price: priceParam || undefined,
          rating: ratingParam || undefined,
          duration: durationParam || undefined
        };

        const courseRes = await api.get('/courses', { params });
        setCourses(courseRes.data.courses || []);
        setTotalCount(courseRes.data.totalCount || 0);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
        setError('Failed to fetch courses catalog.');
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, [searchParam, categoryParam, levelParam, priceParam, ratingParam, durationParam, sortByParam, pageParam]);

  // Set URL Params helper
  const updateURLParams = (updatedFields) => {
    const nextParams = new URLSearchParams(searchParams);
    
    // Always reset to page 1 on filter changes
    if (!updatedFields.hasOwnProperty('page')) {
      nextParams.set('page', '1');
    }
    
    Object.entries(updatedFields).forEach(([key, val]) => {
      if (val) {
        nextParams.set(key, val);
      } else {
        nextParams.delete(key);
      }
    });
    
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateURLParams({ search: searchQuery });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedPrice('');
    setSelectedRating('');
    setSelectedDuration('');
    setSelectedSort('latest');
    setSearchParams({});
  };

  const totalPages = Math.ceil(totalCount / limitPerPage) || 1;

  return (
    <div className="container-wide" style={{ paddingBottom: '80px' }}>
      {/* Header section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)',
        padding: '50px 30px',
        borderRadius: '24px',
        border: '1px solid var(--glass-border)',
        marginBottom: '40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 20, right: 30, color: 'rgba(168, 85, 247, 0.15)' }}>
          <Sparkles size={60} />
        </div>
        <h1 style={{ fontSize: '38px', marginBottom: '12px', lineHeight: 1.2 }}>
          Master New Skills. <span className="text-gradient">Explore Skein LMS.</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
          Access premium course pathways, take assessments, and obtain verified graduate credentials.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '30px',
        alignItems: 'start'
      }} className="catalog-layout">
        
        {/* Sidebar Filters panel */}
        <aside className="glass-panel" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)', position: 'sticky', top: '110px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--glass-border)', paddingBottom: 12 }}>
            <span style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <Sliders size={16} /> Filters
            </span>
            <button onClick={handleClearFilters} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '12px' }}>
              <RotateCcw size={12} /> Clear all
            </button>
          </div>

          {/* Search box */}
          <div style={{ marginBottom: 20 }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search courses/instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingRight: '40px', fontSize: '13px' }}
              />
              <button type="submit" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Category Dropdown/Filter */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => updateURLParams({ category: e.target.value })}
              style={{ width: '100%', fontSize: '13px' }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Difficulty Level</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <label key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedLevel === lvl}
                    onChange={() => updateURLParams({ level: selectedLevel === lvl ? '' : lvl })}
                    style={{ cursor: 'pointer' }}
                  />
                  {lvl}
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pricing</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Free', 'Paid'].map((prc) => (
                <label key={prc} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedPrice === prc}
                    onChange={() => updateURLParams({ price: selectedPrice === prc ? '' : prc })}
                    style={{ cursor: 'pointer' }}
                  />
                  {prc}
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ratings</label>
            <select
              className="form-select"
              value={selectedRating}
              onChange={(e) => updateURLParams({ rating: e.target.value })}
              style={{ width: '100%', fontSize: '13px' }}
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5 Stars & above</option>
              <option value="4.0">4.0 Stars & above</option>
              <option value="3.0">3.0 Stars & above</option>
            </select>
          </div>

          {/* Duration Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</label>
            <select
              className="form-select"
              value={selectedDuration}
              onChange={(e) => updateURLParams({ duration: e.target.value })}
              style={{ width: '100%', fontSize: '13px' }}
            >
              <option value="">All Durations</option>
              <option value="short">Short (≤ 10 Hours)</option>
              <option value="medium">Medium (11 - 20 Hours)</option>
              <option value="long">Long (&gt; 20 Hours)</option>
            </select>
          </div>
        </aside>

        {/* Right side courses container */}
        <div>
          {/* Header toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <BookOpen size={20} className="text-gradient" />
              <span>{loading ? 'Searching...' : `${totalCount} Courses Available`}</span>
            </h2>

            {/* Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sort By:</span>
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => updateURLParams({ sortBy: e.target.value })}
                style={{ width: '150px', padding: '6px 12px' }}
              >
                <option value="latest">Latest</option>
                <option value="popular">Popularity</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Error notice */}
          {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

          {/* Courses Catalog Display */}
          {loading ? (
            <div className="courses-grid">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 48px', borderRadius: '20px', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
              <Sliders size={36} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: 8 }}>No courses match your parameters</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 20px', fontSize: '14px' }}>
                We couldn't find any listings matching your search text or active filter items.
              </p>
              <button onClick={handleClearFilters} className="btn btn-secondary btn-small">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="courses-grid">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course} viewType="catalog" />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: '40px'
                }}>
                  <button
                    disabled={pageParam <= 1}
                    onClick={() => updateURLParams({ page: (pageParam - 1).toString() })}
                    className="btn btn-secondary btn-small"
                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateURLParams({ page: pageNum.toString() })}
                        className="btn"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid var(--glass-border)',
                          background: pageParam === pageNum ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                          color: pageParam === pageNum ? '#fff' : 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={pageParam >= totalPages}
                    onClick={() => updateURLParams({ page: (pageParam + 1).toString() })}
                    className="btn btn-secondary btn-small"
                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
