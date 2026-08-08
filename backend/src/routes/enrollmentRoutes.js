const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  checkEnrollmentStatus,
  createReview,
  checkoutCoursePayment
} = require('../controllers/enrollmentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All enrollment routes require authentication
router.use(authMiddleware);

router.post('/:courseId', enrollInCourse);
router.post('/:courseId/payment', checkoutCoursePayment);
router.get('/my', getMyEnrollments);
router.get('/:courseId/status', checkEnrollmentStatus);
router.post('/:courseId/review', createReview);

module.exports = router;
