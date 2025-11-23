import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Leaderboard from '../components/Leaderboard';
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

describe('Leaderboard Component', () => {
  test('renders Leaderboard component', () => {
    renderWithProviders(<Leaderboard />);
    expect(screen.getByText(/Clasificación/i)).toBeInTheDocument();
  });

  test('has category filters', () => {
    renderWithProviders(<Leaderboard />);
    expect(screen.getByText(/Por WPM/i)).toBeInTheDocument();
    expect(screen.getByText(/Por Precisión/i)).toBeInTheDocument();
  });

  test('displays table headers', () => {
    renderWithProviders(<Leaderboard />);
    expect(screen.getByText(/Puesto/i)).toBeInTheDocument();
    expect(screen.getByText(/Nombre/i)).toBeInTheDocument();
  });
});
