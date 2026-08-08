const express = require('express');
const router = express.Router();
const { getProfile, syncProfile, getAllUsers, updateUserRole, getAdminStats, getAllEnrollmentsAdmin, register, login } = require('../controllers/authController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getProfile);
router.post('/sync', authMiddleware, syncProfile);

// Admin-only user directories management
router.get('/users', authMiddleware, isAdmin, getAllUsers);
router.put('/users/:userId/role', authMiddleware, isAdmin, updateUserRole);
router.get('/admin/stats', authMiddleware, isAdmin, getAdminStats);
router.get('/admin/enrollments', authMiddleware, isAdmin, getAllEnrollmentsAdmin);

module.exports = router;
