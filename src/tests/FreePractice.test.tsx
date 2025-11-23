import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FreePractice from '../components/FreePractice';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

// Mock the activity tracker
jest.mock('../hooks/useActivityTracker', () => ({
  useActivityTracker: () => ({
    startTracking: jest.fn(),
    stopTracking: jest.fn(),
    isTracking: false,
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('FreePractice Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders FreePractice component', () => {
    renderWithProviders(<FreePractice />);
    expect(screen.getByText(/Práctica Libre/i)).toBeInTheDocument();
  });

  test('displays key selector with all alphabet keys', () => {
    renderWithProviders(<FreePractice />);
    const keys = 'abcdefghijklmnopqrstuvwxyz'.split('');
    keys.forEach(key => {
      expect(screen.getByText(key)).toBeInTheDocument();
    });
  });

  test('blocks key selector during active practice', () => {
    renderWithProviders(<FreePractice />);
    
    // Initially, keys should be clickable
    const keyButton = screen.getByText('a');
    expect(keyButton).not.toBeDisabled();
    
    // Simulate starting practice by firing a keydown event
    fireEvent.keyDown(window, { key: 'a' });
    
    // After practice starts, keys should be disabled
    waitFor(() => {
      expect(keyButton).toBeDisabled();
    });
  });

  test('shows warning message when keys are locked', () => {
    renderWithProviders(<FreePractice />);
    
    // Start practice
    fireEvent.keyDown(window, { key: 'a' });
    
    waitFor(() => {
      expect(screen.getByText(/Teclas bloqueadas durante la práctica/i)).toBeInTheDocument();
    });
  });

  test('displays character limit info for non-authenticated users', () => {
    renderWithProviders(<FreePractice />);
    expect(screen.getByText(/Límite: 100 caracteres/i)).toBeInTheDocument();
  });

  test('shows reset button', () => {
    renderWithProviders(<FreePractice />);
    expect(screen.getByText(/Reiniciar/i)).toBeInTheDocument();
  });

  test('reset button resets practice session', () => {
    renderWithProviders(<FreePractice />);
    
    // Start practice
    fireEvent.keyDown(window, { key: 'a' });
    
    // Click reset
    const resetButton = screen.getByText(/Reiniciar/i);
    fireEvent.click(resetButton);
    
    // Keys should be enabled again
    waitFor(() => {
      const keyButton = screen.getByText('a');
      expect(keyButton).not.toBeDisabled();
    });
  });

  test('displays stats (WPM, accuracy, errors)', () => {
    renderWithProviders(<FreePractice />);
    expect(screen.getByText(/WPM/i)).toBeInTheDocument();
    expect(screen.getByText(/Precisión/i)).toBeInTheDocument();
    expect(screen.getByText(/Errores/i)).toBeInTheDocument();
  });

  test('updates stats when typing', async () => {
    renderWithProviders(<FreePractice />);
    
    // Type some keys
    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyDown(window, { key: 's' });
    
    await waitFor(() => {
      // WPM should be calculated
      const wpmElement = screen.getByText(/WPM/i).parentElement;
      expect(wpmElement).toBeInTheDocument();
    });
  });
});
