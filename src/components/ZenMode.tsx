import React, { useState, useEffect } from 'react';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { GameSource } from '@/types/enums';
import { FaSpa } from 'react-icons/fa';
import MenuLevels from './MenuLevels';
import zenLevels from '@/data/zenLevels.json';
import { useTypingGame } from '@hooks/useTypingGame';
import GameModeLayout from './GameModeLayout';

const ZenMode: React.FC = () => {
  const { t } = useDynamicTranslations();
  const [level, setLevel] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    setText(zenLevels[level].text);
  }, [level]);

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
    modeName: 'ZenMode',
    modeType: 'practice',
    text,
    level: level + 1,
  });

  const handleNext = () => {
    if (level < zenLevels.length - 1) {
      setLevel(prev => prev + 1);
      handleRepeat();
    }
  };

  const currentWpm = elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = (currentIndex + errors) > 0 ? Math.round((currentIndex / (currentIndex + errors)) * 100) : 100;

  return (
    <GameModeLayout
      title={t('zenMode.title')}
      subtitle={t('zenMode.subtitle')}
      icon={<FaSpa className="text-purple-400" />}
      gradientClasses="from-purple-400 via-pink-400 to-rose-400"
      accentColorClass="text-purple-400"
      bgAccentClass="bg-purple-50/50"
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
      source={GameSource.ZEN_MODE}
      sourceComponent="ZenMode"
      instructions={t('zenMode.instructions')}
      level={level + 1}
      levelName={zenLevels[level].name}
      sidebar={
        <MenuLevels
          source={GameSource.ZEN_MODE}
          onLevelChange={setLevel}
          currentLevel={level}
          levels={zenLevels}
        />
      }
    />
  );
};

export default ZenMode;
