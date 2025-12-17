import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaUserCheck, FaUserTimes, FaCircle } from 'react-icons/fa';

interface Friend {
  id: string;
  friend_id: string;
  friend_email: string;
  friend_name: string;
  status: 'accepted' | 'pending';
  isOnline?: boolean;
}

import { useFetchWithTimeout } from '../hooks/useFetchWithTimeout';

// ... imports

const FriendsSystem: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const fetchWithTimeout = useFetchWithTimeout();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [fetchWithTimeout]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetchWithTimeout(`${process.env.REACT_APP_API_URL}/multiplayer/friends`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Friends request aborted');
      } else {
        console.error('Error loading friends:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!searchEmail.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // First, find user by email (you'd need an endpoint for this)
      // For now, we'll assume we have the userId
      const response = await fetch(`${process.env.REACT_APP_API_URL}/multiplayer/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: searchEmail }), // This should be userId
      });

      if (response.ok) {
        alert('¡Solicitud de amistad enviada!');
        setSearchEmail('');
        loadFriends();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al enviar solicitud');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Error al enviar solicitud');
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/multiplayer/friends/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendshipId }),
      });

      if (response.ok) {
        loadFriends();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const pendingRequests = friends.filter(f => f.status === 'pending');
  const acceptedFriends = friends.filter(f => f.status === 'accepted');

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">👥 Amigos</h1>

        {/* Add Friend */}
        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-bold mb-4">Añadir Amigo</h2>
          <div className="flex gap-2">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Email del usuario..."
              className={`flex-1 p-3 rounded border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
            />
            <button
              onClick={sendFriendRequest}
              disabled={loading || !searchEmail.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded font-bold flex items-center gap-2"
            >
              <FaUserPlus /> Enviar Solicitud
            </button>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4">Solicitudes Pendientes</h2>
            <div className="space-y-2">
              {pendingRequests.map((friend) => (
                <div
                  key={friend.id}
                  className={`p-4 rounded flex justify-between items-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{friend.friend_name || friend.friend_email}</p>
                    <p className="text-sm opacity-75">{friend.friend_email}</p>
                  </div>
                  <button
                    onClick={() => acceptFriendRequest(friend.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center gap-2"
                  >
                    <FaUserCheck /> Aceptar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-bold mb-4">Mis Amigos ({acceptedFriends.length})</h2>
          {acceptedFriends.length === 0 ? (
            <p className="text-center opacity-75 py-8">No tienes amigos añadidos aún</p>
          ) : (
            <div className="space-y-2">
              {acceptedFriends.map((friend) => (
                <div
                  key={friend.id}
                  className={`p-4 rounded flex justify-between items-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaCircle
                      className={`text-xs ${friend.isOnline ? 'text-green-500' : 'text-gray-500'}`}
                    />
                    <div>
                      <p className="font-semibold">{friend.friend_name || friend.friend_email}</p>
                      <p className="text-sm opacity-75">{friend.friend_email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                      Invitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsSystem;
