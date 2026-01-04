import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressDashboard from '../components/ProgressDashboard';
import { ThemeProvider } from '@hooks/useTheme';
import { LanguageProvider } from '@hooks/useLanguage';

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

  test('switches between tabs', () => {
    renderWithProviders(<ProgressDashboard />);
    
    const analyticsTab = screen.getByText(/Análisis/i);
    fireEvent.click(analyticsTab);
    expect(screen.getByText(/Distribución de Errores/i)).toBeInTheDocument();
    
    const exportTab = screen.getByText(/Exportar/i);
    fireEvent.click(exportTab);
    expect(screen.getByText(/Descargar Datos/i)).toBeInTheDocument();
  });

  test('filters history by time range', () => {
    renderWithProviders(<ProgressDashboard />);
    const filterSelect = screen.getByRole('combobox');
    fireEvent.change(filterSelect, { target: { value: '7d' } });
    expect(filterSelect).toHaveValue('7d');
  });

  test('renders charts with mock data', () => {
    // Recharts usually needs some mocking or specific setup to be tested in JSDOM
    renderWithProviders(<ProgressDashboard />);
    const wpmChart = screen.getByText(/Progreso de WPM/i);
    expect(wpmChart).toBeInTheDocument();
    // Check for SVG elements if Recharts renders them
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
