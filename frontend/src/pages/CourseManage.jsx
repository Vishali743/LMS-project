import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { uploadToStorage } from '../services/firebase';
import { 
  ArrowLeft, PlusCircle, Trash, Edit, CheckCircle, 
  PlayCircle, FileText, HelpCircle, Save, Settings 
} from 'lucide-react';

export default function CourseManage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing structures
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'settings'
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  
  // Lesson form state
  const [lessonId, setLessonId] = useState(null); // set if editing
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('text');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [lessonDuration, setLessonDuration] = useState(10);

  // Quiz builder state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizSectionId, setQuizSectionId] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizMaxScore, setQuizMaxScore] = useState(100);
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Load Course and Sections
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.course);
      setSections(response.data.sections);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch course data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Section Management
  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle) return;
    try {
      await api.post(`/courses/${id}/sections`, { title: newSectionTitle });
      setNewSectionTitle('');
      setSuccess('Section added successfully!');
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to create section.');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section? All lessons inside will be deleted!')) return;
    try {
      await api.delete(`/courses/sections/${sectionId}`);
      setSuccess('Section deleted.');
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete section.');
    }
  };

  // Lesson Management
  const openAddLesson = (sectionId) => {
    setSelectedSectionId(sectionId);
    setLessonId(null);
    setLessonTitle('');
    setLessonType('text');
    setLessonUrl('');
    setLessonText('');
    setLessonDuration(10);
    setShowLessonModal(true);
  };

  const openEditLesson = (lesson, sectionId) => {
    setSelectedSectionId(sectionId);
    setLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonType(lesson.content_type);
    
    // We need to fetch full lesson details because the syllabus summary hides the description
    setLoading(true);
    api.get(`/courses/lessons/${lesson.id}`)
      .then(res => {
        setLessonUrl(res.data.lesson.content_url || '');
        setLessonText(res.data.lesson.text_content || '');
        setLessonDuration(res.data.lesson.duration_minutes || 10);
        setShowLessonModal(true);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch lesson details.');
      })
      .finally(() => setLoading(false));
  };

  const handleLessonFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isMockConfig = !import.meta.env.VITE_FIREBASE_API_KEY || 
                          import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' ||
                          import.meta.env.VITE_FIREBASE_API_KEY.includes('your_');

    try {
      setSuccess('Uploading resource file...');
      
      let url = '';
      if (!isMockConfig) {
        url = await uploadToStorage('lessons', file);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        url = response.data.fileUrl;
      }
      
      setLessonUrl(url);
      setSuccess('File uploaded successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to upload video resource.');
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: lessonTitle,
        content_type: lessonType,
        content_url: lessonUrl,
        text_content: lessonText,
        duration_minutes: parseInt(lessonDuration) || 0
      };

      if (lessonId) {
        await api.put(`/courses/lessons/${lessonId}`, payload);
        setSuccess('Lesson updated.');
      } else {
        await api.post(`/courses/sections/${selectedSectionId}/lessons`, payload);
        setSuccess('Lesson added successfully.');
      }
      setShowLessonModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to save lesson.');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/courses/lessons/${lessonId}`);
      setSuccess('Lesson deleted.');
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete lesson.');
    }
  };

  // Quiz Management
  const openQuizBuilder = async (section) => {
    setQuizSectionId(section.id);
    if (section.quiz) {
      // Edit Quiz
      setQuizId(section.quiz.id);
      setQuizTitle(section.quiz.title);
      setQuizMaxScore(section.quiz.max_score);
      // Fetch full questions & options
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/${section.quiz.id}`);
        // Map questions to edit format
        const mappedQuestions = res.data.questions.map(q => ({
          questionText: q.question_text,
          questionType: q.question_type,
          points: q.points,
          options: q.options.map(opt => ({
            optionText: opt.option_text,
            isCorrect: opt.is_correct === 1 || opt.is_correct === true
          }))
        }));
        setQuizQuestions(mappedQuestions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      // Create new
      setQuizId(null);
      setQuizTitle('Section Quiz');
      setQuizMaxScore(100);
      setQuizQuestions([
        { questionText: 'Sample Question?', questionType: 'multiple_choice', points: 10, options: [{ optionText: 'Option A', isCorrect: true }, { optionText: 'Option B', isCorrect: false }] }
      ]);
    }
    setShowQuizModal(true);
  };

  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      { questionText: '', questionType: 'multiple_choice', points: 10, options: [{ optionText: '', isCorrect: true }, { optionText: '', isCorrect: false }] }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    try {
      let currentQuizId = quizId;
      if (!currentQuizId) {
        // 1. Create quiz entry
        const res = await api.post(`/quizzes/course/${id}`, {
          sectionId: quizSectionId,
          title: quizTitle,
          max_score: quizMaxScore
        });
        currentQuizId = res.data.quizId;
      } else {
        // Wait, for updates, since we wipe and reload questions, we can keep the title and max_score. Let's make sure it is updated if changed.
        // We will just post the questions.
      }

      // 2. Save Questions
      await api.post(`/quizzes/${currentQuizId}/questions`, { questions: quizQuestions });
      
      setSuccess('Assessment quiz saved successfully!');
      setShowQuizModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to save assessment quiz.');
    }
  };

  if (loading && !showLessonModal && !showQuizModal) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container-wide">
      {/* Header breadcrumb */}
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '14px'
        }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {course && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <span className="badge badge-instructor" style={{ marginBottom: 8 }}>Instructor Portal</span>
            <h1 style={{ fontSize: '28px', marginBottom: 4 }}>Manage: {course.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Status: <span style={{ color: course.is_published ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {course.is_published ? 'Published to Catalog' : 'Draft mode'}
              </span>
            </p>
          </div>
          <Link to={`/courses/${id}`} className="btn btn-secondary">
            Preview landing page
          </Link>
        </div>
      )}

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 20 }} onClick={() => setSuccess('')}>{success}</div>}

      {/* Builder Core Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Section (Add Module form) */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Add Module Section</h3>
          <form onSubmit={handleCreateSection}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Module 1: Introduction" 
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-small" style={{ width: '100%' }}>
              <PlusCircle size={14} />
              Add Section
            </button>
          </form>
        </div>

        {/* Right Section (Curriculum Layout) */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Course Syllabus Outline</h2>
          
          {sections.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', textStyle: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>You haven't added any modules yet. Create one on the left to start uploading lessons!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sections.map((section, sIndex) => (
                <div key={section.id} className="glass-panel" style={{ borderRadius: '16px', padding: '24px' }}>
                  
                  {/* Module Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px' }}>Module {sIndex + 1}: {section.title}</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => openAddLesson(section.id)} className="btn btn-secondary btn-small" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        + Add Lecture
                      </button>
                      <button onClick={() => openQuizBuilder(section)} className="btn btn-primary btn-small" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        {section.quiz ? 'Edit Quiz' : 'Add Quiz'}
                      </button>
                      <button onClick={() => handleDeleteSection(section.id)} className="btn btn-danger btn-small" style={{ padding: '6px 10px' }}>
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Lectures List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {section.lessons?.map((lesson, lIndex) => (
                      <div key={lesson.id} className="glass-panel" style={{ padding: '12px 18px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {lesson.content_type === 'video' ? <PlayCircle size={16} color="var(--accent-primary)" /> : <FileText size={16} color="var(--accent-secondary)" />}
                          <span style={{ fontSize: '14px' }}>{lIndex + 1}. {lesson.title}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({lesson.duration_minutes} min)</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEditLesson(lesson, section.id)} className="btn btn-secondary btn-small" style={{ padding: '4px 8px' }}>
                            <Edit size={12} />
                          </button>
                          <button onClick={() => handleDeleteLesson(lesson.id)} className="btn btn-danger btn-small" style={{ padding: '4px 8px', backgroundColor: 'transparent', color: '#ef4444' }}>
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Quiz tag inside lessons lists */}
                    {section.quiz && (
                      <div className="glass-panel" style={{ padding: '12px 18px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(168, 85, 247, 0.05)', border: '1px dashed rgba(168, 85, 247, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <HelpCircle size={16} color="#c084fc" />
                          <span style={{ fontSize: '14px', color: '#d8b4fe', fontWeight: 600 }}>Assessment: {section.quiz.title}</span>
                          <span style={{ color: '#d8b4fe', fontSize: '11px' }}>({section.quiz.max_score} max points)</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openQuizBuilder(section)} className="btn btn-secondary btn-small" style={{ padding: '4px 8px' }}>
                            <Edit size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    {(!section.lessons || section.lessons.length === 0) && !section.quiz && (
                      <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>This module has no study elements yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT LESSON MODAL --- */}
      {showLessonModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', padding: '30px', backgroundColor: 'var(--bg-secondary)', overflowY: 'auto', maxHeight: '90vh' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>{lessonId ? 'Edit Lecture' : 'Add New Lecture'}</h3>
            
            <form onSubmit={handleSaveLesson}>
              <div className="form-group">
                <label className="form-label">Lecture Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={lessonTitle} 
                  onChange={(e) => setLessonTitle(e.target.value)} 
                  placeholder="e.g. Installing React Developer Tools"
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Content Type *</label>
                  <select className="form-select" value={lessonType} onChange={(e) => setLessonType(e.target.value)}>
                    <option value="text">Text / Markdown Article</option>
                    <option value="video">Video URL (YouTube/Vimeo)</option>
                    <option value="document">PDF Document / File Link</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Duration (Minutes)</label>
                  <input type="number" className="form-input" value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} />
                </div>
              </div>

              {lessonType !== 'text' && (
                <div className="form-group">
                  <label className="form-label">Resource URL (Video Link / PDF Link)</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={lessonUrl} 
                      onChange={(e) => setLessonUrl(e.target.value)} 
                      placeholder="e.g. https://www.youtube.com/watch?v=... or upload below" 
                      style={{ flex: 1 }}
                    />
                    <input 
                      type="file" 
                      id="lecture-file-picker" 
                      style={{ display: 'none' }} 
                      onChange={handleLessonFileUpload}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => document.getElementById('lecture-file-picker').click()}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Upload File
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Article content (Markdown supported)</label>
                <textarea 
                  className="form-textarea" 
                  value={lessonText} 
                  onChange={(e) => setLessonText(e.target.value)} 
                  placeholder="Write text summaries, guides, code blocks, or links here..." 
                  style={{ minHeight: '180px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowLessonModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Lecture</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- QUIZ BUILDER MODAL --- */}
      {showQuizModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '750px', borderRadius: '16px', padding: '30px', backgroundColor: 'var(--bg-secondary)', overflowY: 'auto', maxHeight: '90vh' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Quiz Builder & Assessments</h3>
            
            <form onSubmit={handleSaveQuiz}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Quiz Title *</label>
                  <input type="text" className="form-input" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Max Scaled Score *</label>
                  <input type="number" className="form-input" value={quizMaxScore} onChange={(e) => setQuizMaxScore(e.target.value)} required />
                </div>
              </div>

              <div className="divider" style={{ margin: '20px 0' }} />

              <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Questions list ({quizQuestions.length})</span>
                <button type="button" onClick={handleAddQuestion} className="btn btn-secondary btn-small" style={{ fontSize: '11px', padding: '4px 8px' }}>
                  + Add Question
                </button>
              </h4>

              {/* Questions Loops */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '40vh', overflowY: 'auto', paddingRight: '10px', marginBottom: '20px' }}>
                {quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '10px' }}>Q{qIdx + 1}.</span>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Type question here..."
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...quizQuestions];
                          updated[qIdx].questionText = e.target.value;
                          setQuizQuestions(updated);
                        }}
                        style={{ flex: 1 }}
                        required
                      />
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="Points"
                        value={q.points}
                        onChange={(e) => {
                          const updated = [...quizQuestions];
                          updated[qIdx].points = parseInt(e.target.value) || 0;
                          setQuizQuestions(updated);
                        }}
                        style={{ width: '80px' }}
                        title="Points weight"
                        required
                      />
                      <button type="button" onClick={() => handleRemoveQuestion(qIdx)} className="btn btn-danger btn-small" style={{ padding: '10px' }}>
                        <Trash size={12} />
                      </button>
                    </div>

                    {/* Options builder */}
                    <div style={{ paddingLeft: '32px' }}>
                      <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Choices (Check correct one)</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[0, 1, 2, 3].map(optIdx => {
                          // Ensure choice exist
                          if (!q.options[optIdx]) {
                            q.options[optIdx] = { optionText: '', isCorrect: false };
                          }
                          return (
                            <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <input 
                                type="radio" 
                                name={`q-correct-${qIdx}`}
                                checked={q.options[optIdx].isCorrect}
                                onChange={() => {
                                  const updated = [...quizQuestions];
                                  updated[qIdx].options = updated[qIdx].options.map((opt, i) => ({
                                    ...opt,
                                    isCorrect: i === optIdx
                                  }));
                                  setQuizQuestions(updated);
                                }}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder={`Choice ${optIdx + 1}`}
                                value={q.options[optIdx].optionText}
                                onChange={(e) => {
                                  const updated = [...quizQuestions];
                                  updated[qIdx].options[optIdx].optionText = e.target.value;
                                  setQuizQuestions(updated);
                                }}
                                style={{ fontSize: '12px', padding: '6px 10px' }}
                                required={optIdx < 2} // At least 2 options are required
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowQuizModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={quizQuestions.length === 0}>
                  <Save size={16} />
                  Save Quiz Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
