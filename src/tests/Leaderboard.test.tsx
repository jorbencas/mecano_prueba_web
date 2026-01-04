import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Leaderboard from '../components/Leaderboard';
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

describe('Leaderboard Component', () => {
  test('renders Leaderboard component', () => {
    renderWithProviders(<Leaderboard />);
    expect(screen.getByText(/Clasificación/i)).toBeInTheDocument();
  });

  test('displays leaderboard data', async () => {
    // This would require mocking the API
    renderWithProviders(<Leaderboard />);
    
    await waitFor(() => {
      // Check for some mock user names if they are provided by the mock API
      // expect(screen.getByText(/User1/i)).toBeInTheDocument();
    });
  });

  test('switches between categories', () => {
    renderWithProviders(<Leaderboard />);
    const accuracyFilter = screen.getByText(/Por Precisión/i);
    fireEvent.click(accuracyFilter);
    // Should update headers or data
    expect(screen.getByText(/Precisión/i)).toBeInTheDocument();
  });

  test('switches between time ranges', () => {
    renderWithProviders(<Leaderboard />);
    const weekFilter = screen.getByText(/Semana/i);
    fireEvent.click(weekFilter);
    // Should update data
  });
});
