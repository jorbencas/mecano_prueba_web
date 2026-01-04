import React, { useState, useEffect } from 'react';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { GameSource } from '@/types/enums';
import { FaHashtag } from 'react-icons/fa';
import MenuLevels from './MenuLevels';
import numbersLevels from '@data/numbersLevels.json';
import { useTypingGame } from '@hooks/useTypingGame';
import GameModeLayout from './GameModeLayout';

const NumbersMode: React.FC = () => {
  const { t } = useDynamicTranslations();
  const [level, setLevel] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    const baseText = numbersLevels[level].text;
    setText(baseText.repeat(5));
  }, [level]);

  const {
    currentIndex,
    errors,
    errorList,
    isActive,
    elapsedTime,
    timeLeft,
    showStats,
    handleStart,
    handleStop,
    handleKeyPress,
    handleRepeat,
    setShowStats,
  } = useTypingGame({
    modeName: 'NumbersMode',
    modeType: 'practice',
    text,
    timeLimit: 60,
    level: level + 1,
    wpmGoal: numbersLevels[level].wpmGoal,
    errorLimit: numbersLevels[level].errorLimit,
  });

  const handleNext = () => {
    if (level < numbersLevels.length - 1) {
      setLevel(prev => prev + 1);
      handleRepeat();
    }
  };

  const currentWpm = elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = (currentIndex + errors) > 0 ? Math.round((currentIndex / (currentIndex + errors)) * 100) : 100;

  return (
    <GameModeLayout
      title={t('numbersMode.title')}
      subtitle={t('numbersMode.subtitle')}
      icon={<FaHashtag className="text-green-400" />}
      gradientClasses="from-green-400 via-emerald-400 to-teal-400"
      accentColorClass="text-green-400"
      bgAccentClass="bg-green-50/50"
      isActive={isActive}
      showStats={showStats}
      currentIndex={currentIndex}
      text={text}
      elapsedTime={elapsedTime}
      timeLeft={timeLeft}
      wpm={currentWpm}
      accuracy={currentAccuracy}
      errors={errors}
      errorList={errorList}
      onStart={handleStart}
      onStop={handleStop}
      onKeyPress={handleKeyPress}
      onRepeat={handleRepeat}
      onNext={handleNext}
      onCloseStats={() => setShowStats(false)}
      source={GameSource.NUMBERS_MODE}
      sourceComponent="NumbersMode"
      instructions={t('numbersMode.instructions')}
      level={level + 1}
      levelName={numbersLevels[level].name}
      wpmGoal={numbersLevels[level].wpmGoal}
      errorLimit={numbersLevels[level].errorLimit}
      sidebar={
        <MenuLevels
          source={GameSource.NUMBERS_MODE}
          onLevelChange={setLevel}
          currentLevel={level}
          levels={numbersLevels}
        />
      }
    />
  );
};

export default NumbersMode;
