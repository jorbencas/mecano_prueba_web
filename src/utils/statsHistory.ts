// src/utils/statsHistory.ts
import { loadStats } from './saveStats';

export interface GlobalStats {
  totalSessions: number;
  avgWpm: number;
  avgAccuracy: number;
  levelsCompleted: number;
  totalErrors: number;
  avgErrors: number;
}

/**
 * 🔹 Calcula estadísticas globales a partir del historial guardado
 */
export const calculateGlobalStats = (): GlobalStats => {
  const data = loadStats();

  if (data.length === 0) {
    return {
      totalSessions: 0,
      avgWpm: 0,
      avgAccuracy: 0,
      levelsCompleted: 0,
      totalErrors: 0,
      avgErrors: 0,
    };
  }

  const totalWpm = data.reduce((acc, s) => acc + (s.wpm || 0), 0);
  const totalAccuracy = data.reduce((acc, s) => acc + (s.accuracy || 0), 0);
  const totalErrors = data.reduce((acc, s) => acc + (s.errors || 0), 0);
  const levelsCompleted = data.filter((s) => s.completed).length;

  return {
    totalSessions: data.length,
    avgWpm: +(totalWpm / data.length).toFixed(1),
    avgAccuracy: +(totalAccuracy / data.length).toFixed(1),
    totalErrors,
    avgErrors: +(totalErrors / data.length).toFixed(1),
    levelsCompleted,
  };
};
