const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const statsAPI = {
  /**
   * Save practice session statistics
   */
  save: async (token: string, stats: {
    mode: string;
    level_number?: number;
    wpm: number;
    accuracy: number;
    errors?: number;
    duration: number;
    completed?: boolean;
    metadata?: any;
  }) => {
    const response = await fetch(`${API_URL}/stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(stats),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save statistics');
    }

    return data;
  },

  /**
   * Get comprehensive user statistics
   */
  get: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/stats/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get statistics');
    }

    return data;
  },

  /**
   * Get level progress across all modes
   */
  getProgress: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/stats/${userId}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get progress');
    }

    return data;
  },
};
