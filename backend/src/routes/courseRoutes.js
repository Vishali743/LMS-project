const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCourses,
  getInstructorCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createSection,
  updateSection,
  deleteSection,
  getLessonDetails,
  createLesson,
  updateLesson,
  deleteLesson,
  getInstructorScholars
} = require('../controllers/courseController');
const { authMiddleware, isInstructor } = require('../middleware/authMiddleware');

// Public catalog routes
router.get('/categories', getCategories);
router.get('/', getCourses);

// Protected routes (require user session) - Specific routes MUST precede dynamic /:id
router.get('/instructor/me', authMiddleware, isInstructor, getInstructorCourses);
router.get('/instructor/students', authMiddleware, isInstructor, getInstructorScholars);
router.get('/:id', getCourseById);

router.post('/', authMiddleware, isInstructor, createCourse);
router.put('/:id', authMiddleware, isInstructor, updateCourse);
router.delete('/:id', authMiddleware, isInstructor, deleteCourse);

// Section routes
router.post('/:courseId/sections', authMiddleware, isInstructor, createSection);
router.put('/sections/:sectionId', authMiddleware, isInstructor, updateSection);
router.delete('/sections/:sectionId', authMiddleware, isInstructor, deleteSection);

// Lesson routes
router.get('/lessons/:lessonId', authMiddleware, getLessonDetails);
router.post('/sections/:sectionId/lessons', authMiddleware, isInstructor, createLesson);
router.put('/lessons/:lessonId', authMiddleware, isInstructor, updateLesson);
router.delete('/lessons/:lessonId', authMiddleware, isInstructor, deleteLesson);

module.exports = router;
