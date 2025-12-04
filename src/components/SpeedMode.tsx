import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import Keyboard from './Keyboard';
import Hands from './Hands';
import InstruccionesButton from './Instrucciones';
import ErrorModal from './ErrorModal';
import Stats from './Stats';
import { getStatsData } from '../utils/getStatsData';
import TypingArea from './TypingArea';

const SpeedMode: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  
  const [duration, setDuration] = useState(30); // 30, 60, or 120 seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextKey, setNextKey] = useState('');
  const [wpm, setWpm] = useState(0);
  const [errors, setErrors] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [showStats, setShowStats] = useState(false);

  const generateText = useCallback(() => {
    const words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'pack', 'my', 'box', 'with', 'five', 'dozen', 'liquor', 'jugs'];
    let text = '';
    for (let i = 0; i < 50; i++) {
      text += words[Math.floor(Math.random() * words.length)] + ' ';
    }
    return text.trim();
  }, []);

  useEffect(() => {
    const newText = generateText();
    setCurrentText(newText);
    setNextKey(newText[0]);
  }, [generateText]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        const minutes = (duration - timeLeft + 1) / 60;
        setWpm(Math.round((totalChars / 5) / minutes));
      }, 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setShowStats(true);
    }
  }, [isActive, timeLeft, totalChars, duration]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isActive || timeLeft === 0) return;
    
    const key = event.key;
    if (key === currentText[currentIndex]) {
      setTotalChars(prev => prev + 1);
      setCurrentIndex(prev => prev + 1);
      
      if (currentIndex + 1 < currentText.length) {
        setNextKey(currentText[currentIndex + 1]);
      } else {
        const newText = generateText();
        setCurrentText(prev => prev + ' ' + newText);
        setNextKey(newText[0]);
      }
    } else {
      setErrors(prev => prev + 1);
    }
  }, [currentText, currentIndex, isActive, timeLeft, generateText]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startChallenge = () => {
    setIsActive(true);
    setTimeLeft(duration);
    setCurrentIndex(0);
    setErrors(0);
    setTotalChars(0);
    setWpm(0);
    const newText = generateText();
    setCurrentText(newText);
    setNextKey(newText[0]);
  };

  const accuracy = totalChars > 0 ? Math.round(((totalChars - errors) / totalChars) * 100) : 100;

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-orange-400 via-red-400 to-yellow-400' : 'from-orange-600 via-red-600 to-yellow-600'}`}>
            {t('speedMode.title', 'Modo Velocidad')}
          </h1>
        </div>

        {!isActive && !showStats && (
          <div className={`p-8 rounded-2xl text-center shadow-xl border backdrop-blur-sm transition-all duration-300 ${isDarkMode ? 'bg-gray-800/60 border-orange-900/30' : 'bg-white/80 border-orange-100'}`}>
            <h2 className="text-2xl font-bold mb-6">{t('speedMode.selectDuration', 'Selecciona Duración')}</h2>
            <div className="flex justify-center gap-4 mb-8">
              {[30, 60, 120].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-8 py-4 rounded-xl text-xl font-bold transition-all duration-200 ${
                    duration === d
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
            <button
              onClick={startChallenge}
              className={`px-10 py-4 rounded-xl font-bold text-xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-orange-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                  : 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
              }`}
            >
              {t('speedMode.start', 'Comenzar Desafío')}
            </button>
          </div>
        )}

        {isActive && (
          <>
            <div className={`p-6 rounded-2xl mb-6 shadow-lg border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/60 border-orange-900/30' : 'bg-white/80 border-orange-100'}`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className={`text-6xl font-black tracking-tighter ${timeLeft <= 10 ? 'animate-pulse text-red-500' : isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {timeLeft}s
                </div>
                
                <div className={`flex gap-8 p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-orange-50/50'}`}>
                  <div className="text-center">
                    <div className={`text-xs uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('typingArea.stats.wpm')}</div>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{wpm}</div>
                  </div>
                  <div className="w-px bg-gray-300/20"></div>
                  <div className="text-center">
                    <div className={`text-xs uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('typingArea.stats.accuracy')}</div>
                    <div className="text-2xl font-bold text-blue-500">{accuracy}%</div>
                  </div>
                  <div className="w-px bg-gray-300/20"></div>
                  <div className="text-center">
                    <div className={`text-xs uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('typingArea.stats.errors')}</div>
                    <div className="text-2xl font-bold text-red-500">{errors}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl mb-6 shadow-lg border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'}`}>
              <TypingArea
                text={currentText}
                currentIndex={currentIndex}
                standalone
                maxHeight="max-h-64 overflow-y-auto"
              />
            </div>

            <div className="mt-8">
              <Keyboard activeKey={nextKey} levelKeys={[]} />
            </div>
            <div className="mt-8">
              <Hands nextKey={nextKey} />
            </div>
          </>
        )}

        <div className="mt-8">
          <InstruccionesButton
            instructions={t('speedMode.instructions', 'Escribe lo más rápido posible durante el tiempo seleccionado. Tu objetivo es maximizar tu WPM.')}
            source="SpeedMode"
          />
        </div>

        {showStats && (
          <ErrorModal isOpen={showStats} onClose={() => {
            setShowStats(false);
            setTimeLeft(duration);
            setIsActive(false);
          }}>
            <Stats
              stats={getStatsData({
                wpm,
                accuracy,
                level: `${duration}s`,
                errors,
                elapsedTime: duration,
                levelCompleted: true,
                levelData: {
                  wpmGoal: 60,
                  errorLimit: 999,
                },
                text: currentText.substring(0, currentIndex),
              })}
              errorList={[]}
              onRepeatLevel={() => {
                setShowStats(false);
                setTimeLeft(duration);
                setIsActive(false);
              }}
              onNextLevel={() => {
                setShowStats(false);
                setTimeLeft(duration);
                setIsActive(false);
              }}
              sourceComponent="SpeedMode"
            />
          </ErrorModal>
        )}
      </div>
    </div>
  );
};

export default SpeedMode;
