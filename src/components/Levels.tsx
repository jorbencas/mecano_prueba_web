import React, { useState, useEffect } from 'react';
import Keyboard from './Keyboard';
import TypingArea from './TypingArea';
import Stats from './Stats';
import Hands from './Hands';
import MenuLevels from "./MenuLevels";
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import InstruccionesButton from './Instrucciones';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { getStatsData } from '../utils/getStatsData';
import levels from '../data/levels.json';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import extractKeysFromText from '../hooks/extractKeysFromText';

const Levels: React.FC = () => {
  const [level, setLevel] = useState(0);
  const [text, setText] = useState('');
  const [nextKey, setNextKey] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState<{ [key: number]: { expected: string; actual: string } }>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [errorList, setErrorList] = useState<{ expected: string; actual: string }[]>([]);
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const { startTracking, stopTracking } = useActivityTracker('Levels', 'level');

  // Generar texto al cambiar de nivel
  useEffect(() => {
    generateText();
  }, [level]);

  const generateText = () => {
    let newText = generateRandomText(extractKeysFromText(levels[level].text), 50);
    setText(newText);
    setNextKey(newText[0].toLowerCase());
    setCurrentIndex(0);
    setTotalWords(newText.split(' ').length);
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrors({});
    setTotalKeystrokes(0);
    setLevelCompleted(false);
    setElapsedTime(0);
    setErrorList([]);
  };

  const generateRandomText = (keys: string[], length: number): string => {
    return Array.from({ length }, () => keys[Math.floor(Math.random() * keys.length)]).join('');
  };

  const finishLevel = () => {
    if (startTime !== null) {
      const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
      const wordsTyped = currentIndex / totalWords;
      const currentWpm = Math.round(wordsTyped / elapsedMinutes);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      setElapsedTime(timeTaken);
      const completed = currentWpm >= levels[level].wpmGoal && accuracy >= 95;
      setLevelCompleted(completed);

      if (completed && !completedLevels.includes(level)) {
        setCompletedLevels(prev => [...prev, level]);
      }
      
      // Stop tracking with metadata
      stopTracking({
        level,
        wpm: currentWpm,
        accuracy,
        errors: Object.keys(errors).length,
        completed,
      });
    }
    setShowStatsModal(true);
  };

  const handleKeyPress = (key: string) => {
    if (!text) return;

    // Start tracking when first key is pressed
    if (currentIndex === 0 && startTime === null) {
      setStartTime(Date.now());
      startTracking();
    }
    
    setTotalKeystrokes(prev => prev + 1);

    const expectedKey = text[currentIndex].toLowerCase();

    if (key.toLowerCase() === expectedKey) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      if (newIndex < text.length) {
        setNextKey(text[newIndex].toLowerCase());
      } else {
        setNextKey('');
        finishLevel();
      }
      updateWPM();
    } else {
      setErrors(prev => {
        const newErrors = {
          ...prev,
          [currentIndex]: { expected: expectedKey, actual: key },
        };

        if (Object.keys(newErrors).length >= levels[level].errorLimit) {
          finishLevel();
        }

        return newErrors;
      });

      setErrorList(prev => [{ expected: expectedKey, actual: key }, ...prev]);
    }
    updateAccuracy();
  };

  useEffect(() => {
    if (startTime !== null && !levelCompleted) {
      const timer = setInterval(() => {
        const timePassed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(timePassed);
        if (timePassed >= 120) finishLevel();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, levelCompleted]);

  const updateWPM = () => {
    if (startTime) {
      const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
      const wordsTyped = currentIndex / totalWords;
      const currentWpm = Math.round(wordsTyped / elapsedMinutes);
      setWpm(currentWpm);
    }
  };

  const updateAccuracy = () => {
    const errorCount = Object.keys(errors).length;
    setAccuracy(
      totalKeystrokes > 0
        ? Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100)
        : 100
    );
  };

  const repeatLevel = () => {
    generateText();
    setShowStatsModal(false);
  };

  const nextLevel = () => {
    if (level < levels.length && levelCompleted) {
      setLevel(level + 1);
      setShowStatsModal(false);
    } else {
      console.log(t('levels.errors.cannotAdvance'));
    }
  };

  return (
    <div className="container mx-auto p-4 flex">
      <MenuLevels
        source="Levels"
        onLevelChange={(newLevel) => setLevel(newLevel)}
        currentLevel={level}
        levels={levels}
        user={user}
      />
      <div className="w-3/4">
        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {t('levels.title')}
        </h1>

        <TypingArea
          text={text}
          currentIndex={currentIndex}
          onKeyPress={handleKeyPress}
          wpm={wpm}
          accuracy={accuracy}
          errors={errors}
          source="Levels"
        />

        <Keyboard activeKey={nextKey} levelKeys={extractKeysFromText(levels[level].text)} />
        <Hands nextKey={nextKey} />

        <InstruccionesButton
          instructions={t('levels.instructions')}
          source="Levels"
        />
        {showStatsModal && (
          <Stats
            stats={getStatsData({
              wpm,
              accuracy,
              level,
              errors: Object.keys(errors).length,
              elapsedTime,
              levelCompleted,
              levelData: {
                wpmGoal: levels[level].wpmGoal,
                errorLimit: levels[level].errorLimit,
              },
              text,
            })}
            errorList={errorList}
            onRepeatLevel={repeatLevel}
            onNextLevel={nextLevel}
            sourceComponent="Levels"
            onClose={() => setShowStatsModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Levels;