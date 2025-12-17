import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBell } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

interface ToastNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
  duration?: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  isVisible,
  onClose,
  onAction,
  actionLabel,
  duration = 5000
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl border flex items-center gap-4 max-w-md ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          <div className="bg-blue-500 p-2 rounded-full text-white">
            <FaBell />
          </div>
          
          <div className="flex-1">
            <p className="font-medium text-sm">{message}</p>
          </div>

          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className={`text-sm font-bold px-3 py-1 rounded transition-colors ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
            >
              {actionLabel}
            </button>
          )}

          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <FaTimes size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;
