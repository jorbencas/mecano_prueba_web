import React, { useState, useEffect } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import UnifiedSpinner from './UnifiedSpinner';
import { useFetchWithTimeout } from '@/hooks/useFetchWithTimeout';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface LeaderboardEntry {
  rank: number;
  id: string;
  display_name: string;
  photo_url: string;
  max_wpm: number;
  avg_accuracy: number;
  total_games: number;
}

const Leaderboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const fetchWithTimeout = useFetchWithTimeout();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();
  const [mode, setMode] = useState<string>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetchWithTimeout(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/stats/leaderboard?mode=${mode}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });

        if (!response.ok) throw new Error('Failed to fetch leaderboard');

        const data = await response.json();
        
        // Map and sort data
        const mappedData = data.map((entry: any, index: number) => ({
          rank: index + 1,
          id: entry.id,
          display_name: entry.display_name || 'Usuario',
          photo_url: entry.photo_url,
          max_wpm: entry.max_wpm,
          avg_accuracy: parseFloat(entry.avg_accuracy),
          total_games: parseInt(entry.total_games)
        }));

        setEntries(mappedData);
      } catch (err: any) {
        handleError(err);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [mode, fetchWithTimeout]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
    <UnifiedSpinner />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('leaderboard.title')}</h1>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {['all', 'xp', 'time_15', 'time_30', 'time_60', 'words_10', 'words_25', 'words_50'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                mode === m
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {t(`leaderboard.modes.${m}`)}
            </button>
          ))}
        </div>

        <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <tr>
                <th className="p-4 text-left w-16">#</th>
                <th className="p-4 text-left">{t('leaderboard.player')}</th>
                <th className="p-4 text-right">{t('leaderboard.wpm')}</th>
                <th className="p-4 text-right">{t('leaderboard.accuracy')}</th>
                <th className="p-4 text-right">{t('leaderboard.games')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center opacity-50">
                    {t('leaderboard.noData')}
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <td className="p-4">
                      <span className={`text-xl font-bold ${
                        entry.rank === 1 ? 'text-yellow-500' :
                        entry.rank === 2 ? 'text-gray-400' :
                        entry.rank === 3 ? 'text-orange-600' : ''
                      }`}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      {entry.photo_url ? (
                        <img src={entry.photo_url} alt={entry.display_name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {entry.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{entry.display_name}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-xl">{entry.max_wpm}</td>
                    <td className="p-4 text-right">{entry.avg_accuracy.toFixed(1)}%</td>
                    <td className="p-4 text-right opacity-75">{entry.total_games}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
