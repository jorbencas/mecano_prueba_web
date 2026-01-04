import React, { useState, useEffect, useCallback } from 'react';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { GameSource } from '@/types/enums';
import { FaBolt } from 'react-icons/fa';
import { useTypingGame } from '@hooks/useTypingGame';
import GameModeLayout from './GameModeLayout';
import Hands from './Hands';

const SpeedMode: React.FC = () => {
  const { t } = useDynamicTranslations();
  const [duration, setDuration] = useState(30);
  const [text, setText] = useState('');

  const generateText = useCallback(() => {
    const words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'pack', 'my', 'box', 'with', 'five', 'dozen', 'liquor', 'jugs'];
    let newText = '';
    for (let i = 0; i < 50; i++) {
      newText += words[Math.floor(Math.random() * words.length)] + ' ';
    }
    return newText.trim();
  }, []);

  useEffect(() => {
    setText(generateText());
  }, [generateText]);

  useEffect(() => {
    const challengeStr = localStorage.getItem('active_challenge');
    if (challengeStr) {
      try {
        const challenge = JSON.parse(challengeStr);
        if (challenge.mode === 'speed-mode' || challenge.challenge_type === 'speed') {
          setDuration(60); 
        }
      } catch (e) {
        console.error('Error parsing active challenge', e);
      }
      localStorage.removeItem('active_challenge');
    }
  }, []);

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
    modeName: 'SpeedMode',
    modeType: 'speedMode',
    text,
    timeLimit: duration,
  });

  // Custom keypress handler to listen to window events
  const onKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;
    handleKeyPress(event.key);
    
    // Generate more text if reaching the end
    if (currentIndex > text.length - 20) {
      setText(prev => prev + ' ' + generateText());
    }
  }, [isActive, handleKeyPress, currentIndex, text.length, generateText]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, [onKeyPress]);

  const currentWpm = elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = (currentIndex + errors) > 0 ? Math.round((currentIndex / (currentIndex + errors)) * 100) : 100;

  return (
    <GameModeLayout
      title={t('speedMode.title', 'Modo Velocidad')}
      subtitle={t('speedMode.subtitle', 'Pon a prueba tu velocidad máxima')}
      icon={<FaBolt className="text-yellow-400" />}
      gradientClasses="from-yellow-400 via-orange-400 to-red-400"
      accentColorClass="text-yellow-400"
      bgAccentClass="bg-yellow-50/50"
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
      source={GameSource.ZEN_MODE}
      sourceComponent="SpeedMode"
      instructions={t('speedMode.instructions', 'Escribe lo más rápido que puedas antes de que se agote el tiempo.')}
    >
      {!isActive && !showStats && (
        <div className="flex justify-center gap-4 mb-8">
          {[30, 60, 120].map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${duration === d ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {d}s
            </button>
          ))}
        </div>
      )}
      {isActive && (
        <div className="mt-8">
          <Hands nextKey={text[currentIndex]} />
        </div>
      )}
    </GameModeLayout>
  );
};

export default SpeedMode;
