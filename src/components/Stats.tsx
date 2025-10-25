// components/Stats.tsx
import React, { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { useTheme } from '../context/ThemeContext';
import { saveStats, SavedStat } from '../utils/saveStats';

interface StatsProps {
  stats: SavedStat;
  errorList: { expected: string; actual: string }[];
  onRepeatLevel: () => void;
  onNextLevel: () => void;
  sourceComponent: string; // "Levels" | "PlayGame" | "CreateText"
}

// === Utilidad ===
const formatElapsedTime = (timeInSeconds: number | null) => {
  if (timeInSeconds === null) return 'N/A';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes} min ${seconds} s`;
};

// === Subcomponentes ===
const StatRow: React.FC<{
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  color?: string;
}> = ({ label, value, highlight, color }) => (
  <div className="flex justify-between">
    <span className="text-gray-600 dark:text-gray-300">{label}:</span>
    <span
      className={`font-bold ${
        color
          ? color
          : highlight
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {value}
    </span>
  </div>
);

const StatCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="p-4 rounded-lg shadow-sm bg-opacity-40 backdrop-blur-md bg-white/30 dark:bg-gray-800/50">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const ErrorTable: React.FC<{ errorList: { expected: string; actual: string }[] }> = ({ errorList }) => (
  <div className="mt-4 bg-red-100 dark:bg-red-900 p-4 rounded-lg max-h-[200px] overflow-y-auto">
    <h3 className="font-semibold mb-2 text-lg text-red-800 dark:text-red-300">Errores</h3>
    <table className="w-full text-sm table-auto">
      <thead className="bg-red-200 dark:bg-red-800">
        <tr>
          <th className="px-2 py-1 text-left font-bold">Esperado</th>
          <th className="px-2 py-1 text-left font-bold">Escrito</th>
        </tr>
      </thead>
      <tbody>
        {errorList.map((error, index) => (
          <tr key={index} className="bg-red-50 dark:bg-red-700/30">
            <td className="px-2 py-1 font-mono">
              {error.expected === ' ' ? '_' : error.expected}
            </td>
            <td className="px-2 py-1 font-mono">
              {error.actual === ' ' ? '_' : error.actual}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const HighlightedText: React.FC<{ text: string; errorList: { expected: string; actual: string }[] }> = ({
  text,
  errorList,
}) => (
  <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-[200px] overflow-y-auto">
    <h3 className="font-semibold mb-2 text-lg">Texto con Errores Resaltados</h3>
    <p className="font-mono whitespace-pre-wrap break-all">
      {text.split('').map((char, index) => {
        const error = errorList.find((e) => e.expected === char && e.actual !== char);
        return (
          <span
            key={index}
            className={`inline-block ${error ? 'bg-red-300 relative' : ''}`}
            data-tooltip-id={`char-${index}`}
            data-tooltip-content={error ? `Escrito: ${error.actual}` : ''}
          >
            {char}
            {error && <Tooltip id={`char-${index}`} place="top" />}
          </span>
        );
      })}
    </p>
  </div>
);

const Requirements: React.FC<{ wpmGoal: number }> = ({ wpmGoal }) => (
  <div className="mt-4 bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
    <h3 className="font-semibold mb-2 text-lg">Requisitos para Pasar al Siguiente Nivel</h3>
    <ul className="list-disc list-inside space-y-1">
      <li>Alcanzar un WPM de al menos {wpmGoal}.</li>
      <li>Tener una precisión del 95% o más.</li>
      <li>No exceder el límite de errores permitidos para este nivel.</li>
    </ul>
  </div>
);

// === Componente principal ===
const Stats: React.FC<StatsProps> = ({
  stats,
  errorList,
  onRepeatLevel,
  onNextLevel,
  sourceComponent,
}) => {
  const { isDarkMode } = useTheme();

  // Guardar estadísticas automáticamente
  useEffect(() => {
    if (stats) saveStats(stats);
  }, [stats]);

  const {
    wpm,
    accuracy,
    level,
    errors,
    wpmGoal,
    elapsedTime,
    levelCompleted,
    errorLimit,
    text,
  } = stats;

  const feedbackMessage =
    sourceComponent === 'CreateText'
      ? errorList.length > 0
        ? 'El texto presenta errores'
        : 'Se ha completado el texto'
      : levelCompleted
      ? '¡Nivel completado con éxito!'
      : 'No se ha completado el nivel';

  return (
    <div className={`relative p-4 rounded-lg transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>
      {/* === Feedback === */}
      <div className="mt-4 text-center mb-4">
        <p
          className={`font-bold ${
            levelCompleted ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {feedbackMessage}
        </p>
      </div>

      {/* === Estadísticas === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Rendimiento">
          <StatRow label="WPM Actual" value={wpm} highlight={wpm >= wpmGoal} />
          <StatRow label="WPM Objetivo" value={wpmGoal} color="text-blue-600 dark:text-blue-400" />
          <StatRow label="Precisión" value={`${accuracy.toFixed(2)}%`} highlight={accuracy >= 95} />
        </StatCard>

        <StatCard title="Detalles">
          <StatRow label="Nivel" value={level} color="text-blue-600 dark:text-blue-400" />
          <StatRow label="Errores" value={`${errors} / ${errorLimit}`} highlight={errors === 0} />
          <StatRow label="Tiempo" value={formatElapsedTime(elapsedTime)} color="text-purple-600 dark:text-purple-400" />
        </StatCard>
      </div>

      {/* === Errores === */}
      {sourceComponent !== 'Levels' && errorList.length > 0 && <ErrorTable errorList={errorList} />}

      {/* === Texto con errores === */}
      {sourceComponent === 'Levels' && text && <HighlightedText text={text} errorList={errorList} />}

      {/* === Requisitos === */}
      {(sourceComponent === 'Levels' || sourceComponent === 'PlayGame') && <Requirements wpmGoal={wpmGoal} />}

      {/* === Botones === */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onRepeatLevel}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {sourceComponent === 'CreateText' ? 'Cerrar' : 'Repetir Nivel'}
        </button>

        {sourceComponent !== 'CreateText' && levelCompleted && (
          <button
            onClick={onNextLevel}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors"
          >
            Siguiente Nivel
          </button>
        )}
      </div>
    </div>
  );
};

export default Stats;