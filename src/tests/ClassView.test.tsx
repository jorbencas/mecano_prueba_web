import { render, screen, waitFor } from '@testing-library/react';
import ClassView from '../components/tutoring/ClassView';
import { AuthContext } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { UserRole } from '../types/enums';

// Mock fetch
global.fetch = jest.fn();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'class-123' }),
  useNavigate: () => mockNavigate,
}));

describe('ClassView', () => {
  const mockUser = { 
    id: 'user-1', 
    email: 'test@test.com', 
    role: UserRole.STUDENT,
    displayName: 'Test User',
    photoURL: null,
    provider: 'email' as const
  };
  const mockToken = 'fake-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches class details and assignments on mount', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/classes/class-123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'class-123',
            name: 'Test Class',
            description: 'Test Description',
            is_teacher: false,
            invite_code: 'ABC-123'
          }),
        });
      }
      if (url.includes('/assignments/class/class-123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error('not found'));
    });

    render(
      <AuthContext.Provider value={{ 
        user: mockUser, 
        token: mockToken, 
        loading: false, 
        error: null, 
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        hasAdminAccess: false,
        login: jest.fn(), 
        logout: jest.fn(), 
        register: jest.fn(), 
        loginWithGoogle: jest.fn(),
        updateUser: jest.fn(),
        changePassword: jest.fn()
      }}>
        <BrowserRouter>
          <ClassView />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Should show loading initially
    expect(screen.getByRole('status')).toBeInTheDocument(); // animate-spin usually has role status or we can find by class

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Class')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/classes/class-123'),
      expect.objectContaining({ headers: { Authorization: `Bearer fake-token` } })
    );
  });

  it('displays assignments when loaded', async () => {
    const mockAssignments = [
      { id: 'a1', title: 'Assignment 1', dueDate: '2024-12-31' },
    ];

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/classes/class-123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'class-123', name: 'Test Class' }),
        });
      }
      if (url.includes('/assignments/class/class-123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAssignments),
        });
      }
      return Promise.reject(new Error('not found'));
    });

    render(
      <AuthContext.Provider value={{ 
        user: mockUser, token: mockToken, loading: false, error: null, 
        isAdmin: false, isTeacher: false, isStudent: true, hasAdminAccess: false,
        login: jest.fn(), logout: jest.fn(), register: jest.fn(), 
        loginWithGoogle: jest.fn(), updateUser: jest.fn(), changePassword: jest.fn()
      }}>
        <BrowserRouter>
          <ClassView />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Assignment 1')).toBeInTheDocument();
    });
  });

  it('shows teacher-only actions when user is teacher', async () => {
    const teacherUser = { ...mockUser, role: UserRole.TEACHER };
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'class-123', name: 'Test Class', is_teacher: true }),
    });

    render(
      <AuthContext.Provider value={{ 
        user: teacherUser, token: mockToken, loading: false, error: null, 
        isAdmin: false, isTeacher: true, isStudent: false, hasAdminAccess: false,
        login: jest.fn(), logout: jest.fn(), register: jest.fn(), 
        loginWithGoogle: jest.fn(), updateUser: jest.fn(), changePassword: jest.fn()
      }}>
        <BrowserRouter>
          <ClassView />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nueva Tarea/i)).toBeInTheDocument();
      expect(screen.getByText(/Alumnos/i)).toBeInTheDocument();
    });
  });
});
