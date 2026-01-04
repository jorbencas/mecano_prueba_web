import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { useUserStore } from '@/store/userStore';

const RecentActivity: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const { recentActivities } = useUserStore();

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`p-6 rounded-none border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
      <h2 className={`text-lg font-black uppercase tracking-tight mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {t('profile.recentActivity')}
      </h2>
      {recentActivities.length === 0 ? (
        <p className={`text-sm font-medium opacity-50 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('profile.noActivity')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
                <th className="p-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{t('profile.date')}</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{t('profile.component')}</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{t('profile.wpm')}</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-right">{t('profile.accuracy')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700/30' : 'divide-gray-100'}`}>
              {recentActivities.slice(0, 5).map((activity) => (
                <tr key={activity.id} className="group transition-colors hover:bg-white/5">
                  <td className="p-3 text-[11px] font-medium opacity-70">{formatDate(activity.timestamp)}</td>
                  <td className="p-3 text-sm font-black uppercase tracking-tight">{activity.component}</td>
                  <td className="p-3 text-sm font-black text-blue-500">{activity.metadata?.wpm || '-'}</td>
                  <td className="p-3 text-sm font-black text-right text-green-500">
                    {activity.metadata?.accuracy ? `${activity.metadata.accuracy}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
