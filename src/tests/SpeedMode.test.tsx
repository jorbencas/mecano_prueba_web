import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeedMode from '../components/SpeedMode';
import { ThemeProvider } from '@hooks/useTheme';
import { LanguageProvider } from '@hooks/useLanguage';

import { AuthProvider } from '../context/AuthContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('SpeedMode Component', () => {
  test('renders SpeedMode component', () => {
    renderWithProviders(<SpeedMode />);
    expect(screen.getByText(/Modo Velocidad/i)).toBeInTheDocument();
  });

  test('shows duration selector', () => {
    renderWithProviders(<SpeedMode />);
    expect(screen.getByRole('button', { name: '30s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '60s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '120s' })).toBeInTheDocument();
  });

  test('selects a duration', () => {
    renderWithProviders(<SpeedMode />);
    const duration60 = screen.getByRole('button', { name: '60s' });
    fireEvent.click(duration60);
    // The button should have active classes (e.g., bg-blue-500)
    expect(duration60).toHaveClass('bg-yellow-500');
  });

  test('starts challenge and shows countdown', () => {
    renderWithProviders(<SpeedMode />);
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton);
    expect(screen.getByText(/Detener/i)).toBeInTheDocument();
  });

  test('completes challenge when timer reaches zero', async () => {
    jest.useFakeTimers();
    renderWithProviders(<SpeedMode />);
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton); // Start the challenge
    
    // Advance timers and system time
    act(() => {
      jest.advanceTimersByTime(35000);
    });
    
    // Run all pending timers to ensure handleStop is called
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      // Feedback for low speed in SpeedMode is "Sigue practicando para mejorar tu velocidad"
      expect(screen.getByText(/Sigue practicando para mejorar tu velocidad/i)).toBeInTheDocument();
      expect(screen.getByText(/Rendimiento/i)).toBeInTheDocument();
    }, { timeout: 10000 });
    
    jest.useRealTimers();
  });
});
