import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Award, HelpCircle, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function QuizComponent({ quizId, onComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Running quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // questionId -> selectedOptionId
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/quizzes/${quizId}`);
        setQuiz(response.data.quiz);
        setQuestions(response.data.questions);
        setQuizStarted(false);
        setSubmissionResult(null);
        setSelectedAnswers({});
        setCurrentQuestionIdx(0);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch quiz details.');
      } finally {
        setLoading(false);
      }
    }
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      // Format answers for API payload: array of { questionId, selectedOptionId }
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, optId]) => ({
        questionId: parseInt(qId),
        selectedOptionId: optId
      }));

      const response = await api.post(`/quizzes/${quizId}/attempt`, {
        answers: formattedAnswers
      });
      
      setSubmissionResult(response.data);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit quiz attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setSubmissionResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
        <HelpCircle size={32} style={{ marginBottom: 12, color: 'var(--text-muted)' }} />
        <p>No questions found in this assessment.</p>
      </div>
    );
  }

  // --- RENDERING VIEWS ---

  // 1. Result screen
  if (submissionResult) {
    const isPass = submissionResult.percentage >= 70;
    return (
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: isPass ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
          color: isPass ? 'var(--color-success)' : 'var(--color-error)',
          marginBottom: '24px'
        }}>
          <Award size={36} />
        </div>

        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
          {isPass ? 'Assessment Completed!' : 'Assessment Attempted'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          {isPass ? 'Fantastic job! You passed the module quiz.' : 'Try reviewing the material and try again.'}
        </p>

        <div className="glass-panel" style={{
          maxWidth: '240px',
          margin: '0 auto 32px',
          padding: '20px',
          borderRadius: '12px',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: 4 }}>Your score</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'Outfit', color: '#fff' }}>
            {submissionResult.score} <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/ {submissionResult.maxScore}</span>
          </div>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: 'bold', 
            color: isPass ? 'var(--color-success)' : 'var(--color-warning)',
            marginTop: '8px'
          }}>
            {submissionResult.percentage}% Accuracy
          </div>
        </div>

        <button onClick={handleRestart} className="btn btn-secondary" style={{ display: 'inline-flex', gap: 6, margin: '0 auto' }}>
          <RefreshCw size={14} />
          Retake Quiz
        </button>
      </div>
    );
  }

  // 2. Start Welcome Screen
  if (!quizStarted) {
    return (
      <div className="glass-panel" style={{ padding: '36px', borderRadius: '16px', textAlign: 'center' }}>
        <HelpCircle size={40} className="text-gradient" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Assessment: {quiz.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', maxWidth: '460px', margin: '0 auto 24px' }}>
          This assessment verifies your understanding of the section curriculum. Submit all answers to receive score rankings.
        </p>

        <div style={{ display: 'flex', gap: 24, justifyStyle: 'center', justifyContent: 'center', marginBottom: '28px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>Questions: <strong>{questions.length}</strong></div>
          <div>•</div>
          <div>Max Score: <strong>{quiz.max_score} pts</strong></div>
          <div>•</div>
          <div>Passing Score: <strong>70%</strong></div>
        </div>

        <button onClick={() => setQuizStarted(true)} className="btn btn-primary" style={{ display: 'inline-flex', gap: 6, margin: '0 auto' }}>
          Start Assessment
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // 3. Question slide viewer
  const activeQuestion = questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === questions.length - 1;
  const hasSelected = selectedAnswers[activeQuestion.id] !== undefined;

  return (
    <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
      {/* Quiz Progress header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <span>Assessment Question {currentQuestionIdx + 1} of {questions.length}</span>
        <span className="badge badge-category">{activeQuestion.points} points</span>
      </div>

      {/* Progress slider bar */}
      <div className="progress-bar-container" style={{ height: '4px', marginBottom: '24px' }}>
        <div 
          className="progress-bar-fill" 
          style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%`, height: '100%' }} 
        />
      </div>

      {/* Question Text */}
      <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', lineHeight: 1.4 }}>
        {activeQuestion.question_text}
      </h3>

      {/* Choices lists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '32px' }}>
        {activeQuestion.options?.map(opt => {
          const isSelected = selectedAnswers[activeQuestion.id] === opt.id;
          return (
            <div 
              key={opt.id}
              onClick={() => handleOptionSelect(activeQuestion.id, opt.id)}
              className="glass-panel"
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.01)',
                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--glass-border)',
                transition: 'var(--transition-fast)'
              }}
            >
              <input 
                type="radio" 
                name={`quiz-question-${activeQuestion.id}`}
                checked={isSelected}
                onChange={() => handleOptionSelect(activeQuestion.id, opt.id)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                {opt.option_text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={handlePrev} 
          className="btn btn-secondary btn-small"
          disabled={currentQuestionIdx === 0}
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button 
            onClick={handleSubmit} 
            className="btn btn-primary btn-small"
            disabled={!hasSelected || submitting}
          >
            {submitting ? 'Grading answers...' : 'Submit Assessment'}
          </button>
        ) : (
          <button 
            onClick={handleNext} 
            className="btn btn-primary btn-small"
            disabled={!hasSelected}
          >
            Next Question
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
