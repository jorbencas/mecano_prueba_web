import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  colorblindMode: ColorblindMode;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  setFontSize: (size: FontSize) => void;
  toggleHighContrast: () => void;
  setColorblindMode: (mode: ColorblindMode) => void;
  toggleReducedMotion: () => void;
  toggleScreenReaderOptimized: () => void;
  resetToDefaults: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  colorblindMode: 'none',
  reducedMotion: false,
  screenReaderOptimized: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      ...defaultSettings,
      reducedMotion: prefersReducedMotion,
    };
  });

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // Apply font size to document root
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    
    // Apply high contrast class
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply colorblind mode
    document.documentElement.setAttribute('data-colorblind-mode', settings.colorblindMode);
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Apply screen reader optimization
    if (settings.screenReaderOptimized) {
      document.documentElement.classList.add('screen-reader-optimized');
    } else {
      document.documentElement.classList.remove('screen-reader-optimized');
    }
  }, [settings]);

  const setFontSize = (fontSize: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const setColorblindMode = (colorblindMode: ColorblindMode) => {
    setSettings(prev => ({ ...prev, colorblindMode }));
  };

  const toggleReducedMotion = () => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const toggleScreenReaderOptimized = () => {
    setSettings(prev => ({ ...prev, screenReaderOptimized: !prev.screenReaderOptimized }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        setFontSize,
        toggleHighContrast,
        setColorblindMode,
        toggleReducedMotion,
        toggleScreenReaderOptimized,
        resetToDefaults,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
