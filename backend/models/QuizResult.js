const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Movies', 'Music', 'Current Affairs', 'History', 'Food']
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    default: 10
  },
  accuracy: {
    type: Number,
    required: true,
    default: 0
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  roomCode: {
    type: String,
    default: null
  },
  isMultiplayer: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: true
  },
  cheatingDetected: {
    type: Number,
    default: 0
  },
  powerupsUsed: {
    hints: { type: Number, default: 0 },
    skips: { type: Number, default: 0 },
    freezes: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for faster queries
quizResultSchema.index({ user: 1, createdAt: -1 });
quizResultSchema.index({ category: 1 });
quizResultSchema.index({ score: -1 });
quizResultSchema.index({ roomCode: 1 });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult;