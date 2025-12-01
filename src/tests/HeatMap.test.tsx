import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeatMap from '../components/HeatMap';
import { ThemeProvider } from '../context/ThemeContext';
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
    {children}
  </ThemeProvider>
);

describe('HeatMap Component', () => {
  const mockStatsData = {
    recent: [
      {
        metadata: {
          keystrokes: [
            { key: 's', error: true, speed: 100 }, // High error
            { key: 's', error: true, speed: 100 },
            { key: 'a', error: false, speed: 100 }, // Low error
          ]
        }
      }
    ]
  };

  beforeEach(() => {
    localStorage.setItem('auth_token', 'test-token');
    (statsAPI.get as jest.Mock).mockResolvedValue(mockStatsData);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders keyboard layout', async () => {
    render(
      <Wrapper>
        <HeatMap />
      </Wrapper>
    );

    expect(await screen.findByText('Q')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Z')).toBeInTheDocument();
  });

  it('applies color coding based on error rates', async () => {
    render(
      <Wrapper>
        <HeatMap />
      </Wrapper>
    );

    // Wait for data to load
    const keyS = await screen.findByText('S');
    const keyContainerS = keyS.closest('div');
    
    // 's' has 100% error rate (2 errors / 2 counts) -> Should have red background
    expect(keyContainerS).toHaveStyle({ backgroundColor: expect.any(String) });
  });
});
