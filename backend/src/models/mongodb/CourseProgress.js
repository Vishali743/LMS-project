const mongoose = require('mongoose');

const CourseProgressSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  courseId: { type: String, required: true, index: true },
  completedLessons: [{ type: String }], // Array of video/lesson IDs completed
  completedQuizzes: [{ type: String }], // Array of quiz IDs completed
  completedAssignments: [{ type: String }], // Array of assignment IDs completed
  videoWatchPercentage: { type: Number, default: 0 },
  overallProgressPercentage: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

// Compound unique index for student progress in a course
CourseProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const CourseProgress = mongoose.models.CourseProgress || mongoose.model('CourseProgress', CourseProgressSchema);

module.exports = { CourseProgress };
