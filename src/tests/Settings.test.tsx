import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from '../components/Settings';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';

const renderSettings = (onShowLogin = jest.fn()) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Settings onShowLogin={onShowLogin} />
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

  it('shows login prompt when not authenticated', () => {
    renderSettings();
    expect(screen.getByText(/No has iniciado sesión/i)).toBeInTheDocument();
  });

  it('calls onShowLogin when login button is clicked', () => {
    const onShowLogin = jest.fn();
    renderSettings(onShowLogin);
    
    const loginButton = screen.getByText(/Iniciar Sesión \/ Registrarse/i);
    fireEvent.click(loginButton);
    
    expect(onShowLogin).toHaveBeenCalled();
  });

  it('renders theme toggle button', () => {
    renderSettings();
    expect(screen.getByText(/Modo Oscuro/i)).toBeInTheDocument();
  });

  it('renders language selector', () => {
    renderSettings();
    expect(screen.getByText(/Idioma/i)).toBeInTheDocument();
  });
});
