import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { getActivityLogs, getActivityStats, getRecentActivities, ActivityLog } from '../utils/activityTracker';
import { FaClock, FaTrophy, FaChartLine, FaFire, FaUserShield, FaStar, FaAward } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getUserLevel, getXPProgress, getXPHistory } from '../utils/userLevelSystem';
import { getTotalCompletedChallenges, getTodayCompletedChallenges } from '../utils/challengeTracker';

const UserProfile: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  
  const [stats, setStats] = useState<ReturnType<typeof getActivityStats> | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [levelData, setLevelData] = useState<ReturnType<typeof getXPProgress> | null>(null);
  const [challengesCompleted, setChallengesCompleted] = useState({ today: 0, total: 0 });

  useEffect(() => {
    if (user) {
      const userId = user.email || user.id;
      setStats(getActivityStats(userId));
      setRecentActivities(getRecentActivities(userId, 10));
      
      // Cargar datos de nivel
      const userLevel = getUserLevel(userId);
      setLevelData(getXPProgress(userLevel.totalXP));
      
      // Cargar retos completados
      setChallengesCompleted({
        today: getTodayCompletedChallenges(userId),
        total: getTotalCompletedChallenges(userId),
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{t('profile.title', 'Perfil de Usuario')}</h1>
          <p>{t('profile.notLoggedIn', 'Debes iniciar sesión para ver tu perfil')}</p>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('profile.title', 'Perfil de Usuario')}</h1>

        {/* User Info */}
        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center text-2xl">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                ) : (
                  <FaUserShield className="text-gray-500" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{user.displayName || user.email}</h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user.email}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <Link to={`/profile/${user.id}`} className="text-blue-500 hover:underline flex items-center gap-1">
                    <FaUserShield /> Ver Perfil Público
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  user.role === 'admin'
                    ? 'bg-blue-500 bg-opacity-20 text-blue-500'
                    : 'bg-green-500 bg-opacity-20 text-green-500'
                }`}
              >
                {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
              </span>
            </div>
          </div>
        </div>

        {/* Level and XP Card */}
        {levelData && (
          <div className={`p-6 rounded-lg mb-6 bg-gradient-to-br ${isDarkMode ? 'from-purple-900/50 to-blue-900/50' : 'from-purple-100 to-blue-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg`}>
                  {levelData.level}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Nivel {levelData.level}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {levelData.xpToNextLevel} XP para nivel {levelData.level + 1}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <FaStar className="text-4xl text-yellow-400 inline-block" />
                <p className="text-sm font-bold mt-1">{levelData.currentXP} XP Total</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progreso</span>
                <span>{levelData.progress}%</span>
              </div>
              <div className={`w-full h-4 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${levelData.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
            
            {/* Challenges Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FaAward className="text-green-500" />
                  <span className="text-sm font-bold">Retos Hoy</span>
                </div>
                <p className="text-2xl font-black">{challengesCompleted.today}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FaTrophy className="text-yellow-500" />
                  <span className="text-sm font-bold">Retos Totales</span>
                </div>
                <p className="text-2xl font-black">{challengesCompleted.total}</p>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Time */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <FaClock className="text-3xl text-blue-500" />
                <span className="text-3xl font-bold">{formatDuration(stats.totalTime)}</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('profile.totalTime', 'Tiempo Total')}
              </p>
            </div>

            {/* Total Activities */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <FaFire className="text-3xl text-orange-500" />
                <span className="text-3xl font-bold">{stats.totalActivities}</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('profile.totalActivities', 'Sesiones')}
              </p>
            </div>

            {/* Average WPM */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <FaChartLine className="text-3xl text-green-500" />
                <span className="text-3xl font-bold">{stats.averageWPM}</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('profile.averageWPM', 'WPM Promedio')}
              </p>
            </div>

            {/* Completed */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <FaTrophy className="text-3xl text-yellow-500" />
                <span className="text-3xl font-bold">{stats.totalCompleted}</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('profile.completed', 'Completados')}
              </p>
            </div>
          </div>
        )}

        {/* Time by Component */}
        {stats && Object.keys(stats.byComponent).length > 0 && (
          <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4">{t('profile.timeByComponent', 'Tiempo por Componente')}</h2>
            <div className="space-y-3">
              {Object.entries(stats.byComponent)
                .sort(([, a], [, b]) => b.time - a.time)
                .map(([component, data]) => (
                  <div key={component}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{component}</span>
                      <span>{formatDuration(data.time)} ({data.count} {t('profile.sessions', 'sesiones')})</span>
                    </div>
                    <div className={`w-full h-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded bg-blue-500"
                        style={{
                          width: `${(data.time / stats.totalTime) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-bold mb-4">{t('profile.recentActivity', 'Actividad Reciente')}</h2>
          {recentActivities.length === 0 ? (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('profile.noActivity', 'No hay actividad registrada')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left p-2">{t('profile.date', 'Fecha')}</th>
                    <th className="text-left p-2">{t('profile.component', 'Componente')}</th>
                    <th className="text-left p-2">{t('profile.duration', 'Duración')}</th>
                    <th className="text-left p-2">{t('profile.wpm', 'WPM')}</th>
                    <th className="text-left p-2">{t('profile.accuracy', 'Precisión')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((activity) => (
                    <tr
                      key={activity.id}
                      className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <td className="p-2 text-sm">{formatDate(activity.timestamp)}</td>
                      <td className="p-2">{activity.component}</td>
                      <td className="p-2">{formatDuration(activity.duration)}</td>
                      <td className="p-2">{activity.metadata?.wpm || '-'}</td>
                      <td className="p-2">
                        {activity.metadata?.accuracy ? `${activity.metadata.accuracy}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
