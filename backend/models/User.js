const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.provider; // Password required only if not using OAuth
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  providerId: {
    type: String,
    default: null
  },
  picture: {
    type: String,
    default: null
  },
  age: {
    type: Number,
    min: [13, 'You must be at least 13 years old'],
    max: [120, 'Please provide a valid age']
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters']
  },
  totalScore: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: null
  },
  achievements: [{
    name: String,
    icon: String,
    dateEarned: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for accuracy
userSchema.virtual('accuracy').get(function() {
  if (this.totalQuestions === 0) return 0;
  return Math.round((this.correctAnswers / this.totalQuestions) * 100);
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified or new
  if (!this.isModified('password')) return next();
  
  // Only hash if password exists (for local auth)
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update user stats after a game
userSchema.methods.updateGameStats = function(score, correctAnswers, totalQuestions) {
  this.totalScore += score;
  this.gamesPlayed += 1;
  this.correctAnswers += correctAnswers;
  this.totalQuestions += totalQuestions;
  
  if (score > this.bestScore) {
    this.bestScore = score;
  }
  
  return this.save();
};

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ totalScore: -1 });
userSchema.index({ gamesPlayed: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;