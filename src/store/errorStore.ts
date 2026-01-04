import { create } from 'zustand';

export type ErrorType = 'error' | 'warning' | 'info';

interface AppError {
  message: string | null;
  type: ErrorType;
  retryAction?: () => void;
}

interface ErrorState {
  error: AppError;
  errorHandlingEnabled: boolean;
  setError: (message: string, type?: ErrorType, retryAction?: () => void) => void;
  clearError: () => void;
  toggleErrorHandling: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  error: {
    message: null,
    type: 'error',
  },
  errorHandlingEnabled: true,
  setError: (message, type = 'error', retryAction) => 
    set({ error: { message, type, retryAction } }),
  clearError: () => 
    set({ error: { message: null, type: 'error' } }),
  toggleErrorHandling: () => 
    set((state) => ({ errorHandlingEnabled: !state.errorHandlingEnabled })),
}));
