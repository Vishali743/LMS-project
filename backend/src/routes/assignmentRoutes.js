const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignmentsByCourse,
  submitAssignment,
  gradeAssignment,
  getStudentSubmissions,
  getMySubmissions,
  createCourseAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  getInstructorAllSubmissions,
  returnAssignment,
  deleteSubmission
} = require('../controllers/assignmentController');
const { authMiddleware, isInstructor } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Instructor routes (Specific paths first)
router.get('/instructor/all-submissions', isInstructor, getInstructorAllSubmissions);
router.post('/section/:sectionId', isInstructor, createAssignment);
router.post('/course/:courseId', isInstructor, createCourseAssignment);
router.post('/grade/:submissionId', isInstructor, gradeAssignment);
router.put('/submission/:submissionId/grade', isInstructor, gradeAssignment);
router.get('/course/:courseId/submissions', isInstructor, getStudentSubmissions);
router.post('/submission/:submissionId/return', isInstructor, returnAssignment);
router.delete('/submission/:submissionId', isInstructor, deleteSubmission);

// Dynamic assignment ID routes
router.put('/:assignmentId', isInstructor, updateAssignment);
router.delete('/:assignmentId', isInstructor, deleteAssignment);
router.get('/:assignmentId/submissions', isInstructor, getAssignmentSubmissions);

// Student & general course routes
router.get('/course/:courseId', getAssignmentsByCourse); // GET /courses/:id/assignments
router.post('/:assignmentId/submit', submitAssignment); // POST /assignments/:id/submit
router.get('/course/:courseId/my', getMySubmissions);

module.exports = router;
