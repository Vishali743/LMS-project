const firebase = require('../config/firebase');

function useFallback() {
  return !firebase.isInitialized();
}

async function getAssignmentsByCourse(courseId) {
  if (useFallback()) {
    const list = (global.mockAssignments || []).filter(a => String(a.course_id) === String(courseId));
    if (list.length === 0) {
      const courseModel = require('./courseModel');
      const sections = await courseModel.getSectionsByCourse(courseId);
      for (const sec of sections) {
        const assId = `ass_${Date.now()}_${sec.id}`;
        const newAss = {
          id: assId,
          course_id: String(courseId),
          section_id: String(sec.id),
          title: `Assignment: ${sec.title}`,
          description: `Complete all practical objectives for section: "${sec.title}". Submit a short summary text and your source code archive zip.`,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          max_points: 100,
          instructions: 'Upload file or write submission text.'
        };
        if (!global.mockAssignments) global.mockAssignments = [];
        global.mockAssignments.push(newAss);
        list.push(newAss);
      }
    }
    return list;
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('assignments').where('course_id', '==', String(courseId)).get();
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });

    if (list.length === 0) {
      const courseModel = require('./courseModel');
      const sections = await courseModel.getSectionsByCourse(courseId);
      const batch = db.batch();
      for (const sec of sections) {
        const assId = `ass_${courseId}_${sec.id}`;
        const newAss = {
          id: assId,
          course_id: String(courseId),
          section_id: String(sec.id),
          title: `${sec.title} Coursework`,
          description: `Write a short reflection or upload a document describing your deliverables for module: "${sec.title}".`,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          max_points: 100,
          instructions: 'Save as draft or submit final coursework. Attach code zips or PDF summaries.'
        };
        batch.set(db.collection('assignments').doc(assId), newAss);
        list.push({ id: assId, ...newAss });
      }
      await batch.commit();
    }
    return list;
  } catch (err) {
    console.error('Failed to get course assignments from Firestore:', err.message);
    return [];
  }
}

async function getAssignmentById(assignmentId) {
  if (useFallback()) {
    return (global.mockAssignments || []).find(a => String(a.id) === String(assignmentId)) || null;
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('assignments').doc(String(assignmentId)).get();
    if (!snapshot.exists) return null;
    return { id: snapshot.id, ...snapshot.data() };
  } catch (err) {
    console.error('Failed to get assignment by ID:', err.message);
    return null;
  }
}

async function saveSubmission(assignmentId, studentId, submissionText, fileUrl, isDraft = false) {
  const submissionId = `${studentId}_${assignmentId}`;
  const submissionDoc = {
    id: submissionId,
    assignment_id: String(assignmentId),
    student_id: String(studentId),
    submission_text: submissionText,
    file_url: fileUrl,
    is_draft: isDraft,
    points_earned: null,
    feedback: null,
    submitted_at: new Date().toISOString()
  };

  if (useFallback()) {
    if (!global.mockSubmissions) global.mockSubmissions = {};
    global.mockSubmissions[submissionId] = submissionDoc;
    return submissionId;
  }

  try {
    const db = firebase.getFirestoreDb();
    const ass = await getAssignmentById(assignmentId);
    if (ass) {
      submissionDoc.course_id = ass.course_id;
      submissionDoc.assignment_title = ass.title;
      submissionDoc.max_points = ass.max_points;
    }
    await db.collection('submissions').doc(submissionId).set(submissionDoc);
    return submissionId;
  } catch (err) {
    console.error('Failed to save submission in Firestore:', err.message);
    throw err;
  }
}

async function getStudentSubmissions(studentId, courseId) {
  if (useFallback()) {
    return Object.values(global.mockSubmissions || {}).filter(s => String(s.student_id) === String(studentId));
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('submissions')
      .where('student_id', '==', String(studentId))
      .get();
    const list = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!courseId || String(data.course_id) === String(courseId)) {
        list.push({ id: doc.id, ...data });
      }
    });
    return list;
  } catch (err) {
    console.error('Failed to get student submissions from Firestore:', err.message);
    return [];
  }
}

async function getSubmissionById(submissionId) {
  if (useFallback()) {
    return (global.mockSubmissions || {})[submissionId] || null;
  }

  try {
    const db = firebase.getFirestoreDb();
    const snap = await db.collection('submissions').doc(String(submissionId)).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    return null;
  }
}

