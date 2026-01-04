import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useTheme } from '@hooks/useTheme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
  duration?: number;
  type?: ToastType;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  isVisible,
  onClose,
  onAction,
  actionLabel,
  duration = 5000,
  type = 'info'
}) => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheckCircle />,
          color: 'text-green-500',
          bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
          border: 'border-green-500/20'
        };
      case 'error':
        return {
          icon: <FaExclamationCircle />,
          color: 'text-red-500',
          bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
          border: 'border-red-500/20'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle />,
          color: 'text-yellow-500',
          bg: isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50',
          border: 'border-yellow-500/20'
        };
      default:
        return {
          icon: <FaInfoCircle />,
          color: 'text-blue-500',
          bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
          border: 'border-blue-500/20'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`fixed bottom-6 right-6 z-[100] p-4 rounded-none border backdrop-blur-md flex items-center gap-4 max-w-md shadow-2xl ${
            isDarkMode 
              ? 'bg-gray-900/90 border-gray-700/50 text-white' 
              : 'bg-white/90 border-gray-200 text-gray-800'
          } ${styles.border}`}
        >
          <div className={`${styles.bg} ${styles.color} p-2.5 rounded-none text-xl`}>
            {styles.icon}
          </div>
          
          <div className="flex-1 pr-2">
            <p className="font-black uppercase tracking-tight text-xs mb-0.5">{type}</p>
            <p className="font-medium text-sm opacity-90">{message}</p>
          </div>

          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-none transition-all ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              {actionLabel}
            </button>
          )}

          <button
            onClick={onClose}
            className={`p-1.5 rounded-none transition-colors ${
              isDarkMode ? 'hover:bg-gray-800 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
            }`}
          >
            <FaTimes size={14} />
          </button>
          
          {/* Progress bar for auto-close */}
          {duration > 0 && (
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className={`absolute bottom-0 left-0 h-0.5 ${styles.color} opacity-50`}
              style={{ backgroundColor: 'currentColor' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;
