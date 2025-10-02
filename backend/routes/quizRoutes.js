const express = require('express');
const router = express.Router();
const { submitQuizResult, getQuizHistory, getResultsByCategory } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { validateQuizResult } = require('../middleware/validation');

// All quiz routes require authentication
router.post('/submit', protect, validateQuizResult, submitQuizResult);
router.get('/history', protect, getQuizHistory);
router.get('/category/:category', protect, getResultsByCategory);

module.exports = router;