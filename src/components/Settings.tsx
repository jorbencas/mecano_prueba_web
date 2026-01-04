import React from 'react';
import { useUIStore, FontSize, ColorblindMode } from '@store/uiStore';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { 
  FaSun, 
  FaMoon, 
  FaUniversalAccess, 
  FaFont, 
  FaEye, 
  FaPalette, 
  FaRunning,
  FaUndo
} from 'react-icons/fa';

interface SettingsProps {
  
}

const Settings: React.FC<SettingsProps> = () => {
  const { 
    isDarkMode, 
    themeVariant, 
    setThemeVariant,
    language,
    setLanguage,
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
    resetAccessibilityToDefaults
  } = useUIStore();
  
  const { t } = useDynamicTranslations();

  const fontSizeLabels: Record<FontSize, string> = {
    small: t('settings.fontSizeSmall'),
    medium: t('settings.fontSizeMedium'),
    large: t('settings.fontSizeLarge'),
    'extra-large': t('settings.fontSizeXL'),
  };

  const colorblindLabels: Record<ColorblindMode, string> = {
    none: t('settings.colorblindNone'),
    deuteranopia: t('settings.colorblindDeut'),
    protanopia: t('settings.colorblindProt'),
    tritanopia: t('settings.colorblindTrit'),
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-2xl font-bold mb-6">{t('settings.title')}</h2>


      {/* Theme */}
      <div className="mb-6">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider opacity-70">
          {isDarkMode ? <FaMoon className="text-blue-400" /> : <FaSun className="text-yellow-500" />}
          {t('settings.theme')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setThemeVariant('light')}
            className={`px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
              themeVariant === 'light' || themeVariant === 'high-contrast-light'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' 
                : isDarkMode ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
            }`}
            aria-pressed={themeVariant === 'light' || themeVariant === 'high-contrast-light'}
          >
            <FaSun /> {t('settings.lightMode')}
          </button>
          <button
            onClick={() => setThemeVariant('dark')}
            className={`px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
              themeVariant === 'dark' || themeVariant === 'high-contrast-dark'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' 
                : isDarkMode ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
            }`}
            aria-pressed={themeVariant === 'dark' || themeVariant === 'high-contrast-dark'}
          >
            <FaMoon /> {t('settings.darkMode')}
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="mb-8">
        <h3 className="font-bold mb-4 text-sm uppercase tracking-wider opacity-70">{t('settings.language')}</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'es' | 'en' | 'ca' | 'va')}
          className={`w-full p-3 rounded-xl border font-medium ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-black'
          }`}
          aria-label={t('settings.language')}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="ca">Català</option>
          <option value="va">Valencià</option>
        </select>
      </div>

      {/* Accessibility Section */}
      <div className={`mb-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
        <h3 className="font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider opacity-70">
          <FaUniversalAccess className="text-purple-500" />
          {t('settings.accessibility')}
        </h3>

        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <label className="flex items-center gap-2 font-bold mb-3 text-xs uppercase tracking-widest opacity-60">
              <FaFont />
              {t('settings.fontSize')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['small', 'medium', 'large', 'extra-large'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    fontSize === size
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode
                      ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                      : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
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
            <label className="flex items-center gap-2 font-bold mb-3 text-xs uppercase tracking-widest opacity-60">
              <FaEye />
              {t('settings.highContrast')}
            </label>
            <button
              onClick={toggleHighContrast}
              className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                highContrast 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : isDarkMode ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
              }`}
              aria-pressed={highContrast}
            >
              {highContrast ? t('settings.highContrastOn') : t('settings.highContrastOff')}
            </button>
          </div>

          {/* Colorblind Mode */}
          <div>
            <label className="flex items-center gap-2 font-bold mb-3 text-xs uppercase tracking-widest opacity-60">
              <FaPalette />
              {t('settings.colorblindMode')}
            </label>
            <select
              value={colorblindMode}
              onChange={(e) => setColorblindMode(e.target.value as ColorblindMode)}
              className={`w-full p-3 rounded-xl border font-medium ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-black'
              }`}
              aria-label={t('settings.colorblindMode')}
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
            <label className="flex items-center gap-2 font-bold mb-3 text-xs uppercase tracking-widest opacity-60">
              <FaRunning />
              {t('settings.reducedMotion')}
            </label>
            <button
              onClick={toggleReducedMotion}
              className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                reducedMotion 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : isDarkMode ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
              }`}
              aria-pressed={reducedMotion}
            >
              {reducedMotion ? t('settings.reducedMotionOn') : t('settings.reducedMotionOff')}
            </button>
          </div>

          {/* Screen Reader Optimization */}
          <div>
            <label className="flex items-center gap-2 font-bold mb-3 text-xs uppercase tracking-widest opacity-60">
              <FaUniversalAccess />
              {t('settings.screenReader')}
            </label>
            <button
              onClick={toggleScreenReaderOptimized}
              className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                screenReaderOptimized 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : isDarkMode ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
              }`}
              aria-pressed={screenReaderOptimized}
            >
              {screenReaderOptimized ? t('settings.screenReaderOn') : t('settings.screenReaderOff')}
            </button>
          </div>
        </div>
      </div>

      {/* Reset to Defaults */}
      <div className="mt-8">
        <button
          onClick={resetAccessibilityToDefaults}
          className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all border ${
            isDarkMode 
              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
              : 'border-red-200 text-red-600 hover:bg-red-50'
          }`}
        >
          <FaUndo size={12} />
          {t('settings.resetDefaults')}
        </button>
      </div>

    </div>
  );
};

export default Settings;

