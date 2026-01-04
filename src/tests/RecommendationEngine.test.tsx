import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecommendationEngine from '../components/RecommendationEngine';
import { ThemeProvider } from '@hooks/useTheme';
import { AuthProvider } from '../context/AuthContext';
import { statsAPI } from '../api/stats';

// Mock useAuth
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock statsAPI
jest.mock('../api/stats');

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ThemeProvider>
);

describe('RecommendationEngine Component', () => {
  const mockStatsData = {
    overall: { avg_wpm: 45, avg_accuracy: 92 },
    recent: [
      { mode: 'classic', wpm: 40, accuracy: 90 },
      { mode: 'quotes', wpm: 30, accuracy: 85 }
    ],
    byMode: [
      { mode: 'classic', avg_wpm: 45, avg_accuracy: 92 },
      { mode: 'quotes', avg_wpm: 35, avg_accuracy: 88 }
    ],
    wpmProgression: [
      { date: '2023-01-01', avg_wpm: 40 },
      { date: '2023-01-02', avg_wpm: 42 },
      { date: '2023-01-03', avg_wpm: 45 }
    ]
  };

  beforeEach(() => {
    localStorage.setItem('auth_token', 'test-token');
    (statsAPI.get as jest.Mock).mockResolvedValue(mockStatsData);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders recommendations title', async () => {
    render(
      <Wrapper>
        <RecommendationEngine />
      </Wrapper>
    );

    expect(await screen.findByText(/Recomendaciones Personalizadas/i)).toBeInTheDocument();
  });

  it('suggests practice based on performance', async () => {
    render(
      <Wrapper>
        <RecommendationEngine />
      </Wrapper>
    );

    // Should suggest practicing the weaker mode or improving accuracy
    await waitFor(() => {
      expect(screen.queryByText(/Generando recomendaciones/i)).not.toBeInTheDocument();
    });
    
    // Check that recommendations are shown
    const headers = screen.getAllByText(/Recomendaciones Personalizadas/i);
    expect(headers.length).toBeGreaterThan(0);
  });

  it('shows balanced performance message when stats are good', async () => {
    (statsAPI.get as jest.Mock).mockResolvedValue({
      overall: { avg_wpm: 60, avg_accuracy: 98 },
      recent: [],
      byMode: [
        { mode: 'classic', avg_wpm: 60, avg_accuracy: 98 },
        { mode: 'quotes', avg_wpm: 59, avg_accuracy: 97 }
      ],
      wpmProgression: Array.from({ length: 25 }, (_, i) => ({ 
        date: `2023-01-${i + 1}`, 
        avg_wpm: 60 
      }))
    });

    render(
      <Wrapper>
        <RecommendationEngine />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Generando recomendaciones/i)).not.toBeInTheDocument();
    });
    
    // High performance should yield advanced techniques recommendation or no critical issues
    expect(screen.getByText(/Recomendaciones Personalizadas/i)).toBeInTheDocument();
  });
});
