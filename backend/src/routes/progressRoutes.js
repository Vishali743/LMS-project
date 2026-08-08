const express = require('express');
const router = express.Router();
const { toggleLessonProgress, getCourseProgress } = require('../controllers/progressController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/toggle/:lessonId', toggleLessonProgress);
router.get('/course/:courseId', getCourseProgress);
router.get('/:courseId', getCourseProgress); // GET /progress/:courseId
router.post('/update', toggleLessonProgress); // POST /progress/update

module.exports = router;
