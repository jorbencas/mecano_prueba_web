export { useAccessibility } from '../context/AccessibilityContext';

/**
 * Helper function to generate ARIA label for typing statistics
 */
export const getStatsAriaLabel = (wpm: number, accuracy: number, errors: number): string => {
  return `Estadísticas: ${wpm} palabras por minuto, ${accuracy}% de precisión, ${errors} errores`;
};

/**
 * Helper function to generate ARIA label for keyboard keys
 */
export const getKeyAriaLabel = (key: string, isActive: boolean, finger?: string): string => {
  let label = `Tecla ${key}`;
  if (isActive) {
    label += ', activa';
  }
  if (finger) {
    label += `, usar ${finger}`;
  }
  return label;
};

/**
 * Helper function to generate ARIA label for progress indicators
 */
export const getProgressAriaLabel = (current: number, total: number, label: string): string => {
  const percentage = Math.round((current / total) * 100);
  return `${label}: ${current} de ${total}, ${percentage}% completado`;
};

/**
 * Helper function to announce dynamic content changes to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};
