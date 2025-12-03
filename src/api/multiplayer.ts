const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface Room {
  id: string;
  name: string;
  mode: 'race' | 'practice';
  creator_id: string;
  creator_email: string;
  creator_name?: string;
  max_players: number;
  is_private: boolean;
  status: 'waiting' | 'active' | 'finished';
  created_at: string;
}

export interface CreateRoomData {
  name: string;
  mode: 'race' | 'practice';
  maxPlayers?: number;
  isPrivate?: boolean;
}

export const multiplayerAPI = {
  /**
   * Get list of active public rooms
   */
  getRooms: async (token: string): Promise<{ rooms: Room[] }> => {
    const response = await fetch(`${API_URL}/multiplayer/rooms`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch rooms');
    }

    return data;
  },

  /**
   * Create a new room
   */
  createRoom: async (token: string, roomData: CreateRoomData): Promise<{ room: Room }> => {
    const response = await fetch(`${API_URL}/multiplayer/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roomData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create room');
    }

    return data;
  },

  /**
   * Get friends list
   */
  getFriends: async (token: string) => {
    const response = await fetch(`${API_URL}/multiplayer/friends`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch friends');
    }

    return data;
  },

  /**
   * Get match history
   */
  getMatchHistory: async (token: string) => {
    const response = await fetch(`${API_URL}/multiplayer/match-history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch match history');
    }

    return data;
  },
};
