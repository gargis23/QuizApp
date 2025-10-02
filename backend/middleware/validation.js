// Validation middleware for various inputs

exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  // Email validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

exports.validateQuizResult = (req, res, next) => {
  const { category, score, correctAnswers, totalQuestions, accuracy } = req.body;
  const errors = [];

  const validCategories = ['Movies', 'Music', 'Current Affairs', 'History', 'Food'];
  
  if (!category || !validCategories.includes(category)) {
    errors.push('Invalid category');
  }

  if (typeof score !== 'number' || score < 0) {
    errors.push('Invalid score');
  }

  if (typeof correctAnswers !== 'number' || correctAnswers < 0 || correctAnswers > totalQuestions) {
    errors.push('Invalid correct answers count');
  }

  if (typeof totalQuestions !== 'number' || totalQuestions <= 0) {
    errors.push('Invalid total questions count');
  }

  if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100) {
    errors.push('Invalid accuracy');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

exports.validateRoomCode = (req, res, next) => {
  const { roomCode } = req.params;

  if (!roomCode || roomCode.length !== 6 || !/^[A-Z0-9]+$/.test(roomCode)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid room code format'
    });
  }

  next();
};

exports.validateProfileUpdate = (req, res, next) => {
  const { name, age, bio } = req.body;
  const errors = [];

  if (name !== undefined && name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (age !== undefined && (age < 13 || age > 120)) {
    errors.push('Age must be between 13 and 120');
  }

  if (bio !== undefined && bio.length > 200) {
    errors.push('Bio cannot exceed 200 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};