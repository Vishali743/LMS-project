import React from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import heroImg from '../assets/hero.png';

// Native intersection observer animated counter
function AnimatedCounter({ target, suffix = '', duration = 1500 }) {
  const [count, setCount] = React.useState(0);
  const elementRef = React.useRef(null);

  React.useEffect(() => {
    let observer;
    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    const handleIntersect = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        animationFrameId = window.requestAnimationFrame(step);
        if (observer && elementRef.current) {
          observer.unobserve(elementRef.current);
        }
      }
    };

    if (elementRef.current && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      try {
        observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
        observer.observe(elementRef.current);
      } catch (err) {
        setCount(target);
      }
    } else {
      setCount(target);
    }

    return () => {
      if (observer && typeof observer.disconnect === 'function') observer.disconnect();
      if (animationFrameId && typeof window !== 'undefined' && window.cancelAnimationFrame) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, duration]);

  return <span ref={elementRef}>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const handleLearnMore = (e) => {
    e.preventDefault();
    const element = document.getElementById('why-learn-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="home-section" className="container-wide" style={{ paddingBottom: '80px' }}>
      
      {/* 1. Hero banner */}
      <section className="hero-section">
        <div className="hero-text-content">
          <span className="badge badge-instructor" style={{ marginBottom: '16px', textTransform: 'none', letterSpacing: '0' }}>
            ✨ Next Generation LMS
          </span>
          
          <h1 style={{ fontSize: '48px', lineHeight: 1.15, marginBottom: '24px', fontWeight: 800 }}>
            Unlock Your Limits. <br />
            <span className="text-gradient">Learn Without Boundaries.</span>
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', lineHeight: 1.6, marginBottom: '36px', maxWidth: '540px' }}>
            SkeinLMS combines self-paced video lectures, server-evaluated quizzes, curriculum assignments, and instantly generated course certificates in a premium learning environment.
          </p>

          <div className="hero-buttons">
            <Link to="/courses" className="btn btn-primary" style={{ padding: '14px 28px' }}>
              Explore Courses
              <ArrowRight size={16} />
            </Link>
            <a href="#why-learn-section" onClick={handleLearnMore} className="btn btn-secondary" style={{ padding: '14px 28px', textDecoration: 'none' }}>
              Learn More
            </a>
          </div>
        </div>

        {/* Visual panel - 3D Online Learning Illustration */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', width: '100%' }} className="animate-float">
          {/* Premium gradient lighting backgrounds */}
          <div style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, transparent 70%)',
            filter: 'blur(35px)',
            top: '-5%',
            left: '-5%',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%)',
            filter: 'blur(35px)',
            bottom: '-5%',
            right: '-5%',
            zIndex: 0
          }} />

          {/* Main 3D Illustration Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '460px',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-lg), 0 20px 50px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            zIndex: 1,
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={heroImg} 
              alt="Skein LMS Learning" 
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Floating Glassmorphic Card 1 */}
          <div className="glass-panel animate-float-slow no-print" style={{
            position: 'absolute',
            top: '12%',
            right: '-8%',
            padding: '10px 18px',
            borderRadius: '14px',
            border: '1px solid var(--glass-border)',
            fontSize: '12px',
            fontWeight: 600,
            color: '#fff',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 2,
            background: 'rgba(18, 19, 26, 0.75)',
            backdropFilter: 'blur(12px)'
          }}>
            <span style={{ fontSize: '14px' }}>✨</span>
            <span>Accredited Syllabus</span>
          </div>

          {/* Floating Glassmorphic Card 2 */}
          <div className="glass-panel animate-float-opposite no-print" style={{
            position: 'absolute',
            bottom: '12%',
            left: '-8%',
            padding: '10px 18px',
            borderRadius: '14px',
            border: '1px solid var(--glass-border)',
            fontSize: '12px',
            fontWeight: 600,
            color: '#fff',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 2,
            background: 'rgba(18, 19, 26, 0.75)',
            backdropFilter: 'blur(12px)'
          }}>
            <span style={{ fontSize: '14px' }}>🎓</span>
            <span>Verified Certificate</span>
          </div>
        </div>
      </section>

      {/* 2. Stats strip */}
      <section className="glass-panel" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        padding: '30px 40px',
        borderRadius: '20px',
        marginBottom: '80px',
        textAlign: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
            <AnimatedCounter target={15} suffix="K+" />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active Students</div>
        </div>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
            <AnimatedCounter target={250} suffix="+" />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Specialized Courses</div>
        </div>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
            <AnimatedCounter target={98} suffix="%" />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Success Rate</div>
        </div>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
            <AnimatedCounter target={50} suffix="+" />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Expert Instructors</div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="why-learn-section" style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '30px', marginBottom: '12px' }}>Why Learn With <span className="text-gradient">SkeinLMS</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Everything you need to advance your career or train your students.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '30px'
        }}>
          <Link to="/features/syllabus" className="glass-card" style={{ textDecoration: 'none', display: 'block', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
            <Zap size={28} style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#fff' }}>Interactive Syllabus</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
              Follow structured paths with video frames, markdown sheets, resource downloads, and checkmark toggles.
            </p>
            <span style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              Explore Syllabus <ArrowRight size={14} />
            </span>
          </Link>

          <Link to="/features/assessments" className="glass-card" style={{ textDecoration: 'none', display: 'block', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
            <Award size={28} style={{ color: 'var(--accent-secondary)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#fff' }}>Instant Assessments</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
              Evaluate sections with multiple choice assessments, automatically graded on the backend servers.
            </p>
            <span style={{ fontSize: '13px', color: 'var(--accent-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              Explore Quizzes <ArrowRight size={14} />
            </span>
          </Link>

          <Link to="/features/certificates" className="glass-card" style={{ textDecoration: 'none', display: 'block', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
            <ShieldCheck size={28} style={{ color: 'var(--color-success)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#fff' }}>Verified Certificates</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
              Generate official course graduation certificates dynamically upon completing curriculum lectures.
            </p>
            <span style={{ fontSize: '13px', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              Explore Credentials <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* 4. Testimonials strip */}
      <section className="glass-panel" style={{ padding: '60px 40px', borderRadius: '24px', textAlign: 'center', marginBottom: '80px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>What Scholars Say</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 36px', fontStyle: 'italic', lineHeight: 1.6 }}>
          "The interactive quiz grading and video lesson tracker allowed me to complete my study modules on React and MySQL in less than three weeks offline! Excellent interface design."
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gradient)' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Alexa Vance</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>React Developer Grad</div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section style={{
        background: 'var(--accent-gradient)',
        borderRadius: '24px',
        padding: '50px 40px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <h2 style={{ fontSize: '32px', color: '#fff', marginBottom: '12px' }}>Start Learning Today</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', maxWidth: '500px', margin: '0 auto 30px' }}>
          Join thousands of students and build actual full-stack software, graphical UI styles, or marketing strategies.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyStyle: 'center', justifyContent: 'center' }}>
          <Link to="/register/student" className="btn btn-secondary" style={{ backgroundColor: '#fff', color: '#0a0b10', border: 'none' }}>
            Sign Up Free
          </Link>
          <Link to="/courses" className="btn btn-secondary" style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#fff', background: 'none' }}>
            Explore Catalog
          </Link>
        </div>
      </section>

    </div>
  );
}
