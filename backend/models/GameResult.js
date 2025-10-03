const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    index: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  playerName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  questionsAttempted: {
    type: Number,
    required: true,
    default: 0
  },
  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  accuracy: {
    type: Number,
    required: true,
    default: 0
  },
  rank: {
    type: Number,
    default: null
  },
  gameCompletedAt: {
    type: Date,
    default: Date.now
  },
  gameStartedAt: {
    type: Date,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
gameResultSchema.index({ roomCode: 1, score: -1 }); // Room leaderboard
gameResultSchema.index({ player: 1, gameCompletedAt: -1 }); // Player history
gameResultSchema.index({ score: -1, gameCompletedAt: -1 }); // Global leaderboard

module.exports = mongoose.model('GameResult', gameResultSchema);