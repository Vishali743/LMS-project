import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Clock, AlertTriangle, CheckCircle, XCircle, ArrowRight, ArrowLeft, RefreshCw, Award } from 'lucide-react';

export default function CourseQuiz() {
  const { id, quizId } = useParams(); // course ID & quiz ID
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quiz taking state
  const [answers, setAnswers] = useState({}); // questionId -> optionId
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadQuizData() {
      try {
        setLoading(true);
        const response = await api.get(`/quizzes/${quizId}`);
        const quizData = response.data.quiz;
        let questionsData = response.data.questions || [];

        // Apply shuffle rules if enabled
        if (quizData.randomizeQuestions) {
          questionsData = [...questionsData].sort(() => Math.random() - 0.5);
        }
        if (quizData.shuffleAnswers) {
          questionsData = questionsData.map(q => ({
            ...q,
            options: [...q.options].sort(() => Math.random() - 0.5)
          }));
        }

        setQuiz(quizData);
        setQuestions(questionsData);
        setTimeLeft((quizData.timeLimit || 30) * 60);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve quiz details.');
      } finally {
        setLoading(false);
      }
    }
    loadQuizData();
  }, [quizId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeft === null || isSubmitted) return;
    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isSubmitted]);

  const handleSelectOption = (questionId, optionId) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitted) return;
    
    // Format answers array: [{ questionId, selectedOptionId }]
    const answersPayload = Object.keys(answers).map(qId => ({
      questionId: parseInt(qId),
      selectedOptionId: parseInt(answers[qId])
    }));

    try {
      setLoading(true);
      const res = await api.post(`/quizzes/${quizId}/submit`, { answers: answersPayload });
      setResult(res.data);
      setIsSubmitted(true);
      
      // Dispatch notification trigger
      try {
        await api.post('/progress/update', { lessonId: 0, completed: true }); // triggers progress recount
      } catch (pErr) {
        console.warn(pErr);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit quiz results.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide" style={{ padding: '60px 0' }}>
        <div className="alert alert-error">{error}</div>
        <Link to={`/courses/${id}`} className="btn btn-secondary" style={{ marginTop: 20 }}>Back to Course</Link>
      </div>
    );
  }

  const activeQuestion = questions[activeQuestionIdx];

  // If submitted, show result details view
  if (isSubmitted && result) {
    const passed = result.percentage >= (quiz?.passingPercentage || 70);
    return (
      <div className="container-wide" style={{ maxWidth: '800px', paddingBottom: '80px' }}>
        
        {/* Result Header */}
        <div className="glass-panel" style={{
          padding: '40px',
          borderRadius: '24px',
          textAlign: 'center',
          border: `1px solid ${passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          background: `linear-gradient(135deg, #0f111a 0%, ${passed ? 'rgba(16,185,129,0.03)' : 'rgba(239,68,68,0.03)'} 100%)`,
          marginBottom: '32px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: passed ? 'var(--color-success)' : 'var(--color-error)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Award size={44} />
          </div>

          <h2 style={{ fontSize: '28px', color: '#fff', marginBottom: '8px' }}>
            {passed ? 'Assessment Cleared!' : 'Quiz Attempt Failed'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {passed ? 'Excellent work! You have passed the quiz and unlocked further course materials.' : 'You did not score enough to pass. Review module contents and attempt again.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, maxWidth: '480px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '16px 8px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Earned Score</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{result.score} pts</div>
            </div>
            <div className="glass-panel" style={{ padding: '16px 8px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Percentage</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: passed ? 'var(--color-success)' : 'var(--color-error)' }}>{result.percentage}%</div>
            </div>
            <div className="glass-panel" style={{ padding: '16px 8px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Passing Rate</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{quiz?.passingPercentage || 70}%</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: '32px' }}>
            <Link to={`/courses/${id}`} className="btn btn-secondary btn-small">Return to Syllabus</Link>
            <button onClick={() => window.location.reload()} className="btn btn-primary btn-small" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <RefreshCw size={14} /> Attempt Again
            </button>
          </div>
        </div>

        {/* Detailed Answers Key Review */}
        <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '20px' }}>Review Question Deliverables</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {questions.map((q, idx) => {
            const selectedOptId = parseInt(answers[q.id]);
            return (
              <div key={q.id} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: 12 }}>
                  <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 600 }}>Q{idx + 1}: {q.question_text}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{q.points || 10} pts</span>
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options?.map(opt => {
                    const isSelected = selectedOptId === opt.id;
                    const isCorrect = opt.is_correct === 1 || opt.is_correct === true;

                    let bg = 'transparent';
                    let border = 'var(--glass-border)';
                    let color = 'var(--text-secondary)';

                    if (isSelected) {
                      if (isCorrect) {
                        bg = 'rgba(16, 185, 129, 0.08)';
                        border = 'var(--color-success)';
                        color = '#fff';
                      } else {
                        bg = 'rgba(239, 68, 68, 0.08)';
                        border = 'var(--color-error)';
                        color = '#fff';
                      }
                    } else if (isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.04)';
                      border = 'rgba(16, 185, 129, 0.3)';
                    }

                    return (
                      <div 
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${border}`,
                          backgroundColor: bg,
                          color: color,
                          fontSize: '13px'
                        }}
                      >
                        <span>{opt.option_text}</span>
                        {isSelected && isCorrect && <CheckCircle size={15} style={{ color: 'var(--color-success)' }} />}
                        {isSelected && !isCorrect && <XCircle size={15} style={{ color: 'var(--color-error)' }} />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation text */}
                {q.explanation && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px dashed var(--glass-border)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    );
  }

  // Active quiz question test taker panel
  return (
    <div className="container-wide" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '30px', minHeight: '80vh', paddingBottom: '80px' }}>
      
      {/* Question panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Header summary */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: 4 }}>{quiz?.title}</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Question {activeQuestionIdx + 1} of {questions.length}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: timeLeft < 60 ? 'var(--color-error)' : '#fff', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', fontWeight: 'bold' }}>
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question card */}
        {activeQuestion && (
          <div className="glass-panel" style={{ padding: '36px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '24px' }}>
              {activeQuestion.question_text}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeQuestion.options?.map(opt => {
                const isSelected = answers[activeQuestion.id] === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(activeQuestion.id, opt.id)}
                    style={{
                      padding: '14px 20px',
                      borderRadius: '12px',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                      background: isSelected ? 'rgba(255, 51, 68, 0.06)' : 'rgba(255,255,255,0.01)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  >
                    {opt.option_text}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Previous / Next pagination navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setActiveQuestionIdx(prev => Math.max(prev - 1, 0))}
            className="btn btn-secondary btn-small"
            disabled={activeQuestionIdx === 0}
            style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: activeQuestionIdx === 0 ? 0.4 : 1 }}
          >
            <ArrowLeft size={14} /> Previous Question
          </button>

          {activeQuestionIdx < questions.length - 1 ? (
            <button
              onClick={() => setActiveQuestionIdx(prev => prev + 1)}
              className="btn btn-secondary btn-small"
              style={{ display: 'flex', gap: 6, alignItems: 'center' }}
            >
              Next Question <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              className="btn btn-primary btn-small"
              style={{ display: 'flex', gap: 6, alignItems: 'center' }}
            >
              Submit Quiz Deliverable
            </button>
          )}
        </div>

      </div>

      {/* Answer matrix sidebar */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', height: 'fit-content', position: 'sticky', top: '100px' }}>
        <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '0.5px' }}>
          Answer Sheet Index
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {questions.map((q, idx) => {
            const answered = answers[q.id] !== undefined;
            const isCurrent = idx === activeQuestionIdx;

            let border = 'var(--glass-border)';
            let bg = 'rgba(255,255,255,0.01)';
            let color = 'var(--text-secondary)';

            if (answered) {
              bg = 'rgba(255, 51, 68, 0.08)';
              border = 'rgba(255, 51, 68, 0.3)';
              color = '#fff';
            }
            if (isCurrent) {
              border = 'var(--accent-primary)';
            }

            return (
              <button
                key={q.id}
                onClick={() => setActiveQuestionIdx(idx)}
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  border: `1px solid ${border}`,
                  backgroundColor: bg,
                  color: color,
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', fontSize: '11px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255, 51, 68, 0.2)' }} />
            <span>Answered Question</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid var(--accent-primary)' }} />
            <span>Current Question</span>
          </div>
        </div>
      </div>

    </div>
  );
}
