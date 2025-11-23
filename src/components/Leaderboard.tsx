import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { loadStats, SavedStat } from '../utils/saveStats';

interface LeaderboardEntry {
  rank: number;
  name: string;
  wpm: number;
  accuracy: number;
  date: string;
}

const Leaderboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [category, setCategory] = useState<'wpm' | 'accuracy'>('wpm');

  useEffect(() => {
    const stats = loadStats();
    const sorted = [...stats].sort((a, b) => 
      category === 'wpm' ? b.wpm - a.wpm : b.accuracy - a.accuracy
    );
    
    const top10 = sorted.slice(0, 10).map((stat, index) => ({
      rank: index + 1,
      name: 'Usuario',
      wpm: stat.wpm,
      accuracy: stat.accuracy,
      date: stat.date || new Date().toISOString(),
    }));
    
    setEntries(top10);
  }, [category]);

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('leaderboard.title', 'Clasificación')}</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setCategory('wpm')}
            className={`px-6 py-3 rounded ${
              category === 'wpm'
                ? 'bg-blue-500 text-white'
                : isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {t('leaderboard.byWPM', 'Por WPM')}
          </button>
          <button
            onClick={() => setCategory('accuracy')}
            className={`px-6 py-3 rounded ${
              category === 'accuracy'
                ? 'bg-blue-500 text-white'
                : isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {t('leaderboard.byAccuracy', 'Por Precisión')}
          </button>
        </div>

        <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <tr>
                <th className="p-4 text-left">{t('leaderboard.rank', 'Puesto')}</th>
                <th className="p-4 text-left">{t('leaderboard.name', 'Nombre')}</th>
                <th className="p-4 text-right">{t('leaderboard.wpm', 'WPM')}</th>
                <th className="p-4 text-right">{t('leaderboard.accuracy', 'Precisión')}</th>
                <th className="p-4 text-right">{t('leaderboard.date', 'Fecha')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={index}
                  className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <td className="p-4">
                    <span className={`text-2xl font-bold ${
                      entry.rank === 1 ? 'text-yellow-500' :
                      entry.rank === 2 ? 'text-gray-400' :
                      entry.rank === 3 ? 'text-orange-600' : ''
                    }`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                    </span>
                  </td>
                  <td className="p-4">{entry.name}</td>
                  <td className="p-4 text-right font-bold">{entry.wpm}</td>
                  <td className="p-4 text-right">{entry.accuracy.toFixed(1)}%</td>
                  <td className="p-4 text-right text-sm opacity-75">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
