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
        <h1 className="text-3xl font-bold mb-6">{t('speedMode.title', 'Modo Velocidad')}</h1>

        {!isActive && !showStats && (
          <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-4">{t('speedMode.selectDuration', 'Selecciona Duración')}</h2>
            <div className="flex gap-4 mb-6">
              {[30, 60, 120].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-6 py-3 rounded text-lg font-bold ${
                    duration === d
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
            <button
              onClick={startChallenge}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xl font-bold"
            >
              {t('speedMode.start', 'Comenzar Desafío')}
            </button>
          </div>
        )}

        {isActive && (
          <>
            <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <div className="text-4xl font-bold text-blue-500">{timeLeft}s</div>
                <div className="flex gap-6 text-lg">
                  <span>{t('typingArea.stats.wpm')}: {wpm}</span>
                  <span>{t('typingArea.stats.accuracy')}: {accuracy}%</span>
                  <span>{t('typingArea.stats.errors')}: {errors}</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <TypingArea
                text={currentText}
                currentIndex={currentIndex}
                standalone
                maxHeight="max-h-64 overflow-y-auto"
              />
            </div>

            <Keyboard activeKey={nextKey} levelKeys={[]} />
            <Hands nextKey={nextKey} />
          </>
        )}

        <InstruccionesButton
          instructions={t('speedMode.instructions', 'Escribe lo más rápido posible durante el tiempo seleccionado. Tu objetivo es maximizar tu WPM.')}
          source="SpeedMode"
        />

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
