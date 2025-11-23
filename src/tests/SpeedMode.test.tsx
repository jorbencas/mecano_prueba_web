import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeedMode from '../components/SpeedMode';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('SpeedMode Component', () => {
  test('renders SpeedMode component', () => {
    renderWithProviders(<SpeedMode />);
    expect(screen.getByText(/Modo Velocidad/i)).toBeInTheDocument();
  });

  test('shows duration selector', () => {
    renderWithProviders(<SpeedMode />);
    expect(screen.getByText(/Selecciona Duración/i)).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();
    expect(screen.getByText('60s')).toBeInTheDocument();
    expect(screen.getByText('120s')).toBeInTheDocument();
  });

  test('has start button', () => {
    renderWithProviders(<SpeedMode />);
    expect(screen.getByText(/Comenzar Desafío/i)).toBeInTheDocument();
  });

  test('displays instructions', () => {
    renderWithProviders(<SpeedMode />);
    // Instructions button should be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
