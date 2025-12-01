import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Player {
  id: string;
  email: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishTime?: number;
  finalWpm?: number;
  finalAccuracy?: number;
}

interface Room {
  id: string;
  players: Player[];
  state: 'waiting' | 'racing' | 'finished';
  text: string;
  startTime: number | null;
}

interface ChatMessage {
  userId: string;
  email: string;
  message: string;
  timestamp: number;
}

interface MultiplayerContextType {
  socket: Socket | null;
  connected: boolean;
  currentRoom: Room | null;
  chatMessages: ChatMessage[];
  joinRoom: (roomId: string, playerData?: any) => void;
  leaveRoom: () => void;
  startRace: (text: string) => void;
  updateProgress: (progress: number, wpm: number, accuracy: number) => void;
  finishRace: (wpm: number, accuracy: number, time: number) => void;
  sendChatMessage: (message: string) => void;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export const MultiplayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const newSocket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('room:updated', (room: Room) => {
      setCurrentRoom(room);
    });

    newSocket.on('race:started', ({ text, startTime }) => {
      setCurrentRoom(prev => prev ? { ...prev, state: 'racing', text, startTime } : null);
    });

    newSocket.on('race:update', ({ playerId, progress, wpm, accuracy }) => {
      setCurrentRoom(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map(p =>
            p.id === playerId ? { ...p, progress, wpm, accuracy } : p
          ),
        };
      });
    });

    newSocket.on('race:player-finished', ({ playerId, wpm, accuracy, time }) => {
      setCurrentRoom(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map(p =>
            p.id === playerId
              ? { ...p, finished: true, finishTime: time, finalWpm: wpm, finalAccuracy: accuracy }
              : p
          ),
        };
      });
    });

    newSocket.on('race:finished', ({ results }) => {
      setCurrentRoom(prev => prev ? { ...prev, state: 'finished' } : null);
    });

    newSocket.on('chat:message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinRoom = (roomId: string, playerData?: any) => {
    if (socket) {
      socket.emit('room:join', { roomId, playerData });
      setChatMessages([]);
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('room:leave', { roomId: currentRoom.id });
      setCurrentRoom(null);
      setChatMessages([]);
    }
  };

  const startRace = (text: string) => {
    if (socket && currentRoom) {
      socket.emit('race:start', { roomId: currentRoom.id, text });
    }
  };

  const updateProgress = (progress: number, wpm: number, accuracy: number) => {
    if (socket && currentRoom) {
      socket.emit('race:progress', { roomId: currentRoom.id, progress, wpm, accuracy });
    }
  };

  const finishRace = (wpm: number, accuracy: number, time: number) => {
    if (socket && currentRoom) {
      socket.emit('race:finish', { roomId: currentRoom.id, wpm, accuracy, time });
    }
  };

  const sendChatMessage = (message: string) => {
    if (socket && currentRoom) {
      socket.emit('chat:message', { roomId: currentRoom.id, message });
    }
  };

  return (
    <MultiplayerContext.Provider
      value={{
        socket,
        connected,
        currentRoom,
        chatMessages,
        joinRoom,
        leaveRoom,
        startRace,
        updateProgress,
        finishRace,
        sendChatMessage,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};
