import { useCallback } from 'react';
import { useErrorStore } from '@store/errorStore';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';

export const useErrorHandler = () => {
  const { error, setError, clearError, toggleErrorHandling, errorHandlingEnabled } = useErrorStore();
  const { t } = useDynamicTranslations();

  const handleError = useCallback((error: any, retryAction?: () => void) => {
    console.error('Handled error:', error);
    
    let message = t('errors.generic', 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.');
    
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }

    // Handle 401 Unauthorized (Session Expired)
    if (message.includes('401') || message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('expired')) {
      // We can't use useAuth here directly due to circular dependency if AuthProvider uses useErrorHandler
      // But we can clear localStorage and reload or use a custom event
      localStorage.removeItem('auth_token');
      window.location.href = '/login?expired=true';
      return;
    }

    setError(message, 'error', retryAction);
  }, [setError, t]);

  return { handleError, clearError, error: error, toggleErrorHandling, errorHandlingEnabled };
};

export const useError = useErrorHandler;
