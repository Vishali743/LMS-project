const db = require('../config/db');

function useFallback() {
  return !db.getPool();
}

/**
 * Fetch overall dashboard statistics from MySQL database with offline fallback support.
 */
async function getDashboardStats(req, res) {
  try {
    if (useFallback()) {
      // Offline fallback: count mock data from global memory lists
      const mockUsers = global.mockUsers ? Object.values(global.mockUsers) : [];
      const students = mockUsers.filter(u => u.role === 'student').length;
      const teachers = mockUsers.filter(u => u.role === 'instructor').length;

      let courses = 0;
      try {
        const courseModel = require('../models/courseModel');
        // Retrieve published courses using fallback helper
        const result = await courseModel.getPublishedCourses({});
        courses = result.courses ? result.courses.length : 0;
      } catch (err) {
        courses = 12; // Fallback mock default
      }

      const enrollments = global.mockEnrollments ? global.mockEnrollments.length : 0;

      return res.json({
        students,
        teachers,
        courses,
        enrollments
      });
    }

    // Direct optimized COUNT queries on MySQL tables
    const studentsResult = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'student'");
    const teachersResult = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'instructor'");
    const coursesResult = await db.query("SELECT COUNT(*) AS count FROM courses WHERE is_published = 1");
    const enrollmentsResult = await db.query("SELECT COUNT(*) AS count FROM enrollments");

    return res.json({
      students: studentsResult[0]?.count ?? 0,
      teachers: teachersResult[0]?.count ?? 0,
      courses: coursesResult[0]?.count ?? 0,
      enrollments: enrollmentsResult[0]?.count ?? 0
    });
  } catch (error) {
    console.error('Error fetching admin dashboard statistics:', error.message);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}

async function getEnrollmentsList(req, res) {
  try {
    if (useFallback()) {
      // Offline fallback: map global.mockEnrollments to join student and course titles from mock data
      const mockEnrollments = global.mockEnrollments || [];
      const mockUsers = global.mockUsers ? Object.values(global.mockUsers) : [];
      
      let mockCourses = [];
      try {
        const courseModel = require('../models/courseModel');
        const result = await courseModel.getPublishedCourses({});
        mockCourses = result.courses || [];
      } catch (err) {}

      const list = mockEnrollments.map((e) => {
        const student = mockUsers.find(u => u.id === e.student_id) || { display_name: 'Demo Student', email: 'student@skeinlms.com' };
        const course = mockCourses.find(c => c.id === e.course_id) || { title: 'Introduction to Programming' };
        return {
          studentName: student.display_name,
          email: student.email,
          courseName: course.title,
          status: e.completed_at ? 'Completed' : 'Studying',
          enrolledDate: new Date(e.enrolled_at || Date.now()).toISOString().split('T')[0]
        };
      });

      // Sort: latest enrollments first (reverse list since mocked pushes are sequential)
      list.reverse();
      return res.json(list);
    }

    const sql = `
      SELECT e.enrolled_at, e.completed_at,
             c.title AS course_name,
             s.display_name AS student_name,
             u.email AS student_email
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN students s ON e.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      ORDER BY e.enrolled_at DESC
    `;
    const rows = await db.query(sql);
    
    const list = rows.map(row => ({
      studentName: row.student_name,
      email: row.student_email,
      courseName: row.course_name,
      status: row.completed_at ? 'Completed' : 'Studying',
      enrolledDate: new Date(row.enrolled_at).toISOString().split('T')[0]
    }));

    return res.json(list);
  } catch (error) {
    console.error('Error fetching admin enrollments list:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve enrollments' });
  }
}

module.exports = {
  getDashboardStats,
  getEnrollmentsList
};