async function gradeSubmission(submissionId, pointsEarned, feedback) {
  if (useFallback()) {
    const sub = (global.mockSubmissions || {})[submissionId];
    if (sub) {
      sub.points_earned = pointsEarned;
      sub.feedback = feedback;
    }
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('submissions').doc(String(submissionId)).update({
      points_earned: Number(pointsEarned),
      feedback: feedback,
      graded_at: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Failed to grade submission in Firestore:', err.message);
    return false;
  }
}

async function createAssignment(data) {
  const newId = `ass_${Date.now()}`;
  const docData = {
    id: newId,
    course_id: String(data.course_id),
    section_id: String(data.section_id),
    title: data.title,
    description: data.description,
    due_date: data.due_date,
    max_points: Number(data.max_points || 100),
    instructions: data.instructions || ''
  };

  if (useFallback()) {
    if (!global.mockAssignments) global.mockAssignments = [];
    global.mockAssignments.push(docData);
    return newId;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('assignments').doc(newId).set(docData);
    return newId;
  } catch (err) {
    console.error('Failed to create assignment in Firestore:', err.message);
    throw err;
  }
}

async function updateAssignment(assignmentId, data) {
  if (useFallback()) {
    const ass = (global.mockAssignments || []).find(a => String(a.id) === String(assignmentId));
    if (ass) Object.assign(ass, data);
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('assignments').doc(String(assignmentId)).update(data);
    return true;
  } catch (err) {
    return false;
  }
}

async function deleteAssignment(assignmentId) {
  if (useFallback()) {
    global.mockAssignments = (global.mockAssignments || []).filter(a => String(a.id) !== String(assignmentId));
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('assignments').doc(String(assignmentId)).delete();
    return true;
  } catch (err) {
    return false;
  }
}

async function getAllSubmissionsInstructor(instructorId) {
  if (useFallback()) {
    return [];
  }

  try {
    const db = firebase.getFirestoreDb();
    const coursesSnapshot = await db.collection('courses').where('instructor_id', '==', String(instructorId)).get();
    const courseIds = [];
    coursesSnapshot.forEach(doc => courseIds.push(doc.id));

    if (courseIds.length === 0) return [];

    const snapshot = await db.collection('submissions').get();
    const list = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (courseIds.includes(String(data.course_id))) {
        const student = await db.collection('users').doc(String(data.student_id)).get();
        const sData = student.exists ? student.data() : { display_name: 'Student' };
        
        list.push({
          id: doc.id,
          student_name: sData.display_name,
          ...data
        });
      }
    }
    return list;
  } catch (err) {
    console.error('Failed to get submissions for instructor:', err.message);
    return [];
  }
}

async function getMySubmissions(courseId, studentId) {
  return getStudentSubmissions(studentId, courseId);
}

async function getCourseSubmissions(courseId) {
  if (useFallback()) {
    return Object.values(global.mockSubmissions || {}).filter(s => !courseId || String(s.course_id) === String(courseId));
  }
  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('submissions').where('course_id', '==', String(courseId)).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    return [];
  }
}

async function returnForResubmission(submissionId) {
  if (useFallback()) {
    const sub = (global.mockSubmissions || {})[submissionId];
    if (sub) {
      sub.returned_for_resubmission = true;
    }
    return true;
  }
  try {
    const db = firebase.getFirestoreDb();
    await db.collection('submissions').doc(String(submissionId)).update({ returned_for_resubmission: true });
    return true;
  } catch (err) {
    return false;
  }
}

async function deleteSubmission(submissionId) {
  if (useFallback()) {
    if (global.mockSubmissions) delete global.mockSubmissions[submissionId];
    return true;
  }
  try {
    const db = firebase.getFirestoreDb();
    await db.collection('submissions').doc(String(submissionId)).delete();
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  getAssignmentsByCourse,
  getAssignmentById,
  getById: getAssignmentById,
  saveSubmission,
  getStudentSubmissions,
  getMySubmissions,
  getCourseSubmissions,
  getSubmissionById,
  gradeSubmission,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAllSubmissionsInstructor,
  getInstructorAllSubmissions: getAllSubmissionsInstructor,
  returnForResubmission,
  deleteSubmission
};

