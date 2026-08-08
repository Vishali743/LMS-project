const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  courseId: { type: String, required: true, index: true },
  sectionId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  maxPoints: { type: Number, default: 100 },
  dueDate: { type: Date, required: true },
  fileUrls: [{ type: String }], // Optional PDF/Doc template attachments
  createdAt: { type: Date, default: Date.now }
});

const SubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: String, required: true, index: true },
  submissionText: { type: String, default: '' },
  fileUrls: [{ type: String }],
  pointsEarned: { type: Number, default: null },
  feedback: { type: String, default: '' },
  isLate: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  gradedAt: { type: Date, default: null }
});

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

module.exports = { Assignment, Submission };
