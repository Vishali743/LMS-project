const firebase = require('../config/firebase');

function useFallback() {
  return !firebase.isInitialized();
}

async function getStudentProgress(studentId, courseId) {
  const docId = `${studentId}_${courseId}`;
  if (useFallback()) {
    if (!global.mockProgress) global.mockProgress = {};
    const record = global.mockProgress[docId];
    return {
      completed_lessons: record ? record.completed_lessons : [],
      completedLessons: record ? record.completed_lessons.length : 0,
      totalLessons: 6,
      completedQuizzesCount: 0,
      totalQuizzesCount: 1,
      completedAssignmentsCount: 0,
      totalAssignmentsCount: 1
    };
  }

  try {
    const db = firebase.getFirestoreDb();
    const docSnap = await db.collection('progress').doc(docId).get();
    const completed = docSnap.exists ? (docSnap.data().completed_lessons || []) : [];
    
    const courseSnap = await db.collection('courses').doc(String(courseId)).get();
    let totalLessons = 6;
    if (courseSnap.exists) {
      const cData = courseSnap.data();
      totalLessons = 0;
      (cData.sections || []).forEach(s => {
        totalLessons += s.lessons?.length || 0;
      });
    }

    return {
      completed_lessons: completed,
      completedLessons: completed.length,
      totalLessons: totalLessons || 6,
      completedQuizzesCount: 0,
      totalQuizzesCount: 1,
      completedAssignmentsCount: 0,
      totalAssignmentsCount: 1
    };
  } catch (err) {
    console.error('Failed to get progress from Firestore:', err.message);
    return {
      completed_lessons: [],
      completedLessons: 0,
      totalLessons: 6,
      completedQuizzesCount: 0,
      totalQuizzesCount: 1,
      completedAssignmentsCount: 0,
      totalAssignmentsCount: 1
    };
  }
}

async function toggleLessonProgress(studentId, courseId, lessonId, isCompleted) {
  const docId = `${studentId}_${courseId}`;
  if (useFallback()) {
    if (!global.mockProgress) global.mockProgress = {};
    if (!global.mockProgress[docId]) {
      global.mockProgress[docId] = { completed_lessons: [] };
    }
    const list = global.mockProgress[docId].completed_lessons;
    const idx = list.indexOf(String(lessonId));
    if (isCompleted && idx === -1) {
      list.push(String(lessonId));
    } else if (!isCompleted && idx !== -1) {
      list.splice(idx, 1);
    }
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    const docRef = db.collection('progress').doc(docId);
    const docSnap = await docRef.get();
    
    let completed = [];
    if (docSnap.exists) {
      completed = docSnap.data().completed_lessons || [];
    }

    const idx = completed.indexOf(String(lessonId));
    if (isCompleted && idx === -1) {
      completed.push(String(lessonId));
    } else if (!isCompleted && idx !== -1) {
      completed.splice(idx, 1);
    }

    await docRef.set({
      student_id: String(studentId),
      course_id: String(courseId),
      completed_lessons: completed,
      updated_at: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to toggle progress in Firestore:', err.message);
    return false;
  }
}

module.exports = {
  getStudentProgress,
  toggleLessonProgress
};
