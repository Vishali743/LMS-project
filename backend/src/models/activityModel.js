const firebase = require('../config/firebase');

function useFallback() {
  const db = require('../config/db');
  return !db.getPool() && (!firebase.isInitialized() || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
}

async function logActivity(userId, activityType, description) {
  if (useFallback()) {
    if (!global.mockActivities) global.mockActivities = [];
    global.mockActivities.unshift({
      id: global.mockActivities.length + 1,
      user_id: userId,
      activity_type: activityType,
      description,
      created_at: new Date().toISOString()
    });
    return;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('recent_activities').add({
      user_id: String(userId),
      activity_type: activityType,
      description,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log activity to Firestore:', err.message);
  }
}

async function getUserActivities(userId) {
  if (useFallback()) {
    if (!global.mockActivities) return [];
    return global.mockActivities.filter(a => String(a.user_id) === String(userId));
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('recent_activities')
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
    console.error('Failed to query user activities from Firestore:', err.message);
    return [];
  }
}

module.exports = {
  logActivity,
  getUserActivities
};
