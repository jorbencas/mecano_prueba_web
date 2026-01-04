import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { motion } from 'framer-motion';

interface UnifiedSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // optional custom color
}

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

const UnifiedSpinner: React.FC<UnifiedSpinnerProps> = ({ size = 'md', color }) => {
  const { isDarkMode } = useTheme();
  const borderColor = color || (isDarkMode ? 'border-blue-500' : 'border-blue-600');
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
      className={`${sizeMap[size]} border-t-transparent rounded-full ${borderColor}`}
    />
  );
};

export default UnifiedSpinner;
