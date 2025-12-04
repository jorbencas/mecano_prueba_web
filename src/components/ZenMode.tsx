import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { useActivityTracker } from '../hooks/useActivityTracker';
import TypingArea from './TypingArea';
import Keyboard from './Keyboard';
import Stats from './Stats';
import { SavedStat } from '../utils/saveStats';
import { FaSpa, FaPlay, FaStop } from 'react-icons/fa';
import MenuLevels from './MenuLevels';
import zenLevels from '../data/zenLevels.json';
import { getStatsData } from '../utils/getStatsData';

const ZenMode: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const { startTracking, stopTracking } = useActivityTracker('ZenMode', 'practice');

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

  useEffect(() => {
    setText(zenLevels[level].text);
    setCurrentIndex(0);
    setErrors(0);
    setErrorList([]);
    setTotalKeystrokes(0);
    setIsActive(false);
    setStartTime(null);
    setElapsedTime(0);
  }, [level]);

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
  };

  const handleStop = useCallback(() => {
    if (!startTime) return;

    const endTime = Date.now();
    const finalElapsedTime = (endTime - startTime) / 1000;
    const wordsTyped = currentIndex / 5;
    const wpm = Math.round((wordsTyped / finalElapsedTime) * 60) || 0;
    const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;

    const finalStats: SavedStat = {
      wpm,
      accuracy,
      level: level + 1,
      errors,
      elapsedTime: finalElapsedTime,
      levelCompleted: true,
      wpmGoal: 0,
      errorLimit: 999,
    };

    setStats(finalStats);
    setShowStats(true);
    setIsActive(false);
    stopTracking();
  }, [startTime, currentIndex, errors, totalKeystrokes, stopTracking, level]);

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
  };

  const handleNext = () => {
    if (level < zenLevels.length - 1) {
      setLevel(prev => prev + 1);
      handleRepeat();
    }
  };

  const currentChar = isActive && currentIndex < text.length ? text[currentIndex] : '';
  const currentWpm = startTime && elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;

  return (
    <div className="container mx-auto p-4 flex">
      <MenuLevels
        source="ZenMode"
        onLevelChange={setLevel}
        currentLevel={level}
        levels={zenLevels}
        user={user}
      />

      <div className="w-full lg:w-3/4 pl-0 lg:pl-8">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-extrabold mb-3 flex items-center justify-center gap-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-purple-400 via-pink-400 to-rose-400' : 'from-purple-600 via-pink-600 to-rose-600'}`}>
            <FaSpa className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
            {t('zenMode.title', 'Modo Zen')}
          </h1>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-purple-200/70' : 'text-purple-800/60'}`}>
            {t('zenMode.subtitle', 'Práctica sin presión')}
          </p>
        </div>

        <div className={`mb-8 p-6 rounded-2xl border backdrop-blur-sm shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800/60 border-purple-900/30' : 'bg-white/80 border-purple-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {zenLevels[level].name}
            </h2>
            <div className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {elapsedTime}s
            </div>
          </div>
          
          <div className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-purple-50/50'} text-lg`}>
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

        <div className="flex justify-center gap-6 mb-8">
          {!isActive ? (
            <button
              onClick={handleStart}
              className={`px-10 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}
            >
              <FaPlay />
              {t('zenMode.start', 'Comenzar')}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className={`px-10 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-red-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' 
                  : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
              }`}
            >
              <FaStop />
              {t('zenMode.stop', 'Detener')}
            </button>
          )}
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
              <Keyboard activeKey={currentChar} levelKeys={[]} />
            </div>
          </div>
        )}

        {!isActive && !showStats && (
          <div className={`text-center p-10 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50 text-gray-400' : 'bg-white/60 border-white/60 text-gray-500'}`}>
            <p className="italic text-xl font-serif">"{text}"</p>
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
              levelData: { wpmGoal: 0, errorLimit: 999 },
              text: text
            })}
            errorList={errorList}
            onRepeatLevel={handleRepeat}
            onNextLevel={handleNext}
            sourceComponent="ZenMode"
            onClose={() => setShowStats(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ZenMode;
