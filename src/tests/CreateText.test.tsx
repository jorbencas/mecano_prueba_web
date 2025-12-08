import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateText from '../components/CreateText';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

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
    
    expect(screen.getByText(/Crear Texto/i)).toBeInTheDocument();
  });

  it('displays level selector', () => {
    renderWithProviders(<CreateText />);
    
    // Should have level buttons or selector
    const levelButtons = screen.getAllByRole('button');
    expect(levelButtons.length).toBeGreaterThan(0);
  });

  it('shows typing area', () => {
    renderWithProviders(<CreateText />);
    
    // TypingArea component should be rendered
    const typingArea = document.querySelector('.typing-area, [class*="typing"]');
    expect(typingArea).toBeTruthy();
  });

  it('displays keyboard component', () => {
    renderWithProviders(<CreateText />);
    
    // Keyboard should be visible
    const keyboard = document.querySelector('[class*="keyboard"]');
    expect(keyboard).toBeTruthy();
  });
});
