import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, children }) => {
  const { isDarkMode } = useTheme();
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="modal-backdrop fixed inset-0 bg-black opacity-50" 
        onClick={handleBackdropClick}
      ></div>
       <div className={`p-6 rounded-lg shadow-xl z-50  ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        {children}
        <button
           className={`mt-4 px-4 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;