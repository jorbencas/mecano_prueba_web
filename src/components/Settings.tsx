import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC<{}> = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={`p-6 rounded-xl shadow-lg max-w-md mx-auto ${isDarkMode ? ' text-white' : ' text-black'}`}>
      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Configuración</h2>
      
      <div className="flex items-center mb-4">
        <button
          onClick={toggleTheme}
          className={`flex items-center p-2 rounded-md ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition duration-300`}
        >
          {isDarkMode ? <FaSun className="text-xl mr-2" /> : <FaMoon className="text-xl mr-2" />}
          <span>Cambiar a Modo {isDarkMode ? 'Claro' : 'Oscuro'}</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
