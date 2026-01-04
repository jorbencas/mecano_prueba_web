import React, { useState, useEffect } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { progressAPI } from '@/api/progress';
import { FaLock, FaStar, FaCheckCircle } from 'react-icons/fa';
import { GameSource } from '@/types/enums';

interface Level {
  name: string;
  text?: string;
  wpmGoal?: number;
  errorLimit?: number;
  requiresLogin?: boolean;
}

interface LevelProgress {
  level_number: number;
  completed: boolean;
  stars: number;
  best_wpm: number;
  best_accuracy: number;
  unlocked: boolean;
}

interface MenuLevelsProps {
  source: GameSource;
  onLevelChange: (level: number) => void;
  currentLevel: number;
  levels: Level[];
}

const MenuLevels: React.FC<MenuLevelsProps> = ({
  source,
  onLevelChange,
  currentLevel,
  levels,
}) => {
  const [levelProgress, setLevelProgress] = useState<LevelProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const { user: authUser } = useAuth(); // Use authUser from context

  useEffect(() => {
    if (authUser) { // Use authUser from context for loading progress
      loadProgress();
    } else {
      // Clear progress if user logs out
      setLevelProgress([]);
    }
  }, [authUser, source]); // Depend on authUser

  const loadProgress = async () => {
    if (!authUser) return;
    
    let isMounted = true;
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      const modeMap: Record<string, string> = {
        [GameSource.LEVELS]: 'levels',
        [GameSource.PLAY_GAME]: 'game',
        [GameSource.ZEN_MODE]: 'zen',
        [GameSource.NUMBERS_MODE]: 'numbers',
        [GameSource.SYMBOLS_MODE]: 'symbols',
        [GameSource.CODE_MODE]: 'code',
        [GameSource.DICTATION_MODE]: 'dictation',
        [GameSource.CREATE_TEXT]: 'levels' // Default to levels for CreateText for now
      };

      const mode = modeMap[source] || 'levels';
      const data = await progressAPI.getByMode(token, authUser.id, mode);
      
      if (isMounted) {
        setLevelProgress(data.progress || []);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  };


  const isLevelUnlocked = (levelIndex: number): boolean => {
    // First level always unlocked
    if (levelIndex === 0) return true;

    // Check login requirement
    if (levels[levelIndex].requiresLogin && !authUser) {
      return false;
    }
    
    // Check progress data
    const progress = levelProgress.find(p => p.level_number === levelIndex);
    if (progress) return progress.unlocked;
    
    // Check if previous level is completed
    const previousProgress = levelProgress.find(p => p.level_number === levelIndex - 1);
    return previousProgress?.completed || false;
  };

  const getLevelStars = (levelIndex: number): number => {
    const progress = levelProgress.find(p => p.level_number === levelIndex);
    return progress?.stars || 0;
  };

  const isLevelCompleted = (levelIndex: number): boolean => {
    const progress = levelProgress.find(p => p.level_number === levelIndex);
    return progress?.completed || false;
  };

  const getUnlockRequirement = (levelIndex: number): string => {
    if (levelIndex === 0) return '';
    if (!authUser) return 'Inicia sesión para desbloquear';
    
    const previousLevel = levels[levelIndex - 1];
    return `Completa "${previousLevel?.name}" para desbloquear`;
  };

  return (
    <div className="w-1/4 pr-4 rounded-lg p-6 ">
      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
        {source === GameSource.CREATE_TEXT ? t('menuLevels.title.texts') : 
         source === GameSource.ZEN_MODE ? t('menuLevels.title.zen', 'Temas Zen') :
         source === GameSource.NUMBERS_MODE ? t('menuLevels.title.numbers', 'Niveles Numéricos') :
         source === GameSource.SYMBOLS_MODE ? t('menuLevels.title.symbols', 'Niveles de Símbolos') :
         source === GameSource.CODE_MODE ? t('menuLevels.title.code', 'Lenguajes de Código') :
         source === GameSource.DICTATION_MODE ? t('menuLevels.title.dictation', 'Ejercicios de Dictado') :
         t('menuLevels.title.levels')}
      </h2>

      {loading && (
        <div className="text-center py-4 opacity-75">{t('menuLevels.loadingProgress')}</div>
      )}

      <ul className="space-y-2 overflow-y-auto overflow-x-hidden max-h-[80vh]">
        {levels.map((level, index) => {
          const isUnlocked = isLevelUnlocked(index);
          const stars = getLevelStars(index);
          const completed = isLevelCompleted(index);
          const isPlayGameLocked = source === GameSource.PLAY_GAME && index > currentLevel;
          const isLocked = !isUnlocked || isPlayGameLocked;

          return (
            <li
              key={index}
              className={`p-3 rounded cursor-pointer transition-all relative
                ${index === currentLevel 
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                  : isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-white hover:bg-blue-100'}
                ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (!isLocked) onLevelChange(index);
              }}
              title={isLocked ? getUnlockRequirement(index) : ''}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1">
                  {completed && <FaCheckCircle className="text-green-500" />}
                  {isLocked && <FaLock className="text-gray-400" />}
                  <span className={isLocked ? 'opacity-50' : ''}>{level.name}</span>
                </div>
                
                {/* Stars */}
                {authUser && !isLocked && stars > 0 && ( // Use authUser
                  <div className="flex gap-1">
                    {[1, 2, 3].map((star) => (
                      <FaStar
                        key={star}
                        className={star <= stars ? 'text-yellow-400' : 'text-gray-400'}
                        size={12}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Unlock requirement tooltip */}
              {isLocked && (
                <div className="text-xs mt-1 opacity-75 italic">
                  {getUnlockRequirement(index)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MenuLevels;