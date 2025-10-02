const express = require('express');
const router = express.Router();
const { updateProfile, getUserById, getUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

// Protected routes
router.put('/profile', protect, validateProfileUpdate, updateProfile);
router.get('/stats', protect, getUserStats);

// Public routes
router.get('/:id', getUserById);

module.exports = router;