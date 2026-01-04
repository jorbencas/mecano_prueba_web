import React from 'react';
import { useUIStore } from '@store/uiStore';

export const useLanguage = () => {
  const { language, setLanguage } = useUIStore();
  return { language, setLanguage };
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
