import { useState, useEffect, useCallback, useRef } from 'react';
import { useActivityTracker } from './useActivityTracker';
import { SavedStat } from '@utils/saveStats';

interface UseTypingGameProps {
  modeName: string;
  modeType: 'level' | 'practice' | 'game' | 'speedMode' | 'precisionMode' | 'createText' | 'freePractice';
  text: string;
  timeLimit?: number; // Optional countdown time in seconds
  onComplete?: (stats: SavedStat) => void;
  wpmGoal?: number;
  errorLimit?: number;
  level?: number;
}

export const useTypingGame = ({
  modeName,
  modeType,
  text,
  timeLimit,
  onComplete,
  wpmGoal = 0,
  errorLimit = 999,
  level = 1,
}: UseTypingGameProps) => {
  const { startTracking, stopTracking } = useActivityTracker(modeName, modeType);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [errorList, setErrorList] = useState<{ expected: string; actual: string }[]>([]);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<SavedStat | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStop = useCallback(() => {
    if (!startTime) return;

    const endTime = Date.now();
    const finalElapsedTime = (endTime - startTime) / 1000;
    const wordsTyped = currentIndex / 5;
    const wpm = Math.round((wordsTyped / (finalElapsedTime || 1)) * 60) || 0;
    const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;

    const finalStats: SavedStat = {
      wpm,
      accuracy,
      level,
      errors,
      elapsedTime: finalElapsedTime,
      levelCompleted: true,
      wpmGoal,
      errorLimit,
    };

    setStats(finalStats);
    setShowStats(true);
    setIsActive(false);
    stopTracking();
    if (onComplete) onComplete(finalStats);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [startTime, currentIndex, errors, totalKeystrokes, stopTracking, level, wpmGoal, errorLimit, onComplete]);

  const handleStart = useCallback(() => {
    setIsActive(true);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setErrors(0);
    setErrorList([]);
    setTotalKeystrokes(0);
    setShowStats(false);
    setElapsedTime(0);
    if (timeLimit) setTimeLeft(timeLimit);
    startTracking();
  }, [timeLimit, startTracking]);

  const handleKeyPress = useCallback((key: string) => {
    if (!isActive || currentIndex >= text.length) return;

    const expectedChar = text[currentIndex];
    setTotalKeystrokes(prev => prev + 1);

    if (key === expectedChar) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      if (nextIndex >= text.length) {
        setTimeout(() => handleStop(), 100);
      }
    } else {
      setErrors(prev => prev + 1);
      setErrorList(prev => [...prev, { expected: expectedChar, actual: key }].slice(-10));
    }
  }, [isActive, currentIndex, text, handleStop]);

  const handleRepeat = useCallback(() => {
    setShowStats(false);
    setCurrentIndex(0);
    setErrors(0);
    setErrorList([]);
    setStartTime(null);
    setIsActive(false);
    setTotalKeystrokes(0);
    setElapsedTime(0);
    if (timeLimit) setTimeLeft(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);

        if (timeLimit) {
          const remaining = Math.max(0, timeLimit - elapsed);
          setTimeLeft(remaining);
          if (remaining === 0) {
            handleStop();
          }
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, startTime, timeLimit, handleStop]);

  return {
    currentIndex,
    errors,
    errorList,
    totalKeystrokes,
    startTime,
    isActive,
    elapsedTime,
    timeLeft,
    showStats,
    stats,
    handleStart,
    handleStop,
    handleKeyPress,
    handleRepeat,
    setShowStats,
  };
};
