import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { Crown } from 'lucide-react';
import { FaAward, FaTrophy } from 'react-icons/fa';
import { useUserStore } from '@/store/userStore';

const LevelXPProgress: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const { levelData, challengesCompleted } = useUserStore();

  if (!levelData) return null;

  return (
    <div className={`p-8 rounded-none border backdrop-blur-md lg:col-span-2 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.05)]' 
        : 'bg-blue-50/80 border-blue-200/50 shadow-sm'
    }`}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Crown size={120} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-6 mb-8">
          <div className={`w-20 h-20 rounded-none border-4 flex items-center justify-center text-4xl font-black shadow-2xl ${
            isDarkMode ? 'bg-gray-900 border-blue-500 text-blue-400' : 'bg-white border-blue-600 text-blue-600'
          }`}>
            {levelData.level}
          </div>
          <div>
            <h3 className={`text-3xl font-black uppercase tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {t('userProfile.level')} {levelData.level}
            </h3>
            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {levelData.xpToNextLevel} {t('userProfile.xpToNext')} {levelData.level + 1}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
              {t('userProfile.progress')}
            </span>
            <span className={`text-lg font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {levelData.progress}%
            </span>
          </div>
          <div className={`w-full h-3 rounded-none border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'} overflow-hidden`}>
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out relative"
              style={{ width: `${levelData.progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
        
        {/* Challenges Stats - Simplified */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-none border ${isDarkMode ? 'bg-gray-900/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'}`}>
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
              {t('userProfile.challengesToday')}
            </p>
            <div className="flex items-center gap-2">
              <FaAward className="text-green-500" />
              <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{challengesCompleted.today}</span>
            </div>
          </div>
          <div className={`p-4 rounded-none border ${isDarkMode ? 'bg-gray-900/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'}`}>
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
              {t('userProfile.challengesTotal')}
            </p>
            <div className="flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{challengesCompleted.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelXPProgress;
