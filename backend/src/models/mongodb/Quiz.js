const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  optionText: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
});

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['multiple_choice', 'true_false'], default: 'multiple_choice' },
  points: { type: Number, default: 10 },
  explanation: { type: String, default: '' },
  options: [OptionSchema]
});

const QuizSchema = new mongoose.Schema({
  courseId: { type: String, required: true, index: true },
  sectionId: { type: String, default: null },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  maxScore: { type: Number, default: 100 },
  passingPercentage: { type: Number, default: 70 },
  timeLimit: { type: Number, default: 30 }, // in minutes
  randomizeQuestions: { type: Boolean, default: false },
  shuffleAnswers: { type: Boolean, default: false },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

const QuizAttemptSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  passed: { type: Boolean, default: false },
  answers: { type: Map, of: String }, // questionId -> optionId/text
  attemptedAt: { type: Date, default: Date.now }
});

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', QuizAttemptSchema);

module.exports = { Quiz, QuizAttempt };
