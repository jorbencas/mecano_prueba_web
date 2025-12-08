import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import LiveChat from './LiveChat';
import RoomLobby from './RoomLobby';
import { FaCopy, FaUsers, FaSignOutAlt, FaPlay, FaLock } from 'react-icons/fa';

const PracticeRoom: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const { currentRoom, startRace, leaveRoom } = useMultiplayer();
  const [selectedText, setSelectedText] = useState('');



  const sampleTexts = [
    'The quick brown fox jumps over the lazy dog.',
    'Practice makes perfect. Keep typing to improve your speed and accuracy.',
    'In the world of typing, consistency is key to mastery.',
  ];

  const isHost = currentRoom?.players[0]?.id === currentRoom?.players.find(p => p.id)?.id;
  const canStart = currentRoom && currentRoom.players.length >= 1 && selectedText;

  const handleStart = () => {
    if (canStart) {
      startRace(selectedText);
    }
  };

  const handleLeave = () => {
    if (window.confirm(t('confirmations.leaveRoom'))) {
      leaveRoom();
    }
  };

  if (!currentRoom) {
    return <RoomLobby mode="practice" onJoinRoom={() => {}} />;
  }

  const copyRoomLink = () => {
    if (currentRoom) {
      const link = `${window.location.origin}/practice-room/${currentRoom.id}`;
      navigator.clipboard.writeText(link);
      alert(t('alerts.linkCopied'));
    }
  };

  // Show RoomLobby if not in a room
  if (!currentRoom) {
    return <RoomLobby mode="practice" onJoinRoom={() => {}} />;
  }

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🎮 Sala de Práctica</h1>
          <div className="flex gap-2">
            <button
              onClick={copyRoomLink}
              className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
              }`}
            >
              <FaCopy /> Copiar Enlace
            </button>
            <button
            onClick={handleLeave}
            className={`px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-red-500/40 active:scale-95 ${
              isDarkMode
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
            }`}
          >
            {t('practiceRoom.leave', 'Salir de la Sala')}          </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Room Info */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaUsers /> Jugadores ({currentRoom?.players.length || 0})
                </h2>
                {isHost && <span className="px-3 py-1 bg-blue-500 rounded text-sm">HOST</span>}
              </div>
              <div className="space-y-2">
                {currentRoom?.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded flex items-center justify-between ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {index === 0 && <FaLock className="text-yellow-500" />}
                      {player.email}
                    </span>
                    {index === 0 && <span className="text-xs opacity-75">Host</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Text Selection (Host Only) */}
            {isHost && currentRoom?.state === 'waiting' && (
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-xl font-bold mb-4">Seleccionar Texto</h2>
                <div className="space-y-3">
                  {sampleTexts.map((text, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedText(text)}
                      className={`w-full p-4 rounded text-left transition-colors ${
                        selectedText === text
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {text}
                    </button>
                  ))}
                  
                  <div className="mt-4">
                    <label className="block mb-2 font-semibold">O escribe tu propio texto:</label>
                    <textarea
                      value={selectedText}
                      onChange={(e) => setSelectedText(e.target.value)}
                      className={`w-full p-3 rounded border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-black'
                      }`}
                      rows={4}
                      placeholder="Escribe el texto para la carrera..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  disabled={!canStart}
                  className="mt-4 w-full px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded font-bold flex items-center justify-center gap-2"
                >
                  <FaPlay /> Iniciar Carrera
                </button>
              </div>
            )}

            {!isHost && currentRoom?.state === 'waiting' && (
              <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className="text-xl">Esperando a que el host seleccione el texto e inicie la carrera...</p>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <LiveChat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeRoom;
