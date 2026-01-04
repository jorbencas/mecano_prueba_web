import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RaceMode from '../components/RaceMode';
import { ThemeProvider } from '@hooks/useTheme';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '@hooks/useLanguage';
import { MultiplayerProvider } from '../context/MultiplayerContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <MultiplayerProvider>{component}</MultiplayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('RaceMode', () => {
  it('renders component', () => {
    renderWithProviders(<RaceMode />);
    
    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('shows race mode title or interface', () => {
    renderWithProviders(<RaceMode />);
    
    // Should have some race-related text
    const raceElements = screen.queryAllByText(/race|carrera/i);
    expect(raceElements.length).toBeGreaterThan(0);
  });
});
