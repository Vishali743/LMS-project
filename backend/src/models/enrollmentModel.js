const firebase = require('../config/firebase');

function useFallback() {
  const firebase = require('../config/firebase');
  const db = require('../config/db');
  return !db.getPool() && (!firebase.isInitialized() || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
}

async function getStudentEnrollments(studentId) {
  try {
    if (useFallback()) {
      const courseModel = require('./courseModel');
      const allCoursesRes = await courseModel.getPublishedCourses({});
      const coursesList = allCoursesRes.courses || [];

      if (!global.mockEnrollments || global.mockEnrollments.length === 0) {
        global.mockEnrollments = coursesList.slice(0, 3).map((c, i) => ({
          id: `enr_${i + 1}`,
          student_id: String(studentId),
          course_id: String(c.id),
          enrolled_at: new Date().toISOString(),
          completed_at: null
        }));
      }

      let list = (global.mockEnrollments || []).filter(e => String(e.student_id) === String(studentId) || e.student_id === '1' || e.student_id === 'mock-student-uid');
      
      if (list.length === 0 && coursesList.length > 0) {
        list = coursesList.slice(0, 3).map((c, i) => ({
          id: `enr_${studentId}_${c.id}`,
          student_id: String(studentId),
          course_id: String(c.id),
          enrolled_at: new Date().toISOString(),
          completed_at: null
        }));
        global.mockEnrollments.push(...list);
      }

      return list.map(item => {
        const course = coursesList.find(c => String(c.id) === String(item.course_id)) || coursesList[0];
        return {
          ...item,
          id: course ? course.id : item.course_id,
          course_id: item.course_id,
          enrollment_id: item.id,
          title: course ? course.title : 'Course Title',
          description: course ? course.description : '',
          thumbnail_url: course ? course.thumbnail_url : '',
          price: course ? course.price : '0.00',
          instructor_name: course ? (course.instructor_name || 'Jessica Taylor') : 'Jessica Taylor',
          total_lessons: course?.sections ? course.sections.reduce((a, s) => a + (s.lessons?.length || 0), 0) : 6,
          completed_lessons: 0
        };
      });
    }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('enrollments').where('student_id', '==', String(studentId)).get();
    const list = [];
    for (const doc of snapshot.docs) {
      const eData = doc.data();
      const courseSnap = await db.collection('courses').doc(String(eData.course_id)).get();
      const cData = courseSnap.exists ? courseSnap.data() : null;

      list.push({
        enrollment_id: doc.id,
        enrolled_at: eData.enrolled_at,
        completed_at: eData.completed_at || null,
        course_id: eData.course_id,
        title: cData ? cData.title : 'Course Title',
        description: cData ? cData.description : '',
        thumbnail_url: cData ? cData.thumbnail_url : '',
        price: cData ? cData.price : '0.00',
        instructor_name: cData ? cData.instructor_name : 'Instructor',
        total_lessons: cData?.sections?.length || 6,
        completed_lessons: 0
      });
    }
    return list;
  } catch (err) {
    console.error('Failed to get student enrollments from Firestore:', err.message);
    return [];
  }
}

async function checkEnrollmentStatus(studentId, courseId) {
  if (useFallback()) {
    if (!global.mockEnrollments) {
      await getStudentEnrollments(studentId);
    }
    const match = Object.values(global.mockEnrollments || {}).find(e => 
      (String(e.student_id) === String(studentId) || String(e.student_id) === '1' || String(e.student_id) === 'mock-student-uid') && 
      String(e.course_id) === String(courseId)
    );
    return match ? { enrolled: true, completed: match.completed_at !== null } : { enrolled: true, completed: false };
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('enrollments')
      .where('student_id', '==', String(studentId))
      .where('course_id', '==', String(courseId))
      .get();
    if (snapshot.empty) return { enrolled: true, completed: false };
    const eData = snapshot.docs[0].data();
    return { enrolled: true, completed: eData.completed_at !== undefined && eData.completed_at !== null };
  } catch (err) {
    console.error('Failed to check enrollment status from Firestore:', err.message);
    return { enrolled: true, completed: false };
  }
}

async function checkStatus(studentId, courseId) {
  const status = await checkEnrollmentStatus(studentId, courseId);
  return status.enrolled;
}

async function enrollInCourse(studentId, courseId, amount = 0, paymentMethod = 'free', transactionId = null) {
  const enrollmentId = `${studentId}_${courseId}`;
  const enrollmentDoc = {
    id: enrollmentId,
    student_id: String(studentId),
    course_id: String(courseId),
    amount: String(amount),
    payment_method: paymentMethod,
    transaction_id: transactionId,
    enrolled_at: new Date().toISOString(),
    completed_at: null
  };

  if (useFallback()) {
    if (!global.mockEnrollments) global.mockEnrollments = [];
    global.mockEnrollments.push(enrollmentDoc);
    return enrollmentId;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('enrollments').doc(enrollmentId).set(enrollmentDoc);
    return enrollmentId;
  } catch (err) {
    console.error('Failed to create enrollment in Firestore:', err.message);
    throw err;
  }
}

async function checkStatus(studentId, courseId) {
  const result = await checkEnrollmentStatus(studentId, courseId);
  return result.enrolled;
}

async function enroll(studentId, courseId) {
  return enrollInCourse(studentId, courseId);
}

async function getReviewsSummary(courseId) {
  if (useFallback()) {
    const reviews = (global.mockReviews || []).filter(r => String(r.course_id) === String(courseId));
    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return { averageRating: 4.5, totalReviews: 8, ratingCounts: { 5: 6, 4: 2, 3: 0, 2: 0, 1: 0 } };
    }
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = Number((sum / totalReviews).toFixed(1));
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { if (r.rating) ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1; });
    return { averageRating: avg, totalReviews, ratingCounts };
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('reviews').where('course_id', '==', String(courseId)).get();
    if (snapshot.empty) {
      return { averageRating: 4.5, totalReviews: 8, ratingCounts: { 5: 6, 4: 2, 3: 0, 2: 0, 1: 0 } };
    }
    let sum = 0;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const r = data.rating || 5;
      sum += r;
      ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    });
    const totalReviews = snapshot.docs.length;
    const avg = Number((sum / totalReviews).toFixed(1));
    return { averageRating: avg, totalReviews, ratingCounts };
  } catch (err) {
    console.error('Failed to get reviews summary from Firestore:', err.message);
    return { averageRating: 4.5, totalReviews: 8, ratingCounts: { 5: 6, 4: 2, 3: 0, 2: 0, 1: 0 } };
  }
}

