export interface SavedStat {
  wpm: number;
  accuracy: number;
  level: number;
  errors: number;
  wpmGoal: number;
  elapsedTime: number;
  levelCompleted: boolean;
  errorLimit: number;
  sourceComponent?: string; // "Levels" | "PlayGame" | "CreateText"
  date?: string;
  text?: string
}

/**
 * Guarda las estadísticas en localStorage (array persistente).
 * Evita duplicados y mantiene máximo 100 registros.
 */
export const saveStats = (newStat: SavedStat) => {
  try {
    const existing = JSON.parse(localStorage.getItem('typingStats') || '[]');

    const updated = [
      ...existing,
      {
        ...newStat,
        date: newStat.date || new Date().toISOString(),
      },
    ];

    // Limitar a los últimos 100 registros
    if (updated.length > 100) updated.shift();

    localStorage.setItem('typingStats', JSON.stringify(updated));
  } catch (err) {
    console.error('Error guardando estadísticas:', err);
  }
};

/**
 * Recupera todas las estadísticas del almacenamiento.
 */
export const loadStats = (): SavedStat[] => {
  try {
    return JSON.parse(localStorage.getItem('typingStats') || '[]');
  } catch {
    return [];
  }
};

/**
 * Elimina todas las estadísticas guardadas.
 */
export const clearStats = () => {
  try {
    localStorage.removeItem('typingStats');
  } catch (err) {
    console.error('Error limpiando estadísticas:', err);
  }
};

/**
 * Filtra estadísticas por tipo de componente (Levels, PlayGame, CreateText).
 */
export const getStatsBySource = (
  source: 'Levels' | 'PlayGame' | 'CreateText'
): SavedStat[] => {
  return loadStats().filter((stat) => stat.sourceComponent === source);
};
