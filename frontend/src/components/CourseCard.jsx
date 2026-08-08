import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Star, ArrowRight } from 'lucide-react';

export default function CourseCard({ course, viewType }) {
  const navigate = useNavigate();
  const {
    id,
    title,
    description,
    thumbnail_url,
    price,
    instructor_name,
    category_name,
    student_count,
    total_lessons,
    completed_lessons,
    average_rating,
    total_reviews
  } = course;

  const courseId = course.course_id || id || course.ID || 0;

  const getSlug = () => {
    if (category_name) {
      return category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    return courseId.toString();
  };

  const courseSlug = getSlug();
  const courseUrl = `/courses/${courseId}`;

  const handleCardClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    if (viewType === 'catalog') {
      navigate(courseUrl);
    } else if (viewType === 'student') {
      navigate(`/courses/${courseId}/play`);
    } else if (viewType === 'instructor') {
      navigate(`/courses/${courseId}/manage`);
    }
  };

  const displayRating = average_rating || course.rating_avg || '4.5';
  const displayLessons = total_lessons || course.lessons_count || 6;
  const displayStudents = student_count || course.enrollment_count || 0;
  const displayReviews = total_reviews !== undefined ? total_reviews : (course.enrollment_count ? Math.floor(course.enrollment_count / 15) : 12);

  // Render a beautiful fallback gradient if no thumbnail is provided
  const placeholderGradient = `linear-gradient(135deg, 
    ${courseId % 3 === 0 ? '#4f46e5, #06b6d4' : courseId % 3 === 1 ? '#a855f7, #ec4899' : '#3b82f6, #8b5cf6'} 0%, 
    #0f172a 100%)`;

  const progressPercent = displayLessons > 0 
    ? Math.round((completed_lessons / displayLessons) * 100) 
    : 0;

  return (
    <div 
      className="glass-card course-card"
      onClick={handleCardClick}
      style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}
    >
      {/* Thumbnail */}
      <div 
        className="course-card-thumb-wrapper" 
        style={{
          overflow: 'hidden',
          borderRadius: '10px',
          height: '160px',
          position: 'relative'
        }}
      >
        <div 
          className="course-card-thumb" 
          style={{
            backgroundImage: thumbnail_url ? `url(${thumbnail_url})` : placeholderGradient,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
            width: '100%',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        {category_name && (
          <span 
            className="badge badge-category" 
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'rgba(10, 11, 16, 0.8)',
              backdropFilter: 'blur(4px)'
            }}
          >
            {category_name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="course-card-body">
        <h3 className="course-card-title">{title}</h3>
        
        {viewType !== 'instructor' && (
          <p className="course-card-instructor">By {instructor_name || 'Expert Instructor'}</p>
        )}

        {/* Catalog View Details (Ratings & Price) */}
        {viewType === 'catalog' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warning)' }}>
              <Star size={14} fill="currentColor" />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{parseFloat(displayRating).toFixed(1)}</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({displayReviews} reviews)</span>
          </div>
        )}

        {/* Instructor View Details (Students enrolled) */}
        {viewType === 'instructor' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 14 }}>
            <Users size={16} />
            <span>{displayStudents} enrolled students</span>
          </div>
        )}

        {/* Student Progress View */}
        {viewType === 'student' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 4 }}>
              <span>{completed_lessons || 0} / {displayLessons} Lessons Completed</span>
              <span style={{ float: 'right', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{progressPercent}%</span>
            </div>
            <div style={{ clear: 'both' }} />
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Action Button Footer */}
        {viewType === 'catalog' && (
          <div className="course-card-price">
            <span>{parseFloat(price) === 0 ? 'Free' : `₹${parseFloat(price).toLocaleString('en-IN')}`}</span>
            <Link to={courseUrl} className="btn btn-primary btn-small">
              View Details
            </Link>
          </div>
        )}

        {viewType === 'student' && (
          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <Link 
              to={`/courses/${courseId}/play`} 
              className="btn btn-primary btn-small"
              style={{ width: '100%' }}
            >
              Resume Learning
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {viewType === 'instructor' && (
          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 10 }}>
            <Link 
              to={`/courses/${courseId}/manage`} 
              className="btn btn-secondary btn-small"
              style={{ flex: 1 }}
            >
              Manage
            </Link>
            <Link 
              to={`/courses/${courseId}/grades`} 
              className="btn btn-primary btn-small"
              style={{ flex: 1 }}
            >
              Grades
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
