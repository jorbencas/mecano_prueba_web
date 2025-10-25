import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import StatsHistory from './StatsHistory';

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español (Castellano)' },
    { code: 'ca', label: 'Català' },
    { code: 'va', label: 'Valencià' }
  ];

  return (
    <div className={`p-6 rounded-xl max-w-md mx-auto ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Configuración</h2>
      
      {/* Cambio de tema */}
      <div className="flex items-center mb-4">
        <button
          onClick={toggleTheme}
          className={`flex items-center p-2 rounded-md ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition duration-300`}
        >
          {isDarkMode ? <FaSun className="text-xl mr-2" /> : <FaMoon className="text-xl mr-2" />}
          <span>Cambiar a Modo {isDarkMode ? 'Claro' : 'Oscuro'}</span>
        </button>
      </div>

      {/* Cambio de idioma */}
      <div className="mb-4">
        <label htmlFor="language" className="block font-semibold mb-2">
          Seleccionar idioma:
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'es' | 'ca' | 'va')}
          className={`w-full p-2 rounded-md border ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <StatsHistory />
      </div>
    </div>
  );
};

export default Settings;
