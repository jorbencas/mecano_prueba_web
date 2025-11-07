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
  sourceComponent: 'Levels' | 'PlayGame' | 'CreateText';
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

  const feedbackMessageKey =
    sourceComponent === 'CreateText'
      ? errorList.length > 0
        ? 'stats.feedback.textErrors'
        : 'stats.feedback.textComplete'
      : levelCompleted
      ? 'stats.feedback.levelComplete'
      : 'stats.feedback.levelFail';

  return (
    <div className={`relative p-4 rounded-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="mt-4 text-center mb-4">
        <p className={`font-bold ${levelCompleted ? 'text-green-600' : 'text-red-600'}`}>
          {t(feedbackMessageKey)}
        </p>
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