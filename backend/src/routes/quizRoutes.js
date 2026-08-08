const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/quizController');
const { authMiddleware, isInstructor } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Student results log
router.get('/student/results', getStudentResults);

// Instructor actions
router.post('/course/:courseId', isInstructor, createQuiz);
router.post('/:quizId/questions', isInstructor, saveQuizQuestions);
router.get('/course/:courseId/grades', isInstructor, getCourseGrades);
router.put('/:quizId', isInstructor, updateQuiz);
router.delete('/:quizId', isInstructor, deleteQuiz);

// Student & general course interaction
router.get('/course/:courseId', getQuizzesByCourse);
router.get('/:quizId', getQuizById);
router.post('/:quizId/attempt', submitQuizAttempt);
router.post('/:quizId/submit', submitQuizAttempt); // Mapping user URL request
router.get('/:quizId/attempts', getQuizAttempts);

module.exports = router;
