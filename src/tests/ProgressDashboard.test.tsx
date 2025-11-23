import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressDashboard from '../components/ProgressDashboard';
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

describe('ProgressDashboard Component', () => {
  test('renders ProgressDashboard component', () => {
    renderWithProviders(<ProgressDashboard />);
    expect(screen.getByText(/Panel de Progreso/i)).toBeInTheDocument();
  });

  test('displays summary cards', () => {
    renderWithProviders(<ProgressDashboard />);
    expect(screen.getByText(/WPM Promedio/i)).toBeInTheDocument();
    expect(screen.getByText(/Mejor WPM/i)).toBeInTheDocument();
    expect(screen.getByText(/Precisión Promedio/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiempo Total/i)).toBeInTheDocument();
  });

  test('shows charts', () => {
    renderWithProviders(<ProgressDashboard />);
    expect(screen.getByText(/Progreso de WPM/i)).toBeInTheDocument();
    expect(screen.getByText(/Progreso de Precisión/i)).toBeInTheDocument();
  });

  test('displays history table', () => {
    renderWithProviders(<ProgressDashboard />);
    expect(screen.getByText(/Historial de Sesiones/i)).toBeInTheDocument();
  });

  test('has filter dropdown', () => {
    renderWithProviders(<ProgressDashboard />);
    expect(screen.getByText(/Filtrar por/i)).toBeInTheDocument();
  });
});
