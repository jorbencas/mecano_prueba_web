import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import { FaPaperPlane } from 'react-icons/fa';

const LiveChat: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { chatMessages, sendChatMessage, currentRoom } = useMultiplayer();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message);
      setMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentRoom) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <p className="text-center opacity-75">No estás en ninguna sala</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg flex flex-col h-[600px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="p-4 border-b border-gray-600">
        <h2 className="text-xl font-bold">💬 Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 && (
          <p className="text-center opacity-75 text-sm">No hay mensajes aún</p>
        )}
        {chatMessages.map((msg, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm text-blue-500">{msg.email}</span>
              <span className="text-xs opacity-50">{formatTime(msg.timestamp)}</span>
            </div>
            <p className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {msg.message}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-600">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className={`flex-1 p-2 rounded border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-black'
            }`}
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded flex items-center gap-2"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default LiveChat;
