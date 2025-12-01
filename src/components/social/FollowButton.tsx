import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { socialAPI } from '../../api/social';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  onToggle?: (isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  targetUserId, 
  initialIsFollowing,
  onToggle 
}) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      if (isFollowing) {
        await socialAPI.unfollowUser(token, targetUserId);
        setIsFollowing(false);
        if (onToggle) onToggle(false);
      } else {
        await socialAPI.followUser(token, targetUserId);
        setIsFollowing(true);
        if (onToggle) onToggle(true);
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === targetUserId) return null;

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
        isFollowing
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
      {isFollowing ? 'Siguiendo' : 'Seguir'}
    </button>
  );
};

export default FollowButton;
