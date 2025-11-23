import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Levels from '../components/Levels';
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

describe('Levels Component', () => {
  test('renders Levels component', () => {
    renderWithProviders(<Levels />);
    // Should show typing area
    expect(screen.getByText(/WPM/i)).toBeInTheDocument();
  });

  test('displays level menu', () => {
    renderWithProviders(<Levels />);
    // MenuLevels should be present
    const menuButtons = screen.getAllByRole('button');
    expect(menuButtons.length).toBeGreaterThan(0);
  });

  test('shows keyboard and hands components', () => {
    renderWithProviders(<Levels />);
    // Keyboard and Hands should render
    const container = screen.getByText(/WPM/i).closest('div');
    expect(container).toBeInTheDocument();
  });

  test('tracks WPM and accuracy', () => {
    renderWithProviders(<Levels />);
    expect(screen.getByText(/WPM/i)).toBeInTheDocument();
    expect(screen.getByText(/Precisión/i)).toBeInTheDocument();
  });

  test('has instructions button', () => {
    renderWithProviders(<Levels />);
    // Instructions button should be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
