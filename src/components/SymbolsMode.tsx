import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { useActivityTracker } from '../hooks/useActivityTracker';
import TypingArea from './TypingArea';
import Keyboard from './Keyboard';
import InstruccionesButton from './Instrucciones';
import Stats from './Stats';
import { SavedStat } from '../utils/saveStats';
import { FaAsterisk, FaPlay, FaStop } from 'react-icons/fa';
import MenuLevels from './MenuLevels';
import symbolsLevels from '../data/symbolsLevels.json';
import { getStatsData } from '../utils/getStatsData';

const SymbolsMode: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const { startTracking, stopTracking } = useActivityTracker('SymbolsMode', 'practice');

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
    // Repeat text to ensure reasonable length
    const baseText = symbolsLevels[level].text;
    setText(baseText.repeat(3)); 
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

    const currentLevelData = symbolsLevels[level];

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
    if (level < symbolsLevels.length - 1) {
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
        source="SymbolsMode"
        onLevelChange={setLevel}
        currentLevel={level}
        levels={symbolsLevels}
        user={user}
      />

      <div className="w-full lg:w-3/4 pl-0 lg:pl-8">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-extrabold mb-3 flex items-center justify-center gap-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-amber-400 via-orange-400 to-yellow-400' : 'from-amber-600 via-orange-600 to-yellow-600'}`}>
            <FaAsterisk className={isDarkMode ? 'text-amber-400' : 'text-amber-600'} />
            {t('symbolsMode.title', 'Modo Símbolos')}
          </h1>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-amber-200/70' : 'text-amber-800/60'}`}>
            {t('symbolsMode.subtitle', 'Domina los caracteres especiales')}
          </p>
        </div>

        <div className={`mb-8 p-6 rounded-2xl border backdrop-blur-sm shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800/60 border-amber-900/30' : 'bg-white/80 border-amber-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {symbolsLevels[level].name}
            </h2>
            <div className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              {elapsedTime}s
            </div>
          </div>
          
          <div className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-amber-50/50'} text-lg`}>
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
              className={`px-10 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-amber-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              }`}
            >
              <FaPlay />
              {t('symbolsMode.start', 'Comenzar')}
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
              {t('symbolsMode.stop', 'Detener')}
            </button>
          )}
        </div>

        {!isActive && !showStats && (
          <>
            <div className={`text-center p-10 rounded-2xl border backdrop-blur-sm mb-6 ${isDarkMode ? 'bg-gray-800/40 border-amber-700/50 text-gray-400' : 'bg-white/60 border-amber-100/60 text-gray-500'}`}>
              <p className="italic text-xl font-mono">{text}</p>
            </div>
            <InstruccionesButton
              instructions={t('symbolsMode.instructions', 'Domina los caracteres especiales y símbolos. Esencial para programadores y usuarios avanzados que necesitan velocidad con símbolos.')}
              source="SymbolsMode"
            />
          </>
        )}

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
                wpmGoal: symbolsLevels[level].wpmGoal || 0, 
                errorLimit: symbolsLevels[level].errorLimit || 999 
              },
              text: text
            })}
            errorList={errorList}
            onRepeatLevel={handleRepeat}
            onNextLevel={handleNext}
            sourceComponent="SymbolsMode"
            onClose={() => setShowStats(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SymbolsMode;
