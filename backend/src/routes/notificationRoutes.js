const express = require('express');
const router = express.Router();
const { getNotifications, readNotification, readAllNotifications } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getNotifications);
router.put('/:id/read', readNotification);
router.post('/read-all', readAllNotifications);

module.exports = router;
