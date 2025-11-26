import React, { useState } from 'react';
import { FaSun, FaMoon, FaSignOutAlt, FaSignInAlt, FaUser, FaUniversalAccess, FaFont, FaEye, FaPalette, FaRunning } from 'react-icons/fa';
import { useTheme, ThemeVariant } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useAccessibility, FontSize, ColorblindMode } from '../context/AccessibilityContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface SettingsProps {
  onShowLogin?: () => void;
  onNavigate?: (view: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onShowLogin, onNavigate }) => {
  const { isDarkMode, themeVariant, setThemeVariant } = useTheme();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useDynamicTranslations();
  const {
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    colorblindMode,
    setColorblindMode,
    reducedMotion,
    toggleReducedMotion,
    screenReaderOptimized,
    toggleScreenReaderOptimized,
  } = useAccessibility();

  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  const handleLogout = async () => {
    if (window.confirm(t('settings.confirmLogout', '¿Seguro que quieres cerrar sesión?'))) {
      await logout();
    }
  };

  const fontSizeLabels: Record<FontSize, string> = {
    small: t('settings.fontSizeSmall', 'Pequeño'),
    medium: t('settings.fontSizeMedium', 'Mediano'),
    large: t('settings.fontSizeLarge', 'Grande'),
    'extra-large': t('settings.fontSizeXL', 'Extra Grande'),
  };

  const colorblindLabels: Record<ColorblindMode, string> = {
    none: t('settings.colorblindNone', 'Ninguno'),
    deuteranopia: t('settings.colorblindDeut', 'Deuteranopia (Rojo-Verde)'),
    protanopia: t('settings.colorblindProt', 'Protanopia (Rojo-Verde)'),
    tritanopia: t('settings.colorblindTrit', 'Tritanopia (Azul-Amarillo)'),
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
              aria-label={t('settings.viewProfile', 'Ver Perfil y Actividad')}
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
            aria-label={t('settings.loginButton', 'Iniciar Sesión / Registrarse')}
          >
            <FaSignInAlt />
            {t('settings.loginButton', 'Iniciar Sesión / Registrarse')}
          </button>
        </div>
      )}

      {/* Theme */}
      <div className="mb-6">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          {isDarkMode ? <FaMoon /> : <FaSun />}
          {t('settings.theme', 'Tema')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setThemeVariant('light')}
            className={`px-4 py-2 rounded flex items-center justify-center gap-2 ${
              themeVariant === 'light' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-pressed={themeVariant === 'light'}
          >
            <FaSun /> {t('settings.lightMode', 'Claro')}
          </button>
          <button
            onClick={() => setThemeVariant('dark')}
            className={`px-4 py-2 rounded flex items-center justify-center gap-2 ${
              themeVariant === 'dark' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-pressed={themeVariant === 'dark'}
          >
            <FaMoon /> {t('settings.darkMode', 'Oscuro')}
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">{t('settings.language', 'Idioma')}</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'es' | 'en' | 'ca' | 'va')}
          className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
          aria-label={t('settings.language', 'Idioma')}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="ca">Català</option>
          <option value="va">Valencià</option>
        </select>
      </div>

      {/* Accessibility Section */}
      <div className={`mb-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} pt-6`}>
        <button
          onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
          className="w-full flex items-center justify-between font-bold mb-4"
          aria-expanded={showAccessibilityPanel}
        >
          <span className="flex items-center gap-2">
            <FaUniversalAccess />
            {t('settings.accessibility', 'Accesibilidad')}
          </span>
          <span>{showAccessibilityPanel ? '▼' : '▶'}</span>
        </button>

        {showAccessibilityPanel && (
          <div className="space-y-4 pl-4">
            {/* Font Size */}
            <div>
              <label className="flex items-center gap-2 font-semibold mb-2">
                <FaFont />
                {t('settings.fontSize', 'Tamaño de Fuente')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['small', 'medium', 'large', 'extra-large'] as FontSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-3 py-2 rounded text-sm ${
                      fontSize === size
                        ? 'bg-blue-600 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    aria-pressed={fontSize === size}
                  >
                    {fontSizeLabels[size]}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div>
              <label className="flex items-center gap-2 font-semibold mb-2">
                <FaEye />
                {t('settings.highContrast', 'Alto Contraste')}
              </label>
              <button
                onClick={toggleHighContrast}
                className={`w-full px-4 py-2 rounded flex items-center justify-center gap-2 ${
                  highContrast ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                aria-pressed={highContrast}
              >
                {highContrast ? t('settings.highContrastOn', 'Activado') : t('settings.highContrastOff', 'Desactivado')}
              </button>
            </div>

            {/* Colorblind Mode */}
            <div>
              <label className="flex items-center gap-2 font-semibold mb-2">
                <FaPalette />
                {t('settings.colorblindMode', 'Modo Daltónico')}
              </label>
              <select
                value={colorblindMode}
                onChange={(e) => setColorblindMode(e.target.value as ColorblindMode)}
                className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
                aria-label={t('settings.colorblindMode', 'Modo Daltónico')}
              >
                {(['none', 'deuteranopia', 'protanopia', 'tritanopia'] as ColorblindMode[]).map((mode) => (
                  <option key={mode} value={mode}>
                    {colorblindLabels[mode]}
                  </option>
                ))}
              </select>
            </div>

            {/* Reduced Motion */}
            <div>
              <label className="flex items-center gap-2 font-semibold mb-2">
                <FaRunning />
                {t('settings.reducedMotion', 'Reducir Movimiento')}
              </label>
              <button
                onClick={toggleReducedMotion}
                className={`w-full px-4 py-2 rounded flex items-center justify-center gap-2 ${
                  reducedMotion ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                aria-pressed={reducedMotion}
              >
                {reducedMotion ? t('settings.reducedMotionOn', 'Activado') : t('settings.reducedMotionOff', 'Desactivado')}
              </button>
            </div>

            {/* Screen Reader Optimization */}
            <div>
              <label className="flex items-center gap-2 font-semibold mb-2">
                {t('settings.screenReader', 'Optimización para Lectores de Pantalla')}
              </label>
              <button
                onClick={toggleScreenReaderOptimized}
                className={`w-full px-4 py-2 rounded flex items-center justify-center gap-2 ${
                  screenReaderOptimized ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                aria-pressed={screenReaderOptimized}
              >
                {screenReaderOptimized ? t('settings.screenReaderOn', 'Activado') : t('settings.screenReaderOff', 'Desactivado')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout - Only show if logged in */}
      {user && (
        <div className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"
            aria-label={t('settings.logout', 'Cerrar Sesión')}
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

