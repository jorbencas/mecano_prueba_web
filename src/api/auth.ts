const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const authAPI = {
  /**
   * Register new user with email and password
   * Role is determined server-side: first user = admin, others = student
   */
  register: async (email: string, password: string, displayName: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  },

  /**
   * Initiate Google OAuth login
   */
  loginWithGoogle: () => {
    window.location.href = `${API_URL}/auth/google`;
  },

  /**
   * Get current user info
   */
  me: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user info');
    }

    return data;
  },

  /**
   * Logout
   */
  logout: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Logout failed');
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (token: string, profile: { displayName?: string; photoURL?: string; language?: string }) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    return data;
  },

  /**
   * Change user password
   */
  changePassword: async (token: string, oldPassword: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to change password');
    }

    return data;
  },
};

export const activityAPI = {
  /**
   * Save activity log
   */
  save: async (token: string, log: {
    activityType: string;
    component: string;
    duration: number;
    metadata?: any;
  }) => {
    const response = await fetch(`${API_URL}/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(log),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save activity');
    }

    return data;
  },

  /**
   * Get activity logs
   */
  getLogs: async (token: string, limit = 100, offset = 0) => {
    const response = await fetch(
      `${API_URL}/activity?limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get activity logs');
    }

    return data;
  },

  /**
   * Get activity statistics
   */
  getStats: async (token: string) => {
    const response = await fetch(`${API_URL}/activity/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get activity stats');
    }

    return data;
  },
};
