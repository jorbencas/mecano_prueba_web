import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '../components/AdminDashboard';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>{component}</AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

// Mock fetch
global.fetch = jest.fn();

describe('AdminDashboard', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    localStorage.setItem('token', 'mock-token');
  });

  it('shows access denied for non-admin users', () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('displays loading state', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Loading activity data/i)).toBeInTheDocument();
    });
  });

  it('renders user statistics when data is loaded', async () => {
    const mockData = [
      {
        userId: '1',
        email: 'user1@test.com',
        role: 'student',
        totalTime: 3600,
        totalActivities: 10,
        averageWPM: 50,
        averageAccuracy: 95,
        totalCompleted: 8,
        byComponent: {},
        byActivityType: {},
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    });
  });

  it('filters users by search term', async () => {
    const mockData = [
      {
        userId: '1',
        email: 'alice@test.com',
        role: 'student',
        totalTime: 3600,
        totalActivities: 10,
        averageWPM: 50,
        averageAccuracy: 95,
        totalCompleted: 8,
        byComponent: {},
        byActivityType: {},
      },
      {
        userId: '2',
        email: 'bob@test.com',
        role: 'admin',
        totalTime: 7200,
        totalActivities: 20,
        averageWPM: 60,
        averageAccuracy: 98,
        totalCompleted: 18,
        byComponent: {},
        byActivityType: {},
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by email/i);
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.queryByText('bob@test.com')).not.toBeInTheDocument();
  });
});
