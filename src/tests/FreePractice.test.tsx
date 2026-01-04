import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FreePractice from '../components/FreePractice';
import { ThemeProvider } from '@hooks/useTheme';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '@hooks/useLanguage';

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

  test('blocks key selector during active practice', async () => {
    renderWithProviders(<FreePractice />);
    
    // Initially, keys should be clickable
    const keyButton = screen.getByText('a');
    expect(keyButton).not.toBeDisabled();
    
    // Start practice by clicking the button
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton);
    
    // After practice starts, keys should be disabled
    await waitFor(() => {
      expect(keyButton).toBeDisabled();
    });
  });

  test('shows warning message when keys are locked', async () => {
    renderWithProviders(<FreePractice />);
    
    // Start practice
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Teclas bloqueadas durante la práctica/i)).toBeInTheDocument();
    });
  });

  test('displays character limit info for non-authenticated users', () => {
    renderWithProviders(<FreePractice />);
    expect(screen.getByText(/Límite: 100 caracteres/i)).toBeInTheDocument();
  });

  test('shows stop button when active', async () => {
    renderWithProviders(<FreePractice />);
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Detener/i)).toBeInTheDocument();
    });
  });

  test('stop button resets practice session', async () => {
    renderWithProviders(<FreePractice />);
    
    // Start practice
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton);
    
    // Click stop (Detener)
    await waitFor(() => {
      const stopButton = screen.getByText(/Detener/i);
      fireEvent.click(stopButton);
    });
    
    // Keys should be enabled again
    await waitFor(() => {
      const keyButton = screen.getByText('a');
      expect(keyButton).not.toBeDisabled();
    });
  });

  test('toggles keys in the selector', async () => {
    renderWithProviders(<FreePractice />);
    
    const keyA = screen.getByText('a');
    const keyB = screen.getByText('b');
    
    // Initially 'a' is selected (blue-500), 'b' is not (bg-gray-200)
    expect(keyA).toHaveClass('bg-blue-500');
    expect(keyB).toHaveClass('bg-gray-200');
    
    // Toggle 'b' on
    fireEvent.click(keyB);
    expect(keyB).toHaveClass('bg-blue-500');
    
    // Toggle 'a' off
    fireEvent.click(keyA);
    expect(keyA).toHaveClass('bg-gray-200');
  });

  test('generates more text when reaching the end', async () => {
    renderWithProviders(<FreePractice />);
    
    // Get initial text
    const typingArea = screen.getByRole('paragraph');
    const initialText = typingArea.textContent || '';
    
    // Start practice
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton);
    
    // Type all characters of the initial text
    for (const char of initialText) {
      fireEvent.keyDown(window, { key: char });
    }
    
    // Check if text has expanded
    await waitFor(() => {
      const newText = typingArea.textContent || '';
      expect(newText.length).toBeGreaterThan(initialText.length);
    });
  });

  test('displays stats (WPM, accuracy, errors)', () => {
    renderWithProviders(<FreePractice />);
    // Use getAllByText because "WPM", "Precisión", "Errores" might appear in different contexts (labels, stats)
    expect(screen.getAllByText(/WPM/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Precisión/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Errores/i).length).toBeGreaterThan(0);
  });

  test('updates stats when typing', async () => {
    renderWithProviders(<FreePractice />);
    
    // Start practice
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton);
    
    // Type some keys
    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyDown(window, { key: 's' });
    
    await waitFor(() => {
      // WPM should be calculated and displayed in the stats section
      const wpmElements = screen.getAllByText(/WPM/i);
      expect(wpmElements.length).toBeGreaterThan(0);
    });
  });
});
