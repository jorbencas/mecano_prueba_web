import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { FaUser, FaChartLine, FaCog } from 'react-icons/fa';
import { useUserStore } from '@/store/userStore';

const ProfileTabs: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const { activeTab, setActiveTab } = useUserStore();

  return (
    <div className="flex justify-center mb-10">
      <div className={`flex p-1 rounded-none border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-8 py-2.5 font-black text-xs uppercase tracking-widest transition-all rounded-none ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-lg'
              : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
          }`}
        >
          <FaUser className="inline mr-2" />
          {t('userProfile.tabs.profile')}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-8 py-2.5 font-black text-xs uppercase tracking-widest transition-all rounded-none ${
            activeTab === 'stats'
              ? 'bg-blue-600 text-white shadow-lg'
              : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
          }`}
        >
          <FaChartLine className="inline mr-2" />
          {t('userProfile.tabs.stats')}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          aria-label={t('userProfile.tabs.settings')}
          className={`px-8 py-2.5 font-black text-xs uppercase tracking-widest transition-all rounded-none ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-lg'
              : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
          }`}
        >
          <FaCog className="inline mr-2" />
          {t('userProfile.tabs.settings')}
        </button>
      </div>
    </div>
  );
};

export default ProfileTabs;
