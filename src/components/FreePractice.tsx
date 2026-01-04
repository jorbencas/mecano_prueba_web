import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@context/AuthContext';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { GameSource } from '@/types/enums';
import { useTypingGame } from '@hooks/useTypingGame';
import GameModeLayout from './GameModeLayout';
import Hands from './Hands';
import { FaCheck, FaKeyboard } from 'react-icons/fa';
import ParticleExplosion from './ParticleExplosion';

const FreePractice: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  
  const MAX_CHARS_FREE = 100;
  const MAX_CHARS_PREMIUM = 500;
  
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['a', 's', 'd', 'f', 'j', 'k', 'l']);
  const [text, setText] = useState('');
  const [configSaved, setConfigSaved] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  const generateText = useCallback(() => {
    const maxChars = user ? MAX_CHARS_PREMIUM : MAX_CHARS_FREE;
    const length = Math.min(100, maxChars);
    let newText = '';
    for (let i = 0; i < length; i++) {
      newText += selectedKeys[Math.floor(Math.random() * selectedKeys.length)];
    }
    return newText;
  }, [selectedKeys, user]);

  useEffect(() => {
    setText(generateText());
  }, [generateText]);

  const onKeyPressCallback = useCallback(() => {
    // Trigger particle explosion
    const colors = ['#4ade80', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setParticles(prev => [...prev, {
      id: Date.now(),
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
      color: randomColor,
    }]);
  }, []);

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
    modeName: 'FreePractice',
    modeType: 'freePractice',
    text,
    onComplete: () => {},
  });

  const onKeyPress = (key: string) => {
    handleKeyPress(key);
    onKeyPressCallback();
    
    // Generate more text if reaching the end
    if (currentIndex >= text.length - 1 && key === text[currentIndex]) {
      setText(prev => prev + generateText());
    }
  };

  const toggleKey = (key: string) => {
    if (isActive) return;
    
    setSelectedKeys(prev => {
      const newKeys = prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key].sort();
      
      if (user) {
        localStorage.setItem(`freePractice_keys_${user.email}`, JSON.stringify(newKeys));
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2000);
      }
      return newKeys;
    });
  };

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`freePractice_keys_${user.email}`);
      if (saved) {
        try {
          setSelectedKeys(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading saved keys:', e);
        }
      }
    }
  }, [user]);

  const allKeys = 'abcdefghijklmnñopqrstuvwxyz'.split('');
  const currentWpm = elapsedTime > 0 ? Math.round((currentIndex / 5) / (elapsedTime / 60)) : 0;
  const currentAccuracy = (currentIndex + errors) > 0 ? Math.round((currentIndex / (currentIndex + errors)) * 100) : 100;

  return (
    <GameModeLayout
      title={t('freePractice.title')}
      icon={<FaKeyboard className="text-green-500" />}
      gradientClasses="from-green-400 via-emerald-400 to-teal-400"
      accentColorClass="text-green-500"
      bgAccentClass="bg-green-50/50"
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
      onKeyPress={onKeyPress}
      onRepeat={handleRepeat}
      onCloseStats={() => setShowStats(false)}
      source={GameSource.FREE_PRACTICE}
      sourceComponent="FreePractice"
      instructions={t('freePractice.instructions')}
      levelKeys={selectedKeys}
      sidebar={
        <div className={`p-6 rounded-2xl shadow-xl border backdrop-blur-sm transition-all duration-300 ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('freePractice.selectKeys')}</h2>
            {user && configSaved && (
              <div className="flex items-center gap-1 text-green-500 text-sm">
                <FaCheck />
                <span>{t('freePractice.saved')}</span>
              </div>
            )}
          </div>
          
          {isActive && (
            <div className={`mb-3 p-2 rounded text-sm ${isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
              ⚠️ {t('freePractice.keysLocked')}
            </div>
          )}
          
          <div className="grid grid-cols-5 gap-2">
            {allKeys.map(key => (
              <button
                key={key}
                onClick={() => toggleKey(key)}
                disabled={isActive}
                className={`p-2 rounded font-mono text-lg transition-colors ${
                  selectedKeys.includes(key)
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {key}
              </button>
            ))}
          </div>
          {!user && (
            <p className="mt-4 text-xs text-yellow-500 italic">
              {t('freePractice.limitInfo')}
            </p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            {t('freePractice.keysSelected')}: {selectedKeys.length}
          </p>
        </div>
      }
    >
      {isActive && (
        <div className="mt-8">
          <Hands nextKey={text[currentIndex]} />
        </div>
      )}
      
      {particles.map(particle => (
        <ParticleExplosion
          key={particle.id}
          x={particle.x}
          y={particle.y}
          color={particle.color}
          onComplete={() => setParticles(prev => prev.filter(p => p.id !== particle.id))}
        />
      ))}
    </GameModeLayout>
  );
};

export default FreePractice;
