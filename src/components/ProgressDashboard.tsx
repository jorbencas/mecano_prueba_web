import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { loadStats, SavedStat } from '../utils/saveStats';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { SourceComponent } from '../constants/sourceComponents';

const ProgressDashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const [stats, setStats] = useState<SavedStat[]>([]);
  const [filter, setFilter] = useState<SourceComponent>(SourceComponent.ALL);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const filteredStats = stats.filter((s) =>
    filter === SourceComponent.ALL ? true : s.sourceComponent === filter
  );

  const last30Days = filteredStats.slice(-30);
  const avgWPM = filteredStats.length > 0 ? Math.round(filteredStats.reduce((sum, s) => sum + s.wpm, 0) / filteredStats.length) : 0;
  const avgAccuracy = filteredStats.length > 0 ? (filteredStats.reduce((sum, s) => sum + s.accuracy, 0) / filteredStats.length).toFixed(1) : 0;
  const totalPracticeTime = filteredStats.reduce((sum, s) => sum + (s.elapsedTime || 0), 0);
  const bestWPM = filteredStats.length > 0 ? Math.max(...filteredStats.map(s => s.wpm)) : 0;

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('progress.title', 'Panel de Progreso')}</h1>

        {/* Filter */}
        <div className="mb-6">
          <label className="mr-4 font-semibold">{t('statsHistory.filter', 'Filtrar por')}:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as SourceComponent)}
            className={`p-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
          >
            {Object.values(SourceComponent).map((key) => (
              <option key={key} value={key}>
                {t(`statsHistory.filters.${key}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
            <div className="text-sm opacity-75">{t('progress.avgWPM', 'WPM Promedio')}</div>
            <div className="text-4xl font-bold">{avgWPM}</div>
          </div>
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
            <div className="text-sm opacity-75">{t('progress.bestWPM', 'Mejor WPM')}</div>
            <div className="text-4xl font-bold">{bestWPM}</div>
          </div>
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
            <div className="text-sm opacity-75">{t('progress.avgAccuracy', 'Precisión Promedio')}</div>
            <div className="text-4xl font-bold">{avgAccuracy}%</div>
          </div>
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-orange-900' : 'bg-orange-100'}`}>
            <div className="text-sm opacity-75">{t('progress.totalTime', 'Tiempo Total')}</div>
            <div className="text-4xl font-bold">{Math.round(totalPracticeTime / 60)}m</div>
          </div>
        </div>

        {/* WPM Progress Chart */}
        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">{t('progress.wpmProgress', 'Progreso de WPM')}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last30Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="wpm" name="WPM" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Chart */}
        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">{t('progress.accuracyProgress', 'Progreso de Precisión')}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last30Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" name="Precisión %" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History Table */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">{t('statsHistory.title', 'Historial de Sesiones')}</h2>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <table className="border-collapse text-sm w-full">
              <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}>
                <tr>
                  <th className="p-2 text-left">{t('statsHistory.columns.date', 'Fecha')}</th>
                  <th className="p-2 text-left">{t('statsHistory.columns.sourceComponent', 'Componente')}</th>
                  <th className="p-2 text-left">{t('statsHistory.columns.level', 'Nivel')}</th>
                  <th className="p-2 text-left">{t('statsHistory.columns.wpm', 'WPM')}</th>
                  <th className="p-2 text-left">{t('statsHistory.columns.accuracy', 'Precisión')}</th>
                  <th className="p-2 text-left">{t('statsHistory.columns.errors', 'Errores')}</th>
                  <th className="p-2 text-left">{t('statsHistory.columns.elapsedTime', 'Tiempo')}</th>
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
                  filteredStats.slice().reverse().map((stat, index) => (
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
      </div>
    </div>
  );
};

export default ProgressDashboard;
