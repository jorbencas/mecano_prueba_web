// ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

export type ThemeVariant = 'light' | 'dark' | 'high-contrast-light' | 'high-contrast-dark';

type ThemeContextType = {
  isDarkMode: boolean;
  themeVariant: ThemeVariant;
  toggleTheme: () => void;
  setThemeVariant: (variant: ThemeVariant) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeVariant, setThemeVariantState] = useState<ThemeVariant>(() => {
    const savedTheme = localStorage.getItem('color-theme');
    if (savedTheme && ['light', 'dark', 'high-contrast-light', 'high-contrast-dark'].includes(savedTheme)) {
      return savedTheme as ThemeVariant;
    }
    console.log('ThemeContext: window.matchMedia is', window.matchMedia);
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const isDarkMode = themeVariant === 'dark' || themeVariant === 'high-contrast-dark';

  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'light', 'high-contrast-light', 'high-contrast-dark');
    
    // Add current theme class
    document.documentElement.classList.add(themeVariant);
    
    // Add dark class for backward compatibility
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    localStorage.setItem('color-theme', themeVariant);
  }, [themeVariant, isDarkMode]);

  const toggleTheme = () => {
    setThemeVariantState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      if (prev === 'high-contrast-light') return 'high-contrast-dark';
      return 'high-contrast-light';
    });
  };

  const setThemeVariant = (variant: ThemeVariant) => {
    setThemeVariantState(variant);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, themeVariant, toggleTheme, setThemeVariant }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
