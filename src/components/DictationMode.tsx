import React, { useState, useEffect } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { GameSource } from '@/types/enums';
import { FaMicrophone, FaPause, FaRedo, FaPlay } from 'react-icons/fa';
import MenuLevels from './MenuLevels';
import dictationLevels from '@data/dictationLevels.json';
import { useTypingGame } from '@hooks/useTypingGame';
import GameModeLayout from './GameModeLayout';
import { useSpeech } from '@hooks/useSpeech';

const DictationMode: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const { speak, cancel, pause, resume, paused: isSpeechPaused } = useSpeech();
  const [level, setLevel] = useState(0);
  const [text, setText] = useState('');
  const [speechRate, setSpeechRate] = useState(1);

  useEffect(() => {
    setText(dictationLevels[level].text);
    cancel();
  }, [level, cancel]);

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
    modeName: 'DictationMode',
    modeType: 'practice',
    text,
    level: level + 1,
    wpmGoal: dictationLevels[level].wpmGoal,
    errorLimit: dictationLevels[level].errorLimit,
    onComplete: () => cancel(),
  });

  const onStart = () => {
    handleStart();
    speak(text, speechRate);
  };

  const onStop = () => {
    handleStop();
    cancel();
  };

  const handleNext = () => {
    if (level < dictationLevels.length - 1) {
      setLevel(prev => prev + 1);
      handleRepeat();
    }
  };

  const currentWpm = elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = (currentIndex + errors) > 0 ? Math.round((currentIndex / (currentIndex + errors)) * 100) : 100;

  return (
    <GameModeLayout
      title={t('dictationMode.title')}
      subtitle={t('dictationMode.subtitle')}
      icon={<FaMicrophone className="text-red-400" />}
      gradientClasses="from-red-400 via-rose-400 to-pink-400"
      accentColorClass="text-red-400"
      bgAccentClass="bg-red-50/50"
      isActive={isActive}
      showStats={showStats}
      currentIndex={currentIndex}
      text={text}
      elapsedTime={elapsedTime}
      wpm={currentWpm}
      accuracy={currentAccuracy}
      errors={errors}
      errorList={errorList}
      onStart={onStart}
      onStop={onStop}
      onKeyPress={handleKeyPress}
      onRepeat={handleRepeat}
      onNext={handleNext}
      onCloseStats={() => setShowStats(false)}
      source={GameSource.DICTATION_MODE}
      sourceComponent="DictationMode"
      instructions={t('dictationMode.instructions')}
      level={level + 1}
      levelName={dictationLevels[level].name}
      wpmGoal={dictationLevels[level].wpmGoal}
      errorLimit={dictationLevels[level].errorLimit}
      sidebar={
        <MenuLevels
          source={GameSource.DICTATION_MODE}
          onLevelChange={setLevel}
          currentLevel={level}
          levels={dictationLevels}
        />
      }
    >
      {isActive && (
        <div className="flex justify-center gap-4 mt-4 mb-8">
          <button
            onClick={isSpeechPaused ? resume : pause}
            className={`p-4 rounded-full shadow-lg transition-all hover:scale-110 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
            title={isSpeechPaused ? t('dictationMode.resume') : t('dictationMode.pause')}
          >
            {isSpeechPaused ? <FaPlay /> : <FaPause />}
          </button>
          <button
            onClick={() => speak(text, speechRate)}
            className={`p-4 rounded-full shadow-lg transition-all hover:scale-110 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
            title={t('dictationMode.repeat')}
          >
            <FaRedo />
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm font-bold opacity-70">{t('dictationMode.speed')}:</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-24 accent-red-500"
            />
            <span className="text-sm font-mono w-8">{speechRate}x</span>
          </div>
        </div>
      )}
    </GameModeLayout>
  );
};

export default DictationMode;
