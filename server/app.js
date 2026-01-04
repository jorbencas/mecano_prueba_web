const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activity');
const usersRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const progressRoutes = require('./routes/progress');
const multiplayerRoutes = require('./routes/multiplayer');
const socialRoutes = require('./routes/social');
const challengesRoutes = require('./routes/challenges');
const adminRoutes = require('./routes/admin');
const classesRoutes = require('./routes/classes');
const assignmentsRoutes = require('./routes/assignments');
const settingsRoutes = require('./routes/settings');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/multiplayer', multiplayerRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
