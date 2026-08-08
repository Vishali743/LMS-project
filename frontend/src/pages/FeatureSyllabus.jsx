import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Layers, CheckCircle, Video, Download, 
  FileText, Code, Link2, Sparkles, ChevronRight, Award, 
  MessageSquare, Users, Check, Play, FileDown, PlusCircle, 
  TrendingUp, Calendar, Send, HelpCircle, Loader2
} from 'lucide-react';

export default function FeatureSyllabus() {
  const { subpage } = useParams();
  const navigate = useNavigate();
  const activeSubpage = subpage || null;

  const [transitioning, setTransitioning] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // States for Video Player subpage
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState([
    { lecture: 'Lecture 1: SkeinLMS Welcome & Architecture Overview', text: 'Backend is configured to listen on port 5000 and uses MySQL database pool.', time: '1:45 PM' }
  ]);
  const [completedVideos, setCompletedVideos] = useState([0]);

  // States for Quizzes subpage
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // States for Assignments subpage
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentComment, setAssignmentComment] = useState('');
  const [uploadedAssignments, setUploadedAssignments] = useState([
    { fileName: 'express_middleware_project.zip', comment: 'Implemented authorization tokens.', date: '07/20/2026', status: 'Graded: 98/100', feedback: 'Outstanding MVC routing structure.' },
    { fileName: 'mysql_schema_queries.zip', comment: 'Created database indices and joins.', date: '07/25/2026', status: 'Graded: 92/100', feedback: 'Ensure correct index usage on foreign keys.' }
  ]);

  // States for Certificates subpage
  const [certName, setCertName] = useState('');
  const [certCategory, setCertCategory] = useState('React.js');
  const [generatedCertificate, setGeneratedCertificate] = useState(null);

  // States for Discussion Forum subpage
  const [forumPosts, setForumPosts] = useState([
    { 
      id: 1, 
      user: 'Arjun K. (Student)', 
      text: 'How does Node.js handle asynchronous events under the hood?', 
      likes: 4, 
      date: '10 mins ago',
      replies: [{ user: 'Sarah J. (Instructor)', text: 'It utilizes libuv thread pools to delegate system call operations non-blockingly.' }]
    },
    { 
      id: 2, 
      user: 'Neha Sharma (Student)', 
      text: 'Can anyone explain the main differences between React Context and Redux?', 
      likes: 7, 
      date: '2 hours ago',
      replies: [{ user: 'Amit P. (TA)', text: 'Context passes data down without prop drilling, whereas Redux provides structured state updates with reducers.' }]
    },
  ]);
  const [newPostText, setNewPostText] = useState('');
  const [replyInputs, setReplyInputs] = useState({});

  // States for Live Classes subpage
  const [liveChat, setLiveChat] = useState([
    { user: 'Sanjay Kumar', text: 'Excited for today\'s React Hook masterclass!' },
    { user: 'Deepa Rao', text: 'Can we ask doubts about custom hooks?' }
  ]);
  const [newChatText, setNewChatText] = useState('');
  const [streamTimer, setStreamTimer] = useState('42:15');

  // Trigger loading screen transition on subpage route update
  useEffect(() => {
    setTransitioning(true);
    const timer = setTimeout(() => {
      setTransitioning(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [activeSubpage]);

  // Simulated live chat classmates updater
  useEffect(() => {
    if (activeSubpage !== 'live') return;
    const botMessages = [
      { user: 'Rahul V.', text: 'Does this also cover React 19 Server Components?' },
      { user: 'Priya Patel', text: 'Yes, the instructor mentioned it will be in the next module!' },
      { user: 'David Miller', text: 'I love how clean custom hooks make the code.' },
      { user: 'Aisha Begum', text: 'Can we access the GitHub repository for this starter code?' },
      { user: 'Amit P. (TA)', text: 'Yes, look at the Resources & Assets tab on the Features/Syllabus hub.' }
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (index < botMessages.length) {
        setLiveChat(prev => [...prev, botMessages[index]]);
        index++;
      } else {
        index = 0;
      }
    }, 6000);

    // Live broadcast timer ticking simulation
    const clockInterval = setInterval(() => {
      setStreamTimer(prev => {
        const [m, s] = prev.split(':').map(Number);
        let sec = s + 1;
        let min = m;
        if (sec >= 60) {
          sec = 0;
          min += 1;
        }
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, [activeSubpage]);

  const navigateToSubpage = (key) => {
    if (key) {
      navigate(`/features/syllabus/${key}`);
    } else {
      navigate('/features/syllabus');
    }
  };

  // Video data mock
  const videos = [
    { title: 'Lecture 1: SkeinLMS Welcome & Architecture Overview', duration: '12:45', embed: 'https://www.youtube.com/embed/ok-plXXHlWw' },
    { title: 'Lecture 2: Local Node.js Development Environment Setup', duration: '18:20', embed: 'https://www.youtube.com/embed/TlB_eWDSMt4' },
    { title: 'Lecture 3: Relational SQL Database Schema Operations', duration: '22:15', embed: 'https://www.youtube.com/embed/HXV3zeQKqGY' },
    { title: 'Lecture 4: Custom React.js Hooks & Context Management', duration: '25:40', embed: 'https://www.youtube.com/embed/Ke90Tje7VS0' }
  ];

  // Quiz Questions mock
  const quizQuestions = [
    {
      q: 'Which database system is primarily used in SkeinLMS?',
      options: ['MongoDB (NoSQL)', 'MySQL (Relational SQL)', 'Redis (In-memory Store)', 'SQLite (Embedded)'],
      answer: 'MySQL (Relational SQL)',
      explanation: 'SkeinLMS backend relies on MySQL with connection pooling for standard relational user tables, course lists, and completion histories.'
    },
    {
      q: 'What is the role of Firebase Admin SDK in the SkeinLMS backend?',
      options: ['Video Compressors', 'JWT Authentication Guard & Role Mapping', 'Styling Components', 'Express Router Compiler'],
      answer: 'JWT Authentication Guard & Role Mapping',
      explanation: 'The backend auth middleware uses Firebase Admin SDK to verify the client-side ID tokens (JWTs) and extract the roles (Student, Instructor, Admin).'
    },
    {
      q: 'What problem does database indexing solve inside databases?',
      options: ['Reduces physical schema file sizes', 'Accelerates search queries on specific columns at the expense of write operations', 'Allows Express to parse payloads faster', 'Automatically encrypts tables'],
      answer: 'Accelerates search queries on specific columns at the expense of write operations',
      explanation: 'Indexes create an efficient lookup system (usually B-Trees) that speeds up search queries on indexed keys, though writing takes slightly longer to index new items.'
    }
  ];

  const triggerMockDownload = (fileName) => {
    setToastMessage(`Initializing secure download for ${fileName}...`);
    setTimeout(() => {
      setToastMessage(`✓ Download completed successfully: ${fileName}`);
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  const addForumPost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setForumPosts([
      { id: Date.now(), user: 'You (Student)', text: newPostText, likes: 0, date: 'Just now', replies: [] },
      ...forumPosts
    ]);
    setNewPostText('');
  };

  const addForumReply = (postId, e) => {
    e.preventDefault();
    const replyText = replyInputs[postId];
    if (!replyText || !replyText.trim()) return;

    setForumPosts(forumPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...post.replies, { user: 'You (Student)', text: replyText }]
        };
      }
      return post;
    }));

    setReplyInputs({ ...replyInputs, [postId]: '' });
  };

  const addChatMessage = (e) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    setLiveChat([...liveChat, { user: 'You (Student)', text: newChatText }]);
    setNewChatText('');
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) score++;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!assignmentFile) return;
    setUploadedAssignments([
      {
        fileName: assignmentFile,
        comment: assignmentComment || 'No comment provided.',
        date: new Date().toLocaleDateString(),
        status: 'Pending Review',
        feedback: 'Your assignment is currently in the grading queue.'
      },
      ...uploadedAssignments
    ]);
    setAssignmentFile(null);
    setAssignmentComment('');
    setToastMessage('✓ Assignment uploaded to grading queue.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCertificateGenerate = (e) => {
    e.preventDefault();
    if (!certName.trim()) return;
    setGeneratedCertificate({
      name: certName,
      category: certCategory,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      hash: 'SKN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    });
  };

  const featureCards = [
    { key: 'video', title: 'Video Lecture Player', icon: Video, color: 'var(--accent-primary)', desc: 'Custom play outlines, checklists, notes logging, and variable speed toggles.' },
    { key: 'resources', title: 'Resources & Assets', icon: Download, color: '#06b6d4', desc: 'Download PDFs, lecture slides, cheat sheets, and starter repositories.' },
    { key: 'quizzes', title: 'Quizzes & Assessments', icon: HelpCircle, color: 'var(--accent-secondary)', desc: 'Test module milestones with instant server-authenticated MCQ grading.' },
    { key: 'assignments', title: 'Assignments', icon: FileText, color: 'var(--color-warning)', desc: 'Upload practical coursework and get grade validation logs.' },
    { key: 'progress', title: 'Progress Tracking', icon: TrendingUp, color: 'var(--color-success)', desc: 'Check dynamic progress gauges, studied hours, and milestones.' },
    { key: 'certificates', title: 'Certificates', icon: Award, color: 'var(--accent-primary)', desc: 'Generate verified achievements shareable directly to LinkedIn.' },
    { key: 'forum', title: 'Discussion Forum', icon: MessageSquare, color: 'var(--accent-secondary)', desc: 'Collaborate and ask question threads directly under lectures.' },
    { key: 'live', title: 'Live Classes', icon: Users, color: '#ec4899', desc: 'Attend interactive live stream masterclasses and webinars.' }
  ];

  return (
    <div className="container-wide" style={{ maxWidth: '1100px', paddingBottom: '80px' }}>
      
      {/* Toast Alert Simulator */}
      {toastMessage && (
        <div className="toast-notification">
          <Sparkles size={16} style={{ color: 'var(--accent-secondary)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs / Navigation Back Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: 'var(--text-secondary)' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }} className="breadcrumbs-link">Home</Link>
          <ChevronRight size={12} />
          <span 
            onClick={() => navigateToSubpage(null)}
            style={{ color: activeSubpage ? 'var(--text-secondary)' : '#fff', cursor: 'pointer', fontWeight: activeSubpage ? 400 : 600 }}
          >
            Features
          </span>
          {activeSubpage && (
            <>
              <ChevronRight size={12} />
              <span style={{ color: '#fff', fontWeight: 600 }}>
                {featureCards.find(c => c.key === activeSubpage)?.title}
              </span>
            </>
          )}
        </div>

        {activeSubpage ? (
          <button 
            onClick={() => navigateToSubpage(null)}
            className="btn btn-secondary btn-small"
            style={{ display: 'flex', gap: 6, alignItems: 'center' }}
          >
            <ArrowLeft size={14} /> Back to Features
          </button>
        ) : (
          <Link 
            to="/"
            className="btn btn-secondary btn-small"
            style={{ display: 'flex', gap: 6, alignItems: 'center' }}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        )}
      </div>

      {/* Transition Loader Skeleton */}
      {transitioning && (
        <div style={{ gridTemplateColumns: '1fr', gap: '20px', padding: '60px 0', display: 'grid' }}>
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="skeleton" style={{ height: '32px', width: '30%', borderRadius: '6px' }} />
            <div className="skeleton" style={{ height: '18px', width: '60%', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '240px', width: '100%', borderRadius: '12px', marginTop: 12 }} />
          </div>
        </div>
      )}

      {!transitioning && (
        <>
          {/* MAIN FEATURES GRID LIST (activeSubpage === null) */}
          {activeSubpage === null && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <span className="badge badge-student" style={{ marginBottom: 12 }}>SYLLABUS & FEATURES</span>
                <h1 style={{ fontSize: '42px', marginBottom: 16 }}>Interactive Syllabus Hub</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '16px', lineHeight: 1.6 }}>
                  Skein LMS consolidates all standard learning tracks into functional modules. Click any card to load its interactive environment.
                </p>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '24px',
                marginBottom: '60px'
              }}>
                {featureCards.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div 
                      key={c.key} 
                      onClick={() => navigateToSubpage(c.key)}
                      className="glass-card feature-card" 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 16,
                        height: '100%',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', gap: 14 }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--glass-border)',
                          flexShrink: 0
                        }}>
                          <Icon size={22} style={{ color: c.color }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '16px', color: '#fff', marginBottom: 6 }}>{c.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                            {c.desc}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        <span>Open Module</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Browse Catalog Footer */}
              <div style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '20px', marginBottom: 8, color: '#fff' }}>Ready to register for courses?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 20 }}>Join any specialization and start completing sections.</p>
                <Link to="/courses" className="btn btn-primary" style={{ padding: '12px 32px' }}>Browse Catalog</Link>
              </div>
            </div>
          )}

          {/* 1. VIDEO LECTURE PLAYER SUBPAGE */}
          {activeSubpage === 'video' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px' }} className="catalog-layout">
              {/* Left: Player & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md)' }}>
                  <iframe 
                    src={videos[activeVideoIdx].embed}
                    title="Lecture Player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  />
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: 12 }}>{videos[activeVideoIdx].title}</h2>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Duration: {videos[activeVideoIdx].duration} mins</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Playback Speed:</span>
                      {['1.0x', '1.25x', '1.5x', '2.0x'].map((speed) => (
                        <button 
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                          style={{
                            background: playbackSpeed === speed ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                            border: 'none', borderRadius: '4px', color: '#fff', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', transition: 'var(--transition-fast)'
                          }}
                        >
                          {speed}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 14 }}>
                    <button 
                      onClick={() => {
                        if (!completedVideos.includes(activeVideoIdx)) {
                          setCompletedVideos([...completedVideos, activeVideoIdx]);
                        }
                      }}
                      className="btn btn-primary btn-small"
                      style={{ display: 'flex', gap: 6, alignItems: 'center' }}
                    >
                      <CheckCircle size={14} />
                      {completedVideos.includes(activeVideoIdx) ? 'Completed' : 'Mark as Completed'}
                    </button>
                    <button 
                      onClick={() => {
                        const next = (activeVideoIdx + 1) % videos.length;
                        setActiveVideoIdx(next);
                      }}
                      className="btn btn-secondary btn-small"
                    >
                      Next Lesson
                    </button>
                  </div>
                </div>

                {/* Notes section */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px' }}>Syllabus Notebook</h3>
                  <textarea 
                    className="form-textarea"
                    placeholder="Type notes for this lecture..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ minHeight: '80px', marginBottom: 12 }}
                  />
                  <button 
                    onClick={() => {
                      if (!notes.trim()) return;
                      setSavedNotes([
                        ...savedNotes, 
                        { text: notes, lecture: videos[activeVideoIdx].title, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                      ]);
                      setNotes('');
                      setToastMessage('✓ Note saved successfully.');
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="btn btn-primary btn-small"
                    style={{ float: 'right' }}
                  >
                    Save Note
                  </button>
                  <div style={{ clear: 'both' }} />

                  {savedNotes.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20, borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
                      <h4 style={{ fontSize: '13px', color: '#fff' }}>Saved Notes:</h4>
                      {savedNotes.map((n, i) => (
                        <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.015)', fontSize: '12px', border: '1px solid var(--glass-border)' }}>
                          <div style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 4 }}>
                            {n.lecture} 
                            <span style={{ color: 'var(--text-muted)', fontSize: '10px', float: 'right' }}>{n.time}</span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{n.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Playlist & Completion Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Watch Progress Gauge */}
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: 8 }}>Course Watch Progress</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <span>Modules completed</span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>
                      {completedVideos.length} / {videos.length} ({Math.round((completedVideos.length / videos.length) * 100)}%)
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${(completedVideos.length / videos.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 16 }}>Lecture Playlist</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {videos.map((vid, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActiveVideoIdx(idx)}
                        style={{
                          padding: '12px', borderRadius: '10px', cursor: 'pointer',
                          background: activeVideoIdx === idx ? 'var(--accent-primary)' : 'rgba(255,255,255,0.015)',
                          border: '1px solid',
                          borderColor: activeVideoIdx === idx ? 'var(--accent-primary)' : 'var(--glass-border)',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: '12px', color: activeVideoIdx === idx ? '#fff' : 'var(--text-primary)', fontWeight: 600 }}>Lecture {idx + 1}</span>
                          {completedVideos.includes(idx) && <CheckCircle size={12} style={{ color: 'var(--color-success)' }} />}
                        </div>
                        <p style={{ fontSize: '11px', color: activeVideoIdx === idx ? '#e0e7ff' : 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>{vid.title}</p>
                        <span style={{ fontSize: '10px', color: activeVideoIdx === idx ? '#c7d2fe' : 'var(--text-muted)' }}>{vid.duration} mins</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. RESOURCES & ASSETS SUBPAGE */}
          {activeSubpage === 'resources' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }} className="catalog-layout">
              {/* Left: Resource Categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px' }}>Curriculum Material Downloads</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { name: 'Introduction to Full Stack Architecture.pdf', size: '1.8 MB', icon: FileText, type: 'PDF Notes' },
                      { name: 'SkeinLMS Database Design Schema.pptx', size: '4.2 MB', icon: FileText, type: 'PPT Slides' },
                      { name: 'express-authentication-crud-brief.pdf', size: '1.2 MB', icon: FileText, type: 'Assignments' },
                      { name: 'skein-lms-boilerplate-starter.zip', size: '14.5 MB', icon: Code, type: 'Source Code' },
                      { name: 'Modern JS ES6 Reference Sheet.pdf', size: '920 KB', icon: FileText, type: 'Cheat Sheets' },
                      { name: 'mock-assessment-payloads.json', size: '140 KB', icon: Code, type: 'Practice Files' }
                    ].map((res, idx) => {
                      const Icon = res.icon;
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                              <Icon size={16} style={{ color: 'var(--accent-primary)' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{res.name}</div>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{res.type} • {res.size}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => triggerMockDownload(res.name)}
                            className="btn btn-secondary btn-small"
                            style={{ display: 'flex', gap: 6, alignItems: 'center' }}
                          >
                            <FileDown size={14} /> Download
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Reference Links */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', height: 'fit-content' }}>
                <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 16 }}>External References</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'React Documentation', url: 'https://react.dev' },
                    { label: 'MDN Web JavaScript', url: 'https://developer.mozilla.org' },
                    { label: 'MySQL Reference Manual', url: 'https://dev.mysql.com' },
                    { label: 'Node.js API Endpoint Guide', url: 'https://nodejs.org' }
                  ].map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '12px', transition: 'var(--transition-fast)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <span>{link.label}</span>
                      <Link2 size={12} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. QUIZZES & ASSESSMENTS SUBPAGE */}
          {activeSubpage === 'quizzes' && (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: 8 }}>Module Practice Assessment</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 24 }}>Test your comprehension before proceeding to final projects.</p>

                {quizSubmitted ? (
                  <div style={{ padding: '10px 0' }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Award size={32} />
                      </div>
                      <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: 8 }}>Assessment Graded!</h2>
                      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: 20 }}>
                        Score: <strong>{quizScore} / {quizQuestions.length}</strong> ({Math.round((quizScore/quizQuestions.length)*100)}%)
                      </p>
                      <button 
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="btn btn-secondary btn-small"
                      >
                        Reset & Try Again
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>
                      <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: 4 }}>Detailed Correction Review:</h4>
                      {quizQuestions.map((q, idx) => {
                        const isCorrect = quizAnswers[idx] === q.answer;
                        return (
                          <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, background: isCorrect ? 'rgba(16,185,129,0.01)' : 'rgba(239,68,68,0.01)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>
                                Question {idx + 1}: {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                              </span>
                            </div>
                            <h5 style={{ fontSize: '14px', color: '#fff', marginBottom: 10 }}>{q.q}</h5>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                              Your Answer: <strong style={{ color: isCorrect ? '#fff' : 'var(--color-error)' }}>{quizAnswers[idx]}</strong>
                            </div>
                            {!isCorrect && (
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                                Correct Answer: <strong style={{ color: 'var(--color-success)' }}>{q.answer}</strong>
                              </div>
                            )}
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '10px', marginTop: 10, lineHeight: 1.4 }}>
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {quizQuestions.map((q, idx) => (
                      <div key={idx} style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600 }}>Question {idx + 1}</span>
                        <h4 style={{ fontSize: '15px', color: '#fff', margin: '6px 0 16px 0' }}>{q.q}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {q.options.map((opt) => (
                            <label 
                              key={opt}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                                background: quizAnswers[idx] === opt ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.01)',
                                border: '1px solid', borderColor: quizAnswers[idx] === opt ? 'var(--accent-primary)' : 'var(--glass-border)',
                                transition: 'var(--transition-fast)'
                              }}
                            >
                              <input 
                                type="radio" 
                                name={`question-${idx}`}
                                value={opt}
                                checked={quizAnswers[idx] === opt}
                                onChange={() => setQuizAnswers({ ...quizAnswers, [idx]: opt })}
                                style={{ accentColor: 'var(--accent-primary)' }}
                                required
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                    >
                      Submit Assessment
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* 4. ASSIGNMENTS SUBPAGE */}
          {activeSubpage === 'assignments' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }} className="catalog-layout">
              {/* Left: Upload portal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: 12 }}>Upload Coursework</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 20 }}>Submit your coursework repository or project zip file for review.</p>

                  <form onSubmit={handleAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                      border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '30px 20px', textAlign: 'center', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.005)', transition: 'var(--transition-fast)'
                    }}
                      onClick={() => setAssignmentFile('skein_crud_express_project.zip')}
                    >
                      <PlusCircle size={28} style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'inline-block' }} />
                      <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                        {assignmentFile ? `Selected File: ${assignmentFile}` : 'Simulate choosing coursework ZIP file'}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ZIP, RAR, or PDF format accepted. Max 25MB.</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Submission Note / Repository URL</label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="e.g., https://github.com/username/skein-crud-backend"
                        value={assignmentComment}
                        onChange={(e) => setAssignmentComment(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!assignmentFile}>
                      Submit Coursework
                    </button>
                  </form>
                </div>

                {/* Submissions feed */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: 14 }}>Submission Status History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {uploadedAssignments.map((a, i) => {
                      const isGraded = a.status.includes('Graded');
                      return (
                        <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--glass-border)', fontSize: '13px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <strong style={{ color: '#fff' }}>{a.fileName}</strong>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '12px', 
                              fontSize: '11px', 
                              backgroundColor: isGraded ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', 
                              color: isGraded ? 'var(--color-success)' : 'var(--color-warning)', 
                              fontWeight: 600 
                            }}>
                              {a.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 8 }}>Submitted on: {a.date}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            <strong>Feedback:</strong> {a.feedback}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Rubric briefs */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', height: 'fit-content' }}>
                <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 14 }}>Assignment Brief</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.6, marginBottom: 16 }}>
                  Implement a node backend containing CRUD endpoints to retrieve and modify user database records securely. 
                </p>
                <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: 8 }}>Grading Rubric:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', gap: 8 }}><Check size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> <span>Valid Express router structures (40%)</span></div>
                  <div style={{ display: 'flex', gap: 8 }}><Check size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> <span>Safe MySQL transaction controls (30%)</span></div>
                  <div style={{ display: 'flex', gap: 8 }}><Check size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> <span>Middleware authorization validation (30%)</span></div>
                </div>
              </div>
            </div>
          )}

          {/* 5. PROGRESS TRACKING SUBPAGE */}
          {activeSubpage === 'progress' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {/* Radial Gauge */}
                <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <svg style={{ width: '120px', height: '120px', transform: 'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        fill="transparent" 
                        stroke="var(--accent-primary)" 
                        strokeWidth="8" 
                        strokeDasharray={2 * Math.PI * 50} 
                        strokeDashoffset={2 * Math.PI * 50 * (1 - 0.75)} 
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 6px var(--accent-glow))' }}
                      />
                    </svg>
                    <span style={{ position: 'absolute', fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>75%</span>
                  </div>
                  <h4 style={{ fontSize: '16px', color: '#fff', marginBottom: 6 }}>Syllabus Completion</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>9 of 12 milestones ticked off in developer track.</p>
                </div>

                {/* Benchmarks Stats */}
                <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h4 style={{ fontSize: '15px', color: '#fff' }}>Syllabus Benchmarks</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Hours studied</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>24.8 Hours</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Quizzes submitted</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>5 submissions</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Assignments posted</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>3 projects</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Study Streak</span>
                      <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>🔥 6 Days</span>
                    </div>
                  </div>
                </div>

                {/* Milestones timeline */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: 16 }}>Upcoming Milestones</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Unlock custom middleware endpoints', done: true },
                      { label: 'Submit authentication CRUD project', done: true },
                      { label: 'Pass security mock assessment', done: false },
                      { label: 'Generate graduation certificate', done: false }
                    ].map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '12px', color: m.done ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '4px', border: '1px solid var(--glass-border)',
                          backgroundColor: m.done ? 'var(--color-success-bg)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {m.done && <Check size={10} style={{ color: 'var(--color-success)' }} />}
                        </div>
                        <span style={{ textDecoration: m.done ? 'line-through' : 'none' }}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Hours Bar Chart */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '16px', color: '#fff', marginBottom: 20 }}>Study Activity (This Week)</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '160px', padding: '0 20px', gap: 12 }}>
                  {[
                    { day: 'Mon', hours: 2.0, pct: '32%' },
                    { day: 'Tue', hours: 4.5, pct: '72%' },
                    { day: 'Wed', hours: 3.0, pct: '48%' },
                    { day: 'Thu', hours: 1.5, pct: '24%' },
                    { day: 'Fri', hours: 5.0, pct: '80%' },
                    { day: 'Sat', hours: 6.2, pct: '99%' },
                    { day: 'Sun', hours: 0.0, pct: '2%' }
                  ].map((d, i) => (
                    <div key={i} className="chart-bar-container">
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill" style={{ height: d.pct }} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{d.day}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{d.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. CERTIFICATIONS SUBPAGE */}
          {activeSubpage === 'certificates' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }} className="catalog-layout">
              {/* Left: Generator Form */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: 12 }}>Verified Certificate Generator</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 20 }}>Generate an official Skein LMS achievement credential verifying your completion scores.</p>

                <form onSubmit={handleCertificateGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name on Certificate</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g., Arjun Krishnan"
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course Specialization Category</label>
                    <select 
                      className="form-select"
                      value={certCategory}
                      onChange={(e) => setCertCategory(e.target.value)}
                    >
                      <option value="React.js Developer Pathway">React.js Developer Specialization</option>
                      <option value="Python Programming & Data Structures">Python Programming & Data Structures</option>
                      <option value="MySQL Database Administration">MySQL Database Administration</option>
                      <option value="DevOps Infrastructure & CI/CD">DevOps Infrastructure & CI/CD</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary">Generate Credentials</button>
                </form>
              </div>

              {/* Right: Certificate View */}
              <div>
                {generatedCertificate ? (
                  <div className="glass-panel" style={{
                    padding: '24px', borderRadius: '16px', border: '2px solid rgba(245,158,11,0.2)',
                    background: 'linear-gradient(135deg, rgba(18,19,26,0.95) 0%, rgba(245,158,11,0.02) 100%)',
                    textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden'
                  }}>
                    {/* Gold watermark design element */}
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, opacity: 0.1, background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                    
                    <Award size={40} style={{ color: '#f59e0b', margin: '0 auto' }} />
                    <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.15em' }}>VERIFIED DIPLOMA CERTIFICATE</span>
                    
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>This is proudly awarded to:</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit', marginTop: 4 }}>{generatedCertificate.name}</div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>For successfully completing syllabus tasks in:</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: 4 }}>{generatedCertificate.category}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                      <svg width="60" height="60" viewBox="0 0 100 100">
                        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="#f59e0b" strokeWidth="2" />
                        <polygon points="50,18 82,34 82,66 50,82 18,66 18,34" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                        <path d="M40,50 L47,57 L60,43" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12, fontSize: '11px', color: 'var(--text-muted)' }}>
                      <div>Date Issued: {generatedCertificate.date}</div>
                      <div>Verification Hash: {generatedCertificate.hash}</div>
                    </div>

                    <button 
                      onClick={() => {
                        triggerMockDownload(`Certificate_${generatedCertificate.hash}.pdf`);
                      }}
                      className="btn btn-secondary btn-small"
                      style={{ background: 'none', border: '1px solid var(--glass-border)', width: '100%' }}
                    >
                      Export PDF Document
                    </button>
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', minHeight: '260px' }}>
                    <Award size={32} style={{ color: 'var(--text-muted)', marginBottom: 8, display: 'inline-block' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Fill out the form to generate your completion verified credential mockup.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. DISCUSSION FORUM SUBPAGE */}
          {activeSubpage === 'forum' && (
            <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: 16 }}>Start a Discussion</h3>
                <form onSubmit={addForumPost} style={{ display: 'flex', gap: 14 }}>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Ask a technical question about the curriculum..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Send size={14} /> Ask
                  </button>
                </form>
              </div>

              {/* Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {forumPosts.map((post) => (
                  <div key={post.id} className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{post.user}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{post.date}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.5 }}>{post.text}</p>
                    
                    <div style={{ display: 'flex', gap: 14, fontSize: '11px', color: 'var(--text-muted)', marginBottom: 12 }}>
                      <button 
                        onClick={() => {
                          const updated = forumPosts.map(p => p.id === post.id ? { ...p, likes: p.likes + 1 } : p);
                          setForumPosts(updated);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        👍 Upvote ({post.likes})
                      </button>
                      <span>•</span>
                      <span>{post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}</span>
                    </div>

                    {/* Replies view */}
                    {post.replies.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 16, borderLeft: '2px solid var(--glass-border)', marginTop: 12, marginBottom: 12 }}>
                        {post.replies.map((rep, idx) => (
                          <div key={idx} style={{ background: 'rgba(255,255,255,0.008)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--glass-border)', fontSize: '12px' }}>
                            <div style={{ color: 'var(--accent-secondary)', fontWeight: 600, marginBottom: 2 }}>{rep.user}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>{rep.text}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Submit reply inline */}
                    <form onSubmit={(e) => addForumReply(post.id, e)} style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Write a reply..." 
                        value={replyInputs[post.id] || ''}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [post.id]: e.target.value })}
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                        required
                      />
                      <button type="submit" className="btn btn-secondary btn-small" style={{ padding: '8px 14px' }}>Reply</button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. LIVE CLASSES SUBPAGE */}
          {activeSubpage === 'live' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }} className="catalog-layout">
              {/* Left: Stream Player Mock */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: '#0a0b10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {/* Live indicator tag */}
                    <span style={{
                      position: 'absolute', top: 20, left: 20, padding: '4px 10px', borderRadius: '12px',
                      backgroundColor: 'var(--color-error)', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, zIndex: 10
                    }}>
                      <span style={{ width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'loading-pulse 1s infinite' }} />
                      LIVE STREAM ({streamTimer})
                    </span>

                    {/* Viewer Counter */}
                    <span style={{
                      position: 'absolute', top: 20, right: 20, padding: '4px 10px', borderRadius: '12px',
                      backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 6, zIndex: 10, border: '1px solid var(--glass-border)'
                    }}>
                      <Users size={12} style={{ color: 'var(--accent-primary)' }} />
                      148 Watching
                    </span>

                    {/* Simulated Code Deck Share */}
                    <div style={{ width: '85%', height: '70%', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '16px', boxSizing: 'border-box', textAlign: 'left', fontFamily: 'monospace', fontSize: '11px', overflow: 'hidden' }}>
                      <div style={{ color: '#6b7280', borderBottom: '1px solid var(--glass-border)', paddingBottom: 6, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                        <span>📂 CustomHooksMasterclass.jsx</span>
                        <span style={{ color: 'var(--color-success)' }}>● ONLINE</span>
                      </div>
                      <span style={{ color: '#a855f7' }}>import</span> React, &#123; useState, useEffect &#125; <span style={{ color: '#a855f7' }}>from</span> <span style={{ color: '#10b981' }}>'react'</span>;<br /><br />
                      <span style={{ color: '#a855f7' }}>export default function</span> <span style={{ color: '#6366f1' }}>useAuthentication</span>() &#123;<br />
                      &nbsp;&nbsp;<span style={{ color: '#a855f7' }}>const</span> [user, setUser] = useState(<span style={{ color: '#f59e0b' }}>null</span>);<br /><br />
                      &nbsp;&nbsp;useEffect(() =&gt; &#123;<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#a855f7' }}>const</span> token = localStorage.getItem(<span style={{ color: '#10b981' }}>'auth-token'</span>);<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#6b7280' }}>// Verify signature on backend...</span><br />
                      &nbsp;&nbsp;&nbsp;&nbsp;validateToken(token).then(setUser);<br />
                      &nbsp;&nbsp;&#125;, []);<br /><br />
                      &nbsp;&nbsp;<span style={{ color: '#a855f7' }}>return</span> &#123; user, isAuthenticated: !!user &#125;;<br />
                      &#125;
                    </div>

                    {/* Webcam overlay */}
                    <div style={{
                      position: 'absolute', bottom: 15, right: 15, width: '56px', height: '56px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', border: '2px solid var(--color-success)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: 'var(--shadow-md)'
                    }}>
                      <div style={{ fontSize: '18px' }}>👩‍🏫</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: 4 }}>React Custom Hook Patterns</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Presenter: Dr. Sarah Jenkins (AI & CS Lead)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Audio wave indicator */}
                    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      <div className="audio-bar" />
                      <div className="audio-bar" />
                      <div className="audio-bar" />
                      <div className="audio-bar" />
                    </div>
                    <button onClick={() => {
                      setToastMessage('Successfully joined streaming conference bridge.');
                      setTimeout(() => setToastMessage(null), 3000);
                    }} className="btn btn-primary btn-small">Join Session</button>
                  </div>
                </div>
              </div>

              {/* Right: Live Chat */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '380px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: 10 }}>Session Live Chat</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '240px', paddingRight: 6 }}>
                    {liveChat.map((msg, i) => (
                      <div key={i} style={{ fontSize: '12px', lineHeight: 1.4 }}>
                        <strong style={{ color: msg.user.includes('TA') || msg.user.includes('Instructor') ? 'var(--color-warning)' : 'var(--accent-primary)' }}>{msg.user}: </strong>
                        <span style={{ color: 'var(--text-secondary)' }}>{msg.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={addChatMessage} style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Send message to class..."
                    value={newChatText}
                    onChange={(e) => setNewChatText(e.target.value)}
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-small" style={{ padding: '8px 12px' }}><Send size={12} /></button>
                </form>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
