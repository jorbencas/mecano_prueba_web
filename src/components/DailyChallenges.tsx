import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  theme?: string;
  date: string;
}

interface ChallengeStats {
  total: number;
  completed: number;
  streak: number;
  totalPoints: number;
}

interface DailyChallengesProps {
  onNavigate?: (view: string) => void;
}

const SEASONAL_THEMES = [
  'christmas', 
  'halloween', 
  'valentine', 
  'easter', 
  'newyear', 
  'summer', 
  'winter', 
  'autumn', 
  'spring',
  'stpatrick',
  'thanksgiving'
];

const DailyChallenges: React.FC<DailyChallengesProps> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seasonalChallenges, setSeasonalChallenges] = useState<Challenge[]>([]);





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
      case 'easy': return 'border-green-500';
      case 'medium': return 'border-yellow-500';
      case 'hard': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const getDifficultyBgColor = (difficulty: string) => {
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
    if (!challenge.target_value) return 0;
    return Math.min(100, Math.round((challenge.progress / challenge.target_value) * 100));
  };

  const renderChallengeCard = (challenge: Challenge) => (
    <div
      key={challenge.id}
      onClick={() => handleChallengeClick(challenge)}
      className={`p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 ${
        challenge.completed ? 'border-green-500 opacity-75' : getDifficultyColor(challenge.difficulty)
      } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base truncate" title={challenge.title}>{challenge.title}</h3>
            {challenge.completed && (
              <FaCheck className="text-green-500 flex-shrink-0" size={12} />
            )}
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`} title={challenge.description}>
            {challenge.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {!challenge.completed && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500 text-white animate-pulse">
              {t('challenges.new', 'NUEVO')}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
            challenge.completed
              ? 'bg-green-500 bg-opacity-20 text-green-500'
              : `${getDifficultyBgColor(challenge.difficulty)} bg-opacity-20 text-white`
          }`}>
            {challenge.completed 
              ? t('challenges.completed', 'Completado')
              : getDifficultyLabel(challenge.difficulty)
            }
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {!challenge.completed && challenge.target_value && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>{t('challenges.progress', 'Progreso')}</span>
            <span>{getProgressPercentage(challenge)}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(challenge)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadChallenges();
      fetchStats();
    }
  }, [user]);

  const generateOfflineChallenges = (): Challenge[] => [
    {
      id: 'daily_1_' + new Date().toDateString(),
      challenge_type: 'speed',
      title: t('challenges.offline.speed.title', 'Velocidad Relámpago'),
      description: t('challenges.offline.speed.desc', 'Escribe 50 palabras en 1 minuto'),
      target_value: 50,
      progress: 0,
      completed: false,
      difficulty: 'easy',
      mode: 'speed-mode',
      date: new Date().toISOString()
    },
    {
      id: 'daily_2_' + new Date().toDateString(),
      challenge_type: 'accuracy',
      title: t('challenges.offline.accuracy.title', 'Precisión Quirúrgica'),
      description: t('challenges.offline.accuracy.desc', 'Completa un texto con 100% de precisión'),
      target_value: 100,
      progress: 0,
      completed: false,
      difficulty: 'medium',
      mode: 'precision-mode',
      date: new Date().toISOString()
    },
    {
      id: 'daily_3_' + new Date().toDateString(),
      challenge_type: 'consistency',
      title: t('challenges.offline.consistency.title', 'Maratón de Escritura'),
      description: t('challenges.offline.consistency.desc', 'Mantén 40 PPM durante 5 minutos'),
      target_value: 300, // seconds
      progress: 0,
      completed: false,
      difficulty: 'hard',
      mode: 'zen-mode',
      date: new Date().toISOString()
    }
  ];

  const loadChallenges = async () => {
    setIsLoading(true);
    // 1. Try LocalStorage first for immediate render
    const cachedDaily = localStorage.getItem('cached_daily_challenges');
    const cachedSeasonal = localStorage.getItem('cached_seasonal_challenges');
    const cachedDate = localStorage.getItem('cached_challenges_date');
    const today = new Date().toDateString();

    let hasCachedData = false;

    if (cachedDaily && cachedDate === today) {
      const parsedDaily = JSON.parse(cachedDaily);
      if (parsedDaily.length > 0) {
        setChallenges(parsedDaily);
        hasCachedData = true;
      }
      if (cachedSeasonal) setSeasonalChallenges(JSON.parse(cachedSeasonal));
      setIsLoading(false); // Show cached data immediately
    }

    // 2. Fetch from API in background to update
    await fetchChallengesFromAPI(hasCachedData);
  };

  const fetchChallengesFromAPI = async (hasCachedData: boolean) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      console.log('Fetching challenges from API...');
      const results = await Promise.allSettled([
        challengesAPI.getDailyChallenges(token, controller.signal),
        challengesAPI.getSeasonalChallenges(token, controller.signal)
      ]);

      clearTimeout(timeoutId);

      const dailyResult = results[0];
      const seasonalResult = results[1];
      const today = new Date().toDateString();

      let newDaily: Challenge[] = [];
      let newSeasonal: Challenge[] = [];

      if (dailyResult.status === 'fulfilled' && dailyResult.value.challenges?.length > 0) {
        const allChallenges = dailyResult.value.challenges;
        
        // Filter seasonal vs daily
        const seasonal = allChallenges.filter((c: Challenge) => 
          c.theme && SEASONAL_THEMES.includes(c.theme)
        );
        
        const daily = allChallenges.filter((c: Challenge) => 
          !c.theme || !SEASONAL_THEMES.includes(c.theme)
        );

        newDaily = daily;
        newSeasonal = seasonal; // Start with these, add from seasonal endpoint if any

        localStorage.setItem('cached_daily_challenges', JSON.stringify(newDaily));
        localStorage.setItem('cached_challenges_date', today);
        setChallenges(newDaily);
      } else {
        console.warn('API Daily failed or empty, using fallback if needed');
        // If no cached data and API failed, use offline
        if (!hasCachedData) {
          newDaily = generateOfflineChallenges();
          localStorage.setItem('cached_daily_challenges', JSON.stringify(newDaily));
          localStorage.setItem('cached_challenges_date', today);
          setChallenges(newDaily);
        }
      }

      if (seasonalResult.status === 'fulfilled' && seasonalResult.value.challenges?.length > 0) {
        // Merge with existing seasonal from daily endpoint if any, avoiding duplicates
        const explicitSeasonal = seasonalResult.value.challenges;
        const existingIds = new Set(newSeasonal.map(c => c.id));
        const uniqueExplicit = explicitSeasonal.filter((c: Challenge) => !existingIds.has(c.id));
        
        newSeasonal = [...newSeasonal, ...uniqueExplicit];
        
        localStorage.setItem('cached_seasonal_challenges', JSON.stringify(newSeasonal));
        setSeasonalChallenges(newSeasonal);
      } else if (newSeasonal.length > 0) {
        // If we found seasonal in daily but seasonal endpoint failed/empty, still save what we found
        localStorage.setItem('cached_seasonal_challenges', JSON.stringify(newSeasonal));
        setSeasonalChallenges(newSeasonal);
      }

    } catch (error: any) {
      console.error('Error in fetchChallengesFromAPI:', error);
      // If critical error and no data, ensure we show something
      if (!hasCachedData) {
         const offline = generateOfflineChallenges();
         setChallenges(offline);
         localStorage.setItem('cached_daily_challenges', JSON.stringify(offline));
         localStorage.setItem('cached_challenges_date', new Date().toDateString());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChallengeClick = (challenge: Challenge) => {
    if (challenge.completed) return;
    
    // Save selected challenge to context or local storage to configure the game
    localStorage.setItem('active_challenge', JSON.stringify(challenge));
    
    // Navigate to the appropriate mode
    const targetMode = challenge.mode || 'practice';
    
    if (onNavigate) {
      // Map API modes/themes to App.tsx views
      let view = targetMode;
      
      // Handle theme-based mapping (legacy or specific overrides)
      if (challenge.theme) {
        if (['speed', 'christmas', 'halloween'].includes(challenge.theme)) {
          view = 'speed-mode';
        } else if (['accuracy', 'valentine'].includes(challenge.theme)) {
          view = 'precision-mode';
        }
      }

      // Map standard modes
      const modeMap: Record<string, string> = {
        'speed-mode': 'speed-mode',
        'precision-mode': 'precision-mode',
        'zen-mode': 'zen-mode',
        'practice': 'practice',
        'accuracy': 'precision-mode', // fallback
        'speed': 'speed-mode' // fallback
      };
      
      onNavigate(modeMap[view] || view);
    } else {
      // Fallback to router navigation
      navigate(targetMode === 'practice' ? '/' : `/${targetMode}`);
    }
  };

  if (!user) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>{t('challenges.notLoggedIn', 'Debes iniciar sesión para ver los retos')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>{t('challenges.loading', 'Cargando retos...')}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          🎯 {t('challenges.title', 'Retos Diarios')}
        </h1>

        {/* Stats Summary - Compact */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center gap-2">
                <FaTrophy className="text-yellow-500 text-xl" />
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('challenges.stats.completed', 'Completados')}
                  </p>
                  <p className="text-lg font-bold leading-tight">{stats.completed}/{stats.total}</p>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center gap-2">
                <FaFire className="text-orange-500 text-xl" />
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('challenges.stats.streak', 'Racha')}
                  </p>
                  <p className="text-lg font-bold leading-tight">{stats.streak} días</p>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center gap-2">
                <span className="text-purple-500 text-xl">⭐</span>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('challenges.stats.points', 'Puntos')}
                  </p>
                  <p className="text-lg font-bold leading-tight">{stats.totalPoints}</p>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center gap-2">
                <FaClock className="text-blue-500 text-xl" />
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('challenges.stats.today', 'Hoy')}
                  </p>
                  <p className="text-lg font-bold leading-tight">
                    {challenges.filter(c => c.completed).length}/{challenges.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Challenges Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📅</span> {t('challenges.todayTitle', 'Retos de Hoy')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {challenges.length === 0 ? (
                <div className={`col-span-full p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className="mb-1">🎉 {t('challenges.noChallenges', 'No hay retos disponibles')}</p>
                </div>
              ) : (
                challenges.map(renderChallengeCard)
              )}
            </div>
          </div>

          {/* Seasonal Challenges Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🍂</span> {t('challenges.seasonalTitle', 'Retos de Temporada')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {seasonalChallenges.length === 0 ? (
                <div className={`col-span-full p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className="mb-1">🌟 {t('challenges.noSeasonal', 'No hay retos de temporada activos')}</p>
                </div>
              ) : (
                seasonalChallenges.map(renderChallengeCard)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;
