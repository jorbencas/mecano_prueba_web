import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatternAnalysis from '../components/PatternAnalysis';
import { ThemeProvider } from '../context/ThemeContext';
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

describe('PatternAnalysis Component', () => {
  const mockStatsData = {
    overall: { avg_wpm: 50, avg_accuracy: 85 }, // Low accuracy (<90)
    wpmProgression: [
      { avg_wpm: 30, date: '2023-01-01' },
      { avg_wpm: 70, date: '2023-01-02' }, // High variance
    ],
    byMode: [
      { mode: 'classic', avg_wpm: 50, avg_accuracy: 90 },
      { mode: 'quotes', avg_wpm: 30, avg_accuracy: 80 }, // Weakest mode
    ]
  };

  beforeEach(() => {
    localStorage.setItem('auth_token', 'test-token');
    (statsAPI.get as jest.Mock).mockResolvedValue(mockStatsData);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders error patterns', async () => {
    render(
      <Wrapper>
        <PatternAnalysis />
      </Wrapper>
    );

    expect(await screen.findByText(/Tu precisión promedio está por debajo del 90%/i)).toBeInTheDocument();
  });

  it('displays error rates and suggestions', async () => {
    render(
      <Wrapper>
        <PatternAnalysis />
      </Wrapper>
    );

    expect(await screen.findByText(/Practica más despacio/i)).toBeInTheDocument();
  });

  it('shows no patterns message when performance is good', async () => {
    (statsAPI.get as jest.Mock).mockResolvedValue({
      overall: { avg_wpm: 60, avg_accuracy: 98 },
      wpmProgression: [
        { avg_wpm: 60, date: '2023-01-01' },
        { avg_wpm: 61, date: '2023-01-02' },
        { avg_wpm: 60, date: '2023-01-03' },
        { avg_wpm: 61, date: '2023-01-04' },
        { avg_wpm: 60, date: '2023-01-05' },
        { avg_wpm: 61, date: '2023-01-06' },
        { avg_wpm: 60, date: '2023-01-07' },
      ],
      byMode: [
        { mode: 'classic', avg_wpm: 60, avg_accuracy: 98 }
      ]
    });

    render(
      <Wrapper>
        <PatternAnalysis />
      </Wrapper>
    );

    expect(await screen.findByText(/Excelente trabajo/i)).toBeInTheDocument();
  });
});
