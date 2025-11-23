import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayGame from '../components/PlayGame';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

// Mock audio
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());

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

describe('PlayGame Component', () => {
  test('renders PlayGame component', () => {
    renderWithProviders(<PlayGame />);
    expect(screen.getByText(/Juego de Letras Cayendo/i)).toBeInTheDocument();
  });

  test('shows start button', () => {
    renderWithProviders(<PlayGame />);
    expect(screen.getByText(/Iniciar/i)).toBeInTheDocument();
  });

  test('starts game when start button is clicked', () => {
    renderWithProviders(<PlayGame />);
    const startButton = screen.getByText(/Iniciar/i);
    fireEvent.click(startButton);
    expect(screen.getByText(/Detener/i)).toBeInTheDocument();
  });

  test('pauses game', () => {
    renderWithProviders(<PlayGame />);
    const startButton = screen.getByText(/Iniciar/i);
    fireEvent.click(startButton);
    
    const pauseButton = screen.getByText(/Pausar/i);
    fireEvent.click(pauseButton);
    
    expect(screen.getByText(/Reanudar/i)).toBeInTheDocument();
  });

  test('stops game', () => {
    renderWithProviders(<PlayGame />);
    const startButton = screen.getByText(/Iniciar/i);
    fireEvent.click(startButton);
    
    const stopButton = screen.getByText(/Detener/i);
    fireEvent.click(stopButton);
    
    expect(screen.getByText(/Iniciar/i)).toBeInTheDocument();
  });
});
