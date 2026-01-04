import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '@hooks/useTheme';
import { socialAPI } from '@api/social';
import FollowButton from './FollowButton';
import { FaTrophy, FaKeyboard, FaClock, FaUsers, FaUser } from 'react-icons/fa';

const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isDarkMode } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async (currentUserId: string) => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const data = await socialAPI.getProfile(currentUserId, token || undefined);
      setProfile(data);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Usuario no encontrado');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadProfile(id);
    }
  }, [id, loadProfile]);

  if (loading) {
    return (
      <div className={`min-h-screen p-8 flex justify-center items-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <div className="text-xl">Cargando perfil...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen p-8 flex justify-center items-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`p-8 rounded-lg mb-6 flex flex-col md:flex-row items-center gap-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-4xl">
            {profile.user.photo_url ? (
              <img src={profile.user.photo_url} alt={profile.user.display_name} className="w-full h-full object-cover" />
            ) : (
              <FaUser className="text-gray-500" />
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{profile.user.display_name}</h1>
            <p className="opacity-75 mb-4">
              Miembro desde {new Date(profile.user.created_at).toLocaleDateString()}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaUsers className="text-blue-500" />
                <span className="font-bold">{profile.social.followers}</span> seguidores
              </div>
              <div className="flex items-center gap-2">
                <FaUsers className="text-green-500" />
                <span className="font-bold">{profile.social.following}</span> siguiendo
              </div>
            </div>

            <FollowButton 
              targetUserId={profile.user.id} 
              initialIsFollowing={profile.social.isFollowing}
              onToggle={(isFollowing) => {
                setProfile((prev: any) => ({
                  ...prev,
                  social: {
                    ...prev.social,
                    followers: prev.social.followers + (isFollowing ? 1 : -1),
                    isFollowing
                  }
                }));
              }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <FaKeyboard className="text-4xl text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold mb-1">{Math.round(profile.stats?.avg_wpm || 0)}</div>
            <div className="opacity-75">WPM Promedio</div>
          </div>

          <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <FaTrophy className="text-4xl text-yellow-500 mx-auto mb-3" />
            <div className="text-3xl font-bold mb-1">{Math.round(profile.stats?.max_wpm || 0)}</div>
            <div className="opacity-75">Mejor WPM</div>
          </div>

          <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <FaClock className="text-4xl text-purple-500 mx-auto mb-3" />
            <div className="text-3xl font-bold mb-1">{profile.stats?.total_sessions || 0}</div>
            <div className="opacity-75">Sesiones Totales</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
