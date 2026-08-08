const notificationModel = require('../models/notificationModel');

async function getNotifications(req, res) {
  try {
    const list = await notificationModel.getUserNotifications(req.user.id);
    return res.json({ notifications: list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

async function readNotification(req, res) {
  const { id } = req.params;
  try {
    await notificationModel.markAsRead(req.user.id, id);
    return res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to read notification' });
  }
}

async function readAllNotifications(req, res) {
  try {
    await notificationModel.markAllAsRead(req.user.id);
    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to read notifications' });
  }
}

module.exports = {
  getNotifications,
  readNotification,
  readAllNotifications
};
