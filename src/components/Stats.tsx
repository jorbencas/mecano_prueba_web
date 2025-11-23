import React, { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { useTheme } from '../context/ThemeContext';
import { saveStats, SavedStat } from '../utils/saveStats';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface StatsProps {
  stats: SavedStat;
  errorList: { expected: string; actual: string }[];
  onRepeatLevel: () => void;
  onNextLevel: () => void;
  sourceComponent: 'Levels' | 'PlayGame' | 'CreateText' | 'PrecisionMode' | 'FreePractice' | 'SpeedMode' | 'NeonMode';
}

const formatElapsedTime = (timeInSeconds: number | null) => {
  if (timeInSeconds === null) return 'N/A';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes} min ${seconds} s`;
};

const StatRow: React.FC<{
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  color?: string;
}> = ({ label, value, highlight, color }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span
      className={`font-bold ${
        color
          ? color
          : highlight
          ? 'text-green-600'
          : 'text-red-600'
      }`}
    >
      {value}
    </span>
  </div>
);

const StatCard: React.FC<{ title: string; className?: string; children: React.ReactNode }> = ({
  title,
  className = '',
  children,
}) => (
  <div className={`p-4 rounded-lg shadow-sm ${className}`}>
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const ErrorTable: React.FC<{ errorList: { expected: string; actual: string }[]; t: any }> = ({ errorList, t }) => (
  <div className="mt-4 bg-red-100 p-4 rounded-lg max-h-[200px] overflow-y-auto">
    <h3 className="font-semibold mb-2 text-lg text-red-800">{t('stats.errors.title')}</h3>
    <table className="w-full text-sm table-auto">
      <thead className="bg-red-200">
        <tr>
          <th className="px-2 py-1 text-left font-bold">{t('stats.errors.expected')}</th>
          <th className="px-2 py-1 text-left font-bold">{t('stats.errors.actual')}</th>
        </tr>
      </thead>
      <tbody>
        {errorList.map((error, index) => (
          <tr key={index} className="bg-red-50">
            <td className="px-2 py-1 font-mono">{error.expected === ' ' ? '_' : error.expected}</td>
            <td className="px-2 py-1 font-mono">{error.actual === ' ' ? '_' : error.actual}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Requirements: React.FC<{ wpmGoal: number; t: any }> = ({ wpmGoal, t }) => (
  <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
    <h3 className="font-semibold mb-2 text-lg text-gray-700">{t('stats.requirements.title')}</h3>
    <ul className="list-disc list-inside space-y-1 text-gray-700">
      <li>{t('stats.requirements.wpm', { wpmGoal })}</li>
      <li>{t('stats.requirements.accuracy')}</li>
      <li>{t('stats.requirements.errors')}</li>
    </ul>
  </div>
);

const HighlightedText: React.FC<{ text: string; errorList: { expected: string; actual: string }[]; t: any }> = ({
  text,
  errorList,
  t,
}) => (
  <div className="mt-4 bg-gray-100 p-4 rounded-lg max-h-[200px] overflow-y-auto">
    <h3 className="font-semibold mb-2 text-lg">{t('stats.highlighted.title')}</h3>
    <p className="font-mono whitespace-pre-wrap break-all">
      {text.split('').map((char, index) => {
        const error = errorList.find((e) => e.expected === char && e.actual !== char);
        return (
          <span
            key={index}
            className={`inline-block ${error ? 'bg-red-300 relative' : ''}`}
            data-tooltip-id={`char-${index}`}
            data-tooltip-content={error ? `${t('stats.highlighted.tooltip')} ${error.actual}` : ''}
          >
            {char}
            {error && <Tooltip id={`char-${index}`} place="top" />}
          </span>
        );
      })}
    </p>
  </div>
);

const Stats: React.FC<StatsProps> = ({
  stats,
  errorList,
  onRepeatLevel,
  onNextLevel,
  sourceComponent,
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  useEffect(() => {
    saveStats({ ...stats, sourceComponent, date: new Date().toISOString() });
  }, [stats, sourceComponent]);

  const { wpm, accuracy, level, errors, wpmGoal, elapsedTime, levelCompleted, errorLimit, text } = stats;

  // Enhanced feedback based on component and performance
  const getFeedbackMessage = () => {
    if (sourceComponent === 'CreateText') {
      if (errorList.length === 0) {
        return {
          message: t('stats.feedback.createtext.perfect', '¡Perfecto! Sin errores'),
          color: 'text-green-600',
          icon: '🎉'
        };
      } else if (accuracy >= 95) {
        return {
          message: t('stats.feedback.createtext.good', 'Buen trabajo, sigue practicando'),
          color: 'text-blue-600',
          icon: '👍'
        };
      } else {
        return {
          message: t('stats.feedback.createtext.improve', 'Revisa los errores y vuelve a intentarlo'),
          color: 'text-orange-600',
          icon: '💪'
        };
      }
    }

    if (sourceComponent === 'PlayGame') {
      if (levelCompleted) {
        if (wpm >= wpmGoal * 1.2) {
          return {
            message: t('stats.feedback.playgame.excellent', '¡Excelente! Superaste el objetivo'),
            color: 'text-green-600',
            icon: '🏆'
          };
        }
        return {
          message: t('stats.feedback.playgame.complete', '¡Nivel completado!'),
          color: 'text-green-600',
          icon: '✅'
        };
      } else {
        return {
          message: t('stats.feedback.playgame.fail', 'Sigue intentándolo'),
          color: 'text-red-600',
          icon: '🎯'
        };
      }
    }

    if (sourceComponent === 'PrecisionMode') {
      if (accuracy >= 98) {
        return {
          message: t('stats.feedback.precision.perfect', '¡Precisión excepcional!'),
          color: 'text-green-600',
          icon: '🎯'
        };
      } else if (accuracy >= 95) {
        return {
          message: t('stats.feedback.precision.good', 'Buena precisión, sigue mejorando'),
          color: 'text-blue-600',
          icon: '👍'
        };
      } else {
        return {
          message: t('stats.feedback.precision.improve', 'Concéntrate en reducir errores'),
          color: 'text-orange-600',
          icon: '💪',
          suggestion: t('stats.suggestions.precision', 'Reduce la velocidad y enfócate en la precisión')
        };
      }
    }

    if (sourceComponent === 'SpeedMode') {
      if (wpm >= 60) {
        return {
          message: t('stats.feedback.speed.excellent', '¡Velocidad impresionante!'),
          color: 'text-green-600',
          icon: '⚡'
        };
      } else if (wpm >= 40) {
        return {
          message: t('stats.feedback.speed.good', 'Buena velocidad, sigue practicando'),
          color: 'text-blue-600',
          icon: '🚀'
        };
      } else {
        return {
          message: t('stats.feedback.speed.improve', 'Sigue practicando para mejorar tu velocidad'),
          color: 'text-orange-600',
          icon: '💪',
          suggestion: t('stats.suggestions.speed', 'Practica los mismos caracteres para ganar fluidez')
        };
      }
    }

    if (sourceComponent === 'FreePractice') {
      if (errorList.length === 0) {
        return {
          message: t('stats.feedback.freepractice.perfect', '¡Práctica perfecta!'),
          color: 'text-green-600',
          icon: '🎉'
        };
      } else if (accuracy >= 95) {
        return {
          message: t('stats.feedback.freepractice.good', 'Buen trabajo en tu práctica'),
          color: 'text-blue-600',
          icon: '👍'
        };
      } else {
        return {
          message: t('stats.feedback.freepractice.improve', 'Sigue practicando para mejorar'),
          color: 'text-orange-600',
          icon: '💪'
        };
      }
    }

    if (sourceComponent === 'NeonMode') {
      if (wpm >= 60 && accuracy >= 95) {
        return {
          message: t('stats.feedback.neon.excellent', '⚡ SISTEMA OPTIMIZADO ⚡'),
          color: 'text-cyan-400',
          icon: '🔮',
          suggestion: t('stats.suggestions.neon.excellent', 'Rendimiento excepcional en el protocolo digital')
        };
      } else if (wpm >= 40 && accuracy >= 90) {
        return {
          message: t('stats.feedback.neon.good', '✨ CONEXIÓN ESTABLE ✨'),
          color: 'text-blue-400',
          icon: '💎'
        };
      } else if (accuracy < 85) {
        return {
          message: t('stats.feedback.neon.lowAccuracy', '⚠️ INTERFERENCIA DETECTADA'),
          color: 'text-yellow-400',
          icon: '⚡',
          suggestion: t('stats.suggestions.neon.accuracy', 'Calibra tu precisión para estabilizar el sistema')
        };
      } else {
        return {
          message: t('stats.feedback.neon.improve', '🔄 RECALIBRANDO SISTEMA'),
          color: 'text-purple-400',
          icon: '🌐',
          suggestion: t('stats.suggestions.neon.speed', 'Aumenta la velocidad de transmisión de datos')
        };
      }
    }

    // Levels (default)

    if (levelCompleted) {
      if (wpm >= wpmGoal && accuracy >= 98) {
        return {
          message: t('stats.feedback.levels.perfect', '¡Perfecto! Dominas este nivel'),
          color: 'text-green-600',
          icon: '⭐'
        };
      }
      return {
        message: t('stats.feedback.levels.complete', '¡Nivel superado!'),
        color: 'text-green-600',
        icon: '✅'
      };
    } else {
      if (wpm < wpmGoal) {
        return {
          message: t('stats.feedback.levels.slowSpeed', 'Necesitas más velocidad'),
          color: 'text-orange-600',
          icon: '⚡',
          suggestion: t('stats.suggestions.speed', 'Practica los mismos caracteres para ganar fluidez')
        };
      } else if (accuracy < 95) {
        return {
          message: t('stats.feedback.levels.lowAccuracy', 'Necesitas más precisión'),
          color: 'text-orange-600',
          icon: '🎯',
          suggestion: t('stats.suggestions.accuracy', 'Reduce la velocidad y concéntrate en la precisión')
        };
      } else {
        return {
          message: t('stats.feedback.levels.tooManyErrors', 'Demasiados errores'),
          color: 'text-red-600',
          icon: '❌',
          suggestion: t('stats.suggestions.errors', 'Revisa tu posición de manos y teclea con calma')
        };
      }
    }
  };

  const feedback = getFeedbackMessage();

  return (
    <div className={`relative p-4 rounded-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="mt-4 text-center mb-6">
        <div className={`text-6xl mb-2`}>{feedback.icon}</div>
        <p className={`text-2xl font-bold ${feedback.color}`}>
          {feedback.message}
        </p>
        {feedback.suggestion && (
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} italic`}>
            💡 {feedback.suggestion}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title={t('stats.cards.performance')} className="bg-blue-50 text-blue-700">
          <StatRow label={t('stats.labels.currentWpm')} value={wpm} highlight={wpm >= wpmGoal} />
          <StatRow label={t('stats.labels.goalWpm')} value={wpmGoal} color="text-blue-600" />
          <StatRow label={t('stats.labels.accuracy')} value={`${accuracy.toFixed(2)}%`} highlight={accuracy >= 95} />
        </StatCard>

        <StatCard title={t('stats.cards.details')} className="bg-green-50 text-green-700">
          <StatRow label={t('stats.labels.level')} value={level} color="text-blue-600" />
          <StatRow label={t('stats.labels.errors')} value={`${errors} / ${errorLimit}`} highlight={errors === 0} />
          <StatRow label={t('stats.labels.time')} value={formatElapsedTime(elapsedTime)} color="text-purple-600" />
        </StatCard>
      </div>

      {sourceComponent !== 'Levels' && errorList.length > 0 && <ErrorTable errorList={errorList} t={t} />}
      {sourceComponent === 'Levels' && text && <HighlightedText text={text} errorList={errorList} t={t} />}
      {(sourceComponent === 'Levels' || sourceComponent === 'PlayGame') && <Requirements wpmGoal={wpmGoal} t={t} />}

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onRepeatLevel} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition">
          {sourceComponent === 'CreateText' ? t('stats.buttons.close') : t('stats.buttons.repeat')}
        </button>

        {sourceComponent !== 'CreateText' && levelCompleted && (
          <button onClick={onNextLevel} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition">
            {t('stats.buttons.next')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Stats;