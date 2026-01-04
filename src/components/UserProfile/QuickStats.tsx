import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { FaClock, FaFire, FaChartLine, FaTrophy } from 'react-icons/fa';
import { useUserStore } from '@/store/userStore';

const QuickStats: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const { stats } = useUserStore();

  if (!stats) return null;

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const statItems = [
    { icon: <FaClock />, label: t('profile.totalTime'), value: formatDuration(stats.totalTime), color: 'text-blue-500' },
    { icon: <FaFire />, label: t('profile.totalActivities'), value: stats.totalActivities, color: 'text-orange-500' },
    { icon: <FaChartLine />, label: t('profile.averageWPM'), value: stats.averageWPM, color: 'text-green-500' },
    { icon: <FaTrophy />, label: t('profile.completed'), value: stats.totalCompleted, color: 'text-yellow-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((stat, i) => (
        <div key={i} className={`p-5 rounded-none border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
          isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'
        }`}>
          <div className={`${stat.color} text-xl mb-3`}>{stat.icon}</div>
          <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
            {stat.label}
          </p>
          <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
