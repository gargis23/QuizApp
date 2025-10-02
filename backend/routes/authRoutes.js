const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, googleAuth, getMe, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Google OAuth routes
router.post('/google', googleAuth);
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL + '/login?error=google_auth_failed' }),
  googleCallback
);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;