import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Achievements from '../components/Achievements';
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

describe('Achievements Component', () => {
  test('renders Achievements component', () => {
    renderWithProviders(<Achievements />);
    expect(screen.getByText(/Logros/i)).toBeInTheDocument();
  });

  test('displays achievement progress', () => {
    renderWithProviders(<Achievements />);
    // Should show unlocked count
    expect(screen.getByText(/Logros Desbloqueados/i)).toBeInTheDocument();
  });

  test('has filter buttons', () => {
    renderWithProviders(<Achievements />);
    expect(screen.getByText(/all/i)).toBeInTheDocument();
    expect(screen.getByText(/unlocked/i)).toBeInTheDocument();
    expect(screen.getByText(/locked/i)).toBeInTheDocument();
  });
});
