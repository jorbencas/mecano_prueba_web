const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const rooms = new Map(); // roomId -> { players: [], state: {} }
const userSockets = new Map(); // userId -> socketId

/**
 * Initialize WebSocket server
 */
function initializeWebSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // Authenticate socket connection
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    userSockets.set(socket.userId, socket.id);

    // Notify friends about online status
    socket.broadcast.emit('user:online', { userId: socket.userId });

    // Join room
    socket.on('room:join', ({ roomId, playerData }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          players: [],
          state: 'waiting',
          text: '',
          startTime: null,
        });
      }

      const room = rooms.get(roomId);
      const player = {
        id: socket.userId,
        email: socket.userEmail,
        socketId: socket.id,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        ...playerData,
      };

      room.players.push(player);
      
      // Notify all players in room
      io.to(roomId).emit('room:updated', room);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    // Leave room
    socket.on('room:leave', ({ roomId }) => {
      socket.leave(roomId);
      
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.players = room.players.filter(p => p.id !== socket.userId);
        
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('room:updated', room);
        }
      }
    });

    // Start race
    socket.on('race:start', ({ roomId, text }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.state = 'racing';
        room.text = text;
        room.startTime = Date.now();
        
        io.to(roomId).emit('race:started', {
          text,
          startTime: room.startTime,
        });
      }
    });

    // Update progress
    socket.on('race:progress', ({ roomId, progress, wpm, accuracy }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        const player = room.players.find(p => p.id === socket.userId);
        
        if (player) {
          player.progress = progress;
          player.wpm = wpm;
          player.accuracy = accuracy;
          
          // Broadcast to all players in room
          io.to(roomId).emit('race:update', {
            playerId: socket.userId,
            progress,
            wpm,
            accuracy,
          });
        }
      }
    });

    // Finish race
    socket.on('race:finish', ({ roomId, wpm, accuracy, time }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        const player = room.players.find(p => p.id === socket.userId);
        
        if (player) {
          player.finished = true;
          player.finishTime = time;
          player.finalWpm = wpm;
          player.finalAccuracy = accuracy;
          
          io.to(roomId).emit('race:player-finished', {
            playerId: socket.userId,
            wpm,
            accuracy,
            time,
          });

          // Check if all players finished
          const allFinished = room.players.every(p => p.finished);
          if (allFinished) {
            room.state = 'finished';
            io.to(roomId).emit('race:finished', {
              results: room.players.map(p => ({
                id: p.id,
                email: p.email,
                wpm: p.finalWpm,
                accuracy: p.finalAccuracy,
                time: p.finishTime,
              })),
            });
          }
        }
      }
    });

    // Chat message
    socket.on('chat:message', ({ roomId, message }) => {
      io.to(roomId).emit('chat:message', {
        userId: socket.userId,
        email: socket.userEmail,
        message,
        timestamp: Date.now(),
      });
    });

    // Friend request
    socket.on('friend:request', ({ targetUserId }) => {
      const targetSocketId = userSockets.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('friend:request', {
          fromUserId: socket.userId,
          fromEmail: socket.userEmail,
        });
      }
    });

    // Friend accept
    socket.on('friend:accept', ({ targetUserId }) => {
      const targetSocketId = userSockets.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('friend:accepted', {
          fromUserId: socket.userId,
          fromEmail: socket.userEmail,
        });
      }
    });

    // Typing indicator
    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:start', {
        userId: socket.userId,
        email: socket.userEmail,
      });
    });

    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:stop', {
        userId: socket.userId,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      userSockets.delete(socket.userId);
      
      // Remove from all rooms
      rooms.forEach((room, roomId) => {
        room.players = room.players.filter(p => p.id !== socket.userId);
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('room:updated', room);
        }
      });

      // Notify friends about offline status
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    });
  });

  return io;
}

/**
 * Get active rooms
 */
function getActiveRooms() {
  return Array.from(rooms.values());
}

/**
 * Get room by ID
 */
function getRoom(roomId) {
  return rooms.get(roomId);
}

module.exports = {
  initializeWebSocket,
  getActiveRooms,
  getRoom,
};
