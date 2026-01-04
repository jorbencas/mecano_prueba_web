import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '@/api/auth';
import { UserRole } from '@/types/enums';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'email';
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  hasAdminAccess: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  updateUser: (profile: { displayName?: string; photoURL?: string; language?: string }) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Add timeout
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth check timed out')), 5000)
          );

          const authPromise = authAPI.me(token);

          const { user } = await Promise.race([authPromise, timeoutPromise]) as any;
          setUser(user);
        }
      } catch (error) {
        // Token invalid, expired, or server unreachable
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { token, user } = await authAPI.login(email, password);
      
      localStorage.setItem('auth_token', token);
      setToken(token);
      setUser(user);
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { token, user } = await authAPI.register(email, password, displayName);
      
      localStorage.setItem('auth_token', token);
      setToken(token);
      setUser(user);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    setError(null);
    authAPI.loginWithGoogle();
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (profile: { displayName?: string; photoURL?: string; language?: string }) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token');
      
      const updatedUser = await authAPI.updateProfile(token, profile);
      setUser(updatedUser);
    } catch (error: any) {
      setError(error.message || 'Failed to update user');
      throw error;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token');
      
      await authAPI.changePassword(token, oldPassword, newPassword);
    } catch (error: any) {
      setError(error.message || 'Failed to change password');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAdmin: user?.role === UserRole.ADMIN,
        isTeacher: user?.role === UserRole.TEACHER,
        isStudent: user?.role === UserRole.STUDENT,
        hasAdminAccess: user?.role === UserRole.ADMIN || user?.role === UserRole.TEACHER,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
