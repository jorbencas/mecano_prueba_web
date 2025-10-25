// src/utils/getStatsData.ts

export interface ErrorItem {
  expected: string;
  actual: string;
}

export interface LevelData {
  wpmGoal: number;
  errorLimit: number;
}

export interface GetStatsParams {
  wpm: number;
  accuracy?: number; // opcional, se puede calcular
  level: number;
  errors?: number | Record<string, unknown>; // puede venir como objeto o número
  elapsedTime?: number | null;
  errorList?: ErrorItem[];
  levelCompleted: boolean;
  levelData?: LevelData;
  text?: string;
}

/**
 * 🔹 Construye un objeto de estadísticas coherente para el componente <Stats />.
 * Se encarga de calcular:
 * - totalWords
 * - avgTimePerWord
 * - accuracy (si no se pasa)
 * - normalizar errores (si vienen como objeto)
 */
export const getStatsData = ({
  wpm,
  accuracy,
  level,
  errors = 0,
  elapsedTime = null,
  errorList = [],
  levelCompleted,
  levelData,
  text,
}: GetStatsParams) => {
  // 🔸 Normaliza errores (por si viene como objeto tipo { a: 2, b: 3 })
  const normalizedErrors =
    typeof errors === 'object' ? Object.keys(errors).length : errors;

  // 🔸 Calcula total de palabras si se pasa el texto
  const totalWords = text
    ? text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : null;

  // 🔸 Calcula precisión si no se pasa manualmente
  const computedAccuracy =
    accuracy ??
    (totalWords
      ? Math.max(0, Math.min(100, ((totalWords - normalizedErrors) / totalWords) * 100))
      : 100);

  // 🔸 Calcula tiempo promedio por palabra
  const avgTimePerWord =
    totalWords && elapsedTime
      ? Number((elapsedTime / totalWords).toFixed(2))
      : null;

  return {
    wpm,
    accuracy: computedAccuracy,
    level,
    errors: normalizedErrors,
    wpmGoal: levelData?.wpmGoal ?? 0,
    elapsedTime,
    errorList,
    levelCompleted,
    errorLimit: levelData?.errorLimit ?? 0,
    avgTimePerWord,
    totalWords,
  };
};

// 🔸 Tipo derivado automáticamente del retorno
export type StatsData = ReturnType<typeof getStatsData>;
