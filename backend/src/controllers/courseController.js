const courseModel = require('../models/courseModel');

// --- Categories ---
async function getCategories(req, res) {
  try {
    const categories = await courseModel.getAllCategories();
    return res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

// --- Courses ---

async function getCourses(req, res) {
  const { categoryId, search, level, price, rating, duration, sortBy, page = 1, limit = 12 } = req.query;
  try {
    const { courses, totalCount } = await courseModel.getPublishedCourses({
      categoryId,
      search,
      level,
      price,
      rating,
      duration,
      sortBy,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    return res.json({ courses, totalCount });
  } catch (error) {
    console.error('Error fetching courses:', error.message);
    return res.status(500).json({ error: 'Failed to fetch courses' });
  }
}

async function getInstructorCourses(req, res) {
  try {
    const courses = await courseModel.getCoursesByInstructor(req.user.id);
    return res.json({ courses });
  } catch (error) {
    console.error('Error fetching instructor courses:', error.message);
    return res.status(500).json({ error: 'Failed to fetch instructor courses' });
  }
}

async function getCourseById(req, res) {
  const { id } = req.params;
  try {
    const course = await courseModel.getCourseById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const sections = await courseModel.getSectionsByCourse(course.id);

    // Fetch lessons and quizzes for sections
    const enrollmentModel = require('../models/enrollmentModel'); // circular dependency safety
    const quizModel = require('../models/quizModel');
    
    for (let i = 0; i < sections.length; i++) {
      const lessons = await courseModel.getLessonsBySection(sections[i].id);
      sections[i].lessons = lessons;

      // Check section quiz
      const quizzes = await quizModel.getQuizzesByCourse(course.id);
      const sectionQuiz = quizzes.find(q => q.section_id === sections[i].id);
      sections[i].quiz = sectionQuiz || null;
    }

    const ratingSummary = await enrollmentModel.getReviewsSummary(course.id);
    const reviews = await enrollmentModel.getCourseReviews(course.id, 10);

    return res.json({
      course,
      sections,
      ratingSummary,
      reviews
    });
  } catch (error) {
    console.error('Error fetching course by ID:', error.message);
    return res.status(500).json({ error: 'Failed to fetch course details' });
  }
}

async function createCourse(req, res) {
  const { title, description, thumbnail_url, category_id, price, is_published } = req.body;
  try {
    const courseId = await courseModel.createCourse({
      instructorId: req.user.id,
      title,
      description,
      thumbnailUrl: thumbnail_url,
      categoryId: category_id,
      price,
      isPublished: is_published
    });
    return res.status(201).json({
      message: 'Course created successfully',
      courseId
    });
  } catch (error) {
    console.error('Error creating course:', error.message);
    return res.status(500).json({ error: 'Failed to create course' });
  }
}

async function updateCourse(req, res) {
  const { id } = req.params;
  const { title, description, thumbnail_url, category_id, price, is_published } = req.body;
  try {
    const course = await courseModel.getCourseById(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await courseModel.updateCourse(id, {
      title,
      description,
      thumbnailUrl: thumbnail_url,
      categoryId: category_id,
      price,
      isPublished: is_published
    });

    return res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error.message);
    return res.status(500).json({ error: 'Failed to update course' });
  }
}

async function deleteCourse(req, res) {
  const { id } = req.params;
  try {
    const course = await courseModel.getCourseById(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await courseModel.deleteCourse(id);
    return res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error.message);
    return res.status(500).json({ error: 'Failed to delete course' });
  }
}

// --- Sections ---

async function createSection(req, res) {
  const { courseId } = req.params;
  const { title, sort_order } = req.body;
  try {
    const course = await courseModel.getCourseById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const sectionId = await courseModel.createSection(courseId, title, sort_order);
    return res.status(201).json({
      message: 'Section created successfully',
      sectionId
    });
  } catch (error) {
    console.error('Error creating section:', error.message);
    return res.status(500).json({ error: 'Failed to create section' });
  }
}

async function updateSection(req, res) {
  const { sectionId } = req.params;
  const { title, sort_order } = req.body;
  try {
    const section = await courseModel.getSectionById(sectionId);
    if (!section) return res.status(404).json({ error: 'Section not found' });

    const course = await courseModel.getCourseById(section.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await courseModel.updateSection(sectionId, title, sort_order);
    return res.json({ message: 'Section updated successfully' });
  } catch (error) {
    console.error('Error updating section:', error.message);
    return res.status(500).json({ error: 'Failed to update section' });
  }
}

async function deleteSection(req, res) {
  const { sectionId } = req.params;
  try {
    const section = await courseModel.getSectionById(sectionId);
    if (!section) return res.status(404).json({ error: 'Section not found' });

    const course = await courseModel.getCourseById(section.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await courseModel.deleteSection(sectionId);
    return res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error.message);
    return res.status(500).json({ error: 'Failed to delete section' });
  }
}

// --- Lessons ---

async function getLessonDetails(req, res) {
  const { lessonId } = req.params;
  try {
    const lesson = await courseModel.getLessonById(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const section = await courseModel.getSectionById(lesson.section_id);
    const courseId = section.course_id;

    // Verify student enrollment or instructor ownership
    if (req.user.role === 'student') {
      const enrollmentModel = require('../models/enrollmentModel');
      const enrolled = await enrollmentModel.checkStatus(req.user.id, courseId);
      if (!enrolled) {
        return res.status(403).json({ error: 'Access denied: Enrolled students only' });
      }
    } else if (req.user.role === 'instructor') {
      const course = await courseModel.getCourseById(courseId);
      if (course.instructor_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    return res.json({ lesson });
  } catch (error) {
    console.error('Error fetching lesson details:', error.message);
    return res.status(500).json({ error: 'Failed to fetch lesson details' });
  }
}

async function createLesson(req, res) {
  const { sectionId } = req.params;
  const { title, content_type, content_url, text_content, duration_minutes, sort_order } = req.body;
  try {
    const section = await courseModel.getSectionById(sectionId);
    if (!section) return res.status(404).json({ error: 'Section not found' });

    const course = await courseModel.getCourseById(section.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const lessonId = await courseModel.createLesson(sectionId, {
      title,
      contentType: content_type,
      contentUrl: content_url,
      textContent: text_content,
      durationMinutes: duration_minutes,
      sortOrder: sort_order
    });

    return res.status(201).json({
      message: 'Lesson created successfully',
      lessonId
    });
  } catch (error) {
    console.error('Error creating lesson:', error.message);
    return res.status(500).json({ error: 'Failed to create lesson' });
  }
}

async function updateLesson(req, res) {
  const { lessonId } = req.params;
  const { title, content_type, content_url, text_content, duration_minutes, sort_order } = req.body;
  try {
    const lesson = await courseModel.getLessonById(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const section = await courseModel.getSectionById(lesson.section_id);
    const course = await courseModel.getCourseById(section.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await courseModel.updateLesson(lessonId, {
      title,
      contentType: content_type,
      contentUrl: content_url,
      textContent: text_content,
      durationMinutes: duration_minutes,
      sortOrder: sort_order
    });

    return res.json({ message: 'Lesson updated successfully' });
  } catch (error) {
    console.error('Error updating lesson:', error.message);
    return res.status(500).json({ error: 'Failed to update lesson' });
  }
}

async function deleteLesson(req, res) {
  const { lessonId } = req.params;
  try {
    const lesson = await courseModel.getLessonById(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const section = await courseModel.getSectionById(lesson.section_id);
    const course = await courseModel.getCourseById(section.course_id);
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await courseModel.deleteLesson(lessonId);
    return res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error.message);
    return res.status(500).json({ error: 'Failed to delete lesson' });
  }
}

async function getInstructorScholars(req, res) {
  try {
    const scholars = await courseModel.getScholarsByInstructor(req.user.id);
    return res.json({ scholars });
  } catch (error) {
    console.error('Error fetching instructor scholars:', error.message);
    return res.status(500).json({ error: 'Failed to fetch instructor scholars' });
  }
}

module.exports = {
  getCategories,
  getCourses,
  getInstructorCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createSection,
  updateSection,
  deleteSection,
  getLessonDetails,
  createLesson,
  updateLesson,
  deleteLesson,
  getInstructorScholars
};
