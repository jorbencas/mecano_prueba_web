// Settings.tsx
import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Configuración</h2>
      
      <div className="flex items-center mb-4">
        <button
          onClick={toggleTheme}
          className="flex items-center p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
        >
          {isDarkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
          <span className="ml-2">Cambiar a Modo {isDarkMode ? 'Claro' : 'Oscuro'}</span>
        </button>
      </div>

      <button
        onClick={onBack}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Volver al Menú
      </button>
    </div>
  );
};

export default Settings;
