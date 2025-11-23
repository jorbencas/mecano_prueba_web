import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrecisionMode from '../components/PrecisionMode';
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

describe('PrecisionMode Component', () => {
  test('renders PrecisionMode component', () => {
    renderWithProviders(<PrecisionMode />);
    expect(screen.getByText(/Modo Precisión/i)).toBeInTheDocument();
  });

  test('displays accuracy stats', () => {
    renderWithProviders(<PrecisionMode />);
    expect(screen.getByText(/Precisión/i)).toBeInTheDocument();
    expect(screen.getByText(/Errores/i)).toBeInTheDocument();
  });

  test('shows text to type', () => {
    renderWithProviders(<PrecisionMode />);
    // Text should be displayed
    const textElements = screen.getAllByText(/the/i);
    expect(textElements.length).toBeGreaterThan(0);
  });
});
