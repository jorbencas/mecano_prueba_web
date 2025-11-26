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

      <div className="w-3/4 pl-4">
        <div className="text-center mb-6">
          <h1 className={`text-3xl font-bold mb-2 flex items-center justify-center gap-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            <FaSpa />
            {t('zenMode.title', 'Modo Zen')}
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('zenMode.subtitle', 'Práctica sin presión')}
          </p>
        </div>

        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {zenLevels[level].name}
            </h2>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {elapsedTime}s
            </div>
          </div>
          
          <div className={`flex flex-col sm:flex-row justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
            <p>WPM: <span className="font-bold">{currentWpm}</span></p>
            <p>{t('stats.labels.errors', 'Errores')}: <span className="font-bold text-red-500">{errors}</span></p>
            <p>{t('stats.labels.accuracy', 'Precisión')}: <span className="font-bold text-blue-500">{currentAccuracy}%</span></p>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          {!isActive ? (
            <button
              onClick={handleStart}
              className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 ${
                isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
              } text-white shadow-lg transition-transform hover:scale-105`}
            >
              <FaPlay />
              {t('zenMode.start', 'Comenzar')}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 ${
                isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
              } text-white shadow-lg transition-transform hover:scale-105`}
            >
              <FaStop />
              {t('zenMode.stop', 'Detener')}
            </button>
          )}
        </div>

        {isActive && (
          <>
            <div className="mb-8">
              <TypingArea
                text={text}
                currentIndex={currentIndex}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="mb-8">
              <Keyboard activeKey={currentChar} levelKeys={[]} />
            </div>
          </>
        )}

        {!isActive && !showStats && (
          <div className={`text-center p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-inner opacity-75`}>
            <p className="italic text-lg">"{text}"</p>
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
