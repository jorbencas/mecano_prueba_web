const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const challengesAPI = {
  /**
   * Get today's daily challenges
   */
  getDailyChallenges: async (token: string) => {
    const response = await fetch(`${API_URL}/challenges/daily`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch daily challenges');
    }

    return data;
  },

  /**
   * Get challenge history
   */
  getHistory: async (token: string, filters?: { limit?: number; offset?: number; completed?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.completed !== undefined) params.append('completed', filters.completed.toString());

    const response = await fetch(`${API_URL}/challenges/history?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch challenge history');
    }

    return data;
  },

  /**
   * Update challenge progress
   */
  updateProgress: async (token: string, challengeId: string, progress: number) => {
    const response = await fetch(`${API_URL}/challenges/${challengeId}/progress`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update progress');
    }

    return data;
  },

  /**
   * Mark challenge as completed
   */
  completeChallenge: async (token: string, challengeId: string) => {
    const response = await fetch(`${API_URL}/challenges/${challengeId}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to complete challenge');
    }

    return data;
  },

  /**
   * Get challenge statistics
   */
  getStats: async (token: string) => {
    const response = await fetch(`${API_URL}/challenges/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch challenge stats');
    }

    return data;
  },
};
