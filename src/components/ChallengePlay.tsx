import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@context/AuthContext';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { useTypingGame } from '@hooks/useTypingGame';
import GameModeLayout from './GameModeLayout';
import Hands from './Hands';
import { challengesAPI } from '@api/challenges';
import { FaArrowLeft } from 'react-icons/fa';
// @ts-ignore
import challengeTexts from '@data/challengeTexts.json';
import { GameSource } from '@/types/enums';

interface ChallengePlayProps {
  onBack: () => void;
}

const ChallengePlay: React.FC<ChallengePlayProps> = ({ onBack }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  
  const [challengeQueue, setChallengeQueue] = useState<any[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [challenge, setChallenge] = useState<any>(null);
  const [text, setText] = useState('');

  const loadChallenge = useCallback((c: any) => {
    setChallenge(c);
    let challengeText = c.text;
    if (!challengeText) {
      const theme = (c.theme || 'default') as keyof typeof challengeTexts;
      const texts = challengeTexts[theme] || challengeTexts.default;
      challengeText = texts[Math.floor(Math.random() * texts.length)];
    }
    setText(challengeText);
  }, []);

  useEffect(() => {
    const queueStr = localStorage.getItem('active_challenges_queue');
    const singleStr = localStorage.getItem('active_challenge');
    
    if (queueStr) {
      try {
        const queue = JSON.parse(queueStr);
        setChallengeQueue(queue);
        if (queue.length > 0) {
          loadChallenge(queue[0]);
        }
      } catch (e) {
        console.error('Error parsing challenge queue', e);
      }
    } else if (singleStr) {
      try {
        const parsed = JSON.parse(singleStr);
        setChallengeQueue([parsed]);
        loadChallenge(parsed);
      } catch (e) {
        console.error('Error parsing single challenge', e);
      }
    }
  }, [loadChallenge]);

  const onComplete = useCallback(async () => {
    if (user && challenge?.id) {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          await challengesAPI.completeChallenge(token, challenge.id);
        }
      } catch (e) {
        console.error('Error completing challenge in API', e);
      }
    }
  }, [user, challenge]);

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
    modeName: 'ChallengePlay',
    modeType: 'level', // Using 'level' as generic mode type
    text,
    onComplete,
  });

  const handleNext = () => {
    const nextIndex = currentChallengeIndex + 1;
    if (nextIndex < challengeQueue.length) {
      setCurrentChallengeIndex(nextIndex);
      loadChallenge(challengeQueue[nextIndex]);
      handleRepeat();
    } else {
      onBack();
    }
  };

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentWpm = elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = (currentIndex + errors) > 0 ? Math.round((currentIndex / (currentIndex + errors)) * 100) : 100;

  return (
    <GameModeLayout
      title={challenge.title}
      subtitle={challenge.description}
      gradientClasses="from-yellow-400 via-orange-400 to-red-400"
      accentColorClass="text-orange-500"
      bgAccentClass="bg-orange-50/50"
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
      source={GameSource.CHALLENGE}
      sourceComponent="Challenge"
      instructions={t('challenges.instructions', 'Completa el reto para ganar XP y subir de nivel.')}
      wpmGoal={challenge.target_value || 40}
    >
      <div className="mb-8">
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-sm border border-gray-200/50`}
        >
          <FaArrowLeft />
          <span>{t('common.back')}</span>
        </button>
      </div>
      
      {isActive && (
        <div className="mt-8">
          <Hands nextKey={text[currentIndex]} />
        </div>
      )}
    </GameModeLayout>
  );
};

export default ChallengePlay;
