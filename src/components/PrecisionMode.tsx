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
        <h1 className="text-3xl font-bold mb-6">{t('precisionMode.title', 'Modo Precisión')}</h1>

        {/* Start Screen */}
        {!isActive && !showStats && (
          <div className={`p-6 rounded-lg text-center mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-4">
              {t('precisionMode.readyToStart', '¿Listo para el desafío de precisión?')}
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('precisionMode.startInstructions', `Tienes ${TIME_LIMIT} segundos para escribir el texto con la mayor precisión posible`)}
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xl font-bold"
            >
              {t('precisionMode.start', 'Comenzar Desafío')}
            </button>
          </div>
        )}

        {/* Active Practice Indicator */}
        {isActive && (
          <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="text-4xl font-bold text-blue-500">{Math.max(0, TIME_LIMIT - timeElapsed)}s</div>
              <button
                onClick={handleStop}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                {t('precisionMode.stop', 'Detener')}
              </button>
            </div>
            <div className="flex gap-6 text-lg">
              <span>{t('typingArea.stats.accuracy')}: <span className={accuracy >= 98 ? 'text-green-500' : accuracy >= 95 ? 'text-yellow-500' : 'text-red-500'}>{accuracy}%</span></span>
              <span>{t('typingArea.stats.errors')}: <span className="text-red-500">{totalErrors}</span></span>
              <span>{t('precisionMode.progress', 'Progreso')}: {currentIndex}/{currentText.length}</span>
            </div>
          </div>
        )}

        {/* Text Display */}
        {isActive && (
          <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
          <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-red-900' : 'bg-red-100'}`}>
            <h3 className="font-bold mb-2">{t('precisionMode.problematicKeys', 'Teclas Problemáticas')}:</h3>
            <div className="flex gap-4">
              {mostProblematicKeys.map(({key, count}) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-mono font-bold">{key}</div>
                  <div className="text-sm">{count} {t('precisionMode.errors', 'errores')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isActive && (
          <>
            <Keyboard activeKey={nextKey} levelKeys={[]} />
            <Hands nextKey={nextKey} />
          </>
        )}
        
        <InstruccionesButton
          instructions={t('precisionMode.instructions', 'Concéntrate en la precisión. Cada error se registra y se muestran tus teclas más problemáticas.')}
          source="PrecisionMode"
        />

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