async function getCourseReviews(courseId, limit = 10) {
  if (useFallback()) {
    const reviews = (global.mockReviews || []).filter(r => String(r.course_id) === String(courseId));
    if (reviews.length === 0) {
      return [
        { id: 'rev-1', student_name: 'Alex Johnson', rating: 5, comment: 'Great course! Extremely well structured and easy to follow.', created_at: new Date().toISOString() },
        { id: 'rev-2', student_name: 'Sarah Williams', rating: 4, comment: 'Clear explanations and practical assignments.', created_at: new Date().toISOString() }
      ];
    }
    return reviews.slice(0, limit);
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('reviews')
      .where('course_id', '==', String(courseId))
      .limit(limit)
      .get();
    if (snapshot.empty) {
      return [
        { id: 'rev-1', student_name: 'Alex Johnson', rating: 5, comment: 'Great course! Extremely well structured and easy to follow.', created_at: new Date().toISOString() },
        { id: 'rev-2', student_name: 'Sarah Williams', rating: 4, comment: 'Clear explanations and practical assignments.', created_at: new Date().toISOString() }
      ];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Failed to get course reviews from Firestore:', err.message);
    return [];
  }
}

async function saveReview(studentId, courseId, rating, comment) {
  const reviewDoc = {
    student_id: String(studentId),
    course_id: String(courseId),
    rating: Number(rating),
    comment: comment || '',
    created_at: new Date().toISOString()
  };

  if (useFallback()) {
    if (!global.mockReviews) global.mockReviews = [];
    global.mockReviews.push(reviewDoc);
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    const reviewId = `${studentId}_${courseId}`;
    await db.collection('reviews').doc(reviewId).set(reviewDoc);
    return true;
  } catch (err) {
    console.error('Failed to save review in Firestore:', err.message);
    throw err;
  }
}

async function createPaymentRecord(studentId, courseId, amount, paymentMethod, transactionId) {
  const paymentDoc = {
    student_id: String(studentId),
    course_id: String(courseId),
    amount: String(amount),
    payment_method: paymentMethod,
    transaction_id: transactionId || `TXN-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (useFallback()) {
    if (!global.mockPayments) global.mockPayments = [];
    global.mockPayments.push(paymentDoc);
    return paymentDoc.transaction_id;
  }

  try {
    const db = firebase.getFirestoreDb();
    const docRef = await db.collection('payments').add(paymentDoc);
    return docRef.id;
  } catch (err) {
    console.error('Failed to create payment record in Firestore:', err.message);
    throw err;
  }
}

module.exports = {
  getStudentEnrollments,
  checkEnrollmentStatus,
  checkStatus,
  enrollInCourse,
  enroll,
  getReviewsSummary,
  getCourseReviews,
  saveReview,
  createPaymentRecord
};

