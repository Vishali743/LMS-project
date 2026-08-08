const progressModel = require('../models/progressModel');
const courseModel = require('../models/courseModel');
const enrollmentModel = require('../models/enrollmentModel');

// Toggle or set lesson completion status
async function toggleLessonProgress(req, res) {
  const { lessonId } = req.params;
  const { completed } = req.body; // boolean
  const studentId = req.user.id;

  try {
    // 1. Get courseId for this lesson
    const lesson = await courseModel.getLessonById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const section = await courseModel.getSectionById(lesson.section_id);
    const courseId = section.course_id;

    // 2. Verify enrollment
    const isEnrolled = await enrollmentModel.checkStatus(studentId, courseId);
    if (!isEnrolled) {
      return res.status(403).json({ error: 'You are not enrolled in the course containing this lesson' });
    }

    // 3. Save progress log
    await progressModel.saveProgress(studentId, lessonId, completed);

    if (completed) {
      const activityModel = require('../models/activityModel');
      await activityModel.logActivity(studentId, 'lesson_complete', `Completed lecture: "${lesson.title}"`);
    }

    // 4. Recalculate completion metrics
    const stats = await progressModel.getCourseCompletionStats(studentId, courseId);
    
    if (stats.totalLessons > 0 && stats.completedLessons === stats.totalLessons) {
      // Graduate student
      await progressModel.setCourseGraduation(studentId, courseId);
    } else {
      // Revert graduation status
      await progressModel.clearCourseGraduation(studentId, courseId);
    }

    return res.json({
      message: 'Progress updated successfully',
      completed,
      progress: {
        completedLessons: stats.completedLessons,
        totalLessons: stats.totalLessons,
        percentage: stats.totalLessons > 0 ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error toggling progress:', error.message);
    return res.status(500).json({ error: 'Failed to update progress' });
  }
}

// Get completed lessons list & percentage for a course
async function getCourseProgress(req, res) {
  const { courseId } = req.params;
  const studentId = req.user.id;
  try {
    const completedLessonIds = await progressModel.getCompletedLessonIds(studentId, courseId);
    
    const quizModel = require('../models/quizModel');
    const quizzes = await quizModel.getQuizzesByCourse(courseId);
    const completedQuizIds = [];
    for (const q of quizzes) {
      const attempts = await quizModel.getStudentQuizAttempts(studentId, q.id);
      if (attempts.length > 0) {
        completedQuizIds.push(q.id);
      }
    }

    const assignmentModel = require('../models/assignmentModel');
    const submissions = await assignmentModel.getMySubmissions(courseId, studentId);
    const completedAssignmentIds = submissions.map(s => s.assignment_id);

    const stats = await progressModel.getCourseCompletionStats(studentId, courseId);
    const lessonsDone = completedLessonIds.length;
    const lessonsTotal = stats.totalLessons || 9;
    const progressPercent = lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0;

    const detailed = await progressModel.getDetailedProgress(studentId, courseId);

    return res.json({
      completedLessonIds,
      completedQuizIds,
      completedAssignmentIds,
      percentage: progressPercent,
      completedSectionIds: detailed.completedSectionIds,
      sectionDetails: detailed.sectionDetails,
      stats: {
        completedLessons: lessonsDone,
        totalLessons: lessonsTotal,
        completedQuizzesCount: completedQuizIds.length,
        totalQuizzesCount: quizzes.length,
        completedAssignmentsCount: completedAssignmentIds.length,
        totalAssignmentsCount: (await assignmentModel.getAssignmentsByCourse(courseId)).length
      }
    });
  } catch (error) {
    console.error('Error fetching course progress:', error.message);
    return res.status(500).json({ error: 'Failed to fetch course progress' });
  }
}

module.exports = {
  toggleLessonProgress,
  getCourseProgress
};
