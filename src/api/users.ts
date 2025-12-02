const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const usersAPI = {
  /**
   * Get all users (admin only)
   */
  getAll: async (token: string) => {
    const response = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get users');
    }

    return data;
  },

  /**
   * Update user role (admin only)
   */
  updateRole: async (token: string, userId: string, role: string) => {
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update role');
    }

    return data;
  },

  /**
   * Update user details (admin only)
   */
  updateUser: async (token: string, userId: string, updates: { email?: string; display_name?: string; role?: string }) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update user');
    }

    return data;
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete user');
    }

    return data;
  },
};
