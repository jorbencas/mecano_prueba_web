import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { useActivityTracker } from '../hooks/useActivityTracker';
import Keyboard from './Keyboard';
import Hands from './Hands';
import TypingArea from './TypingArea';
import Stats from './Stats';
import { getStatsData } from '../utils/getStatsData';
import BaseModal from './BaseModal';
import { challengesAPI } from '../api/challenges';
import { FaTrophy, FaArrowLeft } from 'react-icons/fa';
// @ts-ignore
import challengeTexts from '../data/challengeTexts.json';

interface ChallengePlayProps {
  onBack: () => void;
}

const ChallengePlay: React.FC<ChallengePlayProps> = ({ onBack }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  
  const [challenge, setChallenge] = useState<any>(null);
  const [text, setText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextKey, setNextKey] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState<{ [key: number]: { expected: string; actual: string } }>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { startTracking, stopTracking } = useActivityTracker('ChallengePlay', 'level');

  useEffect(() => {
    const challengeStr = localStorage.getItem('active_challenge');
    if (challengeStr) {
      try {
        const parsed = JSON.parse(challengeStr);
        setChallenge(parsed);
        
        let challengeText = parsed.text;
        if (!challengeText) {
          const theme = (parsed.theme || 'default') as keyof typeof challengeTexts;
          const texts = challengeTexts[theme] || challengeTexts.default;
          challengeText = texts[Math.floor(Math.random() * texts.length)];
        }
        
        setText(challengeText);
        setNextKey(challengeText[0] || '');
      } catch (e) {
        console.error('Error parsing challenge', e);
      }
    }
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (isCompleted || !text) return;

    if (!startTime) {
      setStartTime(Date.now());
      startTracking();
    }

    setTotalKeystrokes(prev => prev + 1);
    const expectedKey = text[currentIndex];

    if (key === expectedKey) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      if (newIndex < text.length) {
        setNextKey(text[newIndex]);
      } else {
        finishChallenge();
      }
    } else {
      setErrors(prev => ({
        ...prev,
        [currentIndex]: { expected: expectedKey, actual: key }
      }));
    }

    // Update stats
    const errorCount = Object.keys(errors).length + (key !== expectedKey ? 1 : 0);
    const currentAccuracy = Math.round(((totalKeystrokes + 1 - errorCount) / (totalKeystrokes + 1)) * 100);
    setAccuracy(currentAccuracy);

    if (startTime) {
      const minutes = (Date.now() - startTime) / 60000;
      const currentWpm = Math.round((currentIndex + 1) / 5 / minutes);
      setWpm(currentWpm);
    }
  }, [currentIndex, text, isCompleted, startTime, totalKeystrokes, errors, startTracking]);

  const finishChallenge = async () => {
    setIsCompleted(true);
    const finalTime = Math.round((Date.now() - (startTime || Date.now())) / 1000);
    setElapsedTime(finalTime);
    setShowStats(true);

    stopTracking({
      challengeId: challenge?.id,
      wpm,
      accuracy,
      completed: true
    });

    // Update progress in API if applicable
    if (user && challenge?.id) {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // If it's a speed challenge, progress is WPM. If accuracy, it's accuracy.
          // For now, let's just mark as completed if they finish the text.
          await challengesAPI.completeChallenge(token, challenge.id);
        }
      } catch (e) {
        console.error('Error completing challenge in API', e);
      }
    }
  };

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-sm border border-gray-200/50`}
        >
          <FaArrowLeft />
          <span>{t('common.back')}</span>
        </button>
        
        <div className="text-center flex-grow">
          <h1 className={`text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-yellow-400 via-orange-400 to-red-400' : 'from-yellow-600 via-orange-600 to-red-600'}`}>
            {challenge.title}
          </h1>
          <p className={`text-sm opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {challenge.description}
          </p>
        </div>
        
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      <div className={`p-8 rounded-3xl shadow-2xl border backdrop-blur-md transition-all duration-500 ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/90 border-white/50'}`}>
        <div className="flex justify-center gap-12 mb-10">
          <div className="text-center">
            <div className="text-xs uppercase font-black tracking-widest opacity-50 mb-1">{t('typingArea.stats.wpm')}</div>
            <div className="text-4xl font-black text-blue-500">{wpm}</div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase font-black tracking-widest opacity-50 mb-1">{t('typingArea.stats.accuracy')}</div>
            <div className="text-4xl font-black text-green-500">{accuracy}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase font-black tracking-widest opacity-50 mb-1">{t('typingArea.stats.errors')}</div>
            <div className="text-4xl font-black text-red-500">{Object.keys(errors).length}</div>
          </div>
        </div>

        <TypingArea
          text={text}
          currentIndex={currentIndex}
          onKeyPress={handleKeyPress}
          wpm={wpm}
          accuracy={accuracy}
          errors={errors}
          source="Challenge"
        />

        <div className="mt-12">
          <Keyboard activeKey={nextKey} levelKeys={[]} />
        </div>
        
        <div className="mt-12">
          <Hands nextKey={nextKey} />
        </div>
      </div>

      {showStats && (
        <BaseModal isOpen={showStats} onClose={() => setShowStats(false)}>
          <div className="p-6 text-center">
            <div className="mb-6 inline-block p-4 rounded-full bg-yellow-500/20 text-yellow-500">
              <FaTrophy size={48} />
            </div>
            <h2 className="text-3xl font-black mb-2">{t('stats.title')}</h2>
            <p className="mb-8 opacity-70">{t('stats.congrats')}</p>
            
            <Stats
              stats={getStatsData({
                wpm,
                accuracy,
                level: challenge.title,
                errors: Object.keys(errors).length,
                elapsedTime,
                levelCompleted: true,
                levelData: {
                  wpmGoal: challenge.target_value || 40,
                  errorLimit: 999,
                },
                text,
              })}
              errorList={Object.values(errors)}
              onRepeatLevel={() => {
                setCurrentIndex(0);
                setStartTime(null);
                setWpm(0);
                setAccuracy(100);
                setErrors({});
                setTotalKeystrokes(0);
                setIsCompleted(false);
                setShowStats(false);
              }}
              onNextLevel={onBack}
              sourceComponent="Challenge"
            />
          </div>
        </BaseModal>
      )}
    </div>
  );
};

export default ChallengePlay;
