const quizModel = require('../models/quizModel');
const courseModel = require('../models/courseModel');
const enrollmentModel = require('../models/enrollmentModel');

// Create Quiz (Instructor)
async function createQuiz(req, res) {
  const { courseId } = req.params;
  const { sectionId, title, max_score } = req.body;
  try {
    const course = await courseModel.getCourseById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const quizId = await quizModel.createQuiz(courseId, sectionId, title, max_score);
    return res.status(201).json({
      message: 'Quiz created successfully',
      quizId
    });
  } catch (error) {
    console.error('Error creating quiz:', error.message);
    return res.status(500).json({ error: 'Failed to create quiz' });
  }
}

// Add/Save Questions and Options for a Quiz
async function saveQuizQuestions(req, res) {
  const { quizId } = req.params;
  const { questions } = req.body;
  
  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: 'questions must be an array' });
  }

  try {
    const quiz = await quizModel.getQuizById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const course = await courseModel.getCourseById(quiz.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await quizModel.saveQuestionsAndOptions(quizId, questions);
    return res.json({ message: 'Quiz questions saved successfully' });
  } catch (error) {
    console.error('Error saving quiz questions:', error.message);
    return res.status(500).json({ error: 'Failed to save quiz questions' });
  }
}

// Get Quizzes by Course
async function getQuizzesByCourse(req, res) {
  const { courseId } = req.params;
  try {
    const quizzes = await quizModel.getQuizzesByCourse(courseId);
    return res.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error.message);
    return res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
}

// Get Quiz with Questions and Options
async function getQuizById(req, res) {
  const { quizId } = req.params;
  try {
    const quiz = await quizModel.getQuizById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const questions = await quizModel.getQuestionsByQuiz(quizId);
    const showAnswers = req.user.role !== 'student';

    for (let i = 0; i < questions.length; i++) {
      const options = await quizModel.getOptionsByQuestion(questions[i].id, showAnswers);
      questions[i].options = options;
    }

    return res.json({ quiz, questions });
  } catch (error) {
    console.error('Error fetching quiz details:', error.message);
    return res.status(500).json({ error: 'Failed to fetch quiz' });
  }
}

// Submit Quiz Attempt (Student)
async function submitQuizAttempt(req, res) {
  const { quizId } = req.params;
  const { answers } = req.body; // Array of { questionId, selectedOptionId }
  const studentId = req.user.id;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers must be an array' });
  }

  try {
    // 1. Verify Quiz exists
    const quiz = await quizModel.getQuizById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // 2. Verify enrollment
    const isEnrolled = await enrollmentModel.checkStatus(studentId, quiz.course_id);
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not enrolled in this course' });
    }

    // 3. Score evaluation
    const questions = await quizModel.getQuestionsByQuiz(quizId);
    let totalScore = 0;
    let maxScore = 0;

    for (const q of questions) {
      maxScore += q.points;
      const submittedAnswer = answers.find(a => a.questionId === q.id);
      if (submittedAnswer) {
        const isCorrect = await quizModel.checkAnswerCorrectness(submittedAnswer.selectedOptionId, q.id);
        if (isCorrect) {
          totalScore += q.points;
        }
      }
    }

    const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * quiz.max_score) : 0;

    // 4. Log attempt
    await quizModel.saveQuizAttempt(studentId, quizId, finalScore);

    // Log Activity
    const activityModel = require('../models/activityModel');
    const pct = quiz.max_score > 0 ? Math.round((finalScore / quiz.max_score) * 100) : 0;
    await activityModel.logActivity(studentId, 'quiz_complete', `Completed quiz: "${quiz.title}" with score ${finalScore}/${quiz.max_score} (${pct}%)`);

    return res.json({
      score: finalScore,
      maxScore: quiz.max_score,
      percentage: pct
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error.message);
    return res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
}

// Get Attempts History for a Quiz
async function getQuizAttempts(req, res) {
  const { quizId } = req.params;
  const studentId = req.user.id;
  try {
    const attempts = await quizModel.getStudentQuizAttempts(studentId, quizId);
    return res.json({ attempts });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error.message);
    return res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
}

// Get Grades for Course (Instructor)
async function getCourseGrades(req, res) {
  const { courseId } = req.params;
  try {
    const course = await courseModel.getCourseById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const grades = await quizModel.getCourseGradesReport(courseId);
    return res.json({ grades });
  } catch (error) {
    console.error('Error fetching course grades:', error.message);
    return res.status(500).json({ error: 'Failed to fetch grades' });
  }
}

async function updateQuiz(req, res) {
  const { quizId } = req.params;
  const { title, max_score } = req.body;
  try {
    const quiz = await quizModel.getQuizById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const course = await courseModel.getCourseById(quiz.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await quizModel.updateQuiz(quizId, title, max_score);
    return res.json({ message: 'Quiz updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update quiz' });
  }
}

async function deleteQuiz(req, res) {
  const { quizId } = req.params;
  try {
    const quiz = await quizModel.getQuizById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const course = await courseModel.getCourseById(quiz.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await quizModel.deleteQuiz(quizId);
    return res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete quiz' });
  }
}

async function getStudentResults(req, res) {
  try {
    const db = require('../config/db');
    const useFallback = !db.getPool();
    if (useFallback) {
      const attempts = (global.mockQuizResults || []).filter(r => r.student_id === req.user.id).map(r => {
        const quiz = (global.mockQuizzes || []).find(q => q.id === r.quiz_id);
        return {
          ...r,
          quiz_title: quiz ? quiz.title : 'Course Quiz Assessment'
        };
      });
      return res.json({ attempts });
    }
    const attempts = await db.query(
      `SELECT qr.*, q.title AS quiz_title 
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.id
       WHERE qr.student_id = ?
       ORDER BY qr.attempted_at DESC`,
      [req.user.id]
    );
    return res.json({ attempts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch student results' });
  }
}

module.exports = {
  createQuiz,
  saveQuizQuestions,
  getQuizzesByCourse,
  getQuizById,
  submitQuizAttempt,
  getQuizAttempts,
  getCourseGrades,
  updateQuiz,
  deleteQuiz,
  getStudentResults
};
