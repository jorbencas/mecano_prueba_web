import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { FaLock } from 'react-icons/fa';
import BenefitsList from '@/components/BenefitsList';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowLogin: () => void;
  featureName?: string;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  onShowLogin,
  featureName 
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`max-w-md w-full rounded-lg shadow-2xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <FaLock className="text-3xl text-blue-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">
            {t('registrationModal.title', 'Función Bloqueada')}
          </h2>
          
          {featureName && (
            <p className={`text-center mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('registrationModal.featureBlocked', `Para acceder a "${featureName}" necesitas estar registrado.`)}
            </p>
          )}

          {/* Benefits */}
          <div className="mt-6">
            <BenefitsList compact />
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                onClose();
                onShowLogin();
              }}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
            >
              {t('registrationModal.loginButton', 'Iniciar Sesión / Registrarse')}
            </button>
            <button
              onClick={onClose}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {t('registrationModal.cancel', 'Continuar sin registrarse')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
