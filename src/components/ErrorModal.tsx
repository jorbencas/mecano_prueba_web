import React from 'react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, children }) => {
  
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
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div 
        className="modal-backdrop fixed inset-0 bg-black opacity-50" 
        onClick={handleBackdropClick}
      ></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative z-100">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
        <div >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;