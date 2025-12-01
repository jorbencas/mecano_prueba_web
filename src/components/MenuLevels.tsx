import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { progressAPI } from '../api/progress';
import { FaLock, FaStar, FaCheckCircle } from 'react-icons/fa';

interface Level {
  name: string;
  text?: string;
  wpmGoal?: number;
  errorLimit?: number;
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
  source: 'Levels' | 'PlayGame' | 'CreateText' | 'ZenMode' | 'NumbersMode' | 'SymbolsMode' | 'CodeMode' | 'DictationMode';
  onLevelChange: (level: number) => void;
  onCreateNewText?: (text: string, wpmGoal?: number, errorLimit?: number) => void;
  currentLevel: number;
  levels: Level[];
  user?: any;
}

const MenuLevels: React.FC<MenuLevelsProps> = ({
  source,
  onLevelChange,
  onCreateNewText,
  currentLevel,
  levels,
  user,
}) => {
  const [showCreateTextModal, setShowCreateTextModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [wpmGoal, setWpmGoal] = useState(60);
  const [errorLimit, setErrorLimit] = useState(5);
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
    if (!authUser) return; // Use authUser from context
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const modeMap: Record<string, string> = {
        'Levels': 'levels',
        'PlayGame': 'game',
        'ZenMode': 'zen',
        'NumbersMode': 'numbers',
        'SymbolsMode': 'symbols',
        'CodeMode': 'code',
        'DictationMode': 'dictation'
      };

      const mode = modeMap[source] || 'levels';
      const data = await progressAPI.getByMode(token, authUser.id, mode); // Use authUser.id
      setLevelProgress(data.progress || []);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewText = () => {
    if (newText.trim() && newText.length >= 10 && onCreateNewText) {
      onCreateNewText(newText.trim(), wpmGoal, errorLimit);
      setNewText('');
      setWpmGoal(60);
      setErrorLimit(5);
      setShowCreateTextModal(false);
    }
  };

  const isLevelUnlocked = (levelIndex: number): boolean => {
    // First level always unlocked
    if (levelIndex === 0) return true;
    
    // If no user, only first 10 levels unlocked
    if (!authUser) return levelIndex < 10; // Use authUser
    
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
        {source === 'CreateText' ? t('menuLevels.title.texts') : 
         source === 'ZenMode' ? t('menuLevels.title.zen', 'Temas Zen') :
         source === 'NumbersMode' ? t('menuLevels.title.numbers', 'Niveles Numéricos') :
         source === 'SymbolsMode' ? t('menuLevels.title.symbols', 'Niveles de Símbolos') :
         source === 'CodeMode' ? t('menuLevels.title.code', 'Lenguajes de Código') :
         source === 'DictationMode' ? t('menuLevels.title.dictation', 'Ejercicios de Dictado') :
         t('menuLevels.title.levels')}
      </h2>

      {loading && (
        <div className="text-center py-4 opacity-75">{t('menuLevels.loadingProgress', 'Cargando progreso...')}</div>
      )}

      <ul className="space-y-2 overflow-y-auto overflow-x-hidden max-h-[80vh]">
        {levels.map((level, index) => {
          const isUnlocked = isLevelUnlocked(index);
          const stars = getLevelStars(index);
          const completed = isLevelCompleted(index);
          const isPlayGameLocked = source === 'PlayGame' && index > currentLevel;
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

      {source === 'CreateText' && (
        <button
          onClick={() => setShowCreateTextModal(true)}
          className={`mt-4 px-4 py-2 ${isDarkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'} text-white rounded-md transition-colors duration-300`}
        >
          {t('menuLevels.buttons.createNewText')}
        </button>
      )}

      {showCreateTextModal && (
        <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-black'} bg-opacity-50 flex items-center justify-center z-50`}>
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {t('menuLevels.modal.title')}
            </h2>
            
            <div className="mb-4">
              <label className="block mb-2 font-semibold">
                {t('menuLevels.modal.textLabel')}
              </label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                rows={6}
                placeholder={t('menuLevels.modal.textPlaceholder')}
              />
              <p className="text-sm mt-1 opacity-75">
                {newText.length} {t('menuLevels.modal.charCount', 'caracteres')} ({t('menuLevels.modal.minChars', 'mínimo 10')})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-semibold">
                  {t('menuLevels.modal.wpmGoalLabel')}
                </label>
                <input
                  type="number"
                  value={wpmGoal}
                  onChange={(e) => setWpmGoal(Number(e.target.value))}
                  className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                  min={20}
                  max={150}
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  {t('menuLevels.modal.errorLimitLabel')}
                </label>
                <input
                  type="number"
                  value={errorLimit}
                  onChange={(e) => setErrorLimit(Number(e.target.value))}
                  className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                  min={0}
                  max={20}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddNewText}
                disabled={newText.length < 10}
                className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {t('menuLevels.modal.addButton')}
              </button>
              <button
                onClick={() => {
                  setShowCreateTextModal(false);
                  setNewText('');
                  setWpmGoal(60);
                  setErrorLimit(5);
                }}
                className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} rounded-md`}
              >
                {t('menuLevels.modal.cancelButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuLevels;