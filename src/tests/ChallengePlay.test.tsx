import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChallengePlay from '../components/ChallengePlay';
import { ThemeProvider } from '@hooks/useTheme';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '@hooks/useLanguage';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('ChallengePlay Component', () => {
  const mockChallenge = {
    id: 1,
    title: 'Test Challenge',
    description: 'Test Description',
    text: 'abc',
    target_value: 40
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('active_challenge', JSON.stringify(mockChallenge));
  });

  test('renders ChallengePlay component with challenge data', async () => {
    renderWithProviders(<ChallengePlay onBack={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Challenge/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
    });
  });

  test('shows start button and instructions', async () => {
    renderWithProviders(<ChallengePlay onBack={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Comenzar/i)).toBeInTheDocument();
    });
  });

  test('starts challenge when clicking start', async () => {
    renderWithProviders(<ChallengePlay onBack={() => {}} />);
    
    await waitFor(() => {
      const startButton = screen.getByText(/Comenzar/i);
      fireEvent.click(startButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Detener/i)).toBeInTheDocument();
    });
  });

  test('handles a queue of multiple challenges', async () => {
    const mockQueue = [
      { id: 1, title: 'Challenge 1', text: 'abc' },
      { id: 2, title: 'Challenge 2', text: 'def' }
    ];
    localStorage.setItem('active_challenges_queue', JSON.stringify(mockQueue));
    
    renderWithProviders(<ChallengePlay onBack={() => {}} />);
    
    // Check first challenge
    await waitFor(() => {
      expect(screen.getByText(/Challenge 1/i)).toBeInTheDocument();
    });
    
    // Complete first challenge
    const startButton = screen.getByText(/Comenzar/i);
    fireEvent.click(startButton);
    for (const char of 'abc') {
      fireEvent.keyDown(window, { key: char });
    }
    
    // Stats should appear, then click Next
    await waitFor(() => {
      const nextButton = screen.getByText(/Siguiente Nivel/i);
      fireEvent.click(nextButton);
    });
    
    // Check second challenge
    await waitFor(() => {
      expect(screen.getByText(/Challenge 2/i)).toBeInTheDocument();
    });
  });

  test('calls onBack when clicking the back button', async () => {
    const onBackMock = jest.fn();
    renderWithProviders(<ChallengePlay onBack={onBackMock} />);
    
    await waitFor(() => {
      const backButton = screen.getByText(/Volver/i);
      fireEvent.click(backButton);
    });
    
    expect(onBackMock).toHaveBeenCalled();
  });
});
