import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, ShieldCheck, Users, GraduationCap, 
  Briefcase, Award, TrendingUp, HelpCircle, X, Check, ArrowRight
} from 'lucide-react';

const AnimatedCounter = ({ endValue, duration = 1500, suffix = '' }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(endValue.replace(/[^0-9]/g, ''), 10);
    if (isNaN(end) || start === end) return;

    const totalSteps = 40;
    const stepTime = Math.abs(Math.floor(duration / totalSteps));
    const increment = Math.ceil(end / totalSteps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [endValue, duration]);

  return <span>{value.toLocaleString('en-IN')}{suffix}</span>;
};

export default function About() {
  const [selectedCard, setSelectedCard] = useState(null);

  const pillars = [
    {
      id: 'guided-learning',
      title: 'Guided Learning',
      short: 'Structured syllabus sections and chronological lectures ensure you do not skip vital steps.',
      icon: Compass,
      color: 'var(--accent-primary)',
      detailed: 'Our curriculum paths are structured into organized modules and sequential lessons. Designed by learning scientists, this progression prevents conceptual gaps, tracks learning speed, and includes integrated checkmarks so you always know your next step.',
      bullets: [
        'Curated week-by-week checkpoints',
        'Chronological video lectures and notes',
        'Visual checkbox progress mapping'
      ]
    },
    {
      id: 'academic-integrity',
      title: 'Academic Integrity',
      short: 'Assessments are evaluated server-side in MySQL to authenticate true grade performance.',
      icon: ShieldCheck,
      color: 'var(--color-success)',
      detailed: 'Skein LMS enforces authentic learning evaluations. Quizzes and assessments are run with custom time limits, random option shuffling, and instant server-side calculation to prevent tampering. All attempts log in relational schemas.',
      bullets: [
        'Secure server-side attempt validation',
        'Relational schema attempt logs',
        'Anti-cheat randomized option order'
      ]
    },
    {
      id: 'expert-faculty',
      title: 'Expert Faculty',
      short: 'Learn directly from leading corporate technologists, consultants, and scholars.',
      icon: Users,
      color: 'var(--accent-secondary)',
      detailed: 'Gain practical insights from certified field engineers, university lecturers, and corporate consultants with years of development experience. Get access to detailed code reviews, feedback forums, and weekly career panels.',
      bullets: [
        'Instructors with 10+ years industry experience',
        'Interactive Q&A support for every lecture',
        'Dedicated grading and review feedback'
      ]
    },
    {
      id: 'career-support',
      title: 'Career Support',
      short: 'Comprehensive counseling, resume critiques, and interview simulations.',
      icon: GraduationCap,
      color: 'var(--color-warning)',
      detailed: 'Unlock professional growth with our specialized placement mentors. Students receive 1-on-1 assistance with resume tailoring, portfolio reviews, behavioral interview strategies, and salary negotiations.',
      bullets: [
        '1-on-1 mentor guidance scheduling',
        'Resume critique and GitHub profile optimization',
        'Mock HR and technical interview drills'
      ]
    },
    {
      id: 'industry-projects',
      title: 'Industry Projects',
      short: 'Build production-ready applications for your professional portfolio.',
      icon: Briefcase,
      color: '#06b6d4',
      detailed: 'Apply your skills to solve real business situations. Develop API services, cloud servers, mobile app screens, and dashboard layouts modeled on projects from leading tech firms, complete with peer reviews.',
      bullets: [
        'Real-world business case prompts',
        'Step-by-step technical implementation checklists',
        'Portfolio-grade repository deliverables'
      ]
    },
    {
      id: 'certifications',
      title: 'Certifications',
      short: 'Earn verifiable shareable certificate credentials on course completion.',
      icon: Award,
      color: 'var(--color-success)',
      detailed: 'Celebrate your course completions. Receive a secure, custom-hash verified certificate highlighting course duration, category, and grading parameters, shareable directly on LinkedIn and job applications.',
      bullets: [
        'Secure cryptographically signed certificates',
        'One-click sharing to LinkedIn profiles',
        'Unique credentials verification backend URL'
      ]
    },
    {
      id: 'placement-assistance',
      title: 'Placement Assistance',
      short: 'Dedicated hiring partners and mock whiteboard challenges.',
      icon: TrendingUp,
      color: 'var(--accent-primary)',
      detailed: 'Accelerate your career placement. Skein LMS coordinates with over 80+ partner corporate recruiters, giving students priority application reviews, specialized hiring drives, and code assessments.',
      bullets: [
        'Direct hiring channels to tech companies',
        'Coding test assessments preparation',
        'Alumni networking directories'
      ]
    },
    {
      id: 'community-support',
      title: 'Community Support',
      short: 'Peer discussions, Q&A forums, and developer collaborative chatrooms.',
      icon: HelpCircle,
      color: 'var(--accent-secondary)',
      detailed: 'Learn together. Participate in discussion threads for every course lecture, ask questions, form cohort study groups, and connect with thousands of active tech enthusiasts across the student registry.',
      bullets: [
        'Lecture discussion boards & answers',
        'Cohort group chats & collaborative work',
        'Peer-to-peer workspace code review'
      ]
    }
  ];

  return (
    <div className="container-wide" style={{ maxWidth: '1100px', paddingBottom: '80px' }}>
      
      {/* Header section */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span className="badge badge-instructor" style={{ marginBottom: 12 }}>ABOUT US</span>
        <h1 style={{ fontSize: '42px', marginBottom: 16 }}>Learn Without Boundaries</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '16px', lineHeight: 1.6 }}>
          Skein LMS is a premium full-stack learning platform designed to bridge the gap between academic theory and real-world tech careers.
        </p>
      </div>

      {/* Counters Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '24px', 
        marginBottom: '60px' 
      }}>
        {[
          { label: 'Enrolled Students', val: '15000', suf: '+' },
          { label: 'Active Seeded Courses', val: '510', suf: '+' },
          { label: 'Expert Instructors', val: '120', suf: '+' },
          { label: 'Career Success Rate', val: '98', suf: '%' },
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel" style={{ textAlign: 'center', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-primary)', marginBottom: 6 }}>
              <AnimatedCounter endValue={stat.val} suffix={stat.suf} />
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Our Mission */}
      <div className="glass-panel" style={{ 
        padding: '40px', 
        borderRadius: '24px', 
        marginBottom: '60px', 
        border: '1px solid var(--glass-border)',
        background: 'linear-gradient(135deg, rgba(26,28,38,0.7) 0%, rgba(99,102,241,0.03) 100%)'
      }}>
        <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '16px' }}>Our Mission</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px', marginBottom: 16 }}>
          Founded in 2026, Skein LMS is an innovative response to bloated, slow learning software systems. We believe education should be fast, highly accessible, and visually clean.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px' }}>
          By consolidating video course play outlines, progress checkboxes, assignment uploads, and secure quiz attempts under a premium unified interface, Skein LMS allows students to maximize their learning curve and fast-track their corporate tech careers.
        </p>
      </div>

      {/* Interactive Pillars Grid */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '12px', textAlign: 'center', color: '#fff' }}>Skein LMS Core Pillars</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '40px', fontSize: '14px' }}>
          Click any card to explore the complete feature breakdown.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px' 
        }}>
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div 
                key={p.id} 
                onClick={() => setSelectedCard(p)}
                className="glass-card about-card" 
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
                    <Icon size={22} style={{ color: p.color }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', color: '#fff', marginBottom: 6 }}>{p.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                      {p.short}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600, marginTop: 10 }}>
                  <span>Learn More</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Footer */}
      <div style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid var(--glass-border)', marginTop: '60px' }}>
        <h3 style={{ fontSize: '22px', marginBottom: 8, color: '#fff' }}>Ready to start studying?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 24 }}>Explore our course catalog and find the exact path that fits your career aspirations.</p>
        <Link to="/courses" className="btn btn-primary" style={{ padding: '12px 32px' }}>
          Explore Catalog
        </Link>
      </div>

      {/* Card Details Modal popup */}
      {selectedCard && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 11, 16, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(10px)',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '550px',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            padding: '32px',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedCard(null)}
              style={{
                position: 'absolute',
                top: 24, right: 24,
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--glass-border)'
              }}>
                {React.createElement(selectedCard.icon, { size: 24, style: { color: selectedCard.color } })}
              </div>
              <h3 style={{ fontSize: '22px', color: '#fff' }}>{selectedCard.title}</h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              {selectedCard.detailed}
            </p>

            <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: '12px' }}>Key Highlights:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '32px' }}>
              {selectedCard.bullets.map((bullet, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={12} style={{ color: 'var(--color-success)' }} />
                  </div>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedCard(null)} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
