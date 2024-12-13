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
  onBack: () => void;
  onLevelChange: (level: number) => void;
  onCreateNewText?: (text: string) => void;
  currentLevel: number;
  levels: Level[];
}

const MenuLevels: React.FC<MenuLevelsProps> = ({ 
  source, 
  onBack, 
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
     <div className={`w-1/4 pr-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg shadow-md p-6`}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h2 className="text-xl font-bold mb-2">Crear Nuevo Texto</h2>
            <input 
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Escribe un nuevo texto aquí..."
              className="border p-2 rounded mb-2 w-full"
            />
            <button onClick={handleAddNewText} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">Agregar Nuevo Texto</button>
            <button onClick={() => setShowCreateTextModal(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded ml-2">Cerrar</button>
          </div>
        </div>
      )}
      <button onClick={onBack}  className={`mt-6 w-full ${isDarkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'} text-white py-2 rounded-md transition-colors duration-300`}>
        Volver al Menú Principal
      </button>
    </div>
  );
};

export default MenuLevels;