import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { TrendingUp } from 'lucide-react';
import HeatMap from '../HeatMap';

const ActivityHeatmap: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  return (
    <div className={`p-6 rounded-none border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
      <h2 className={`text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <TrendingUp size={20} className="text-blue-500" />
        {t('userProfile.activityHeatmap', 'Mapa de Actividad')}
      </h2>
      <div className="overflow-x-auto">
        <HeatMap />
      </div>
    </div>
  );
};

export default ActivityHeatmap;
