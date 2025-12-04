import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { useActivityTracker } from '../hooks/useActivityTracker';
import Keyboard from './Keyboard';
import Hands from './Hands';
import InstruccionesButton from './Instrucciones';
import ErrorModal from './ErrorModal';
import Stats from './Stats';
import { getStatsData } from '../utils/getStatsData';
import TypingArea from './TypingArea';

const PrecisionMode: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const { startTracking, stopTracking } = useActivityTracker('PrecisionMode', 'precisionMode');
  
  const TIME_LIMIT = 120; // 120 seconds
  
  const [currentText] = useState('the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextKey, setNextKey] = useState(currentText[0]);
  const [errors, setErrors] = useState<{key: string, count: number}[]>([]);
  const [totalChars, setTotalChars] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  // Practice control states
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Only allow typing when practice is active
    if (!isActive) return;
    
    const key = event.key;
    
    // Start timer on first keypress
    if (!startTime) {
      setStartTime(Date.now());
      startTracking();
    }
    
    if (key === currentText[currentIndex]) {
      setTotalChars(prev => prev + 1);
      setCurrentIndex(prev => prev + 1);
      
      if (currentIndex + 1 < currentText.length) {
        setNextKey(currentText[currentIndex + 1]);
      } else {
        // Completed the text
        handleStop();
      }
    } else {
      setErrors(prev => {
        const existing = prev.find(e => e.key === currentText[currentIndex]);
        if (existing) {
          return prev.map(e => e.key === currentText[currentIndex] ? {...e, count: e.count + 1} : e);
        }
        return [...prev, {key: currentText[currentIndex], count: 1}];
      });
    }

    const totalErrors = errors.reduce((sum, e) => sum + e.count, 0);
    setAccuracy(Math.round(((totalChars - totalErrors) / Math.max(1, totalChars + 1)) * 100));
  }, [currentText, currentIndex, isActive, errors, totalChars, startTime, startTracking]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
  
  // Timer effect
  useEffect(() => {
    if (isActive && startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeElapsed(elapsed);
        
        // Check time limit
        if (elapsed >= TIME_LIMIT) {
          handleStop();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, startTime]);
  
  const handleStart = () => {
    setIsActive(true);
    setStartTime(null); // Will be set on first keypress
    setTimeElapsed(0);
    setCurrentIndex(0);
    setNextKey(currentText[0]);
    setErrors([]);
    setTotalChars(0);
    setAccuracy(100);
  };
  
  const handleStop = () => {
    setIsActive(false);
    setShowStats(true);
    
    // Stop tracking with metadata
    if (startTime) {
      const totalErrors = errors.reduce((sum, e) => sum + e.count, 0);
      stopTracking({
        wpm: Math.round((totalChars / 5) / (timeElapsed / 60)),
        accuracy,
        errors: totalErrors,
        completed: currentIndex >= currentText.length,
      });
    }
  };
  
  const handleReset = () => {
    if (isActive) {
      handleStop();
    }
    setCurrentIndex(0);
    setNextKey(currentText[0]);
    setErrors([]);
    setTotalChars(0);
    setAccuracy(100);
    setTimeElapsed(0);
    setStartTime(null);
    setShowStats(false);
  };

  const totalErrors = errors.reduce((sum, e) => sum + e.count, 0);
  const mostProblematicKeys = [...errors].sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-teal-400 via-cyan-400 to-blue-400' : 'from-teal-600 via-cyan-600 to-blue-600'}`}>
            {t('precisionMode.title', 'Modo Precisión')}
          </h1>
        </div>

        {/* Start Screen */}
        {!isActive && !showStats && (
          <div className={`p-8 rounded-2xl text-center shadow-xl border backdrop-blur-sm transition-all duration-300 ${isDarkMode ? 'bg-gray-800/60 border-teal-900/30' : 'bg-white/80 border-teal-100'}`}>
            <h2 className="text-2xl font-bold mb-4">
              {t('precisionMode.readyToStart', '¿Listo para el desafío de precisión?')}
            </h2>
            <p className={`mb-8 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('precisionMode.startInstructions', `Tienes ${TIME_LIMIT} segundos para escribir el texto con la mayor precisión posible`)}
            </p>
            <button
              onClick={handleStart}
              className={`px-10 py-4 rounded-xl font-bold text-xl shadow-lg shadow-teal-500/30 transition-all hover:scale-105 hover:shadow-teal-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                  : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
              }`}
            >
              {t('precisionMode.start', 'Comenzar Desafío')}
            </button>
          </div>
        )}

        {/* Active Practice Indicator */}
        {isActive && (
          <div className={`p-6 rounded-2xl mb-6 shadow-lg border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/60 border-teal-900/30' : 'bg-white/80 border-teal-100'}`}>
            <div className="flex justify-between items-center mb-6">
              <div className={`text-5xl font-black tracking-tighter ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                {Math.max(0, TIME_LIMIT - timeElapsed)}s
              </div>
              <button
                onClick={handleStop}
                className={`px-6 py-2 rounded-lg font-bold shadow-lg transition-all hover:scale-105 active:scale-95 ${
                  isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                {t('precisionMode.stop', 'Detener')}
              </button>
            </div>
            
            <div className={`flex gap-8 p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-teal-50/50'}`}>
              <div className="flex-1 text-center">
                <div className={`text-xs uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('typingArea.stats.accuracy')}</div>
                <div className={`text-3xl font-bold ${accuracy >= 98 ? 'text-green-500' : accuracy >= 95 ? 'text-yellow-500' : 'text-red-500'}`}>{accuracy}%</div>
              </div>
              <div className="w-px bg-gray-300/20"></div>
              <div className="flex-1 text-center">
                <div className={`text-xs uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('typingArea.stats.errors')}</div>
                <div className="text-3xl font-bold text-red-500">{totalErrors}</div>
              </div>
              <div className="w-px bg-gray-300/20"></div>
              <div className="flex-1 text-center">
                <div className={`text-xs uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('precisionMode.progress', 'Progreso')}</div>
                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{currentIndex}/{currentText.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Text Display */}
        {isActive && (
          <div className={`p-6 rounded-2xl mb-6 shadow-lg border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'}`}>
            <TypingArea
              text={currentText}
              currentIndex={currentIndex}
              standalone
              maxHeight="max-h-48"
            />
          </div>
        )}

        {/* Problematic Keys */}
        {isActive && mostProblematicKeys.length > 0 && (
          <div className={`p-6 rounded-2xl mb-6 border backdrop-blur-sm ${isDarkMode ? 'bg-red-900/20 border-red-900/30' : 'bg-red-50/80 border-red-100'}`}>
            <h3 className="font-bold mb-4 text-red-500 flex items-center gap-2">
              <span>⚠️</span> {t('precisionMode.problematicKeys', 'Teclas Problemáticas')}
            </h3>
            <div className="flex gap-4 flex-wrap">
              {mostProblematicKeys.map(({key, count}) => (
                <div key={key} className={`flex flex-col items-center p-3 rounded-xl min-w-[80px] ${isDarkMode ? 'bg-red-900/40' : 'bg-white shadow-sm border border-red-100'}`}>
                  <div className={`text-2xl font-mono font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{key}</div>
                  <div className="text-xs font-bold text-red-500">{count} err</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isActive && (
          <div className="mt-8">
            <div className="mb-8">
              <Keyboard activeKey={nextKey} levelKeys={[]} />
            </div>
            <Hands nextKey={nextKey} />
          </div>
        )}
        
        <div className="mt-8">
          <InstruccionesButton
            instructions={t('precisionMode.instructions', 'Concéntrate en la precisión. Cada error se registra y se muestran tus teclas más problemáticas.')}
            source="PrecisionMode"
          />
        </div>

        {/* Stats Modal */}
        {showStats && (
          <ErrorModal isOpen={showStats} onClose={() => {
            setShowStats(false);
          }}>
            <Stats
              stats={getStatsData({
                wpm: Math.round((totalChars / 5) / Math.max(0.1, timeElapsed / 60)),
                accuracy,
                level: 'Precision',
                errors: totalErrors,
                elapsedTime: timeElapsed,
                levelCompleted: currentIndex >= currentText.length,
                levelData: {
                  wpmGoal: 0,
                  errorLimit: 999,
                },
                text: currentText.substring(0, currentIndex),
              })}
              errorList={errors.map(e => ({ expected: e.key, actual: '?' }))}
              onRepeatLevel={() => {
                setShowStats(false);
                handleReset();
              }}
              onNextLevel={() => {
                setShowStats(false);
                handleReset();
              }}
              sourceComponent="PrecisionMode"
            />
          </ErrorModal>
        )}
      </div>
    </div>
  );
};

export default PrecisionMode;
