const db = require('../config/db');

function useFallback() {
  return !db.getPool();
}

if (!global.mockQuizzes) {
  global.mockQuizzes = [];
}
if (!global.mockQuestions) {
  global.mockQuestions = [];
}
if (!global.mockQuestionOptions) {
  global.mockQuestionOptions = [];
}
if (!global.mockQuizResults) {
  global.mockQuizResults = [];
}

// Pre-seed mock quiz datasets if empty
if (global.mockQuizzes.length === 0) {
  for (let cId = 1; cId <= 6; cId++) {
    for (let m = 1; m <= 3; m++) {
      const qId = (cId - 1) * 3 + m;
      const secId = (cId - 1) * 3 + m;
      global.mockQuizzes.push({
        id: qId,
        course_id: cId,
        section_id: secId,
        title: `Module ${m} Assessment Quiz`,
        max_score: 30,
        passingPercentage: 70,
        timeLimit: 15,
        randomizeQuestions: false,
        shuffleAnswers: false
      });

      const questionsData = [
        { id: (qId - 1) * 3 + 1, qText: `What is the core structural design pattern of Module ${m}?` },
        { id: (qId - 1) * 3 + 2, qText: `How do we optimize execution metrics in Module ${m}?` },
        { id: (qId - 1) * 3 + 3, qText: `True or False: Direct polling is preferred over event streams in Module ${m}.` }
      ];

      questionsData.forEach((q, qIdx) => {
        global.mockQuestions.push({
          id: q.id,
          quiz_id: qId,
          question_text: q.qText,
          question_type: qIdx === 2 ? 'true_false' : 'multiple_choice',
          points: 10
        });

        if (qIdx === 2) {
          global.mockQuestionOptions.push({ id: (q.id - 1) * 4 + 1, question_id: q.id, option_text: 'True', is_correct: 0 });
          global.mockQuestionOptions.push({ id: (q.id - 1) * 4 + 2, question_id: q.id, option_text: 'False (Correct)', is_correct: 1 });
        } else {
          global.mockQuestionOptions.push({ id: (q.id - 1) * 4 + 1, question_id: q.id, option_text: 'Option A: High latency fallback', is_correct: 0 });
          global.mockQuestionOptions.push({ id: (q.id - 1) * 4 + 2, question_id: q.id, option_text: 'Option B: Thread safety caching (Correct)', is_correct: 1 });
          global.mockQuestionOptions.push({ id: (q.id - 1) * 4 + 3, question_id: q.id, option_text: 'Option C: Unsynchronized global storage', is_correct: 0 });
          global.mockQuestionOptions.push({ id: (q.id - 1) * 4 + 4, question_id: q.id, option_text: 'Option D: Ad-hoc local polling', is_correct: 0 });
        }
      });
    }
  }
}

if (global.mockQuizResults.length === 0) {
  global.mockQuizResults.push({
    id: 1,
    student_id: 1,
    quiz_id: 1,
    score: 30,
    attempted_at: '2026-07-28T10:00:00Z'
  });
  global.mockQuizResults.push({
    id: 2,
    student_id: 1,
    quiz_id: 2,
    score: 20,
    attempted_at: '2026-07-28T12:00:00Z'
  });
  global.mockQuizResults.push({
    id: 3,
    student_id: 1,
    quiz_id: 3,
    score: 30,
    attempted_at: '2026-07-29T08:00:00Z'
  });
}

async function createQuiz(courseId, sectionId, title, maxScore) {
  if (useFallback()) {
    const id = global.mockQuizzes.length + 1;
    global.mockQuizzes.push({
      id,
      course_id: parseInt(courseId),
      section_id: sectionId ? parseInt(sectionId) : null,
      title,
      max_score: maxScore || 100
    });
    return id;
  }
  const result = await db.query(
    'INSERT INTO quizzes (course_id, section_id, title, max_score) VALUES (?, ?, ?, ?)',
    [courseId, sectionId || null, title, maxScore || 100]
  );
  return result.insertId;
}

async function getQuizById(id) {
  if (useFallback()) {
    return global.mockQuizzes.find(q => q.id === parseInt(id)) || null;
  }
  const results = await db.query('SELECT * FROM quizzes WHERE id = ?', [id]);
  return results.length > 0 ? results[0] : null;
}

async function getQuizzesByCourse(courseId) {
  if (useFallback()) {
    return global.mockQuizzes.filter(q => q.course_id === parseInt(courseId));
  }
  return db.query('SELECT * FROM quizzes WHERE course_id = ?', [courseId]);
}

async function getQuestionsByQuiz(quizId) {
  if (useFallback()) {
    return global.mockQuestions.filter(q => q.quiz_id === parseInt(quizId));
  }
  return db.query(
    'SELECT id, question_text, question_type, points FROM quiz_questions WHERE quiz_id = ?',
    [quizId]
  );
}

async function getOptionsByQuestion(questionId, showAnswers = false) {
  if (useFallback()) {
    return global.mockQuestionOptions
      .filter(o => o.question_id === parseInt(questionId))
      .map(o => {
        if (showAnswers) return o;
        const { is_correct, ...rest } = o;
        return rest;
      });
  }
  const selectQuery = showAnswers 
    ? 'SELECT id, option_text, is_correct FROM question_options WHERE question_id = ?'
    : 'SELECT id, option_text FROM question_options WHERE question_id = ?';
  return db.query(selectQuery, [questionId]);
}

