import React from 'react';
import { render, screen } from '@testing-library/react';
import Settings from '../components/Settings';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';

const renderSettings = (onNavigate = jest.fn()) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AccessibilityProvider>
            <Settings onNavigate={onNavigate} />
          </AccessibilityProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('Settings Component', () => {
  it('renders settings title', () => {
    renderSettings();
    expect(screen.getByText(/Configuración/i)).toBeInTheDocument();
  });

  it('renders theme toggle buttons', () => {
    renderSettings();
    expect(screen.getByText(/Claro/i)).toBeInTheDocument();
    expect(screen.getByText(/Oscuro/i)).toBeInTheDocument();
  });

  it('renders language selector', () => {
    renderSettings();
    expect(screen.getByText(/Idioma/i)).toBeInTheDocument();
  });

  it('renders accessibility section', () => {
    renderSettings();
    expect(screen.getByText(/Accesibilidad/i)).toBeInTheDocument();
  });
});
