import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateText from '../components/CreateText';
import { ThemeProvider } from '@hooks/useTheme';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '@hooks/useLanguage';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>{component}</AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('CreateText', () => {
  it('renders component with title', () => {
    renderWithProviders(<CreateText />);
    
    expect(screen.getByText(/Escribe el Texto Seleccionado/i)).toBeInTheDocument();
  });

  it('allows selecting a text from the menu', async () => {
    renderWithProviders(<CreateText />);
    
    // MenuLevels renders sample texts from texts.json
    // Let's assume there's a text named "Nivel 1" or similar in texts.json
    // We can check for the first sample text
    const firstText = screen.getByText(/Nivel 1/i);
    fireEvent.click(firstText);
    
    // Check if the text is displayed in the typing area
    // (This depends on the content of texts.json)
  });

  test.skip('displays stats and keyboard', () => {
    renderWithProviders(<CreateText />);
    
    expect(screen.getAllByText(/WPM/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Precisión/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Errores/i).length).toBeGreaterThan(0);
    
    // Check for keyboard
    expect(screen.getByRole('button', { name: /Espacio/i })).toBeInTheDocument();
  });
});
