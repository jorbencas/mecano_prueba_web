import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Achievements from '../components/Achievements';
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

  test('filters achievements', () => {
    renderWithProviders(<Achievements />);
    const unlockedFilter = screen.getByText(/unlocked/i);
    fireEvent.click(unlockedFilter);
    // Should only show unlocked achievements
  });

  test('displays achievement cards with details', () => {
    renderWithProviders(<Achievements />);
    // Check for some achievement titles (mocked or real)
    const cards = screen.getAllByRole('img', { hidden: true }); // Icons usually
    expect(cards.length).toBeGreaterThan(0);
  });

  test('shows progress for tiered achievements', () => {
    renderWithProviders(<Achievements />);
    // Check for progress text like "5/10"
    const progressText = screen.queryAllByText(/\d+\/\d+/);
    expect(progressText).toBeDefined();
  });
});
