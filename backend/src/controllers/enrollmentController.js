const enrollmentModel = require('../models/enrollmentModel');
const courseModel = require('../models/courseModel');
const activityModel = require('../models/activityModel');

// Enroll a student in a course
async function enrollInCourse(req, res) {
  const { courseId } = req.params;
  const studentId = req.user.id;
  try {
    // 1. Verify course exists and is published
    const course = await courseModel.getCourseById(courseId);
    if (!course || course.is_published === 0) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }

    // 2. Check if already enrolled
    const isEnrolled = await enrollmentModel.checkStatus(studentId, courseId);
    if (isEnrolled) {
      return res.status(400).json({ error: 'You are already enrolled in this course' });
    }

    // 3. Insert enrollment
    await enrollmentModel.enroll(studentId, courseId);

    // Log Activity
    await activityModel.logActivity(studentId, 'enrollment', `Enrolled in course: ${course.title}`);

    // Add Notification
    const notificationModel = require('../models/notificationModel');
    await notificationModel.addNotification(studentId, `You successfully enrolled in "${course.title}".`, 'enrollment');

    // Send email alert (Nodemailer)
    const emailService = require('../services/emailService');
    const loginUrl = `${req.protocol}://${req.get('host')}/login/student`;
    emailService.sendEnrollmentEmail(
      req.user.email,
      req.user.display_name || req.user.email.split('@')[0],
      course.title,
      new Date().toLocaleDateString(),
      loginUrl,
      course.teacher_name
    ).catch(console.error);

    return res.status(201).json({ message: 'Enrolled in course successfully' });
  } catch (error) {
    console.error('Error during course enrollment:', error.message);
    return res.status(500).json({ error: 'Failed to enroll in course' });
  }
}

// Get enrolled courses for current student
async function getMyEnrollments(req, res) {
  const studentId = req.user.id;
  try {
    const enrollments = await enrollmentModel.getStudentEnrollments(studentId);
    return res.json({ enrollments });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error.message);
    return res.status(500).json({ error: 'Failed to fetch enrolled courses' });
  }
}

// Check enrollment status for specific course
async function checkEnrollmentStatus(req, res) {
  const { courseId } = req.params;
  const studentId = req.user.id;
  try {
    const enrolled = await enrollmentModel.checkStatus(studentId, courseId);
    return res.json({ enrolled });
  } catch (error) {
    console.error('Error checking enrollment status:', error.message);
    return res.status(500).json({ error: 'Failed to check status' });
  }
}

// Post/Submit a review on course
async function createReview(req, res) {
  const { courseId } = req.params;
  const { rating, comment } = req.body;
  const studentId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  try {
    // 1. Verify enrollment
    const isEnrolled = await enrollmentModel.checkStatus(studentId, courseId);
    if (!isEnrolled) {
      return res.status(403).json({ error: 'You must be enrolled in the course to leave a review' });
    }

    // 2. Upsert review
    await enrollmentModel.saveReview(studentId, courseId, rating, comment);
    return res.json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error creating review:', error.message);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
}

// Process course checkout and enrollment
async function checkoutCoursePayment(req, res) {
  const { courseId } = req.params;
  const { amount, paymentMethod, transactionId } = req.body;
  const studentId = req.user.id;
  try {
    const course = await courseModel.getCourseById(courseId);
    if (!course || course.is_published === 0) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }

    const isEnrolled = await enrollmentModel.checkStatus(studentId, courseId);
    if (isEnrolled) {
      return res.status(400).json({ error: 'You are already enrolled in this course' });
    }

    await enrollmentModel.createPaymentRecord(studentId, courseId, amount, paymentMethod, transactionId);
    await enrollmentModel.enroll(studentId, courseId);

    // Log Activity
    await activityModel.logActivity(studentId, 'enrollment', `Purchased and enrolled in course: ${course.title}`);

    // Add Notification
    const notificationModel = require('../models/notificationModel');
    await notificationModel.addNotification(studentId, `You successfully enrolled in "${course.title}".`, 'enrollment');

    // Send email alert (Nodemailer)
    const emailService = require('../services/emailService');
    const loginUrl = `${req.protocol}://${req.get('host')}/login/student`;
    emailService.sendEnrollmentEmail(
      req.user.email,
      req.user.display_name || req.user.email.split('@')[0],
      course.title,
      new Date().toLocaleDateString(),
      loginUrl,
      course.teacher_name
    ).catch(console.error);

    return res.status(201).json({ message: 'Payment approved. Enrolled in course successfully' });
  } catch (error) {
    console.error('Error during course checkout payment:', error.message);
    return res.status(500).json({ error: 'Checkout transaction failed' });
  }
}

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  checkEnrollmentStatus,
  createReview,
  checkoutCoursePayment
};
