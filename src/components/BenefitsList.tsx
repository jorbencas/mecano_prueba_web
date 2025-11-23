import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface BenefitsListProps {
  compact?: boolean;
}

const BenefitsList: React.FC<BenefitsListProps> = ({ compact = false }) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  const benefits = [
    { key: 'benefit1', text: t('login.benefit1', 'Guarda tu progreso y estadísticas') },
    { key: 'benefit2', text: t('login.benefit2', 'Compite en la clasificación global') },
    { key: 'benefit3', text: t('login.benefit3', 'Desbloquea logros y medallas') },
    { key: 'benefit4', text: t('login.benefit4', 'Accede desde cualquier dispositivo') },
    { key: 'benefit5', text: t('login.benefit5', 'Crea niveles y textos personalizados') },
  ];

  return (
    <div className={`${compact ? 'p-4' : 'p-6'} rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <h3 className={`font-bold ${compact ? 'mb-3' : 'mb-4'} ${compact ? 'text-base' : 'text-lg'} ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {t('login.benefits', 'Beneficios de registrarte')}:
      </h3>
      <ul className={`space-y-${compact ? '2' : '3'} ${compact ? 'text-sm' : ''}`}>
        {benefits.map(benefit => (
          <li key={benefit.key} className="flex items-start gap-2">
            <span className={`text-green-500 ${compact ? 'mt-0.5' : 'mt-1'}`}>✓</span>
            <span className={isDarkMode ? 'text-gray-200' : compact ? 'text-gray-700' : 'text-gray-800'}>
              {benefit.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BenefitsList;
