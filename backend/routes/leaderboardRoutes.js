const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserRank, getCategoryLeaderboard } = require('../controllers/leaderboardController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, getLeaderboard);
router.get('/category/:category', getCategoryLeaderboard);

// Protected routes
router.get('/rank', protect, getUserRank);

module.exports = router;