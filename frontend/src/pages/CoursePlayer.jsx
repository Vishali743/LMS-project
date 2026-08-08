import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { uploadToStorage } from '../services/firebase';
import QuizComponent from '../components/QuizComponent';
import { 
  ArrowLeft, PlayCircle, FileText, CheckCircle2, 
  Circle, Award, ArrowRight, Layers, X, 
  ChevronLeft, ChevronRight, Loader2, Sparkles,
  Lock, Upload, Paperclip, Calendar, AlertCircle
} from 'lucide-react';

export default function CoursePlayer() {
  const { id } = useParams(); // courseId
  const { dbUser } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [completedSectionIds, setCompletedSectionIds] = useState([]);
  const [sectionDetails, setSectionDetails] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Selected elements
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeAssignmentSection, setActiveAssignmentSection] = useState(null);
  
  // Assignment form state
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  // Custom modals/notifications
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load completed progress
  const loadProgress = async () => {
    try {
      const response = await api.get(`/progress/course/${id}`);
      setCompletedSectionIds(response.data.completedSectionIds || []);
      setSectionDetails(response.data.sectionDetails || []);
      return response.data.completedLessonIds || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Load Course and Syllabus
  const loadCourseOutline = async (completedIds) => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.course);
      const sectionsData = response.data.sections || response.data.course?.sections || [];
      setSections(sectionsData);
      
      // Find first unlocked uncompleted lesson
      let targetLesson = null;
      // Fetch section completion logs
      const progressRes = await api.get(`/progress/course/${id}`);
      const compSecIds = progressRes.data.completedSectionIds || [];

      for (let sIdx = 0; sIdx < sectionsData.length; sIdx++) {
        const sec = sectionsData[sIdx];
        const isPrevUnlocked = sIdx === 0 || compSecIds.includes(sectionsData[sIdx - 1].id);
        
        if (isPrevUnlocked) {
          for (const les of sec.lessons || []) {
            if (!completedIds.includes(les.id)) {
              targetLesson = les;
              break;
            }
          }
        }
        if (targetLesson) break;
      }

      if (!targetLesson && sectionsData.length > 0) {
        const firstSec = sectionsData[0];
        if (firstSec.lessons && firstSec.lessons.length > 0) {
          targetLesson = firstSec.lessons[0];
        }
      }
      if (targetLesson) {
        await loadLessonDetails(targetLesson.id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load syllabus outline.');
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const completedIds = await loadProgress();
      setCompletedLessonIds(completedIds);
      await loadCourseOutline(completedIds);
      setLoading(false);
    }
    if (id) {
      loadData();
    }
  }, [id]);

  // Load full lesson data (description text)
  const loadLessonDetails = async (lessonId) => {
    try {
      setLessonLoading(true);
      setError('');
      const res = await api.get(`/courses/lessons/${lessonId}`);
      setActiveLesson(res.data.lesson);
      setActiveQuiz(null);
      setActiveAssignmentSection(null);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve lesson content details.');
    } finally {
      setLessonLoading(false);
    }
  };

  // Load weekly assignment details inside a section
  const loadWeeklyAssignment = async (section) => {
    try {
      setLessonLoading(true);
      setError('');
      setSuccess('');
      setTextInput('');
      setFileUrl('');
      
      // Fetch assignment in course
      const assRes = await api.get(`/assignments/course/${id}`);
      const courseAss = assRes.data.assignments || [];
      const sectionAss = courseAss.find(a => a.section_id === section.id);
      setAssignment(sectionAss || null);

      if (sectionAss) {
        // Fetch student submission details
        const subRes = await api.get(`/assignments/course/${id}/my`);
        const existingSub = subRes.data.submissions?.find(s => s.assignment_id === sectionAss.id);
        setSubmission(existingSub || null);
        if (existingSub) {
          setTextInput(existingSub.submission_text || '');
          setFileUrl(existingSub.file_url || '');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve assignment settings.');
    } finally {
      setLessonLoading(false);
    }
  };

  useEffect(() => {
    if (activeAssignmentSection) {
      loadWeeklyAssignment(activeAssignmentSection);
    }
  }, [activeAssignmentSection]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isMockConfig = !import.meta.env.VITE_FIREBASE_API_KEY || 
                          import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' ||
                          import.meta.env.VITE_FIREBASE_API_KEY.includes('your_');

    try {
      setUploadingFile(true);
      setSuccess('Uploading resource file...');
      
      let url = '';
      if (!isMockConfig) {
        url = await uploadToStorage('submissions', file);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        url = response.data.fileUrl;
      }
      
      setFileUrl(url);
      setSuccess('File uploaded successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to upload file.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmitAssignment = async (e, isDraft = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!textInput && !fileUrl) {
      setError('Please provide submission text notes or upload files.');
      return;
    }

    try {
      setLessonLoading(true);
      await api.post(`/assignments/${assignment.id}/submit`, {
        submissionText: textInput,
        fileUrl,
        isDraft
      });
      setSuccess(isDraft ? '✓ Assignment draft saved successfully!' : '✓ Assignment deliverable submitted successfully!');
      
      // Reload stats and locks
      const completedIds = await loadProgress();
      setCompletedLessonIds(completedIds);
      
      await loadWeeklyAssignment(activeAssignmentSection);
    } catch (err) {
      console.error(err);
      setError('Failed to submit assignment.');
    } finally {
      setLessonLoading(false);
    }
  };

  // Toggle completion
  const handleToggleComplete = async (lessonId) => {
    const isCompleted = completedLessonIds.includes(lessonId);
    try {
      const response = await api.post(`/progress/toggle/${lessonId}`, { completed: !isCompleted });
      const updatedProgress = response.data.progress || {};
      
      // Reload progress lists
      const completedIds = await loadProgress();
      setCompletedLessonIds(completedIds);
      
      if (!isCompleted) {
        // If progress is now 100%, show graduation modal!
        if (updatedProgress.percentage === 100) {
          setShowGraduationModal(true);
        } else {
          // If not 100%, check if there is a next lesson to auto-advance to!
          const flat = getAllLessons();
          const activeIndex = flat.findIndex(l => l.id === lessonId);
          const next = activeIndex >= 0 && activeIndex < flat.length - 1 ? flat[activeIndex + 1] : null;
          if (next) {
            setToastMessage(`✓ Lesson completed! Unlocking next: "${next.title}"...`);
            setTimeout(() => {
              setToastMessage(null);
              loadLessonDetails(next.id);
            }, 1800);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get all syllabus lessons in a flat list
  const getAllLessons = () => {
    const flat = [];
    sections.forEach(sec => {
      sec.lessons?.forEach(les => {
        flat.push(les);
      });
    });
    return flat;
  };

  // Parse Video URL into standard iframe embed URL
  const getEmbedVideoUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return `https://www.youtube.com/embed/${urlParams.get('v')}`;
      }
      if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        const id = parts[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('vimeo.com/')) {
        const parts = url.split('vimeo.com/');
        const id = parts[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${id}`;
      }
      return url;
    } catch (err) {
      return url;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Calculate global completion percentage
  const totalLessonsCount = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const completedLessonsCount = completedLessonIds.length;
  const progressPercent = totalLessonsCount > 0 
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
    : 0;

  // Next and Previous lessons pointers
  const flatLessons = getAllLessons();
  const activeIndex = flatLessons.findIndex(l => l.id === activeLesson?.id);
  const prevLesson = activeIndex > 0 ? flatLessons[activeIndex - 1] : null;
  const nextLesson = activeIndex >= 0 && activeIndex < flatLessons.length - 1 ? flatLessons[activeIndex + 1] : null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '340px 1fr',
      minHeight: 'calc(100vh - 72px)',
      position: 'relative',
      margin: '-40px -40px -40px -40px'
    }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-notification" style={{ top: 20, zIndex: 1100 }}>
          <Sparkles size={16} style={{ color: 'var(--color-warning)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SYLLABUS NAVIGATION PANEL */}
      <div className="glass-panel" style={{
        borderRight: '1px solid var(--glass-border)',
        height: '100%',
        overflowY: 'auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {/* Course back */}
        <Link to={`/courses/${id}`} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontSize: '13px'
        }}>
          <ArrowLeft size={14} />
          Back to Course Info
        </Link>

        {/* Progress Bar widget */}
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 6 }}>
            <span>Syllabus Completed</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{progressPercent}%</span>
          </div>
          <div className="progress-bar-container" style={{ margin: 0, height: '4px' }}>
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 8 }}>
            {completedLessonsCount} of {totalLessonsCount} lectures done
          </div>
        </div>

        {/* Modules Accordion list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((section, sIdx) => {
            const isUnlocked = sIdx === 0 || completedSectionIds.includes(sections[sIdx - 1].id);
            const isWeekCompleted = completedSectionIds.includes(section.id);

            return (
              <div key={section.id} style={{ opacity: isUnlocked ? 1 : 0.6 }}>
                <h4 style={{ 
                  fontSize: '12px', 
                  textTransform: 'uppercase', 
                  color: isUnlocked ? 'var(--text-secondary)' : 'var(--text-muted)', 
                  letterSpacing: '0.5px', 
                  marginBottom: 8, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={12} style={{ color: isUnlocked ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                    <span>Week {sIdx + 1}: {section.title}</span>
                  </span>
                  {isWeekCompleted ? (
                    <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />
                  ) : !isUnlocked ? (
                    <Lock size={12} style={{ color: 'var(--text-muted)' }} />
                  ) : null}
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 6 }}>
                  {section.lessons?.map(lesson => {
                    const isCompleted = completedLessonIds.includes(lesson.id);
                    const isSelected = activeLesson?.id === lesson.id;
                    return (
                      <div 
                        key={lesson.id}
                        onClick={() => {
                          if (!isUnlocked) {
                            setToastMessage('🔒 Complete the previous week assessment and assignments to unlock!');
                            setTimeout(() => setToastMessage(null), 2500);
                            return;
                          }
                          loadLessonDetails(lesson.id);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          cursor: isUnlocked ? 'pointer' : 'not-allowed',
                          background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                          fontSize: '13px',
                          transition: 'var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => { if (!isSelected && isUnlocked) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={(e) => { if (!isSelected && isUnlocked) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                          {isCompleted ? (
                            <CheckCircle2 size={15} color="var(--color-success)" style={{ minWidth: 15 }} />
                          ) : (
                            <Circle size={15} color="var(--text-muted)" style={{ minWidth: 15 }} />
                          )}
                          <span style={{ 
                            color: isSelected ? '#fff' : 'var(--text-secondary)', 
                            fontWeight: isSelected ? 600 : 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {lesson.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Section Quiz */}
                  {section.quiz && (
                    <div
                      onClick={() => {
                        if (!isUnlocked) {
                          setToastMessage('🔒 Complete the previous week assessment and assignments to unlock!');
                          setTimeout(() => setToastMessage(null), 2500);
                          return;
                        }
                        setActiveQuiz(section.quiz);
                        setActiveLesson(null);
                        setActiveAssignmentSection(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        background: activeQuiz?.id === section.quiz.id ? 'rgba(168, 85, 247, 0.08)' : 'transparent',
                        fontSize: '13px',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => { if (activeQuiz?.id !== section.quiz.id && isUnlocked) e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                      onMouseLeave={(e) => { if (activeQuiz?.id !== section.quiz.id && isUnlocked) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Award size={15} color="#c084fc" />
                      <span style={{ 
                        color: activeQuiz?.id === section.quiz.id ? '#fff' : '#d8b4fe', 
                        fontWeight: activeQuiz?.id === section.quiz.id ? 600 : 400 
                      }}>
                        Weekly Quiz
                      </span>
                    </div>
                  )}

                  {/* Weekly Assignment Link */}
                  <div
                    onClick={() => {
                      if (!isUnlocked) {
                        setToastMessage('🔒 Complete the previous week assessment and assignments to unlock!');
                        setTimeout(() => setToastMessage(null), 2500);
                        return;
                      }
                      setActiveAssignmentSection(section);
                      setActiveLesson(null);
                      setActiveQuiz(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      background: activeAssignmentSection?.id === section.id ? 'rgba(255, 51, 68, 0.08)' : 'transparent',
                      fontSize: '13px',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => { if (activeAssignmentSection?.id !== section.id && isUnlocked) e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                    onMouseLeave={(e) => { if (activeAssignmentSection?.id !== section.id && isUnlocked) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <FileText size={15} color="var(--accent-primary)" />
                    <span style={{ 
                      color: activeAssignmentSection?.id === section.id ? '#fff' : 'var(--text-secondary)',
                      fontWeight: activeAssignmentSection?.id === section.id ? 600 : 400 
                    }}>
                      Weekly Assignment
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT CONTENT DISPLAY PANEL */}
      <div style={{ padding: '40px', overflowY: 'auto', backgroundColor: '#08090d', position: 'relative' }}>
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Loading Spinner overlay */}
        {lessonLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(8, 9, 13, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <Loader2 size={36} className="spin" style={{ color: 'var(--accent-primary)' }} />
          </div>
        )}

        {/* --- VIEW 1: ACTIVE VIDEO LESSON --- */}
        {activeLesson && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            <div style={{ marginBottom: '24px' }}>
              <span className="badge badge-category" style={{ marginBottom: 8 }}>
                {activeLesson.content_type?.toUpperCase() || 'VIDEO'} LECTURE
              </span>
              <h2 style={{ fontSize: '26px', color: '#fff', marginBottom: 8 }}>{activeLesson.title}</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Estimated study duration: {activeLesson.duration_minutes || 15} minutes</span>
            </div>

            {(activeLesson.content_url || activeLesson.video_url) ? (
              <div className="glass-panel" style={{
                position: 'relative',
                paddingBottom: '56.25%', 
                height: 0,
                overflow: 'hidden',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)',
                marginBottom: '28px',
                backgroundColor: '#000'
              }}>
                {(activeLesson.content_url || activeLesson.video_url).toLowerCase().match(/\.(mp4|webm|ogg)$/) || (activeLesson.content_url || activeLesson.video_url).includes('/uploads/') ? (
                  <video 
                    controls 
                    playsInline
                    preload="metadata"
                    src={activeLesson.content_url || activeLesson.video_url}
                    onError={(e) => {
                      e.target.src = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '16px',
                      objectFit: 'contain',
                      backgroundColor: '#000'
                    }}
                  />
                ) : (
                  <iframe 
                    src={getEmbedVideoUrl(activeLesson.content_url || activeLesson.video_url)}
                    title={activeLesson.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            ) : (
              <div className="glass-panel" style={{
                padding: '80px 40px',
                borderRadius: '16px',
                textAlign: 'center',
                marginBottom: '28px',
                border: '1px dashed var(--glass-border)'
              }}>
                <PlayCircle size={44} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                <h4 style={{ color: '#fff', marginBottom: 4 }}>Lecture Video Offline</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Reference syllabus text summaries and markdown materials provided below.</p>
              </div>
            )}

            <div className="glass-panel" style={{
              padding: '30px',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              marginBottom: '32px',
              lineHeight: 1.6,
              fontSize: '15px'
            }}>
              {activeLesson.text_content ? (
                <div style={{ whiteSpace: 'pre-line', color: 'var(--text-primary)' }} className="markdown-body">
                  {activeLesson.text_content.split('\n').map((line, idx) => {
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} style={{ color: '#fff', fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('1. ') || line.startsWith('- ')) {
                      return <div key={idx} style={{ paddingLeft: '12px', marginBottom: '6px', color: 'var(--text-secondary)' }}>{line}</div>;
                    }
                    return <p key={idx} style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>{line}</p>;
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No article summaries provided for this lecture.</p>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTop: '1px solid var(--glass-border)',
              paddingTop: '24px',
              marginTop: '32px',
              gap: 16
            }}>
              <button 
                onClick={() => loadLessonDetails(prevLesson.id)}
                className="btn btn-secondary btn-small"
                disabled={!prevLesson}
                style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: prevLesson ? 1 : 0.4 }}
              >
                <ChevronLeft size={16} />
                Previous Lecture
              </button>

              <button 
                onClick={() => handleToggleComplete(activeLesson.id)}
                className={`btn ${completedLessonIds.includes(activeLesson.id) ? 'btn-secondary' : 'btn-primary'}`}
                style={{ minWidth: '220px', display: 'flex', gap: 8, justifyContent: 'center' }}
              >
                <CheckCircle2 size={16} style={{ color: completedLessonIds.includes(activeLesson.id) ? 'var(--color-success)' : '#fff' }} />
                {completedLessonIds.includes(activeLesson.id) ? 'Completed' : 'Mark as Completed'}
              </button>

              <button 
                onClick={() => loadLessonDetails(nextLesson.id)}
                className="btn btn-secondary btn-small"
                disabled={!nextLesson}
                style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: nextLesson ? 1 : 0.4 }}
              >
                Next Lecture
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        )}

        {/* --- VIEW 2: ACTIVE QUIZ ASSESSMENTS --- */}
        {activeQuiz && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <QuizComponent quizId={activeQuiz.id} onComplete={loadProgress} />
          </div>
        )}

        {/* --- VIEW 3: ACTIVE WEEKLY ASSIGNMENT UPLOADS --- */}
        {activeAssignmentSection && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            <div style={{ marginBottom: '24px' }}>
              <span className="badge badge-category" style={{ marginBottom: 8 }}>
                WEEKLY DELIVERABLE
              </span>
              <h2 style={{ fontSize: '26px', color: '#fff', marginBottom: 8 }}>
                {assignment ? assignment.title : `Weekly Assignment: ${activeAssignmentSection.title}`}
              </h2>
              {assignment && (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Award size={14} style={{ color: 'var(--color-success)' }} />
                    <span>Max Marks: {assignment.max_points || 100}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Layers size={14} style={{ color: 'var(--color-warning)' }} />
                    <span>Module: {activeAssignmentSection.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={14} style={{ color: submission ? (submission.returned_for_resubmission ? '#ef4444' : submission.is_draft ? 'var(--color-warning)' : 'var(--color-success)') : '#ef4444' }} />
                    <span>Status: <strong>{submission ? (submission.returned_for_resubmission ? 'Returned for Revision' : submission.is_draft ? 'Draft Saved' : 'Submitted') : 'Not Submitted'}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {assignment ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Description */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  <p>{assignment.description}</p>
                </div>

                {/* Instructions */}
                {assignment.instructions && (
                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', fontSize: '14px', lineHeight: 1.6, borderLeft: '4px solid var(--accent-primary)' }}>
                    <h4 style={{ color: '#fff', marginBottom: 8, fontSize: '15px', fontWeight: 600 }}>Instructions</h4>
                    <p style={{ whiteSpace: 'pre-line', color: 'var(--text-secondary)' }}>{assignment.instructions}</p>
                  </div>
                )}

                {/* Submissions Details */}
                <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 16 }}>Your Submission</h3>
                  
                  {submission && !submission.is_draft && !submission.returned_for_resubmission ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div className="alert alert-success" style={{ fontSize: '13px', display: 'flex', gap: 8 }}>
                        <CheckCircle2 size={16} /> Submission uploaded successfully.
                      </div>

                      <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: 8 }}>
                          <span>Submitted Text:</span>
                          <span>{new Date(submission.submitted_at).toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#fff' }}>{submission.submission_text || 'No text note provided.'}</p>
                        
                        {submission.file_url && (
                          <div style={{ marginTop: 12 }}>
                            <a 
                              href={submission.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-small"
                              style={{ display: 'inline-flex', gap: 6, alignItems: 'center', textDecoration: 'none' }}
                            >
                              <Paperclip size={12} /> Download Submission File
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Graded info */}
                      {submission.graded_at ? (
                        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.02)', fontSize: '13px' }}>
                          <h4 style={{ color: '#fff', marginBottom: 6 }}>Grade: {submission.points_earned} / {assignment.max_points}</h4>
                          <p style={{ color: 'var(--text-secondary)' }}><strong>Feedback:</strong> {submission.feedback || 'Excellent work!'}</p>
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          Pending grading by the instructor.
                        </div>
                      )}
                    </div>
                  ) : (
                    // Submission Uploader
                    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {submission?.returned_for_resubmission && (
                        <div className="alert alert-error" style={{ fontSize: '13px', display: 'flex', gap: 8, flexDirection: 'column', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.02)' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 'bold' }}>
                            <AlertCircle size={15} /> Returned for Resubmission
                          </div>
                          <span>The instructor returned this assignment. Feedback: "{submission.feedback || 'Please refine details.'}"</span>
                        </div>
                      )}

                      {submission?.is_draft && (
                        <div className="alert alert-warning" style={{ fontSize: '13px', display: 'flex', gap: 6, alignItems: 'center', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.02)' }}>
                          <AlertCircle size={15} /> Saved as Draft (Not yet submitted for grading)
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>Submission Notes</label>
                        <textarea
                          className="form-input"
                          placeholder="Paste links or explain implementation parameters here..."
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          style={{ minHeight: '100px' }}
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <label className="btn btn-secondary btn-small" style={{ cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Upload size={14} /> {uploadingFile ? 'Uploading...' : 'Attach ZIP / PDF'}
                          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>
                        {fileUrl && (
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Paperclip size={12} /> {fileUrl.split('/').pop()}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <button 
                          type="button" 
                          onClick={(e) => handleSubmitAssignment(e, false)}
                          className="btn btn-primary btn-small"
                        >
                          Submit Assignment
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => handleSubmitAssignment(e, true)}
                          className="btn btn-secondary btn-small"
                        >
                          Save Draft
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', border: '1px dashed var(--glass-border)', color: 'var(--text-secondary)' }}>
                <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                <h4>No assignments configured for this week.</h4>
              </div>
            )}

          </div>
        )}

        {/* --- VIEW 4: EMPTY WELCOME SCREEN --- */}
        {!activeLesson && !activeQuiz && !activeAssignmentSection && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            textAlign: 'center'
          }}>
            <PlayCircle size={48} className="text-gradient" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '24px', marginBottom: 8 }}>Weekly Syllabus Course Player</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              Choose a weekly module or assessment in the left accordion menu to begin learning.
            </p>
          </div>
        )}
      </div>

      {/* Graduation congratulatory overlay modal */}
      {showGraduationModal && (
        <div className="modal-overlay" style={{ zIndex: 2000 }} onClick={() => setShowGraduationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'center', position: 'relative', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'linear-gradient(135deg, #0f111a 0%, rgba(16,185,129,0.05) 100%)' }}>
            <button 
              onClick={() => setShowGraduationModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
            
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--color-success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <Award size={44} />
            </div>

            <h2 style={{ fontSize: '26px', color: '#fff', marginBottom: '8px', fontFamily: 'Outfit' }}>Congratulations, Graduate!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
              You have completed 100% of the syllabus in <strong>{course?.title}</strong>! Your verified completion certificate has been generated and added to your archives.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'left',
              fontSize: '13px',
              marginBottom: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Certificate ID:</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'monospace' }}>
                  CERT-SKEIN-{id}-{dbUser?.id || '000'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Issuer:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>Skein LMS Global Education</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setShowGraduationModal(false)} className="btn btn-secondary btn-small">
                Dismiss
              </button>
              <Link to="/dashboard/certificates" className="btn btn-primary btn-small" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', textDecoration: 'none' }}>
                View Certificate
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
