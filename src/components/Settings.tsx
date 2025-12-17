import React, { useState } from 'react';
import { FaSun, FaMoon, FaUniversalAccess, FaFont, FaEye, FaPalette, FaRunning } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useAccessibility, FontSize, ColorblindMode } from '../context/AccessibilityContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface SettingsProps {
  onNavigate?: (view: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { isDarkMode, themeVariant, setThemeVariant } = useTheme();
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

    </div>
  );
};

export default Settings;

