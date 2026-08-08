const assignmentModel = require('../models/assignmentModel');
const courseModel = require('../models/courseModel');
const enrollmentModel = require('../models/enrollmentModel');

// Create Assignment (Instructor)
async function createAssignment(req, res) {
  const { sectionId } = req.params;
  const { title, description, max_points } = req.body;

  try {
    const section = await courseModel.getSectionById(sectionId);
    if (!section) return res.status(404).json({ error: 'Section not found' });

    const course = await courseModel.getCourseById(section.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: You do not own this course' });
    }

    const assignmentId = await assignmentModel.create(sectionId, title, description, max_points);
    return res.status(201).json({
      message: 'Assignment created successfully',
      assignmentId
    });
  } catch (error) {
    console.error('Error creating assignment:', error.message);
    return res.status(500).json({ error: 'Failed to create assignment' });
  }
}

// Get assignments in a course (Authenticated)
async function getAssignmentsByCourse(req, res) {
  const { courseId } = req.params;
  try {
    const assignments = await assignmentModel.getAssignmentsByCourse(courseId);
    return res.json({ assignments });
  } catch (error) {
    console.error('Error fetching course assignments:', error.message);
    return res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}

// Submit Assignment (Student)
async function submitAssignment(req, res) {
  const { assignmentId } = req.params;
  const { submissionText, fileUrl, isDraft } = req.body;
  const studentId = req.user.id;

  try {
    const assignment = await assignmentModel.getById(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    const isEnrolled = await enrollmentModel.checkStatus(studentId, assignment.course_id);
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You must be enrolled in the course to submit assignments' });
    }

    await assignmentModel.saveSubmission(assignmentId, studentId, submissionText, fileUrl, isDraft || false);

    // Log Activity & Add Notification
    const activityModel = require('../models/activityModel');
    const notificationModel = require('../models/notificationModel');
    if (isDraft) {
      await activityModel.logActivity(studentId, 'assignment_draft', `Saved draft for assignment: "${assignment.title}"`);
    } else {
      await activityModel.logActivity(studentId, 'assignment_submit', `Submitted assignment: "${assignment.title}"`);
      await notificationModel.addNotification(studentId, `You submitted your coursework for "${assignment.title}".`, 'assignment');
      
      const course = await courseModel.getCourseById(assignment.course_id);
      if (course && course.instructor_id) {
        await notificationModel.addNotification(course.instructor_id, `A student submitted coursework for "${assignment.title}".`, 'assignment');
      }
    }

    return res.json({ message: isDraft ? 'Assignment draft saved' : 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Error submitting assignment:', error.message);
    return res.status(500).json({ error: 'Failed to upload assignment submission' });
  }
}

// Grade Assignment (Instructor)
async function gradeAssignment(req, res) {
  const { submissionId } = req.params;
  const { pointsEarned, feedback } = req.body;

  try {
    const submission = await assignmentModel.getSubmissionById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission record not found' });

    const course = await courseModel.getCourseById(submission.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (pointsEarned < 0 || pointsEarned > submission.max_points) {
      return res.status(400).json({ error: `Points earned must be between 0 and ${submission.max_points}` });
    }

    await assignmentModel.gradeSubmission(submissionId, pointsEarned, feedback);

    // Log Activity & Add Notification for Student
    const activityModel = require('../models/activityModel');
    const notificationModel = require('../models/notificationModel');
    await activityModel.logActivity(submission.student_id, 'assignment_grade', `Received grade: ${pointsEarned}/${submission.max_points} for "${submission.assignment_title || 'Coursework'}"`);
    await notificationModel.addNotification(submission.student_id, `Your submission for "${submission.assignment_title || 'Coursework'}" was graded: ${pointsEarned}/${submission.max_points}.`, 'grade');

    return res.json({ message: 'Assignment graded successfully' });
  } catch (error) {
    console.error('Error grading assignment:', error.message);
    return res.status(500).json({ error: 'Failed to submit grade' });
  }
}

// Fetch all submissions for a specific course (Instructor)
async function getStudentSubmissions(req, res) {
  const { courseId } = req.params;
  try {
    const course = await courseModel.getCourseById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const submissions = await assignmentModel.getCourseSubmissions(courseId);
    return res.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error.message);
    return res.status(500).json({ error: 'Failed to fetch student submissions' });
  }
}

// Fetch student's own submissions with grades for a course
async function getMySubmissions(req, res) {
  const { courseId } = req.params;
  const studentId = req.user.id;
  try {
    const submissions = await assignmentModel.getMySubmissions(courseId, studentId);
    return res.json({ submissions });
  } catch (error) {
    console.error('Error fetching own submissions:', error.message);
    return res.status(500).json({ error: 'Failed to fetch your submissions' });
  }
}

async function createCourseAssignment(req, res) {
  const { courseId } = req.params;
  const { title, description, max_points, due_date, sectionId } = req.body;
  try {
    const course = await courseModel.getCourseById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    let targetSectionId = sectionId;
    if (!targetSectionId) {
      const sections = await courseModel.getSectionsByCourse(courseId);
      if (sections.length > 0) {
        targetSectionId = sections[0].id;
      } else {
        const newSecId = await courseModel.createSection(courseId, 'Course Deliverables');
        targetSectionId = newSecId;
      }
    }

    const assignmentId = await assignmentModel.create(targetSectionId, title, description, max_points, due_date);
    return res.status(201).json({
      message: 'Assignment created successfully',
      assignmentId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create assignment' });
  }
}

async function updateAssignment(req, res) {
  const { assignmentId } = req.params;
  const { title, description, max_points, due_date } = req.body;
  try {
    const ass = await assignmentModel.getById(assignmentId);
    if (!ass) return res.status(404).json({ error: 'Assignment not found' });
    
    const course = await courseModel.getCourseById(ass.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await assignmentModel.updateAssignment(assignmentId, title, description, max_points, due_date);
    return res.json({ message: 'Assignment updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update assignment' });
  }
}

async function deleteAssignment(req, res) {
  const { assignmentId } = req.params;
  try {
    const ass = await assignmentModel.getById(assignmentId);
    if (!ass) return res.status(404).json({ error: 'Assignment not found' });
    
    const course = await courseModel.getCourseById(ass.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await assignmentModel.deleteAssignment(assignmentId);
    return res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete assignment' });
  }
}

async function getAssignmentSubmissions(req, res) {
  const { assignmentId } = req.params;
  try {
    const ass = await assignmentModel.getById(assignmentId);
    if (!ass) return res.status(404).json({ error: 'Assignment not found' });

    const course = await courseModel.getCourseById(ass.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const allSubmissions = await assignmentModel.getCourseSubmissions(ass.course_id);
    const filtered = allSubmissions.filter(s => s.assignment_id === parseInt(assignmentId));
    return res.json({ submissions: filtered });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch assignment submissions' });
  }
}

async function getInstructorAllSubmissions(req, res) {
  try {
    const list = await assignmentModel.getInstructorAllSubmissions(req.user.id);
    return res.json({ submissions: list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch instructor submissions' });
  }
}

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  submitAssignment,
  gradeAssignment,
  getStudentSubmissions,
  getMySubmissions,
  createCourseAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  getInstructorAllSubmissions
};

async function returnAssignment(req, res) {
  const { submissionId } = req.params;
  try {
    const submission = await assignmentModel.getSubmissionById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const course = await courseModel.getCourseById(submission.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await assignmentModel.returnForResubmission(submissionId);
    return res.json({ message: 'Assignment returned for resubmission successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to return assignment' });
  }
}

async function deleteSubmission(req, res) {
  const { submissionId } = req.params;
  try {
    const submission = await assignmentModel.getSubmissionById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Optional ownership check
    if (submission.course_id) {
      const course = await courseModel.getCourseById(submission.course_id);
      if (course && course.instructor_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    await assignmentModel.deleteSubmission(submissionId);
    return res.json({ message: 'Submission deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete submission' });
  }
}

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  submitAssignment,
  gradeAssignment,
  getStudentSubmissions,
  getMySubmissions,
  createCourseAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  getInstructorAllSubmissions,
  returnAssignment,
  deleteSubmission
};

