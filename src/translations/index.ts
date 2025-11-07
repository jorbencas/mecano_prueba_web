// src/locales/index.ts
import en from './en.json';
import es from './es.json';
import ca from './ca.json';
import va from './va.json';

export const locales = { en, es, ca, va };
export type SupportedLanguage = keyof typeof locales;
