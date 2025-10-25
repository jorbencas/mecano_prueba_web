// src/utils/formatStats.ts
import type { StatsData } from './getStatsData';

/**
 * 🔹 Convierte segundos a formato legible (ej: "1m 23s")
 */
const formatElapsedTime = (seconds: number | null): string => {
  if (seconds === null || seconds === undefined) return 'N/A';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

/**
 * 🔹 Devuelve una cadena legible con las estadísticas
 * Ideal para logs, depuración o exportaciones de datos
 */
export const formatStats = (stats: StatsData): string => {
  const parts: string[] = [];

  parts.push(`Nivel ${stats.level}`);
  parts.push(`WPM: ${stats.wpm}`);
  parts.push(`Precisión: ${stats.accuracy.toFixed(1)}%`);
  parts.push(`Errores: ${stats.errors}/${stats.errorLimit}`);
  parts.push(`Tiempo: ${formatElapsedTime(stats.elapsedTime)}`);
  parts.push(`Objetivo: ${stats.wpmGoal} WPM`);
  parts.push(
    `Estado: ${stats.levelCompleted ? 'Completado ✅' : 'Incompleto ❌'}`
  );

  if (stats.totalWords) parts.push(`Palabras: ${stats.totalWords}`);
  if (stats.avgTimePerWord)
    parts.push(`Tiempo/palabra: ${stats.avgTimePerWord}s`);

  return parts.join(' | ');
};

/**
 * 🔹 Devuelve un objeto plano (útil para guardar o enviar a backend)
 */
export const formatStatsObject = (stats: StatsData) => ({
  level: stats.level,
  wpm: stats.wpm,
  accuracy: stats.accuracy,
  errors: stats.errors,
  wpmGoal: stats.wpmGoal,
  errorLimit: stats.errorLimit,
  elapsedTime: stats.elapsedTime,
  totalWords: stats.totalWords,
  avgTimePerWord: stats.avgTimePerWord,
  completed: stats.levelCompleted,
});
