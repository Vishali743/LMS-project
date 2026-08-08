const firebase = require('../config/firebase');

function useFallback() {
  return !firebase.isInitialized();
}

async function addNotification(userId, message, type = 'general') {
  if (useFallback()) {
    if (!global.mockNotifications) global.mockNotifications = [];
    global.mockNotifications.unshift({
      id: global.mockNotifications.length + 1,
      user_id: userId,
      message,
      type,
      read: false,
      created_at: new Date().toISOString()
    });
    return;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('notifications').add({
      user_id: String(userId),
      message,
      type,
      read: false,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log notification to Firestore:', err.message);
  }
}

async function getUserNotifications(userId) {
  if (useFallback()) {
    if (!global.mockNotifications) return [];
    return global.mockNotifications.filter(n => String(n.user_id) === String(userId));
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('notifications')
      .where('user_id', '==', String(userId))
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();
    
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (err) {
    console.error('Failed to query notifications from Firestore:', err.message);
    return [];
  }
}

async function markAsRead(userId, notificationId) {
  if (useFallback()) {
    if (!global.mockNotifications) return;
    const notif = global.mockNotifications.find(n => String(n.id) === String(notificationId) && String(n.user_id) === String(userId));
    if (notif) notif.read = true;
    return;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('notifications').doc(String(notificationId)).update({ read: true });
  } catch (err) {
    console.error('Failed to mark notification as read in Firestore:', err.message);
  }
}

async function markAllAsRead(userId) {
  if (useFallback()) {
    if (!global.mockNotifications) return;
    global.mockNotifications.forEach(n => {
      if (String(n.user_id) === String(userId)) n.read = true;
    });
    return;
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('notifications')
      .where('user_id', '==', String(userId))
      .where('read', '==', false)
      .get();
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to mark all notifications as read in Firestore:', err.message);
  }
}

module.exports = {
  addNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
