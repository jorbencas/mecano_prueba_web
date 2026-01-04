const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const settingsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/settings`);
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return response.json();
  },

  update: async (token: string, updates: Record<string, any>) => {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update settings');
    }

    return response.json();
  },
};
