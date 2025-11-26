import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface Level {
  name: string;
  text?: string;
  wpmGoal?: number;
  errorLimit?: number;
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
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  const handleAddNewText = () => {
    if (newText.trim() && newText.length >= 10 && onCreateNewText) {
      onCreateNewText(newText.trim(), wpmGoal, errorLimit);
      setNewText('');
      setWpmGoal(60);
      setErrorLimit(5);
      setShowCreateTextModal(false);
    }
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

      <ul className="space-y-2 overflow-y-auto overflow-x-hidden max-h-[80vh]">
        {levels.map((level, index) => {
          const isLocked = !user && index >= 10;
          return (
            <li
              key={index}
              className={`p-2 rounded cursor-pointer flex justify-between items-center
                ${index === currentLevel 
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                  : isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-white hover:bg-blue-100'}
                ${(source === 'PlayGame' && index > currentLevel) || isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (isLocked) return;
                if (source !== 'PlayGame' || index <= currentLevel) onLevelChange(index);
              }}
            >
              <span>{level.name}</span>
              {isLocked && <span className="text-lg">🔒</span>}
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
                {t('menuLevels.modal.textLabel', 'Texto a practicar')}
              </label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={t('menuLevels.modal.placeholder')}
                className={`border p-3 rounded mb-2 w-full h-40 resize-none overflow-y-auto ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
              />
              <div className={`text-sm ${newText.length < 10 ? 'text-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('menuLevels.modal.charCount', 'Caracteres')}: {newText.length} {newText.length < 10 && `(${t('menuLevels.modal.minChars', 'mínimo 10')})`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-semibold">
                  {t('menuLevels.modal.wpmGoal', 'Objetivo WPM')}
                </label>
                <input
                  type="number"
                  value={wpmGoal}
                  onChange={(e) => setWpmGoal(parseInt(e.target.value) || 60)}
                  min="10"
                  max="200"
                  className={`border p-2 rounded w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  {t('menuLevels.modal.errorLimit', 'Límite de errores')}
                </label>
                <input
                  type="number"
                  value={errorLimit}
                  onChange={(e) => setErrorLimit(parseInt(e.target.value) || 5)}
                  min="1"
                  max="50"
                  className={`border p-2 rounded w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddNewText}
                disabled={newText.length < 10}
                className={`px-4 py-2 rounded ${newText.length < 10 ? 'bg-gray-400 cursor-not-allowed' : isDarkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-500 hover:bg-green-400'} text-white`}
              >
                {t('menuLevels.modal.add')}
              </button>
              <button
                onClick={() => {
                  setShowCreateTextModal(false);
                  setNewText('');
                  setWpmGoal(60);
                  setErrorLimit(5);
                }}
                className={`px-4 py-2 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-400'} text-white rounded`}
              >
                {t('menuLevels.modal.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuLevels;