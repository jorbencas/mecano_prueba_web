import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TypingArea from '../components/TypingArea';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        {component}
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('TypingArea Component', () => {
  test('renders text correctly', () => {
    renderWithProviders(
      <TypingArea
        text="Hello World"
        currentIndex={0}
      />
    );
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('e')).toBeInTheDocument();
  });

  test('highlights current character', () => {
    renderWithProviders(
      <TypingArea
        text="Hello"
        currentIndex={1}
      />
    );
    // 'e' is at index 1
    const charElement = screen.getByText('e');
    expect(charElement).toHaveClass('font-bold text-blue-500');
  });

  test('highlights typed characters', () => {
    renderWithProviders(
      <TypingArea
        text="Hello"
        currentIndex={2}
      />
    );
    // 'H' and 'e' are typed (indices 0 and 1)
    const hElement = screen.getByText('H');
    expect(hElement).toHaveClass('text-green-500');
  });

  test('displays stats when not standalone', () => {
    renderWithProviders(
      <TypingArea
        text="Hello"
        currentIndex={0}
        wpm={50}
        accuracy={90}
        errors={2}
      />
    );
    expect(screen.getByText(/WPM: 50/i)).toBeInTheDocument();
    expect(screen.getByText(/Precisión: 90%/i)).toBeInTheDocument();
    expect(screen.getByText(/Errores: 2/i)).toBeInTheDocument();
  });
});
