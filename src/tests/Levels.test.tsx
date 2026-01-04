import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Levels from '../components/Levels';
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

describe('Levels Component', () => {
  test('renders Levels component', () => {
    renderWithProviders(<Levels />);
    // Should show stats bar with WPM
    expect(screen.getAllByText(/WPM/i).length).toBeGreaterThan(0);
  });

  test('displays level menu', () => {
    renderWithProviders(<Levels />);
    // MenuLevels should be present (sidebar)
    const menuButtons = screen.getAllByRole('button');
    expect(menuButtons.length).toBeGreaterThan(0);
  });

  test('tracks WPM and accuracy', () => {
    renderWithProviders(<Levels />);
    expect(screen.getAllByText(/WPM/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Precisión/i).length).toBeGreaterThan(0);
  });

  test('has start button', () => {
    renderWithProviders(<Levels />);
    // Start button should be present
    expect(screen.getByText(/Comenzar/i)).toBeInTheDocument();
  });

  test('changes levels using the sidebar', async () => {
    renderWithProviders(<Levels />);
    
    // Find level 2 in the sidebar and click it
    const level2Item = screen.getByText(/Nivel 2: Introducción a las letras/i);
    fireEvent.click(level2Item);
    
    // Check if the title updates
    await waitFor(() => {
      expect(screen.getByText(/Nivel 2/i)).toBeInTheDocument();
    });
  });

  test('completes a level and shows stats modal', async () => {
    renderWithProviders(<Levels />);
    
    // Get initial text
    const typingArea = screen.getByRole('paragraph');
    const text = typingArea.textContent || '';
    
    // Start level
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton);
    
    // Type all characters correctly
    for (const char of text) {
      fireEvent.keyDown(window, { key: char });
    }
    
    // Stats modal should appear
    await waitFor(() => {
      expect(screen.getByText(/¡Nivel completado con éxito!/i)).toBeInTheDocument();
      expect(screen.getByText(/Repetir Nivel/i)).toBeInTheDocument();
      expect(screen.getByText(/Siguiente Nivel/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
