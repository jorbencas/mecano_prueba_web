const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const challengesAPI = {
  /**
   * Get today's daily challenges
   */
  getDailyChallenges: async (token: string, signal?: AbortSignal) => {
    const response = await fetch(`${API_URL}/challenges/daily`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch daily challenges');
    }

    return data;
  },

  /**
   * Get seasonal challenges
   */
  getSeasonalChallenges: async (token: string, signal?: AbortSignal) => {
    // For now, we can reuse the daily endpoint or a specific one if available
    // Assuming the backend supports filtering by type or a specific endpoint
    // If not, we might need to mock this or filter client-side
    // Let's assume a new endpoint for now
    const response = await fetch(`${API_URL}/challenges/seasonal`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal,
    });

    const data = await response.json();

    if (!response.ok) {
      // If endpoint doesn't exist, return empty for now to avoid breaking
      console.warn('Seasonal challenges endpoint might not exist yet');
      return { challenges: [] };
    }

    return data;
  },

  /**
   * Get challenge history
   */
  getHistory: async (token: string, filters?: { limit?: number; offset?: number; completed?: boolean }, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.completed !== undefined) params.append('completed', filters.completed.toString());

    const response = await fetch(`${API_URL}/challenges/history?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal,
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
  getStats: async (token: string, signal?: AbortSignal) => {
    const response = await fetch(`${API_URL}/challenges/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch challenge stats');
    }

    return data;
  },
};
