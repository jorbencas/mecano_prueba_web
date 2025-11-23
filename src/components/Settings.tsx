import React from 'react';
import { FaSun, FaMoon, FaSignOutAlt, FaSignInAlt, FaUser } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface SettingsProps {
  onShowLogin?: () => void;
  onNavigate?: (view: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onShowLogin, onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useDynamicTranslations();

  const handleLogout = async () => {
    if (window.confirm(t('settings.confirmLogout', '¿Seguro que quieres cerrar sesión?'))) {
      await logout();
    }
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-2xl font-bold mb-6">{t('settings.title', 'Configuración')}</h2>

      {/* User Info or Login Prompt */}
      {user ? (
        <div className="mb-6 p-4 bg-blue-500 bg-opacity-20 rounded-lg">
          <h3 className="font-bold mb-2">{t('settings.userInfo', 'Usuario')}</h3>
          <p className="text-sm">{user.displayName || user.email}</p>
          <p className="text-xs opacity-75">{user.email}</p>
          
          {/* View Profile Button */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('profile')}
              className="mt-3 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <FaUser />
              {t('settings.viewProfile', 'Ver Perfil y Actividad')}
            </button>
          )}
        </div>
      ) : (
        <div className={`mb-6 p-4 rounded-lg border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
          <h3 className="font-bold mb-2">{t('settings.notLoggedIn', 'No has iniciado sesión')}</h3>
          <p className="text-sm mb-4 opacity-75">
            {t('settings.loginPrompt', 'Inicia sesión para guardar tu progreso y acceder a todas las funciones.')}
          </p>
          <button
            onClick={onShowLogin}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"
          >
            <FaSignInAlt />
            {t('settings.loginButton', 'Iniciar Sesión / Registrarse')}
          </button>
        </div>
      )}

      {/* Theme */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">{t('settings.theme', 'Tema')}</h3>
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isDarkMode ? <><FaSun /> {t('settings.lightMode', 'Modo Claro')}</> : <><FaMoon /> {t('settings.darkMode', 'Modo Oscuro')}</>}
        </button>
      </div>

      {/* Language */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">{t('settings.language', 'Idioma')}</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'es' | 'en' | 'ca' | 'va')}
          className={`p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="ca">Català</option>
          <option value="va">Valencià</option>
        </select>
      </div>

      {/* Logout - Only show if logged in */}
      {user && (
        <div className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"
          >
            <FaSignOutAlt />
            {t('settings.logout', 'Cerrar Sesión')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;
