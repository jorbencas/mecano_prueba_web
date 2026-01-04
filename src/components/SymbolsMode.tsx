import React, { useState, useEffect } from 'react';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { GameSource } from '@/types/enums';
import { FaAsterisk } from 'react-icons/fa';
import MenuLevels from './MenuLevels';
import symbolsLevels from '@/data/symbolsLevels.json';
import { useTypingGame } from '@hooks/useTypingGame';
import GameModeLayout from './GameModeLayout';

const SymbolsMode: React.FC = () => {
  const { t } = useDynamicTranslations();
  const [level, setLevel] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    const baseText = symbolsLevels[level].text;
    setText(baseText.repeat(3));
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
    modeName: 'SymbolsMode',
    modeType: 'practice',
    text,
    level: level + 1,
    wpmGoal: symbolsLevels[level].wpmGoal,
    errorLimit: symbolsLevels[level].errorLimit,
  });

  const handleNext = () => {
    if (level < symbolsLevels.length - 1) {
      setLevel(prev => prev + 1);
      handleRepeat();
    }
  };

  const currentWpm = elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = (currentIndex + errors) > 0 ? Math.round((currentIndex / (currentIndex + errors)) * 100) : 100;

  return (
    <GameModeLayout
      title={t('symbolsMode.title')}
      subtitle={t('symbolsMode.subtitle')}
      icon={<FaAsterisk className="text-amber-400" />}
      gradientClasses="from-amber-400 via-orange-400 to-yellow-400"
      accentColorClass="text-amber-400"
      bgAccentClass="bg-amber-50/50"
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
      source={GameSource.SYMBOLS_MODE}
      sourceComponent="SymbolsMode"
      instructions={t('symbolsMode.instructions')}
      level={level + 1}
      levelName={symbolsLevels[level].name}
      wpmGoal={symbolsLevels[level].wpmGoal}
      errorLimit={symbolsLevels[level].errorLimit}
      isFullKeyboard={true}
      sidebar={
        <MenuLevels
          source={GameSource.SYMBOLS_MODE}
          onLevelChange={setLevel}
          currentLevel={level}
          levels={symbolsLevels}
        />
      }
    />
  );
};

export default SymbolsMode;
