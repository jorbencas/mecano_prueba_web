import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsConfiguration from '../components/SettingsConfiguration';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ThemeProvider>
);

describe('SettingsConfiguration Component', () => {
  it('renders login message when not authenticated', () => {
    render(
      <Wrapper>
        <SettingsConfiguration />
      </Wrapper>
    );

    expect(screen.getByText(/Debes iniciar sesión para configurar tus preferencias/i)).toBeInTheDocument();
  });
});
