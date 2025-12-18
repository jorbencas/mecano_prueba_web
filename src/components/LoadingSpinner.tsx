import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  inline?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message, 
  inline = false 
}) => {
  const { isDarkMode } = useTheme();

  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          ease: "linear",
          repeat: Infinity,
        }}
        className={`${sizeClasses[size]} border-t-transparent rounded-full ${
          isDarkMode ? 'border-blue-500' : 'border-blue-600'
        }`}
      />
      {message && (
        <p className={`text-xs font-black uppercase tracking-widest ${
          isDarkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {message}
        </p>
      )}
    </div>
  );

  if (inline) return spinner;

  return (
    <div className="flex items-center justify-center p-8 w-full h-full min-h-[100px]">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
