import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { loadStats } from '../utils/saveStats';
import { checkAchievements, Achievement } from '../utils/achievements';

const Achievements: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    const stats = loadStats();
    const checked = checkAchievements(stats);
    setAchievements(checked);
  }, []);

  const filtered = achievements.filter(a => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('achievements.title', 'Logros')}</h1>

        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-4xl font-bold">{unlockedCount}/{achievements.length}</div>
              <div className="text-sm opacity-75">{t('achievements.unlocked', 'Logros Desbloqueados')}</div>
            </div>
            <div className="flex gap-2">
              {['all', 'unlocked', 'locked'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded ${
                    filter === f
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {t(`achievements.filter.${f}`, f)}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(achievement => (
            <div
              key={achievement.id}
              className={`p-6 rounded-lg ${
                achievement.unlocked
                  ? isDarkMode
                    ? 'bg-gradient-to-br from-yellow-900 to-yellow-800'
                    : 'bg-gradient-to-br from-yellow-100 to-yellow-200'
                  : isDarkMode
                  ? 'bg-gray-800 opacity-50'
                  : 'bg-gray-200 opacity-50'
              }`}
            >
              <div className="text-6xl mb-4 text-center">{achievement.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-center">{achievement.name}</h3>
              <p className="text-sm text-center mb-4">{achievement.description}</p>
              {achievement.unlocked && achievement.unlockedDate && (
                <div className="text-xs text-center opacity-75">
                  {t('achievements.unlockedOn', 'Desbloqueado')}: {new Date(achievement.unlockedDate).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
