const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const progressAPI = {
  /**
   * Get level progress for a specific mode
   */
  getByMode: async (token: string, userId: string, mode: string) => {
    const response = await fetch(`${API_URL}/progress/${userId}/${mode}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get progress');
    }

    return data;
  },

  /**
   * Update level completion and unlock next level
   */
  update: async (token: string, progress: {
    mode: string;
    level_number: number;
    wpm: number;
    accuracy: number;
    completed?: boolean;
  }) => {
    const response = await fetch(`${API_URL}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(progress),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update progress');
    }

    return data;
  },

  /**
   * Get all progress across all modes
   */
  getAll: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/progress/${userId}/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get progress');
    }

    return data;
  },
};
