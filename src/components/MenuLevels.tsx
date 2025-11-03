import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Level {
  keys: string[];
  name: string;
  text?: string;
  wpmGoal?: number;
  errorLimit?: number;
}

interface MenuLevelsProps {
  source: 'Levels' | 'PlayGame' | 'CreateText';
  onLevelChange: (level: number) => void;
  onCreateNewText?: (text: string) => void;
  currentLevel: number;
  levels: Level[];
}

const MenuLevels: React.FC<MenuLevelsProps> = ({ 
  source, 
  onLevelChange, 
  onCreateNewText, 
  currentLevel, 
  levels 
}) => {
  const [showCreateTextModal, setShowCreateTextModal] = useState(false);
  const [newText, setNewText] = useState('');
  const { isDarkMode } = useTheme();

  const handleAddNewText = () => {
    if (newText.trim() && onCreateNewText) {
      onCreateNewText(newText.trim());
      setNewText('');
      setShowCreateTextModal(false);
    }
  };

  return (
<div className={`w-1/4 pr-4 rounded-lg p-6 overflow-y-auto overflow-x-hidden max-h-[80vh]`}>
      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
        {source === 'CreateText' ? 'Textos' : 'Niveles'}
      </h2>
      <ul className="space-y-2">
        {levels.map((level, index) => (
          <li
            key={index}
             className={`p-2 rounded cursor-pointer 
             ${index === currentLevel 
                ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-blue-100'}
              ${source === 'PlayGame' && index > currentLevel ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (source !== 'PlayGame' || index <= currentLevel) {
                onLevelChange(index);
              }}}
          >
            {level.name}
          </li>
        ))}
      </ul>
      {source === 'CreateText' && (
        <button 
          onClick={() => setShowCreateTextModal(true)}
          className={`mt-4 px-4 py-2 ${isDarkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'}  text-white py-2 rounded-md transition-colors duration-300 `}
        >
          Crear Nuevo Texto
        </button>
      )}
      {showCreateTextModal && (
       <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-black'} bg-opacity-50 flex items-center justify-center`}>
  <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-4 rounded w-full max-w-lg`}>
    <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Crear Nuevo Texto</h2>
    <textarea 
      value={newText}
      onChange={(e) => setNewText(e.target.value)}
      placeholder="Escribe un nuevo texto aquí..."
      className={`border p-2 rounded mb-2 w-full h-40 resize-none overflow-y-auto ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
    />
    <button onClick={handleAddNewText} className={`mt-4 px-4 py-2 ${isDarkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-500 hover:bg-green-400'} text-white rounded`}>Agregar Nuevo Texto</button>
    <button onClick={() => setShowCreateTextModal(false)} className={`mt-4 px-4 py-2 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-400'} text-white rounded ml-2`}>Cerrar</button>
  </div>
</div>

      )}
    </div>
  );
};

export default MenuLevels;