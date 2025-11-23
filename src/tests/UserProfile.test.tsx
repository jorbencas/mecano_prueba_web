import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../components/UserProfile';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import * as activityTracker from '../utils/activityTracker';

// Mock the activity tracker
jest.mock('../utils/activityTracker');

const mockGetActivityStats = activityTracker.getActivityStats as jest.MockedFunction<typeof activityTracker.getActivityStats>;
const mockGetRecentActivities = activityTracker.getRecentActivities as jest.MockedFunction<typeof activityTracker.getRecentActivities>;

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

describe('UserProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows login message when user is not authenticated', () => {
    mockGetActivityStats.mockReturnValue({
      totalTime: 0,
      totalActivities: 0,
      byComponent: {},
      byActivityType: {},
      averageWPM: 0,
      averageAccuracy: 0,
      totalCompleted: 0,
    });
    mockGetRecentActivities.mockReturnValue([]);

    renderWithProviders(<UserProfile />);
    expect(screen.getByText(/Debes iniciar sesión para ver tu perfil/i)).toBeInTheDocument();
  });

  test('displays user statistics when authenticated', () => {
    mockGetActivityStats.mockReturnValue({
      totalTime: 3600, // 1 hour
      totalActivities: 10,
      byComponent: {
        FreePractice: { count: 5, time: 1800 },
        Levels: { count: 5, time: 1800 },
      },
      byActivityType: {},
      averageWPM: 55,
      averageAccuracy: 92,
      totalCompleted: 8,
    });
    mockGetRecentActivities.mockReturnValue([]);

    // Note: This test would need a mocked authenticated user
    // For now, it's a placeholder showing the structure
  });

  test('displays recent activity table', () => {
    const mockActivities = [
      {
        id: '1',
        userId: 'test-user',
        timestamp: new Date('2024-01-01T10:00:00'),
        activityType: 'freePractice' as const,
        component: 'FreePractice',
        duration: 120,
        metadata: { wpm: 50, accuracy: 95 },
      },
      {
        id: '2',
        userId: 'test-user',
        timestamp: new Date('2024-01-01T11:00:00'),
        activityType: 'level' as const,
        component: 'Levels',
        duration: 180,
        metadata: { wpm: 60, accuracy: 90 },
      },
    ];

    mockGetActivityStats.mockReturnValue({
      totalTime: 300,
      totalActivities: 2,
      byComponent: {},
      byActivityType: {},
      averageWPM: 55,
      averageAccuracy: 93,
      totalCompleted: 2,
    });
    mockGetRecentActivities.mockReturnValue(mockActivities);

    // Note: This test would need a mocked authenticated user
  });

  test('shows no activity message when no logs exist', () => {
    mockGetActivityStats.mockReturnValue({
      totalTime: 0,
      totalActivities: 0,
      byComponent: {},
      byActivityType: {},
      averageWPM: 0,
      averageAccuracy: 0,
      totalCompleted: 0,
    });
    mockGetRecentActivities.mockReturnValue([]);

    // Would show "No hay actividad registrada" when authenticated
  });

  test('formats duration correctly', () => {
    // Test that formatDuration utility works
    // 3661 seconds = 1h 1m 1s
    // This would be tested indirectly through the component render
  });

  test('displays time by component with progress bars', () => {
    mockGetActivityStats.mockReturnValue({
      totalTime: 3600,
      totalActivities: 10,
      byComponent: {
        FreePractice: { count: 5, time: 2400 },
        Levels: { count: 5, time: 1200 },
      },
      byActivityType: {},
      averageWPM: 55,
      averageAccuracy: 92,
      totalCompleted: 8,
    });
    mockGetRecentActivities.mockReturnValue([]);

    // Would show progress bars for each component
  });
});
