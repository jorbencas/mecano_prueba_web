import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaLock } from 'react-icons/fa';

interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  locked?: boolean;
  color?: string; // Tailwind color class prefix, e.g., 'blue', 'green'
}

const NavigationCard: React.FC<NavigationCardProps> = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  locked = false,
  color = 'blue'
}) => {
  const { isDarkMode } = useTheme();

  const baseClasses = `
    relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer
    border-2
  `;

  const themeClasses = isDarkMode
    ? `bg-gray-800 border-gray-700 hover:border-${color}-500`
    : `bg-white border-gray-100 hover:border-${color}-500 shadow-md`;

  const iconContainerClasses = `
    w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl
    ${isDarkMode ? `bg-gray-700 text-${color}-400` : `bg-${color}-50 text-${color}-600`}
  `;

  return (
    <div 
      onClick={locked ? undefined : onClick}
      className={`${baseClasses} ${themeClasses} ${locked ? 'opacity-75 cursor-not-allowed grayscale' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className={iconContainerClasses}>
          {icon}
        </div>
        {locked && <FaLock className="text-gray-400" />}
      </div>
      
      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {description}
      </p>

      {/* Decorative background element */}
      <div className={`
        absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5
        ${isDarkMode ? 'bg-white' : `bg-${color}-500`}
      `} />
    </div>
  );
};

export default NavigationCard;
