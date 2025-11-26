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

      <div className="w-3/4 pl-4">
        <div className="text-center mb-6">
          <h1 className={`text-3xl font-bold mb-2 flex items-center justify-center gap-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <FaMicrophone />
            {t('dictationMode.title', 'Modo Dictado')}
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('dictationMode.subtitle', 'Escribe lo que escuchas')}
          </p>
        </div>

        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {dictationLevels[level].name}
            </h2>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {elapsedTime}s
            </div>
          </div>
          
          <div className={`flex flex-col sm:flex-row justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
            <p>WPM: <span className="font-bold">{currentWpm}</span></p>
            <p>{t('stats.labels.errors', 'Errores')}: <span className="font-bold text-red-500">{errors}</span></p>
            <p>{t('stats.labels.accuracy', 'Precisión')}: <span className="font-bold text-blue-500">{currentAccuracy}%</span></p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex gap-4">
            {!isActive ? (
              <button
                onClick={handleStart}
                className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } text-white shadow-lg transition-transform hover:scale-105`}
              >
                <FaPlay />
                {t('dictationMode.start', 'Comenzar')}
              </button>
            ) : (
              <>
                <button
                  onClick={handleStop}
                  className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 ${
                    isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                  } text-white shadow-lg transition-transform hover:scale-105`}
                >
                  <FaStop />
                  {t('dictationMode.stop', 'Detener')}
                </button>
                <button
                  onClick={toggleSpeech}
                  className={`px-4 py-3 rounded-lg font-bold flex items-center gap-2 ${
                    isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                  } text-white shadow-lg`}
                >
                  {isSpeechPaused ? <FaPlay /> : <FaPause />}
                </button>
                <button
                  onClick={() => speak(text.substring(currentIndex), speechRate)}
                  className={`px-4 py-3 rounded-lg font-bold flex items-center gap-2 ${
                    isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'
                  } text-white shadow-lg`}
                >
                  <FaRedo />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Velocidad:</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{speechRate}x</span>
          </div>
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
              <Keyboard activeKey={currentChar} levelKeys={[]} isFullKeyboard={true} />
            </div>
          </>
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
