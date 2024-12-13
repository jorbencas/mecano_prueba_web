import React from 'react';
import { Tooltip } from 'react-tooltip';
import { useTheme } from '../context/ThemeContext';

interface StatsProps {
  wpm: number;
  accuracy: number;
  level: number;
  errors: number;
  wpmGoal: number;
  elapsedTime: number | null;
  errorList: { expected: string; actual: string }[];
  levelCompleted: boolean;
  errorLimit: number;
  onRepeatLevel: () => void;
  onNextLevel: () => void;
  sourceComponent: string;
  text?: string;
}

const Stats: React.FC<StatsProps> = ({
  wpm,
  accuracy,
  level,
  errors,
  wpmGoal,
  elapsedTime,
  errorList,
  levelCompleted,
  errorLimit,
  onRepeatLevel,
  onNextLevel,
  sourceComponent,
  text
}) => {
  const { isDarkMode } = useTheme();
  const formatElapsedTime = (timeInSeconds: number | null) => {
    if (timeInSeconds === null) return 'N/A';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes} min ${seconds} s`;
  };

  return (
    <div className={`relative p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className="mt-4 text-center mb-4">
        <p className={`font-bold ${levelCompleted ? 'text-green-600' : 'text-red-600'}`}>
          {sourceComponent === "CreateText" 
            ? (errorList.length > 0 ? "El texto presenta errores" : "Se ha completado el texto")
            : (levelCompleted 
                ? "¡Nivel completado con éxito!" 
                : "No se ha completado el nivel")}
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-blue-700">Rendimiento</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">WPM Actual:</span>
              <span className={`font-bold ${wpm >= wpmGoal ? 'text-green-600' : 'text-red-600'}`}>
                {wpm}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">WPM Objetivo:</span>
              <span className="font-bold text-blue-600">{wpmGoal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Precisión:</span>
              <span className={`font-bold ${accuracy >= 95 ? 'text-green-600' : 'text-red-600'}`}>
                {accuracy.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-green-700">Detalles</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Nivel:</span>
              <span className="font-bold text-blue-600">{level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Errores:</span>
              <span className={`font-bold ${errors === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {errors} / {errorLimit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tiempo:</span>
              <span className="font-bold text-purple-600">
                {formatElapsedTime(elapsedTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {sourceComponent !== "Levels" && errorList.length > 0 && (
        <div className="mt-4 bg-red-100 p-4 rounded-lg max-h-[200px] overflow-y-auto">
          <h3 className="font-semibold mb-2 text-lg text-red-800">Errores</h3>
          <table className="w-full text-sm table-auto">
            <thead className="bg-red-200">
              <tr>
                <th className="px-2 py-1 text-left font-bold">Esperado</th>
                <th className="px-2 py-1 text-left font-bold">Escrito</th>
              </tr>
            </thead>
            <tbody>
              {errorList.map((error, index) => (
                <tr key={index} className='bg-red-50'>
                  <td className="px-2 py-1 font-mono">{error.expected === ' ' ? '_' : error.expected}</td>
                  <td className="px-2 py-1 font-mono">{error.actual === ' ' ? '_' : error.actual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sourceComponent === "Levels" && text && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg max-h-[200px] overflow-y-auto">
          <h3 className="font-semibold mb-2 text-lg">Texto con Errores Resaltados</h3>
          <p className="font-mono whitespace-pre-wrap break-all">
            {text.split('').map((char, index) => {
              const error = errorList.find(e => e.expected === char && e.actual !== char);
              return (
                 <span 
                  key={index} 
                  className={`inline-block ${error ? 'bg-red-300 relative' : ''}`}
                  data-tooltip-id={`char-${index}`}
                  data-tooltip-content={error ? `Escrito: ${error.actual}` : ''}
                >
                  {char}
                  {error && (
                    <Tooltip id={`char-${index}`} place="top" />

                  )}
                </span>
              );
            })}
          </p>
        </div>
      )}

      {(sourceComponent === "Levels" || sourceComponent === "PlayGame") && (
        <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-lg text-gray-700">Requisitos para Pasar al Siguiente Nivel</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Alcanzar un WPM de al menos {wpmGoal}.</li>
            <li>Tener una precisión del 95% o más.</li>
            <li>No exceder el límite de errores permitidos para este nivel.</li>
          </ul>
        </div>
      )}

      {sourceComponent === "CreateText" ? (
        <button onClick={onRepeatLevel} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          Cerrar
        </button>
      ) : (
        <>
          <button onClick={onRepeatLevel} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            Repetir Nivel
          </button>
          {levelCompleted && (
            <button onClick={onNextLevel} 
              className="mt-4 ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">
              Siguiente Nivel
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Stats;