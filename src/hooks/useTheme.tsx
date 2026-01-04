import React from 'react';
import { useUIStore } from '@store/uiStore';

export const useTheme = () => {
  const { themeVariant, setThemeVariant, toggleTheme, isDarkMode } = useUIStore();
  return { themeVariant, setThemeVariant, toggleTheme, isDarkMode };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
