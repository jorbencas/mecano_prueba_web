// utils/saveStats.ts
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
}

const STORAGE_KEY = 'savedStats';

// Guardar una estadística
export const saveStats = (stat: SavedStat) => {
  try {
    const current = loadStats();
    const newStats = [...current, stat];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  } catch (err) {
    console.error('Error guardando estadísticas:', err);
  }
};

// Cargar todas las estadísticas
export const loadStats = (): SavedStat[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed: SavedStat[] = JSON.parse(data);
    return parsed;
  } catch (err) {
    console.error('Error cargando estadísticas:', err);
    return [];
  }
};

// Borrar todas las estadísticas
export const clearStats = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error borrando estadísticas:', err);
  }
};
