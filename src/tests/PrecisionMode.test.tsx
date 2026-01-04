import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrecisionMode from '../components/PrecisionMode';
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

describe('PrecisionMode Component', () => {
  test('renders PrecisionMode component', () => {
    renderWithProviders(<PrecisionMode />);
    expect(screen.getByText(/Modo Precisión/i)).toBeInTheDocument();
  });

  test('displays accuracy stats', () => {
    renderWithProviders(<PrecisionMode />);
    expect(screen.getAllByText(/Precisión/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Errores/i).length).toBeGreaterThan(0);
  });

  test('has start button', () => {
    renderWithProviders(<PrecisionMode />);
    expect(screen.getByText(/Comenzar/i)).toBeInTheDocument();
  });

  test('starts challenge and tracks errors', async () => {
    renderWithProviders(<PrecisionMode />);
    
    // Start challenge
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton);
    
    // Type a wrong key
    fireEvent.keyDown(window, { key: 'z' });
    
    await waitFor(() => {
      // Errors should be 1
      const errorElements = screen.getAllByText(/1/);
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  test('shows results after stopping', async () => {
    renderWithProviders(<PrecisionMode />);
    
    // Start challenge
    fireEvent.click(screen.getByText(/Comenzar/i));
    
    // Stop challenge
    fireEvent.click(screen.getByText(/Detener/i));
    
    await waitFor(() => {
      expect(screen.getByText(/Rendimiento/i)).toBeInTheDocument();
    });
  });
});
