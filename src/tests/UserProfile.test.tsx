import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../components/UserProfile';
import { ThemeProvider } from '@hooks/useTheme';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '@hooks/useLanguage';
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
    const mockUser = { id: 'test-user', name: 'Test User', email: 'test@example.com' };
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

    // We need to mock useAuth to return the user
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({ user: mockUser });

    renderWithProviders(<UserProfile />);
    
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/55/)).toBeInTheDocument(); // WPM
    expect(screen.getByText(/92%/)).toBeInTheDocument(); // Accuracy
    expect(screen.getByText(/1h 0m 0s/i)).toBeInTheDocument(); // Total time
  });

  test('displays recent activity table with data', () => {
    const mockUser = { id: 'test-user', name: 'Test User' };
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
    ];

    mockGetActivityStats.mockReturnValue({
      totalTime: 120,
      totalActivities: 1,
      byComponent: {},
      byActivityType: {},
      averageWPM: 50,
      averageAccuracy: 95,
      totalCompleted: 1,
    });
    mockGetRecentActivities.mockReturnValue(mockActivities);
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({ user: mockUser });

    renderWithProviders(<UserProfile />);
    
    expect(screen.getByText(/Práctica Libre/i)).toBeInTheDocument();
    expect(screen.getByText(/50 WPM/i)).toBeInTheDocument();
    expect(screen.getByText(/95%/)).toBeInTheDocument();
  });

  test('shows no activity message when no logs exist', () => {
    const mockUser = { id: 'test-user', name: 'Test User' };
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
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({ user: mockUser });

    renderWithProviders(<UserProfile />);
    
    expect(screen.getByText(/No hay actividad registrada/i)).toBeInTheDocument();
  });
});
