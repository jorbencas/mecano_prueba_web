import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { challengesAPI } from '../api/challenges';
import { FaFire, FaTrophy, FaCheck, FaClock } from 'react-icons/fa';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface Challenge {
  id: string;
  challenge_type: string;
  title: string;
  description: string;
  target_value: number;
  progress: number;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  mode?: string;
  date: string;
}

interface ChallengeStats {
  total: number;
  completed: number;
  streak: number;
  totalPoints: number;
}

const DailyChallenges: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChallenges();
      fetchStats();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const data = await challengesAPI.getDailyChallenges(token);
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const data = await challengesAPI.getStats(token);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t('challenges.difficulty.easy', 'Fácil');
      case 'medium': return t('challenges.difficulty.medium', 'Medio');
      case 'hard': return t('challenges.difficulty.hard', 'Difícil');
      default: return difficulty;
    }
  };

  const getProgressPercentage = (challenge: Challenge) => {
    if (challenge.completed) return 100;
    if (!challenge.target_value) return 0;
    return Math.min(100, Math.round((challenge.progress / challenge.target_value) * 100));
  };

  if (!user) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>{t('challenges.notLoggedIn', 'Debes iniciar sesión para ver los retos')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>{t('challenges.loading', 'Cargando retos...')}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          🎯 {t('challenges.title', 'Retos Diarios')}
        </h1>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <FaTrophy className="text-yellow-500 text-2xl" />
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('challenges.stats.completed', 'Completados')}
                  </p>
                  <p className="text-2xl font-bold">{stats.completed}/{stats.total}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <FaFire className="text-orange-500 text-2xl" />
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('challenges.stats.streak', 'Racha')}
                  </p>
                  <p className="text-2xl font-bold">{stats.streak} días</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <span className="text-purple-500 text-2xl">⭐</span>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('challenges.stats.points', 'Puntos')}
                  </p>
                  <p className="text-2xl font-bold">{stats.totalPoints}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <FaClock className="text-blue-500 text-2xl" />
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('challenges.stats.today', 'Hoy')}
                  </p>
                  <p className="text-2xl font-bold">
                    {challenges.filter(c => c.completed).length}/{challenges.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Challenges List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            {t('challenges.todayTitle', 'Retos de Hoy')}
          </h2>

          {challenges.length === 0 ? (
            <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className="text-xl mb-2">🎉 {t('challenges.noChallenges', 'No hay retos disponibles')}</p>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {t('challenges.checkBack', 'Vuelve mañana para nuevos desafíos')}
              </p>
            </div>
          ) : (
            challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`p-6 rounded-lg border-l-4 ${
                  challenge.completed ? 'border-green-500' : getDifficultyColor(challenge.difficulty)
                } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{challenge.title}</h3>
                      {challenge.completed && (
                        <FaCheck className="text-green-500" />
                      )}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {challenge.description}
                    </p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    challenge.completed
                      ? 'bg-green-500 bg-opacity-20 text-green-500'
                      : `${getDifficultyColor(challenge.difficulty)} bg-opacity-20 text-white`
                  }`}>
                    {challenge.completed 
                      ? t('challenges.completed', 'Completado')
                      : getDifficultyLabel(challenge.difficulty)
                    }
                  </span>
                </div>

                {/* Progress Bar */}
                {!challenge.completed && challenge.target_value && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>{t('challenges.progress', 'Progreso')}</span>
                      <span>{getProgressPercentage(challenge)}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(challenge)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;
