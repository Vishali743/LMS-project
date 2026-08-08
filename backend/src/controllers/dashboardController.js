const userModel = require('../models/userModel');
const enrollmentModel = require('../models/enrollmentModel');
const notificationModel = require('../models/notificationModel');
const activityModel = require('../models/activityModel');
const db = require('../config/db');

function useFallback() {
  return !db.getPool();
}

/**
 * Get student dashboard summary
 */
async function getStudentDashboard(req, res) {
  const studentId = req.user.id;
  try {
    // 1. Fetch profile details
    const profile = await userModel.findById(studentId);

    // 2. Fetch enrolled courses
    const enrollments = await enrollmentModel.getStudentEnrollments(studentId);

    // 3. Fetch latest notifications
    const notifications = await notificationModel.getUserNotifications(studentId);

    // 4. Fetch recent activities log
    const activities = await activityModel.getUserActivities(studentId);

    // 5. Fetch upcoming assignment reminders
    let reminders = [];
    if (useFallback()) {
      const assignments = global.mockAssignments || [];
      const myEnrollments = global.mockEnrollments || [];
      const courseIds = myEnrollments.filter(e => e.student_id === studentId).map(e => e.course_id);
      
      const sections = global.mockSections || [];
      const courseSections = sections.filter(s => courseIds.includes(s.course_id));
      const sectionIds = courseSections.map(s => s.id);
      
      reminders = assignments
        .filter(a => sectionIds.includes(a.section_id))
        .map(a => {
          const section = courseSections.find(s => s.id === a.section_id);
          return {
            id: a.id,
            title: a.title,
            due_date: a.due_date,
            course_title: 'Course Core Modules',
            section_title: section ? section.title : 'General Module'
          };
        });
    } else {
      const sql = `
        SELECT a.id, a.title, a.due_date, s.title AS section_title, c.title AS course_title
        FROM assignments a
        JOIN sections s ON a.section_id = s.id
        JOIN courses c ON s.course_id = c.id
        JOIN enrollments e ON e.course_id = c.id
        WHERE e.student_id = ?
        ORDER BY a.due_date ASC
        LIMIT 5
      `;
      reminders = await db.query(sql, [studentId]);
    }

    return res.json({
      profile,
      enrollments,
      notifications,
      activities,
      reminders
    });
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error.message);
    return res.status(500).json({ error: 'Failed to aggregate dashboard resources' });
  }
}

module.exports = {
  getStudentDashboard
};
