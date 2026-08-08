import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Play, BookOpen, Star, User, Calendar, CheckCircle, 
  ArrowRight, ShieldAlert, Edit, MessageSquare, 
  Award, Globe, Clock, BarChart, X, Video, Share2, 
  Heart, HelpCircle, ChevronDown, ChevronUp, Layers
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ totalReviews: 0, averageRating: 0 });
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  // Expandable sections/curriculum state
  const [expandedSections, setExpandedSections] = useState({ 0: true });

  // Expandable FAQ state
  const [expandedFaqs, setExpandedFaqs] = useState({ 0: true });

  // Preview video modal state
  const [previewVideo, setPreviewVideo] = useState(null);

  // Social actions feedback states
  const [copied, setCopied] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  // Load Course Detail & Related
  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/courses/${id}`);
      const courseData = response.data.course;
      setCourse(courseData);
      setSections(response.data.sections || courseData?.sections || []);
      setReviews(response.data.reviews || []);
      setRatingSummary(response.data.ratingSummary || { totalReviews: 0, averageRating: 0 });

      // Fetch related courses in same category
      if (courseData && courseData.category_id) {
        const relatedRes = await api.get('/courses', {
          params: { categoryId: courseData.category_id, limit: 4 }
        });
        const filtered = (relatedRes.data.courses || []).filter(c => c.id !== courseData.id).slice(0, 3);
        setRelatedCourses(filtered);
      }

      if (dbUser) {
        if (dbUser.role === 'student') {
          const enrollRes = await api.get(`/enrollments/${courseData.id}/status`);
          setIsEnrolled(enrollRes.data.enrolled);
        } else if (dbUser.role === 'instructor' && courseData.instructor_id === dbUser.id) {
          setIsEnrolled(true);
        } else if (dbUser.role === 'admin') {
          setIsEnrolled(true);
        }
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
      if (err.response && err.response.status === 404) {
        setError('Course not found');
      } else {
        setError('Failed to load course details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id, dbUser]);

  const toggleSection = (idx) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleFaq = (idx) => {
    setExpandedFaqs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Handle Free Enrollment
  const handleEnrollFree = async () => {
    if (!dbUser) {
      return navigate('/login/student');
    }

    try {
      setEnrolling(true);
      setError('');
      await api.post(`/enrollments/${course.id}`);
      setIsEnrolled(true);
      loadCourseData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Enrollment transaction failed.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWishlist = () => {
    setWishlisted(!wishlisted);
  };

  const handlePreviewOpen = () => {
    if (course && course.preview_video_url) {
      setPreviewVideo(course.preview_video_url);
    } else {
      setPreviewVideo('PLACEHOLDER');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // State 1: Failed to load (500 or Network connection failure)
  if (error && error.includes('Failed')) {
    return (
      <div className="container-wide" style={{ padding: '80px 0', textAlign: 'center', maxWidth: '600px' }}>
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: 16, display: 'inline-block' }} />
          <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px' }}>Failed to Load Details</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '24px', lineHeight: 1.6 }}>
            We encountered a connection issue while communicating with the server. Please verify your internet or retry loading.
          </p>
          <button onClick={loadCourseData} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // State 2: Course Not Found (404)
  if (!course || error === 'Course not found') {
    return (
      <div className="container-wide" style={{ padding: '80px 0', textAlign: 'center', maxWidth: '600px' }}>
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <ShieldAlert size={48} color="#f59e0b" style={{ marginBottom: 16, display: 'inline-block' }} />
          <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px' }}>Course Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '24px', lineHeight: 1.6 }}>
            The course with ID "{id}" does not exist in our catalog pathways or has been moved. Let's find another course!
          </p>
          <Link to="/courses" className="btn btn-primary">
            Browse Course Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = dbUser && dbUser.id === course.instructor_id;
  const isPaid = parseFloat(course.price) > 0;
  const originalPrice = parseFloat(course.price || 0);
  const discountPercent = 20; // Skein LMS Promos
  const discountAmount = originalPrice * (discountPercent / 100);
  const finalPrice = originalPrice - discountAmount;

  const averageRatingVal = parseFloat(ratingSummary.averageRating || course.rating_avg || 4.5);
  const totalReviewsVal = parseInt(ratingSummary.totalReviews || Math.floor(course.enrollment_count / 15) || 12);
  
  const starChart = [
    { stars: 5, percentage: averageRatingVal >= 4.7 ? 75 : 62 },
    { stars: 4, percentage: averageRatingVal >= 4.7 ? 18 : 25 },
    { stars: 3, percentage: averageRatingVal >= 4.7 ? 5 : 8 },
    { stars: 2, percentage: averageRatingVal >= 4.7 ? 1 : 3 },
    { stars: 1, percentage: averageRatingVal >= 4.7 ? 1 : 2 }
  ];

  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const skillsList = [course.category_name || 'Technology', 'Problem Solving', 'System Design', 'Industrial Deployment'];

  const faqs = [
    { q: 'Is there a deadline or expiration for course access?', a: 'No, all courses on Skein LMS offer self-paced lifetime access, allowing you to study whenever you have free time.' },
    { q: 'Can I play lecture videos on tablet and mobile viewports?', a: 'Yes! The custom course player and workspace layouts are built using fully responsive CSS frameworks.' },
    { q: 'How do I claim my verification graduation certificate?', a: 'Once all curriculum modules show as checked, and you obtain passing grades on the quizzes, your official certificate will be generated.' }
  ];

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/enrollments/${course.id}/review`, {
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewMessage(response.data.message);
      setReviewComment('');
      loadCourseData();
    } catch (err) {
      console.error(err);
      setReviewMessage('Failed to submit review.');
    }
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      
      {/* 1. Large Banner Section */}
      <section style={{
        background: 'linear-gradient(135deg, #101118 0%, #1e1b4b 50%, #101118 100%)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '60px 0',
        marginBottom: '40px',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', top: '10%', left: '5%', filter: 'blur(40px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)', bottom: '10%', right: '10%', filter: 'blur(40px)', zIndex: 0 }} />
        
        <div className="container-wide" style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-category" style={{ marginBottom: '16px' }}>{course.category_name || 'Technology'}</span>
          <h1 style={{ fontSize: '40px', marginBottom: '16px', lineHeight: 1.2, maxWidth: '800px', color: '#fff' }}>{course.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '800px', marginBottom: '24px', lineHeight: 1.6 }}>
            {course.short_description || 'Master this course pathway programmatically and gain verifiable academic credentials.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img 
                src={course.instructor_photo || `https://i.pravatar.cc/150?img=${course.id}`} 
                alt={course.instructor_name} 
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span>Taught by <strong style={{ color: '#fff' }}>{course.instructor_name || 'Skein LMS Lead'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={16} fill="var(--color-warning)" color="var(--color-warning)" />
              <span style={{ color: '#fff', fontWeight: 600 }}>{averageRatingVal.toFixed(1)}</span>
              <span>({totalReviewsVal} ratings)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={16} />
              <span>{course.enrollment_count || 120} enrolled students</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={16} />
              <span>{course.language || 'English'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grid Layout Content */}
      <div className="container-wide" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '40px',
        alignItems: 'start'
      }} className="catalog-layout">
        
        {/* Left Column (Main Details) */}
        <div>
          
          {/* Detailed description */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#fff' }}>About This Course</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px', whiteSpace: 'pre-line' }}>
              {course.description}
            </p>
          </div>

          {/* Learning Outcomes */}
          {course.learning_outcomes && (
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#fff' }}>Learning Outcomes</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {JSON.parse(course.learning_outcomes).map((outcome, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '14.5px', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={18} style={{ color: 'var(--color-success)', marginTop: 2, minWidth: 18 }} />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills you will learn */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#fff' }}>Skills You Will Learn</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {skillsList.map((skill, idx) => (
                <span 
                  key={idx}
                  style={{
                    fontSize: '13px',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px', color: '#fff' }}>Prerequisites</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', margin: 0, lineHeight: 1.6 }}>
              {course.prerequisites || 'No prior technical credentials are required. Fundamental logical thinking is key.'}
            </p>
          </div>

          {/* Curriculum Expandable Accordion */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#fff' }}>Course Curriculum</h2>
            {sections.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No sections or lectures uploaded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sections.map((section, sIndex) => {
                  const isExpanded = !!expandedSections[sIndex];
                  return (
                    <div key={section.id} className="glass-panel" style={{ borderRadius: '12px', padding: 0, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      <div 
                        onClick={() => toggleSection(sIndex)}
                        style={{
                          padding: '16px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          background: 'rgba(255,255,255,0.015)'
                        }}
                      >
                        <span style={{ fontSize: '15px', color: '#fff', fontWeight: 600 }}>
                          Module {sIndex + 1}: {section.title}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {section.lessons?.length || 0} lectures
                          </span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(10, 11, 16, 0.2)' }}>
                          {section.lessons?.map((lesson, lIndex) => (
                            <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', fontSize: '13px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                                <Play size={13} style={{ color: 'var(--accent-primary)' }} />
                                <span>{lIndex + 1}. {lesson.title}</span>
                              </div>
                              <span style={{ color: 'var(--text-muted)' }}>{lesson.duration_minutes} mins</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Instructor Bio */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#fff' }}>Meet Your Instructor</h2>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <img 
                src={course.instructor_photo || `https://i.pravatar.cc/150?img=${course.id}`} 
                alt={course.instructor_name} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--glass-border)' }}
              />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <h3 style={{ fontSize: '18px', color: '#fff', margin: '0 0 4px 0' }}>{course.instructor_name || 'Lead Specialist'}</h3>
                <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600, display: 'block', marginBottom: 12 }}>
                  {course.instructor_bio ? course.instructor_bio.split(' ')[0] + ' Expert' : 'Authorized Instructor'}
                </span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                  {course.instructor_bio || 'Expert instructor providing detailed modules and professional feedback on exams.'}
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={20} className="text-gradient" />
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {faqs.map((faq, idx) => {
                const isExpanded = !!expandedFaqs[idx];
                return (
                  <div key={idx} className="glass-panel" style={{ borderRadius: '12px', padding: 0, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <div 
                      onClick={() => toggleFaq(idx)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.015)'
                      }}
                    >
                      <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{faq.q}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, background: 'rgba(10, 11, 16, 0.2)' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews Rating Breakdown */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={20} className="text-gradient" />
              Reviews & Feedback
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr',
              gap: '30px',
              alignItems: 'center',
              marginBottom: '32px',
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid var(--glass-border)'
            }} className="review-breakdown-grid">
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit', lineHeight: 1 }}>
                  {averageRatingVal.toFixed(1)}
                </div>
                <div style={{ display: 'flex', gap: 3, justifyContent: 'center', color: 'var(--color-warning)', margin: '8px 0' }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} fill={idx < Math.round(averageRatingVal) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Course Rating
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {starChart.map((item) => (
                  <div key={item.stars} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)', width: '45px', textAlign: 'right' }}>{item.stars} Stars</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${item.percentage}%`, height: '100%', background: 'var(--color-warning)', borderRadius: 3 }} />
                    </div>
                    <span style={{ color: 'var(--text-muted)', width: '35px' }}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Review Form */}
            {isEnrolled && dbUser && dbUser.role === 'student' && (
              <form onSubmit={handleReviewSubmit} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Submit Your Assessment Feedback</h3>
                {reviewMessage && <div className="alert alert-success" style={{ padding: '10px', fontSize: '13px', marginBottom: 16 }}>{reviewMessage}</div>}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Rating:</span>
                  <select 
                    className="form-select" 
                    value={reviewRating} 
                    onChange={(e) => setReviewRating(parseInt(e.target.value))}
                    style={{ width: '100px', padding: '6px' }}
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <textarea 
                    className="form-input" 
                    placeholder="Share details of your experience with this course..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    style={{ minHeight: '80px', fontSize: '13px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-small">
                  Submit Review
                </button>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No reviews posted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'var(--accent-primary)'
                      }}>
                        {review.display_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{review.display_name}</div>
                        <div style={{ display: 'flex', gap: 3, color: 'var(--color-warning)' }}>
                          {[...Array(review.rating)].map((_, idx) => (
                            <Star key={idx} size={11} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#fff' }}>Related Courses</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '20px'
              }}>
                {relatedCourses.map((rc) => (
                  <Link 
                    key={rc.id} 
                    to={`/courses/${rc.id}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div className="glass-card" style={{ height: '100%', padding: '16px' }}>
                      <div style={{
                        height: '110px',
                        borderRadius: '8px',
                        backgroundImage: `url(${rc.thumbnail_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        marginBottom: '12px'
                      }} />
                      <h4 style={{ fontSize: '14px', color: '#fff', margin: '0 0 6px 0', lineHeight: 1.4 }} className="text-truncate">{rc.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>By {rc.instructor_name}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                          {parseFloat(rc.price) === 0 ? 'Free' : `₹${rc.price}`}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 2 }}>
                          View Details <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Action Sidebar Card */}
        <aside className="glass-panel" style={{
          padding: '30px',
          borderRadius: '20px',
          position: 'sticky',
          top: '110px',
          border: '1px solid var(--glass-border)'
        }}>
          {/* Video preview thumb overlay */}
          <div 
            onClick={handlePreviewOpen}
            style={{
              height: '180px',
              borderRadius: '12px',
              background: course.thumbnail_url ? `url(${course.thumbnail_url})` : 'linear-gradient(135deg, #4f46e5, #a855f7)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              marginBottom: '24px',
              cursor: 'pointer',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(10, 11, 16, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.5)',
                color: 'var(--bg-primary)'
              }}>
                <Play size={20} style={{ marginLeft: 3 }} />
              </div>
            </div>
            <div style={{
              position: 'absolute',
              bottom: 12, left: 12, right: 12,
              fontSize: '12px',
              fontWeight: 600,
              color: '#fff',
              textAlign: 'center'
            }}>
              Preview Course Video
            </div>
          </div>

          {/* Pricing Box with Discount */}
          <div style={{ marginBottom: '24px' }}>
            {isPaid ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Original Price: <span style={{ textDecoration: 'line-through' }}>₹{originalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit', color: '#fff' }}>
                  Discounted Price: ₹{finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-success)', fontWeight: 600 }}>
                  You Save: ₹{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (20% OFF)
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '34px', fontWeight: 800, fontFamily: 'Outfit', color: '#fff' }}>
                Free
              </div>
            )}
          </div>

          {/* Action buttons */}
          {isOwner ? (
            <Link to={`/courses/${course.id}/manage`} className="btn btn-secondary" style={{ width: '100%', display: 'flex', gap: 6, justifyContent: 'center' }}>
              <Edit size={16} />
              Manage Course
            </Link>
          ) : isEnrolled ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to={`/courses/${course.id}/play`} className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }}>
                Resume Studying
                <ArrowRight size={16} />
              </Link>
              <Link to={`/courses/${course.id}/assignments`} className="btn btn-secondary" style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }}>
                Coursework Assignments
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {isPaid ? (
                <>
                  <Link to={`/checkout/${course.id}`} className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }}>
                    Buy Now
                    <ArrowRight size={16} />
                  </Link>
                  <button 
                    onClick={() => navigate(`/checkout/${course.id}`)}
                    className="btn btn-secondary" 
                    style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center', background: 'none' }}
                  >
                    Enroll Now
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleEnrollFree} 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }}
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Free'}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}

          {/* Wishlist & Share buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            <button 
              onClick={handleWishlist}
              className="btn btn-secondary btn-small"
              style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid var(--glass-border)' }}
            >
              <Heart size={14} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : 'var(--text-primary)'} />
              <span>{wishlisted ? 'Wishlisted' : 'Wishlist'}</span>
            </button>
            <button 
              onClick={handleShare}
              className="btn btn-secondary btn-small"
              style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid var(--glass-border)' }}
            >
              <Share2 size={14} />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

          {/* Certificate Information Card */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.015)'
          }}>
            <h4 style={{ fontSize: '13px', color: '#fff', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={16} style={{ color: 'var(--color-success)' }} />
              Verifiable Certificate
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Complete all lessons and quizzes to claim your verified certificate of achievement code credentials.
            </p>
          </div>

          <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>{course.duration_hours || 10} hours of on-demand lectures</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <BookOpen size={14} style={{ color: 'var(--accent-secondary)' }} />
              <span>{totalLessons || 6} detailed text/video materials</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />
              <span>Self-paced lifetime workspace access</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart size={14} style={{ color: 'var(--color-success)' }} />
              <span>Level: {course.difficulty_level || 'Beginner'}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Preview Modal */}
      {previewVideo && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 11, 16, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(8px)',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '720px',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--glass-border)',
              background: 'rgba(10, 11, 16, 0.4)'
            }}>
              <span style={{ fontSize: '15px', color: '#fff', fontWeight: 600 }}>Lesson Video Preview</span>
              <button 
                onClick={() => setPreviewVideo(null)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>
            {previewVideo === 'PLACEHOLDER' ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Video size={48} style={{ color: 'var(--text-muted)', marginBottom: 16, display: 'inline-block' }} />
                <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: 8 }}>Preview Video Coming Soon</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  The instructor is currently compiling the video syllabus preview. Check back soon!
                </p>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  title="Lesson Preview"
                  src={previewVideo}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
