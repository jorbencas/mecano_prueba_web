import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { useAuth } from '../context/AuthContext';
import Keyboard from './Keyboard';
import InstruccionesButton from './Instrucciones';
import LiveChat from './LiveChat';
import RoomLobby from './RoomLobby';
import { FaFlagCheckered, FaTrophy, FaUserFriends, FaClock, FaCheckCircle } from 'react-icons/fa';

const RaceMode: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const { currentRoom, updateProgress, finishRace, leaveRoom } = useMultiplayer();
  

  
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const text = currentRoom?.text || '';
  const isRacing = currentRoom?.state === 'racing';
  const isFinished = currentRoom?.state === 'finished';

  useEffect(() => {
    if (isRacing && currentRoom?.startTime && !startTime) {
      setStartTime(currentRoom.startTime);
      inputRef.current?.focus();
    }
  }, [isRacing, currentRoom?.startTime]);

  useEffect(() => {
    if (!isRacing) {
      setUserInput('');
      setStartTime(null);
      setFinished(false);
    }
  }, [currentRoom, startTime]);

  if (!currentRoom) {
    return <RoomLobby mode="race" onJoinRoom={() => {}} />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isRacing || finished) return;

    const value = e.target.value;
    setUserInput(value);

    // Calculate stats
    const progress = (value.length / text.length) * 100;
    const errors = value.split('').filter((char, i) => char !== text[i]).length;
    const accuracy = ((value.length - errors) / value.length) * 100 || 100;
    const elapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0.01;
    const wordsTyped = value.trim().split(/\s+/).length;
    const wpm = Math.round(wordsTyped / elapsedMinutes);

    // Update progress
    updateProgress(progress, wpm, accuracy);

    // Check if finished
    if (value === text) {
      const totalTime = Date.now() - (startTime || Date.now());
      finishRace(wpm, accuracy, totalTime);
      setFinished(true);
    }
  };

  const handleLeave = () => {
    if (window.confirm('¿Seguro que quieres salir de la carrera?')) {
      leaveRoom();
    }
  };

  const getPlayerPosition = (playerId: string) => {
    if (!currentRoom) return 0;
    const sorted = [...currentRoom.players].sort((a, b) => b.progress - a.progress);
    return sorted.findIndex(p => p.id === playerId) + 1;
  };

  // Show RoomLobby if not in a room
  if (!currentRoom) {
    return <RoomLobby mode="race" onJoinRoom={() => {}} />;
  }

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🏁 Modo Carrera</h1>
          <button
            onClick={handleLeave}
            className={`px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-red-500/40 active:scale-95 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' 
                : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
            }`}
          >
            Salir
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Race Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Players Progress */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-4">Jugadores</h2>
              <div className="space-y-3">
                {currentRoom?.players.map((player, index) => (
                  <div key={player.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {player.finished && <FaCheckCircle className="text-green-500" />}
                        {getPlayerPosition(player.id) === 1 && !isFinished && <FaTrophy className="text-yellow-500" />}
                        {player.email}
                      </span>
                      <span>{player.wpm} WPM | {player.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className={`w-full h-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-3 rounded transition-all ${
                          player.finished ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${player.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Text Display */}
            {isRacing && (
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="text-2xl font-mono leading-relaxed mb-4">
                  {text.split('').map((char, i) => (
                    <span
                      key={i}
                      className={
                        i < userInput.length
                          ? userInput[i] === char
                            ? 'text-green-500'
                            : 'text-red-500 bg-red-500 bg-opacity-20'
                          : i === userInput.length
                          ? 'bg-blue-500 bg-opacity-30'
                          : ''
                      }
                    >
                      {char}
                    </span>
                  ))}
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  disabled={finished}
                  className={`w-full p-4 rounded border-2 text-xl font-mono ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-black'
                  }`}
                  placeholder="Empieza a escribir..."
                  autoFocus
                />
              </div>
            )}

            {!isRacing && !isFinished && (
        <>
          <div className={`text-center p-10 rounded-2xl border backdrop-blur-sm mb-6 ${isDarkMode ? 'bg-gray-800/40 border-blue-700/50 text-gray-400' : 'bg-white/60 border-blue-100/60 text-gray-500'}`}>
            <p className="text-2xl font-bold mb-4">{t('raceMode.ready', '¿Listo para la carrera?')}</p>
            <p className="text-lg">{t('raceMode.instruction', 'Escribe el texto lo más rápido posible')}</p>
          </div>
          <InstruccionesButton
            instructions={t('raceMode.instructions', 'Compite contra el tiempo escribiendo el texto completo. Ideal para practicar velocidad bajo presión.')}
            source="RaceMode"
          />
        </>
      )}
            {isFinished && (
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-2xl font-bold mb-4 text-center">🏆 Resultados Finales</h2>
                <div className="space-y-2">
                  {currentRoom?.players
                    .sort((a, b) => (b.finalWpm || 0) - (a.finalWpm || 0))
                    .map((player, index) => (
                      <div
                        key={player.id}
                        className={`p-4 rounded flex justify-between items-center ${
                          index === 0 ? 'bg-yellow-500 bg-opacity-20' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {index === 0 && <FaTrophy className="text-yellow-500 text-2xl" />}
                          <span className="font-bold">#{index + 1}</span>
                          {player.email}
                        </span>
                        <span>
                          {player.finalWpm} WPM | {player.finalAccuracy?.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Keyboard */}
            <Keyboard activeKey={userInput[userInput.length - 1] || ''} levelKeys={text.split('')} isFullKeyboard />
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

export default RaceMode;
