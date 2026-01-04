const express = require('express');
const { register, login, logout, getUserById } = require('../auth/local');
const { authenticate } = require('../auth/middleware');
const passport = require('../auth/google');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new user with email and password
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Register user (role is determined server-side: first user = admin, others = student)
    const result = await register(email, password, displayName || null);

    res.json(result);
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await login(email, password);

    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback
 */
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, data, info) => {
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (err) {
      console.error('❌ Google Auth Error:', err);
      return res.redirect(`${frontendURL}/login?error=auth_failed&message=${encodeURIComponent(err.message)}`);
    }

    if (!data) {
      console.error('❌ Google Auth Failed: No user data');
      return res.redirect(`${frontendURL}/login?error=no_user`);
    }

    // Success
    const { token } = data;
    res.redirect(`${frontendURL}/auth/callback?token=${token}`);
  })(req, res, next);
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { displayName, photoURL, language } = req.body;
    const { updateProfile } = require('../auth/local');
    
    const result = await updateProfile(req.user.id, { displayName, photoURL, language });
    res.json(result);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/auth/change-password
 * Change current user password
 */
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { changePassword } = require('../auth/local');
    
    const result = await changePassword(req.user.id, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message || 'Failed to change password' });
  }
});

module.exports = router;
