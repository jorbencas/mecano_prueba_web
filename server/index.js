const http = require('http');
const app = require('./app');
const { testConnection, initializeSchema } = require('./db');
const { initializeWebSocket } = require('./websocket');
require('dotenv').config();

const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;

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
