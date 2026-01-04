import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { FaTrophy } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Achievements: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  const achievements = [
    { icon: '🚀', name: 'Velocista', date: '2023-10-01' },
    { icon: '🎯', name: 'Francotirador', date: '2023-10-05' },
    { icon: '🔥', name: 'En Racha', date: '2023-10-10' },
    { icon: '📚', name: 'Estudiante', date: '2023-10-12' },
    { icon: '🌟', name: 'Estrella', date: '2023-10-15' }
  ];

  return (
    <div className={`p-6 rounded-none border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-lg font-black uppercase tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <FaTrophy size={20} className="text-yellow-500" />
          {t('userProfile.achievements', 'Logros Recientes')}
        </h2>
        <Link to="/achievements" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-400">
          {t('common.viewAll', 'Ver Todos')}
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {achievements.map((achievement, i) => (
          <div key={i} className={`p-3 text-center rounded-none border ${isDarkMode ? 'bg-gray-900/50 border-gray-700/50' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-2xl mb-1">{achievement.icon}</div>
            <p className={`text-[9px] font-black uppercase tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {achievement.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
