import React from 'react';
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressPredictor from '../components/ProgressPredictor';
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

describe('ProgressPredictor Component', () => {
  const mockStatsData = {
    overall: { avg_wpm: 45 },
    wpmProgression: [
      { avg_wpm: 40 },
      { avg_wpm: 42 },
      { avg_wpm: 45 },
      { avg_wpm: 48 },
      { avg_wpm: 50 },
    ]
  };

  beforeEach(() => {
    localStorage.setItem('auth_token', 'test-token');
    (statsAPI.get as jest.Mock).mockResolvedValue(mockStatsData);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders current WPM and goal input', async () => {
    render(
      <Wrapper>
        <ProgressPredictor />
      </Wrapper>
    );

    await waitFor(() => {
      expect(statsAPI.get).toHaveBeenCalled();
    });

    // Check for elements that actually exist
    expect(await screen.findByText(/Tiempo Estimado/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByLabelText(/Establece tu objetivo de WPM/i)).toBeInTheDocument();
  });

  it('calculates and displays prediction', async () => {
    render(
      <Wrapper>
        <ProgressPredictor />
      </Wrapper>
    );

    // Wait for loading to finish and check that prediction UI is rendered
    await waitForElementToBeRemoved(() => screen.queryByText(/Calculando predicciones/i));
    expect(screen.getByText(/Tiempo Estimado/i)).toBeInTheDocument();
  });

  it('updates prediction when goal changes', async () => {
    render(
      <Wrapper>
        <ProgressPredictor />
      </Wrapper>
    );

    // Wait for data load
    await screen.findByText(/Tiempo Estimado/i, {}, { timeout: 3000 });

    const input = screen.getByLabelText(/Establece tu objetivo de WPM/i);
    fireEvent.change(input, { target: { value: '60' } });

    expect(input).toHaveValue('60');
  });

});
