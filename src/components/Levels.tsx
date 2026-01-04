import React, { useState, useEffect, useCallback } from 'react';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { GameSource } from '@/types/enums';
import { FaKeyboard } from 'react-icons/fa';
import MenuLevels from './MenuLevels';
import levels from '@data/levels.json';
import { useTypingGame } from '@hooks/useTypingGame';
import GameModeLayout from './GameModeLayout';
import Hands from './Hands';
import extractKeysFromText from '@hooks/extractKeysFromText';

const Levels: React.FC = () => {
  const { t } = useDynamicTranslations();
  const [level, setLevel] = useState(0);
  const [text, setText] = useState('');

  const generateRandomText = useCallback((keys: string[], length: number): string => {
    return Array.from({ length }, () => keys[Math.floor(Math.random() * keys.length)]).join('');
  }, []);

  const generateText = useCallback(() => {
    const keys = extractKeysFromText(levels[level].text);
    const newText = generateRandomText(keys, 50);
    setText(newText);
  }, [level, generateRandomText]);

  useEffect(() => {
    generateText();
  }, [generateText]);

  const {
    currentIndex,
    errors,
    errorList,
    isActive,
    elapsedTime,
    showStats,
    handleStart,
    handleStop,
    handleKeyPress,
    handleRepeat,
    setShowStats,
  } = useTypingGame({
    modeName: 'Levels',
    modeType: 'level',
    text,
    level: level + 1,
    wpmGoal: levels[level].wpmGoal,
    errorLimit: levels[level].errorLimit,
  });

  const handleNext = () => {
    if (level < levels.length - 1) {
      setLevel(prev => prev + 1);
      handleRepeat();
    }
  };

  const onLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    handleRepeat();
  };

  const currentWpm = elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = (currentIndex + errors) > 0 ? Math.round((currentIndex / (currentIndex + errors)) * 100) : 100;

  return (
    <GameModeLayout
      title={t('levels.title')}
      icon={<FaKeyboard className="text-blue-500" />}
      gradientClasses="from-blue-500 via-indigo-500 to-violet-500"
      accentColorClass="text-blue-500"
      bgAccentClass="bg-blue-50/50"
      isActive={isActive}
      showStats={showStats}
      currentIndex={currentIndex}
      text={text}
      elapsedTime={elapsedTime}
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
      source={GameSource.LEVELS}
      sourceComponent="Levels"
      instructions={t('levels.instructions')}
      level={level + 1}
      wpmGoal={levels[level].wpmGoal}
      errorLimit={levels[level].errorLimit}
      levelKeys={extractKeysFromText(levels[level].text)}
      sidebar={
        <MenuLevels
          source={GameSource.LEVELS}
          onLevelChange={onLevelChange}
          currentLevel={level}
          levels={levels}
        />
      }
    >
      {isActive && (
        <div className="mt-8">
          <Hands nextKey={text[currentIndex]} />
        </div>
      )}
    </GameModeLayout>
  );
};

export default Levels;