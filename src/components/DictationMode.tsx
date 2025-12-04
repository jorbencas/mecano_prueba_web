import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { useActivityTracker } from '../hooks/useActivityTracker';
import TypingArea from './TypingArea';
import Keyboard from './Keyboard';
import Stats from './Stats';
import { SavedStat } from '../utils/saveStats';
import { FaMicrophone, FaPlay, FaStop, FaPause, FaRedo } from 'react-icons/fa';
import MenuLevels from './MenuLevels';
import dictationLevels from '../data/dictationLevels.json';
import { getStatsData } from '../utils/getStatsData';
import { useSpeech } from '../hooks/useSpeech';

const DictationMode: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const { startTracking, stopTracking } = useActivityTracker('DictationMode', 'practice');
  const { speak, cancel, pause, resume, speaking: isSpeaking, paused: isSpeechPaused } = useSpeech();

  const [level, setLevel] = useState(0);
  const [text, setText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [errorList, setErrorList] = useState<{ expected: string; actual: string }[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<SavedStat | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speechRate, setSpeechRate] = useState(1);

  useEffect(() => {
    setText(dictationLevels[level].text);
    setCurrentIndex(0);
    setErrors(0);
    setErrorList([]);
    setTotalKeystrokes(0);
    setIsActive(false);
    setStartTime(null);
    setElapsedTime(0);
    cancel();
  }, [level, cancel]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handleStart = () => {
    setIsActive(true);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setErrors(0);
    setErrorList([]);
    setTotalKeystrokes(0);
    setShowStats(false);
    setElapsedTime(0);
    startTracking();
    speak(dictationLevels[level].text, speechRate);
  };

  const handleStop = useCallback(() => {
    if (!startTime) return;

    const endTime = Date.now();
    const finalElapsedTime = (endTime - startTime) / 1000;
    const wordsTyped = currentIndex / 5;
    const wpm = Math.round((wordsTyped / finalElapsedTime) * 60) || 0;
    const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;

    const currentLevelData = dictationLevels[level];

    const finalStats: SavedStat = {
      wpm,
      accuracy,
      level: level + 1,
      errors,
      elapsedTime: finalElapsedTime,
      levelCompleted: true,
      wpmGoal: currentLevelData.wpmGoal || 0,
      errorLimit: currentLevelData.errorLimit || 999,
    };

    setStats(finalStats);
    setShowStats(true);
    setIsActive(false);
    stopTracking();
    cancel();
  }, [startTime, currentIndex, errors, totalKeystrokes, stopTracking, level, cancel]);

  const handleKeyPress = (key: string) => {
    if (!isActive || currentIndex >= text.length) return;

    const expectedChar = text[currentIndex];
    setTotalKeystrokes(prev => prev + 1);

    if (key === expectedChar) {
      setCurrentIndex(prev => prev + 1);
      
      if (currentIndex + 1 >= text.length) {
        setTimeout(() => handleStop(), 100);
      }
    } else {
      setErrors(prev => prev + 1);
      setErrorList(prev => [...prev, { expected: expectedChar, actual: key }].slice(-10));
    }
  };

  const handleRepeat = () => {
    setShowStats(false);
    setCurrentIndex(0);
    setErrors(0);
    setErrorList([]);
    setStartTime(null);
    setIsActive(false);
    setTotalKeystrokes(0);
    setElapsedTime(0);
    cancel();
  };

  const handleNext = () => {
    if (level < dictationLevels.length - 1) {
      setLevel(prev => prev + 1);
      handleRepeat();
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      if (isSpeechPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(text.substring(currentIndex), speechRate);
    }
  };

  const currentChar = isActive && currentIndex < text.length ? text[currentIndex] : '';
  const currentWpm = startTime && elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;

  return (
    <div className="container mx-auto p-4 flex">
      <MenuLevels
        source="DictationMode"
        onLevelChange={setLevel}
        currentLevel={level}
        levels={dictationLevels}
        user={user}
      />

      <div className="w-full lg:w-3/4 pl-0 lg:pl-8">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-extrabold mb-3 flex items-center justify-center gap-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-rose-400 via-red-400 to-orange-400' : 'from-rose-600 via-red-600 to-orange-600'}`}>
            <FaMicrophone className={isDarkMode ? 'text-rose-400' : 'text-rose-600'} />
            {t('dictationMode.title', 'Modo Dictado')}
          </h1>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-rose-200/70' : 'text-rose-800/60'}`}>
            {t('dictationMode.subtitle', 'Escribe lo que escuchas')}
          </p>
        </div>

        <div className={`mb-8 p-6 rounded-2xl border backdrop-blur-sm shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800/60 border-rose-900/30' : 'bg-white/80 border-rose-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {dictationLevels[level].name}
            </h2>
            <div className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
              {elapsedTime}s
            </div>
          </div>
          
          <div className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-rose-50/50'} text-lg`}>
            <div className="flex flex-col items-center">
              <span className={`text-sm uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>WPM</span>
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{currentWpm}</span>
            </div>
            <div className="w-px h-8 bg-gray-300/20 hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <span className={`text-sm uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('stats.labels.errors', 'Errores')}</span>
              <span className="text-2xl font-bold text-red-500">{errors}</span>
            </div>
            <div className="w-px h-8 bg-gray-300/20 hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <span className={`text-sm uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('stats.labels.accuracy', 'Precisión')}</span>
              <span className="text-2xl font-bold text-blue-500">{currentAccuracy}%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="flex gap-4">
            {!isActive ? (
              <button
                onClick={handleStart}
                className={`px-10 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-rose-500/30 transition-all hover:scale-105 hover:shadow-rose-500/40 active:scale-95 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white' 
                    : 'bg-gradient-to-r from-rose-500 to-red-500 text-white'
                }`}
              >
                <FaPlay />
                {t('dictationMode.start', 'Comenzar')}
              </button>
            ) : (
              <>
                <button
                  onClick={handleStop}
                  className={`px-10 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-red-500/40 active:scale-95 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' 
                      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                  }`}
                >
                  <FaStop />
                  {t('dictationMode.stop', 'Detener')}
                </button>
                <button
                  onClick={toggleSpeech}
                  className={`px-6 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg transition-all hover:scale-105 active:scale-95 ${
                    isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                  } text-white`}
                >
                  {isSpeechPaused ? <FaPlay /> : <FaPause />}
                </button>
                <button
                  onClick={() => speak(text.substring(currentIndex), speechRate)}
                  className={`px-6 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg transition-all hover:scale-105 active:scale-95 ${
                    isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'
                  } text-white`}
                >
                  <FaRedo />
                </button>
              </>
            )}
          </div>

          <div className={`flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40' : 'bg-white/60'}`}>
            <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Velocidad:</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-48 accent-rose-500"
            />
            <span className={`font-mono font-bold w-12 text-right ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>{speechRate}x</span>
          </div>
        </div>

        {isActive && (
          <div className={`p-6 rounded-2xl border backdrop-blur-sm shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'}`}>
            <div className="mb-8">
              <TypingArea
                text={text}
                currentIndex={currentIndex}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="mb-4">
              <Keyboard activeKey={currentChar} levelKeys={[]} isFullKeyboard={true} />
            </div>
          </div>
        )}

        {showStats && stats && (
          <Stats
            stats={getStatsData({
              wpm: stats.wpm,
              accuracy: stats.accuracy,
              level: level + 1,
              errors: stats.errors,
              elapsedTime: stats.elapsedTime,
              levelCompleted: true,
              levelData: { 
                wpmGoal: dictationLevels[level].wpmGoal || 0, 
                errorLimit: dictationLevels[level].errorLimit || 999 
              },
              text: text
            })}
            errorList={errorList}
            onRepeatLevel={handleRepeat}
            onNextLevel={handleNext}
            sourceComponent="DictationMode"
            onClose={() => setShowStats(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DictationMode;
