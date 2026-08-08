const express = require('express');
const router = express.Router();
const { getStudentDashboard } = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Dashboard endpoints require authentication
router.get('/student', authMiddleware, getStudentDashboard);

module.exports = router;
