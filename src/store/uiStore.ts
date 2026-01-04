import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeVariant = 'light' | 'dark' | 'high-contrast-light' | 'high-contrast-dark';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
export type Language = 'en' | 'es' | 'ca' | 'va';

interface UIState {
  // Theme
  themeVariant: ThemeVariant;
  isDarkMode: boolean;
  setThemeVariant: (variant: ThemeVariant) => void;
  toggleTheme: () => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Accessibility
  fontSize: FontSize;
  highContrast: boolean;
  colorblindMode: ColorblindMode;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  
  setFontSize: (size: FontSize) => void;
  toggleHighContrast: () => void;
  setColorblindMode: (mode: ColorblindMode) => void;
  toggleReducedMotion: () => void;
  toggleScreenReaderOptimized: () => void;
  resetAccessibilityToDefaults: () => void;
}

const defaultAccessibility = {
  fontSize: 'medium' as FontSize,
  highContrast: false,
  colorblindMode: 'none' as ColorblindMode,
  reducedMotion: false,
  screenReaderOptimized: false,
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      themeVariant: 'light',
      isDarkMode: false,
      setThemeVariant: (variant) => {
        const isDark = variant === 'dark' || variant === 'high-contrast-dark';
        set({ themeVariant: variant, isDarkMode: isDark });
        applyTheme(variant, isDark);
      },
      toggleTheme: () => {
        const { themeVariant } = get();
        let next: ThemeVariant;
        if (themeVariant === 'light') next = 'dark';
        else if (themeVariant === 'dark') next = 'light';
        else if (themeVariant === 'high-contrast-light') next = 'high-contrast-dark';
        else next = 'high-contrast-light';
        
        const isDark = next === 'dark' || next === 'high-contrast-dark';
        set({ themeVariant: next, isDarkMode: isDark });
        applyTheme(next, isDark);
      },

      // Language
      language: 'es',
      setLanguage: (lang) => set({ language: lang }),

      // Accessibility
      ...defaultAccessibility,
      
      setFontSize: (fontSize) => {
        set({ fontSize });
        document.documentElement.setAttribute('data-font-size', fontSize);
      },
      toggleHighContrast: () => {
        const highContrast = !get().highContrast;
        set({ highContrast });
        if (highContrast) document.documentElement.classList.add('high-contrast');
        else document.documentElement.classList.remove('high-contrast');
      },
      setColorblindMode: (colorblindMode) => {
        set({ colorblindMode });
        document.documentElement.setAttribute('data-colorblind-mode', colorblindMode);
      },
      toggleReducedMotion: () => {
        const reducedMotion = !get().reducedMotion;
        set({ reducedMotion });
        if (reducedMotion) document.documentElement.classList.add('reduced-motion');
        else document.documentElement.classList.remove('reduced-motion');
      },
      toggleScreenReaderOptimized: () => {
        const screenReaderOptimized = !get().screenReaderOptimized;
        set({ screenReaderOptimized });
        if (screenReaderOptimized) document.documentElement.classList.add('screen-reader-optimized');
        else document.documentElement.classList.remove('screen-reader-optimized');
      },
      resetAccessibilityToDefaults: () => {
        set(defaultAccessibility);
        // Re-apply defaults
        document.documentElement.setAttribute('data-font-size', defaultAccessibility.fontSize);
        document.documentElement.classList.remove('high-contrast', 'reduced-motion', 'screen-reader-optimized');
        document.documentElement.setAttribute('data-colorblind-mode', defaultAccessibility.colorblindMode);
      },
    }),
    {
      name: 'ui-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.themeVariant, state.isDarkMode);
          document.documentElement.setAttribute('data-font-size', state.fontSize);
          document.documentElement.setAttribute('data-colorblind-mode', state.colorblindMode);
          if (state.highContrast) document.documentElement.classList.add('high-contrast');
          if (state.reducedMotion) document.documentElement.classList.add('reduced-motion');
          if (state.screenReaderOptimized) document.documentElement.classList.add('screen-reader-optimized');
        }
      },
    }
  )
);

function applyTheme(variant: ThemeVariant, isDark: boolean) {
  document.documentElement.classList.remove('dark', 'light', 'high-contrast-light', 'high-contrast-dark');
  document.documentElement.classList.add(variant);
  if (isDark) document.documentElement.classList.add('dark');
}
