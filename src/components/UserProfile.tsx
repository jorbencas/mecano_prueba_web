import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { getActivityStats, getRecentActivities, ActivityLog } from '../utils/activityTracker';
import { FaClock, FaTrophy, FaFire, FaUserShield, FaStar, FaAward, FaChartLine, FaChartBar, FaUser } from 'react-icons/fa';
import { Trophy, Clock, Target, Award, TrendingUp, Calendar, Mail, Star, Zap, Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserLevel, getXPProgress } from '../utils/userLevelSystem';
import { getTotalCompletedChallenges, getTodayCompletedChallenges } from '../utils/challengeTracker';
import { motion } from 'framer-motion';
import ProgressDashboard from './ProgressDashboard';
import LoadingScreen from './LoadingScreen';

interface UserProfileProps {
  initialTab?: 'profile' | 'stats';
}

const UserProfile: React.FC<UserProfileProps> = ({ initialTab = 'profile' }) => {
  const { isDarkMode } = useTheme();
  const { user, loading } = useAuth();
  const { t } = useDynamicTranslations();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<ReturnType<typeof getActivityStats> | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [levelData, setLevelData] = useState<ReturnType<typeof getXPProgress> | null>(null);
  const [challengesCompleted, setChallengesCompleted] = useState({ today: 0, total: 0 });
  const [tutoringSessions, setTutoringSessions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'stats'>(initialTab);

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

      // Load tutoring sessions
      import('../api/tutoring').then(mod => {
        const method = user.role === 'teacher' ? 'getTeacherSessions' : 'getStudentSessions';
        mod.tutoringAPI[method](user.id).then(setTutoringSessions);
      });
    }
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

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
    <div className="py-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 border-b border-blue-500/20 pb-6">
          <h1 className={`text-3xl md:text-4xl font-black tracking-tight uppercase leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('profile.title', 'Perfil de Usuario')}
          </h1>
        </header>

        {/* Tabs - Refined Sharp */}
        <div className="flex justify-center mb-10">
          <div className={`flex p-1 rounded-none border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-8 py-2.5 font-black text-xs uppercase tracking-widest transition-all rounded-none ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
              }`}
            >
              <FaUser className="inline mr-2" />
              {t('userProfile.tabs.profile', 'Perfil')}
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-8 py-2.5 font-black text-xs uppercase tracking-widest transition-all rounded-none ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
              }`}
            >
              <FaChartLine className="inline mr-2" />
              {t('userProfile.tabs.stats', 'Estadísticas')}
            </button>
          </div>
        </div>

        {activeTab === 'stats' ? (
          <div className="animate-fade-in">
            <ProgressDashboard embedded />
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
            {/* User Info & Level - Combined for simplicity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className={`p-6 rounded-none border backdrop-blur-sm lg:col-span-1 ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-24 h-24 rounded-none border-2 p-1 mb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`w-full h-full rounded-none overflow-hidden flex items-center justify-center text-3xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                      ) : (
                        <FaUserShield className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  <h2 className={`text-xl font-black uppercase tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.displayName || user.email?.split('@')[0]}
                  </h2>
                  <p className={`text-xs font-medium mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.email}
                  </p>
                  <span className={`px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest border ${
                    user.role === 'admin'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                      : 'bg-green-500/10 border-green-500/30 text-green-500'
                  }`}>
                    {user.role === 'admin' ? t('userProfile.admin', 'Administrador') : t('userProfile.student', 'Estudiante')}
                  </span>
                  
                  <div className="mt-6 w-full pt-6 border-t border-gray-200/10 dark:border-gray-700/30">
                    <Link to={`/profile/${user.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
                      <FaUserShield /> {t('userProfile.publicProfile', 'Ver Perfil Público')}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Level & XP Card - Refined Sharp */}
              {levelData && (
                <div className={`p-8 rounded-none border backdrop-blur-md lg:col-span-2 relative overflow-hidden ${
                  isDarkMode 
                    ? 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.05)]' 
                    : 'bg-blue-50/80 border-blue-200/50 shadow-sm'
                }`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Crown size={120} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-8">
                      <div className={`w-20 h-20 rounded-none border-4 flex items-center justify-center text-4xl font-black shadow-2xl ${
                        isDarkMode ? 'bg-gray-900 border-blue-500 text-blue-400' : 'bg-white border-blue-600 text-blue-600'
                      }`}>
                        {levelData.level}
                      </div>
                      <div>
                        <h3 className={`text-3xl font-black uppercase tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {t('userProfile.level', 'Nivel')} {levelData.level}
                        </h3>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {levelData.xpToNextLevel} {t('userProfile.xpToNext', 'XP para nivel')} {levelData.level + 1}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between items-end mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                          {t('userProfile.progress', 'Progreso de Nivel')}
                        </span>
                        <span className={`text-lg font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {levelData.progress}%
                        </span>
                      </div>
                      <div className={`w-full h-3 rounded-none border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'} overflow-hidden`}>
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out relative"
                          style={{ width: `${levelData.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Challenges Stats - Simplified */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-none border ${isDarkMode ? 'bg-gray-900/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'}`}>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                          {t('userProfile.challengesToday', 'Retos Hoy')}
                        </p>
                        <div className="flex items-center gap-2">
                          <FaAward className="text-green-500" />
                          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{challengesCompleted.today}</span>
                        </div>
                      </div>
                      <div className={`p-4 rounded-none border ${isDarkMode ? 'bg-gray-900/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'}`}>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                          {t('userProfile.challengesTotal', 'Retos Totales')}
                        </p>
                        <div className="flex items-center gap-2">
                          <FaTrophy className="text-yellow-500" />
                          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{challengesCompleted.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <FaClock />, label: t('profile.totalTime', 'Tiempo Total'), value: formatDuration(stats.totalTime), color: 'text-blue-500', bg: 'bg-blue-500/5' },
                  { icon: <FaFire />, label: t('profile.totalActivities', 'Sesiones'), value: stats.totalActivities, color: 'text-orange-500', bg: 'bg-orange-500/5' },
                  { icon: <FaChartLine />, label: t('profile.averageWPM', 'WPM Promedio'), value: stats.averageWPM, color: 'text-green-500', bg: 'bg-green-500/5' },
                  { icon: <FaTrophy />, label: t('profile.completed', 'Completados'), value: stats.totalCompleted, color: 'text-yellow-500', bg: 'bg-yellow-500/5' }
                ].map((stat, i) => (
                  <div key={i} className={`p-5 rounded-none border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'
                  }`}>
                    <div className={`${stat.color} text-xl mb-3`}>{stat.icon}</div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tutoring Sessions - Simplified */}
            {tutoringSessions.length > 0 && (
              <div className={`p-6 rounded-none border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
                <h2 className={`text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Calendar size={20} className="text-purple-500" />
                  {t('userProfile.upcomingTutoring', 'Próximas Tutorías')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutoringSessions.slice(0, 2).map((session) => (
                    <div key={session.id} className={`p-4 rounded-none border-l-4 border-purple-500 ${isDarkMode ? 'bg-gray-900/50 border-gray-700/50' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className={`font-black uppercase text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.role === 'teacher' ? session.studentEmail : session.teacherName}
                          </h3>
                          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                            {user.role === 'teacher' ? t('userProfile.studentLabel', 'Alumno') : t('userProfile.teacherLabel', 'Profesor')}
                          </p>
                        </div>
                        <div className="bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-widest border border-purple-500/20">
                          {session.status === 'scheduled' ? t('userProfile.scheduled', 'Programada') : session.status}
                        </div>
                      </div>
                      <div className="flex gap-4 text-[11px] font-bold opacity-70">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>{new Date(session.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>{session.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity - Refined Table */}
            <div className={`p-6 rounded-none border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
              <h2 className={`text-lg font-black uppercase tracking-tight mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('profile.recentActivity', 'Actividad Reciente')}
              </h2>
              {recentActivities.length === 0 ? (
                <p className={`text-sm font-medium opacity-50 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('profile.noActivity', 'No hay actividad registrada')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
                        <th className="p-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{t('profile.date', 'Fecha')}</th>
                        <th className="p-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{t('profile.component', 'Componente')}</th>
                        <th className="p-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{t('profile.wpm', 'WPM')}</th>
                        <th className="p-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-right">{t('profile.accuracy', 'Precisión')}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700/30' : 'divide-gray-100'}`}>
                      {recentActivities.slice(0, 5).map((activity) => (
                        <tr key={activity.id} className="group transition-colors hover:bg-white/5">
                          <td className="p-3 text-[11px] font-medium opacity-70">{formatDate(activity.timestamp)}</td>
                          <td className="p-3 text-sm font-black uppercase tracking-tight">{activity.component}</td>
                          <td className="p-3 text-sm font-black text-blue-500">{activity.metadata?.wpm || '-'}</td>
                          <td className="p-3 text-sm font-black text-right text-green-500">
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
        )}
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
