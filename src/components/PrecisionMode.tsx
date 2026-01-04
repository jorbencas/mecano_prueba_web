import React, { useState, useCallback } from 'react';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { GameSource } from '@/types/enums';
import { FaBullseye } from 'react-icons/fa';
import { useTypingGame } from '@hooks/useTypingGame';
import GameModeLayout from './GameModeLayout';
import Hands from './Hands';

const PrecisionMode: React.FC = () => {
  const { t } = useDynamicTranslations();
  const [text] = useState('the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs');

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
    modeName: 'PrecisionMode',
    modeType: 'precisionMode',
    text,
    timeLimit: 120,
  });

  const currentWpm = elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = (currentIndex + errors) > 0 ? Math.round((currentIndex / (currentIndex + errors)) * 100) : 100;

  // Custom keypress handler to listen to window events as in original
  const onKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;
    handleKeyPress(event.key);
  }, [isActive, handleKeyPress]);

  React.useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, [onKeyPress]);

  return (
    <GameModeLayout
      title={t('precisionMode.title')}
      subtitle={t('precisionMode.subtitle', 'Mejora tu precisión con textos desafiantes')}
      icon={<FaBullseye className="text-teal-400" />}
      gradientClasses="from-teal-400 via-cyan-400 to-blue-400"
      accentColorClass="text-teal-400"
      bgAccentClass="bg-teal-50/50"
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
      onCloseStats={() => setShowStats(false)}
      source={GameSource.ZEN_MODE} // Using ZEN_MODE as fallback for instructions
      sourceComponent="PrecisionMode"
      instructions={t('precisionMode.instructions', 'Escribe el texto con la mayor precisión posible. El tiempo es limitado.')}
    >
      {isActive && (
        <div className="mt-8">
          <Hands nextKey={text[currentIndex]} />
        </div>
      )}
    </GameModeLayout>
  );
};

export default PrecisionMode;
