import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Translations {
  [key: string]: any;
}

/**
 * Hook para obtener traducciones dinámicas con soporte de interpolación
 * 
 * Características:
 * - Carga traducciones del idioma actual desde archivos JSON
 * - Soporta claves anidadas usando notación de punto (ej: 'menu.items.game')
 * - Interpolación de variables con sintaxis {{variable}}
 * - Fallback a texto por defecto si no existe la traducción
 * 
 * @returns Objeto con función de traducción `t` y estado de carga
 * 
 * @example
 * ```tsx
 * const { t, loading } = useDynamicTranslations();
 * 
 * // Traducción simple
 * t('menu.items.game')  // → "Juego"
 * 
 * // Con valor por defecto
 * t('menu.items.game', 'Game')
 * 
 * // Con interpolación de variables
 * t('alerts.roleUpdated', { role: 'admin' })
 * // Busca: "Usuario actualizado a {{role}} exitosamente"
 * // Retorna: "Usuario actualizado a admin exitosamente"
 * ```
 */
export const useDynamicTranslations = () => {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  /**
   * Efecto para cargar las traducciones cuando cambia el idioma
   * Usa dynamic import para cargar solo el archivo JSON necesario
   */
  useEffect(() => {
    const loadLanguage = async () => {
      setLoading(true);
      try {
        // Importación dinámica del archivo de traducciones
        // Ej: import('../translations/es.json')
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

  /**
   * Función de traducción con soporte de interpolación
   * 
   * @param key - Clave de traducción (puede usar notación de punto)
   * @param defaultOrValues - Valor por defecto (string) o valores para interpolar (objeto)
   * @returns Texto traducido con variables interpoladas
   * 
   * Proceso:
   * 1. Busca el texto en el objeto de traducciones usando la clave
   * 2. Si no existe, usa el valor por defecto
   * 3. Si hay variables, las reemplaza en el texto
   */
  const t = (
    key: string,
    defaultOrValues?: string | Record<string, any>
  ): string => {
    // 🔹 Buscar el texto en el JSON usando reduce
    // Divide 'menu.items.game' → ['menu', 'items', 'game']
    // Navega: translations['menu']['items']['game']
    let text =
      key.split(".").reduce((acc: any, part: string) => acc?.[part], translations) ??
      (typeof defaultOrValues === "string"
        ? defaultOrValues
        : defaultOrValues?.default ?? key);

    // 🔹 Interpolar variables si el texto es string y hay valores
    // Reemplaza {{variable}} con el valor correspondiente
    if (typeof text === "string" && typeof defaultOrValues === "object") {
      Object.entries(defaultOrValues).forEach(([name, value]) => {
        if (name !== "default") {
          // Busca {{variable}} o {variable} y reemplaza con el valor
          // \s* permite espacios opcionales: {{ variable }} también funciona
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
