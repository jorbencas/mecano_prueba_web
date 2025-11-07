// src/constants/appConstants.ts

// === Tipos de fuente de estadísticas ===
export enum SourceComponent {
  ALL = 'all',
  LEVELS = 'Levels',
  PLAYGAME = 'PlayGame',
  CREATETEXT = 'CreateText',
}

// === Claves de traducción ===
export const TranslationKeys = {
  settings: {
    title: 'settings.title',
    themeLight: 'settings.theme.light',
    themeDark: 'settings.theme.dark',
    languageLabel: 'settings.language.label',
  },
  stats: {
    title: 'stats.title',
    clearConfirm: 'stats.clearConfirm',
    clearButton: 'stats.clearButton',
    filter: {
      all: 'stats.filter.all',
      levels: 'stats.filter.levels',
      free: 'stats.filter.free',
      custom: 'stats.filter.custom',
    },
    columns: {
      wpm: 'stats.columns.wpm',
      accuracy: 'stats.columns.accuracy',
      errors: 'stats.columns.errors',
    },
  },
} as const;
