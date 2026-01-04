import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { FaTimes } from 'react-icons/fa';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, children }) => {
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
      <div className={`relative p-6 rounded-lg shadow-xl z-50 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        {/* Close button - top right */}
        <div
          onClick={onClose}
          className={`absolute top-4 right-4 cursor-pointer text-2xl transition-colors ${
            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
          }`}
          aria-label="Cerrar"
        >
          <FaTimes />
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default BaseModal;