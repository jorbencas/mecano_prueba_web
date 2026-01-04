import React, { useState, useEffect } from 'react';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { GameSource } from '@/types/enums';
import { FaCode } from 'react-icons/fa';
import MenuLevels from './MenuLevels';
import codeLevels from '@data/codeLevels.json';
import { useTypingGame } from '@hooks/useTypingGame';
import GameModeLayout from './GameModeLayout';

const CodeMode: React.FC = () => {
  const { t } = useDynamicTranslations();
  const [level, setLevel] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    setText(codeLevels[level].text);
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
    modeName: 'CodeMode',
    modeType: 'practice',
    text,
    level: level + 1,
    wpmGoal: codeLevels[level].wpmGoal,
    errorLimit: codeLevels[level].errorLimit,
  });

  const handleNext = () => {
    if (level < codeLevels.length - 1) {
      setLevel(prev => prev + 1);
      handleRepeat();
    }
  };

  const currentWpm = elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = (currentIndex + errors) > 0 ? Math.round((currentIndex / (currentIndex + errors)) * 100) : 100;

  return (
    <GameModeLayout
      title={t('codeMode.title')}
      subtitle={t('codeMode.subtitle')}
      icon={<FaCode className="text-blue-400" />}
      gradientClasses="from-teal-400 via-cyan-400 to-blue-400"
      accentColorClass="text-blue-400"
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
      source={GameSource.CODE_MODE}
      sourceComponent="CodeMode"
      instructions={t('codeMode.instructions')}
      level={level + 1}
      levelName={codeLevels[level].name}
      wpmGoal={codeLevels[level].wpmGoal}
      errorLimit={codeLevels[level].errorLimit}
      sidebar={
        <MenuLevels
          source={GameSource.CODE_MODE}
          onLevelChange={setLevel}
          currentLevel={level}
          levels={codeLevels}
        />
      }
    />
  );
};

export default CodeMode;
