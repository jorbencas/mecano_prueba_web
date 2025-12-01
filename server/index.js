const express = require('express');
const http = require('http');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const { testConnection, initializeSchema } = require('./db');
const { initializeWebSocket } = require('./websocket');
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activity');
const usersRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const progressRoutes = require('./routes/progress');
const multiplayerRoutes = require('./routes/multiplayer');
const socialRoutes = require('./routes/social');
const challengesRoutes = require('./routes/challenges');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;

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
app.use('/api/social', socialRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize and start server
async function start() {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Initialize schema
    await initializeSchema();

    // Initialize WebSocket
    initializeWebSocket(httpServer);
    console.log('✅ WebSocket server initialized');

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket server running`);
      console.log(`📊 API endpoints:`);
      console.log(`   - POST /api/auth/register`);
      console.log(`   - POST /api/auth/login`);
      console.log(`   - GET  /api/auth/google`);
      console.log(`   - GET  /api/auth/me`);
      console.log(`   - POST /api/auth/logout`);
      console.log(`   - POST /api/activity`);
      console.log(`   - GET  /api/activity`);
      console.log(`   - GET  /api/activity/stats`);
      console.log(`   - GET  /api/multiplayer/rooms`);
      console.log(`   - POST /api/multiplayer/rooms`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