// Transactional Quiz Questions Builder
async function saveQuestionsAndOptions(quizId, questionsList) {
  if (useFallback()) {
    const qId = parseInt(quizId);
    global.mockQuestions = global.mockQuestions.filter(q => q.quiz_id !== qId);
    
    questionsList.forEach(q => {
      const questionId = global.mockQuestions.length + 1;
      global.mockQuestions.push({
        id: questionId,
        quiz_id: qId,
        question_text: q.questionText,
        question_type: q.questionType || 'multiple_choice',
        points: q.points || 10
      });
      if (Array.isArray(q.options)) {
        q.options.forEach(opt => {
          const optionId = global.mockQuestionOptions.length + 1;
          global.mockQuestionOptions.push({
            id: optionId,
            question_id: questionId,
            option_text: opt.optionText,
            is_correct: opt.isCorrect ? 1 : 0
          });
        });
      }
    });
    return true;
  }

  const connection = await db.getPool().getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId]);

    for (const q of questionsList) {
      const [qResult] = await connection.execute(
        'INSERT INTO quiz_questions (quiz_id, question_text, question_type, points) VALUES (?, ?, ?, ?)',
        [quizId, q.questionText, q.questionType || 'multiple_choice', q.points || 10]
      );
      const questionId = qResult.insertId;

      if (Array.isArray(q.options)) {
        for (const opt of q.options) {
          await connection.execute(
            'INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
            [questionId, opt.optionText, opt.isCorrect ? 1 : 0]
          );
        }
      }
    }

    await connection.commit();
    connection.release();
    return true;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

// Submit a quiz attempt log
async function saveQuizAttempt(studentId, quizId, score) {
  if (useFallback()) {
    const id = global.mockQuizResults.length + 1;
    global.mockQuizResults.push({
      id,
      student_id: parseInt(studentId),
      quiz_id: parseInt(quizId),
      score,
      attempted_at: new Date().toISOString()
    });
    return id;
  }
  const result = await db.query(
    'INSERT INTO quiz_results (student_id, quiz_id, score) VALUES (?, ?, ?)',
    [studentId, quizId, score]
  );
  return result.insertId;
}

// Verify answer correctness
async function checkAnswerCorrectness(optionId, questionId) {
  if (useFallback()) {
    const option = global.mockQuestionOptions.find(
      o => o.id === parseInt(optionId) && o.question_id === parseInt(questionId)
    );
    return option ? option.is_correct === 1 : false;
  }
  const results = await db.query(
    'SELECT is_correct FROM question_options WHERE id = ? AND question_id = ?',
    [optionId, questionId]
  );
  return results.length > 0 && results[0].is_correct === 1;
}

// Get student quiz attempts
async function getStudentQuizAttempts(studentId, quizId) {
  if (useFallback()) {
    return global.mockQuizResults
      .filter(qr => qr.student_id === parseInt(studentId) && qr.quiz_id === parseInt(quizId))
      .sort((a, b) => new Date(b.attempted_at) - new Date(a.attempted_at));
  }
  return db.query(
    'SELECT id, score, attempted_at FROM quiz_results WHERE student_id = ? AND quiz_id = ? ORDER BY attempted_at DESC',
    [studentId, quizId]
  );
}

// Get course grades report
async function getCourseGradesReport(courseId) {
  if (useFallback()) {
    return [];
  }
  const sql = `
    SELECT u.id AS student_id, s_prof.display_name, u.email,
           q.title AS quiz_title, q.max_score,
           qr.score AS quiz_score, qr.attempted_at
    FROM enrollments e
    JOIN users u ON e.student_id = u.id
    JOIN students s_prof ON u.id = s_prof.user_id
    LEFT JOIN quizzes q ON q.course_id = e.course_id
    LEFT JOIN (
      SELECT qr1.student_id, qr1.quiz_id, qr1.score, qr1.attempted_at
      FROM quiz_results qr1
      WHERE qr1.score = (
        SELECT MAX(score) FROM quiz_results qr2 WHERE qr2.student_id = qr1.student_id AND qr2.quiz_id = qr1.quiz_id
      )
    ) qr ON qr.student_id = u.id AND qr.quiz_id = q.id
    WHERE e.course_id = ?
    ORDER BY s_prof.display_name ASC, q.title ASC
  `;
  return db.query(sql, [courseId]);
}

async function updateQuiz(id, title, maxScore) {
  if (useFallback()) {
    const quiz = global.mockQuizzes.find(q => q.id === parseInt(id));
    if (quiz) {
      quiz.title = title;
      quiz.max_score = maxScore || quiz.max_score;
    }
    return;
  }
  return db.query('UPDATE quizzes SET title = ?, max_score = ? WHERE id = ?', [title, maxScore, id]);
}

async function deleteQuiz(id) {
  if (useFallback()) {
    global.mockQuizzes = global.mockQuizzes.filter(q => q.id !== parseInt(id));
    return;
  }
  return db.query('DELETE FROM quizzes WHERE id = ?', [id]);
}

module.exports = {
  createQuiz,
  getQuizById,
  getQuizzesByCourse,
  getQuestionsByQuiz,
  getOptionsByQuestion,
  saveQuestionsAndOptions,
  saveQuizAttempt,
  checkAnswerCorrectness,
  getStudentQuizAttempts,
  getCourseGradesReport,
  updateQuiz,
  deleteQuiz
};
