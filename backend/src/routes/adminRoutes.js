const express = require('express');
const router = express.Router();
const { getDashboardStats, getEnrollmentsList } = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Get overall platform metrics (Admin only)
router.get('/dashboard/stats', authMiddleware, isAdmin, getDashboardStats);

// Get detailed enrollments list (Admin only)
router.get('/enrollments', authMiddleware, isAdmin, getEnrollmentsList);

module.exports = router;
