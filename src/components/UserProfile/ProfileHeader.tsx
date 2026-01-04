import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';

const ProfileHeader: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  return (
    <header className="mb-10 border-b border-blue-500/20 pb-6">
      <h1 className={`text-3xl md:text-4xl font-black tracking-tight uppercase leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {t('profile.title')}
      </h1>
    </header>
  );
};

export default ProfileHeader;
