import React, { useEffect, useState } from 'react';
import { loadStats, clearStats, SavedStat } from '../utils/saveStats';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { SourceComponent } from '../constants/sourceComponents';

const FILTER_KEY = 'statsFilter';

const StatsHistory: React.FC = () => {
  const [stats, setStats] = useState<SavedStat[]>([]);
  const [filter, setFilter] = useState<SourceComponent>(
    () => (localStorage.getItem(FILTER_KEY) as SourceComponent) || SourceComponent.ALL
  );

  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const filteredStats = stats.filter((s) =>
    filter === SourceComponent.ALL ? true : s.sourceComponent === filter
  );

  const handleFilterChange = (value: SourceComponent) => {
    setFilter(value);
    localStorage.setItem(FILTER_KEY, value);
  };

  const handleClear = () => {
    if (window.confirm(t('statsHistory.confirmClear'))) {
      clearStats();
      setStats([]);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">{t('statsHistory.title')}</h2>

      <div className="flex flex-wrap justify-between items-center mb-4">
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value as SourceComponent)}
          className={`p-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
        >
          {Object.values(SourceComponent).map((key) => (
            <option key={key} value={key}>
              {t(`statsHistory.filters.${key}`)}
            </option>
          ))}
        </select>

        <button
          onClick={handleClear}
          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-700 transition"
        >
          {t('statsHistory.clear')}
        </button>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="wpm" name={t('statsHistory.columns.wpm')} stroke="#2563eb" />
            <Line type="monotone" dataKey="accuracy" name={t('statsHistory.columns.accuracy')} stroke="#16a34a" />
            <Line type="monotone" dataKey="errors" name={t('statsHistory.columns.errors')} stroke="#dc2626" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 max-h-96 overflow-y-auto border rounded-lg">
        <table className="border-collapse text-sm w-full">
          <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}>
            <tr>
              {Object.keys(t('statsHistory.columns')).map((colKey) => (
                <th key={colKey} className="p-2 text-left">
                  {t(`statsHistory.columns.${colKey}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStats.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  {t('statsHistory.noData', 'No hay datos disponibles')}
                </td>
              </tr>
            ) : (
              filteredStats.map((stat, index) => (
                <tr key={index} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} border-b`}>
                  <td className="p-2">{new Date(stat.date || '').toLocaleString()}</td>
                  <td className="p-2">{stat.sourceComponent}</td>
                  <td className="p-2">{stat.level}</td>
                  <td className="p-2">{stat.wpm}</td>
                  <td className="p-2">{stat.accuracy.toFixed(1)}%</td>
                  <td className="p-2">{stat.errors}</td>
                  <td className="p-2">{Math.round(stat.elapsedTime)}s</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsHistory;
