const firebase = require('../config/firebase');

function useFallback() {
  const db = require('../config/db');
  return !db.getPool() && (!firebase.isInitialized() || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
}

function ensureMockUsers() {
  if (!global.mockUsers) {
    global.mockUsers = {
      'mock-student-uid': {
        id: 1,
        firebase_uid: 'mock-student-uid',
        email: 'student@skeinlms.com',
        role: 'student',
        display_name: 'Demo Student',
        student_code: 'STU-102938',
        created_at: new Date().toISOString()
      },
      'mock-instructor-uid': {
        id: 2,
        firebase_uid: 'mock-instructor-uid',
        email: 'instructor@skeinlms.com',
        role: 'instructor',
        display_name: 'Jessica Taylor',
        student_code: '',
        created_at: new Date().toISOString()
      },
      'mock-admin-uid': {
        id: 3,
        firebase_uid: 'mock-admin-uid',
        email: 'admin@skeinlms.com',
        role: 'admin',
        display_name: 'Demo Admin',
        student_code: '',
        created_at: new Date().toISOString()
      }
    };
  }
  return global.mockUsers;
}

async function findByUid(uid) {
  if (useFallback()) {
    const mockUsers = ensureMockUsers();
    return mockUsers[uid] || null;
  }

  try {
    const db = firebase.getFirestoreDb();
    const docRef = db.collection('users').doc(String(uid));
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;
    return { id: uid, ...snapshot.data() };
  } catch (err) {
    console.error('Failed to get user by UID from Firestore:', err.message);
    return null;
  }
}

async function findById(id) {
  if (useFallback()) {
    const mockUsers = ensureMockUsers();
    return Object.values(mockUsers).find(u => u.id === parseInt(id) || u.firebase_uid === id) || null;
  }
  return findByUid(id);
}

async function findByEmail(email) {
  if (useFallback()) {
    const mockUsers = ensureMockUsers();
    return Object.values(mockUsers).find(u => u.email === email) || null;
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.error('Failed to get user by email from Firestore:', err.message);
    return null;
  }
}

async function create(uid, email, displayName, role, photoUrl, password = null, studentCode = null) {
  const finalCode = studentCode || (role === 'student' ? 'STU-' + Math.floor(100000 + Math.random() * 900000) : '');
  
  if (useFallback()) {
    const mockUsers = ensureMockUsers();
    const id = Object.keys(mockUsers).length + 1;
    mockUsers[uid] = {
      id,
      firebase_uid: uid,
      email,
      role: role || 'student',
      display_name: displayName || email.split('@')[0],
      photo_url: photoUrl || '',
      student_code: finalCode,
      password,
      created_at: new Date().toISOString()
    };
    return id;
  }

  try {
    const db = firebase.getFirestoreDb();
    const userProfile = {
      firebase_uid: uid,
      email,
      role: role || 'student',
      display_name: displayName || email.split('@')[0],
      photo_url: photoUrl || '',
      student_code: finalCode,
      password,
      created_at: new Date().toISOString()
    };

    await db.collection('users').doc(String(uid)).set(userProfile);

    if (role === 'student') {
      await db.collection('students').doc(String(uid)).set({
        user_id: uid,
        display_name: displayName || email.split('@')[0],
        student_code: finalCode
      });
    } else if (role === 'instructor') {
      await db.collection('teachers').doc(String(uid)).set({
        user_id: uid,
        display_name: displayName || email.split('@')[0]
      });
    }

    return uid;
  } catch (err) {
    console.error('Failed to create user in Firestore:', err.message);
    throw err;
  }
}

async function update(uid, displayName, photoUrl, additionalFields = {}) {
  if (useFallback()) {
    const mockUsers = ensureMockUsers();
    const user = mockUsers[uid];
    if (user) {
      user.display_name = displayName;
      user.photo_url = photoUrl;
      Object.assign(user, additionalFields);
    }
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    const updates = {
      display_name: displayName,
      photo_url: photoUrl,
      ...additionalFields
    };
    await db.collection('users').doc(String(uid)).update(updates);
    
    const user = await findByUid(uid);
    if (user) {
      if (user.role === 'student') {
        await db.collection('students').doc(String(uid)).update({ display_name: displayName }).catch(() => {});
      } else if (user.role === 'instructor') {
        await db.collection('teachers').doc(String(uid)).update({ display_name: displayName }).catch(() => {});
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to update user in Firestore:', err.message);
    return false;
  }
}

async function getAll() {
  if (useFallback()) {
    const mockUsers = ensureMockUsers();
    return Object.values(mockUsers);
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('users').get();
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (err) {
    console.error('Failed to get all users from Firestore:', err.message);
    return [];
  }
}

async function updateRole(userId, newRole) {
  if (useFallback()) {
    const mockUsers = ensureMockUsers();
    const user = Object.values(mockUsers).find(u => String(u.id) === String(userId) || u.firebase_uid === userId);
    if (user) {
      user.role = newRole;
      return true;
    }
    return false;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('users').doc(String(userId)).update({ role: newRole });
    return true;
  } catch (err) {
    console.error('Failed to update user role in Firestore:', err.message);
    return false;
  }
}

module.exports = {
  findByUid,
  findById,
  findByEmail,
  create,
  update,
  getAll,
  updateRole
};

