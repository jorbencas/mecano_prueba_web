import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Translations {
  [key: string]: any;
}

export const useDynamicTranslations = () => {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      setLoading(true);
      try {
        const module = await import(`../translations/${language}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Error loading ${language} translations`, error);
      } finally {
        setLoading(false);
      }
    };

    loadLanguage();
  }, [language]);

  // ✅ ahora acepta valor por defecto
 /**
   * Obtiene la traducción. Permite:
   * - `t('key.path')`
   * - `t('key.path', 'Valor por defecto')`
   * - `t('key.path', { variable: value })`
   * - `t('key.path', { variable: value, default: 'Texto' })`
   */
  const t = (
    key: string,
    defaultOrValues?: string | Record<string, any>
  ): string => {
    // 🔹 Busca el texto en el JSON
    let text =
      key.split(".").reduce((acc: any, part: string) => acc?.[part], translations) ??
      (typeof defaultOrValues === "string"
        ? defaultOrValues
        : defaultOrValues?.default ?? key);

    // 🔹 Si el texto es string y hay valores dinámicos, reemplaza {{var}}
    if (typeof text === "string" && typeof defaultOrValues === "object") {
      Object.entries(defaultOrValues).forEach(([name, value]) => {
        if (name !== "default") {
          text = text.replace(
            new RegExp(`{{\\s*${name}\\s*}}|{\\s*${name}\\s*}`, "g"),
            String(value)
          );
        }
      });
    }

    return text;
  };

  return { t, loading };
};
