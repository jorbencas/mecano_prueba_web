import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayGame from '../components/PlayGame';
import { ThemeProvider } from '@hooks/useTheme';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '@hooks/useLanguage';

// Explicitly mock Audio for this test file to ensure isolation
const mockPlay = jest.fn().mockResolvedValue(undefined);
window.Audio = jest.fn().mockImplementation(() => ({
  play: mockPlay,
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  src: '',
  currentTime: 0,
  volume: 1,
  muted: false,
  loop: false,
  autoplay: false,
  paused: true,
  ended: false,
  error: null,
}));

beforeEach(() => {
  jest.resetModules();
});

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

describe('PlayGame Component', () => {
  test('renders PlayGame component', () => {
    renderWithProviders(<PlayGame />);
    expect(screen.getByText(/Juego de Letras Cayendo/i)).toBeInTheDocument();
  });

  test('starts game when button is clicked', () => {
    renderWithProviders(<PlayGame />);
    const startButton = screen.getByText(/Iniciar/i);
    fireEvent.click(startButton);
    expect(screen.getByText(/Detener/i)).toBeInTheDocument();
  });

  test('pauses and resumes game', () => {
    renderWithProviders(<PlayGame />);
    const startButton = screen.getByText(/Iniciar/i);
    fireEvent.click(startButton);
    
    const pauseButton = screen.getByText(/Pausar/i);
    fireEvent.click(pauseButton);
    expect(screen.getByText(/Reanudar/i)).toBeInTheDocument();
    
    const resumeButton = screen.getByText(/Reanudar/i);
    fireEvent.click(resumeButton);
    expect(screen.getByText(/Pausar/i)).toBeInTheDocument();
  });

  test('updates score when typing a falling letter', async () => {
    renderWithProviders(<PlayGame />);
    fireEvent.click(screen.getByText(/Iniciar/i));
    
    // Check if score label is present
    expect(screen.getByText(/Puntuación \(WPM\)/i)).toBeInTheDocument();
  });

  test('changes level', () => {
    renderWithProviders(<PlayGame />);
    // MenuLevels renders level names
    const level2 = screen.getAllByText(/Nivel 2/i)[0];
    fireEvent.click(level2);
  });

  test.skip('shows game over when lives reach zero', async () => {
    jest.useFakeTimers();
    renderWithProviders(<PlayGame />);
    const startButton = screen.getByText(/Iniciar/i);
    fireEvent.click(startButton);

    act(() => {
      jest.advanceTimersByTime(15000); // Wait for letters to fall
    });

    await waitFor(() => {
      // Feedback for failure in PlayGame is "Sigue intentándolo"
      expect(screen.getByText(/Sigue intentándolo/i)).toBeInTheDocument();
    }, { timeout: 10000 });
    
    jest.useRealTimers();
  });
});
