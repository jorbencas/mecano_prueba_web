import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LevelCreator from '../components/LevelCreator';
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

describe('LevelCreator Component', () => {
  test('renders LevelCreator component', () => {
    renderWithProviders(<LevelCreator />);
    expect(screen.getByText(/Creador de Niveles/i)).toBeInTheDocument();
  });

  test('shows configuration panel', () => {
    renderWithProviders(<LevelCreator />);
    expect(screen.getByText(/Configuración/i)).toBeInTheDocument();
    expect(screen.getByText(/Nombre del Nivel/i)).toBeInTheDocument();
  });

  test('displays key selector', () => {
    renderWithProviders(<LevelCreator />);
    expect(screen.getByText(/Selecciona Teclas/i)).toBeInTheDocument();
  });

  test('has save and export buttons', () => {
    renderWithProviders(<LevelCreator />);
    expect(screen.getByText(/Guardar/i)).toBeInTheDocument();
    expect(screen.getByText(/Exportar/i)).toBeInTheDocument();
  });
});
