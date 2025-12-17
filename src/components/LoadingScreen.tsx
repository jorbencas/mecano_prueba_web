import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          repeat: Infinity,
        }}
        className={`w-16 h-16 mb-4 border-4 border-t-transparent rounded-full ${isDarkMode ? 'border-blue-500' : 'border-blue-600'}`}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-xl font-semibold"
      >
        {message || t('common.loading', 'Cargando...')}
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
