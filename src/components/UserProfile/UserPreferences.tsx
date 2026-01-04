import React from 'react';
import { useUIStore } from '@store/uiStore';
import { useAuth } from '@context/AuthContext';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { FaGlobe } from 'react-icons/fa';

const UserPreferences: React.FC = () => {
  const { language, setLanguage, isDarkMode } = useUIStore();
  const { updateUser } = useAuth();
  const { t } = useDynamicTranslations();

  return (
    <div className={`p-6 rounded-none border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-white/50 shadow-sm'}`}>
      <h2 className={`text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <FaGlobe size={20} className="text-blue-500" />
        {t('userProfile.preferences')}
      </h2>
      
      <div className="max-w-md space-y-6">
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('profile.language')}
          </label>
          <select
            value={language}
            onChange={async (e) => {
              const newLang = e.target.value as any;
              setLanguage(newLang);
              try {
                await updateUser({ language: newLang } as any);
              } catch (error) {
                console.error('Failed to update language in profile:', error);
              }
            }}
            className={`w-full px-4 py-2 rounded-none border ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'
            }`}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="ca">Català</option>
            <option value="va">Valencià</option>
          </select>
          <p className="mt-2 text-[10px] opacity-50 italic">
            {t('profile.languageNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
