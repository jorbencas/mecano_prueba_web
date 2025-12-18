import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { challengesAPI } from '../api/challenges';
import { FaFire, FaTrophy, FaCheck, FaClock, FaCalendarAlt, FaStar } from 'react-icons/fa';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import challengeTexts from '../data/challengeTexts.json';

import { ChallengeItem, Challenge } from './ChallengeItem';

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
  'thanksgiving',
  'threekings',
  'carnival',
  'earthday',
  'starwars',
  'backtoschool',
  'blackfriday'
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
      title: t('challenges.offline.speed.title'),
      description: t('challenges.offline.speed.desc'),
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
      title: t('challenges.offline.accuracy.title'),
      description: t('challenges.offline.accuracy.desc'),
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
      title: t('challenges.offline.consistency.title'),
      description: t('challenges.offline.consistency.desc'),
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
    const cachedHistory = localStorage.getItem('cached_challenge_history');
    const cachedDate = localStorage.getItem('cached_challenges_date');
    const today = new Date().toDateString();

    let hasCachedData = false;

    if (cachedHistory && cachedDate === today) {
      const parsedHistory = JSON.parse(cachedHistory);
      if (parsedHistory.length > 0) {
        processChallenges(parsedHistory);
        hasCachedData = true;
      }
      setIsLoading(false);
    }

    // 2. Fetch from API in background to update
    await fetchChallengesFromAPI(hasCachedData);
  };

  const processChallenges = (allChallenges: Challenge[]) => {
    // Sort by date and created_at (newest first)
    const sorted = [...allChallenges].sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b.id.localeCompare(a.id); // Fallback to ID if dates are same
    });

    // Separate daily and seasonal
    const daily = sorted.filter((c: Challenge) => 
      !c.theme || !SEASONAL_THEMES.includes(c.theme)
    );
    
    const seasonal = sorted.filter((c: Challenge) => 
      c.theme && SEASONAL_THEMES.includes(c.theme)
    );

    setChallenges(daily);
    setSeasonalChallenges(seasonal);
  };

  const fetchChallengesFromAPI = async (hasCachedData: boolean) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      console.log('Fetching challenge history from API...');
      const response = await challengesAPI.getHistory(token, { limit: 100 }, controller.signal);
      
      clearTimeout(timeoutId);

      if (response.challenges && response.challenges.length > 0) {
        const allChallenges = response.challenges;
        processChallenges(allChallenges);
        
        localStorage.setItem('cached_challenge_history', JSON.stringify(allChallenges));
        localStorage.setItem('cached_challenges_date', new Date().toDateString());
      } else if (!hasCachedData) {
        const offline = generateOfflineChallenges();
        setChallenges(offline);
        localStorage.setItem('cached_challenge_history', JSON.stringify(offline));
        localStorage.setItem('cached_challenges_date', new Date().toDateString());
      }
    } catch (error: any) {
      console.error('Error in fetchChallengesFromAPI:', error);
      if (!hasCachedData) {
         const offline = generateOfflineChallenges();
         setChallenges(offline);
         localStorage.setItem('cached_challenge_history', JSON.stringify(offline));
         localStorage.setItem('cached_challenges_date', new Date().toDateString());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChallengeClick = (challenge: Challenge) => {
    // Save selected challenge to context or local storage to configure the game
    localStorage.setItem('active_challenge', JSON.stringify(challenge));
    
    if (onNavigate) {
      onNavigate('challenge-play');
    } else {
      // Fallback to router navigation
      navigate('/challenge-play');
    }
  };

  if (!user) {
    return (
      <div className={`p-6 rounded-none border-2 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-black'}`}>
        <p>{t('challenges.notLoggedIn')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-6 rounded-none border-2 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-black'}`}>
        <p>{t('challenges.loading')}</p>
      </div>
    );
  }

  return (
    <div className="py-6 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b border-blue-500/20 pb-8">
          <h1 className={`text-5xl md:text-6xl font-black mb-3 tracking-tight uppercase leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('challenges.title')}
          </h1>
          <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium tracking-wide`}>
            {t('challenges.subtitle')}
          </p>
        </header>

        {/* Information Bar - Functional Progress Tracking */}
        <div className={`mb-10 p-6 rounded-none border backdrop-blur-md transition-all duration-300 ${
          isDarkMode 
            ? 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)]' 
            : 'bg-white/80 border-blue-200/50 shadow-sm'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-none border text-2xl ${
                isDarkMode ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-blue-600 text-white border-blue-700 shadow-sm'
              }`}>
                <FaCalendarAlt />
              </div>
              <div>
                <h3 className={`text-lg font-black uppercase tracking-tight mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {t('challenges.infoBar.progressTitle')}
                </h3>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {challenges.filter(c => c.completed).length + seasonalChallenges.filter(c => c.completed).length} {t('challenges.infoBar.of')} {challenges.length + seasonalChallenges.length} {t('challenges.infoBar.completed')}
                </p>
              </div>
            </div>

            <div className="flex-grow max-w-xs">
              <div className="flex justify-between mb-1.5">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                  {t('challenges.infoBar.remaining')}: {(challenges.length + seasonalChallenges.length) - (challenges.filter(c => c.completed).length + seasonalChallenges.filter(c => c.completed).length)}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {Math.round(((challenges.filter(c => c.completed).length + seasonalChallenges.filter(c => c.completed).length) / (challenges.length + seasonalChallenges.length || 1)) * 100)}%
                </span>
              </div>
              <div className={`w-full h-2.5 rounded-none border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'} overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
                  style={{ width: `${((challenges.filter(c => c.completed).length + seasonalChallenges.filter(c => c.completed).length) / (challenges.length + seasonalChallenges.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary - Refined Glassmorphism Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
            {[
              { icon: <FaTrophy />, label: t('challenges.stats.completed'), value: `${stats.completed}/${stats.total}`, color: 'text-yellow-500', bg: 'bg-yellow-500/5', border: 'border-yellow-500/10' },
              { icon: <FaFire />, label: t('challenges.stats.streak'), value: `${stats.streak} d`, color: 'text-orange-500', bg: 'bg-orange-500/5', border: 'border-orange-500/10' },
              { icon: <span>⭐</span>, label: t('challenges.stats.points'), value: stats.totalPoints, color: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/10' },
              { icon: <FaClock />, label: t('challenges.stats.today'), value: `${challenges.filter(c => c.completed).length}/${challenges.length}`, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10' }
            ].map((stat, i) => (
              <div key={i} className={`p-4 rounded-none border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                isDarkMode 
                  ? `${stat.bg} ${stat.border}` 
                  : 'bg-white/80 border-slate-200/50 shadow-sm'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`${stat.color} text-xl`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className={`text-[8px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                      {stat.label}
                    </p>
                    <p className="text-xl font-black leading-none tracking-tight">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-20">
          {/* All Challenges Section */}
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-gray-200/30 dark:border-gray-700/30 pb-4">
              <h2 className="text-3xl font-black tracking-tight uppercase">
                {t('challenges.allTitle')}
              </h2>
              <div className={`px-4 py-1.5 rounded-none text-[10px] font-black tracking-[0.2em] uppercase border ${
                isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-600 text-white border-blue-700 shadow-sm'
              }`}>
                {challenges.length + seasonalChallenges.length} {t('challenges.available')}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...challenges, ...seasonalChallenges].length === 0 ? (
                <div className={`col-span-full p-20 rounded-none text-center border backdrop-blur-sm ${
                  isDarkMode ? 'bg-gray-900/40 border-gray-800/50' : 'bg-white/80 border-gray-200/50 shadow-sm'
                }`}>
                  <div className="text-6xl mb-6 opacity-50">🏁</div>
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{t('challenges.noChallenges')}</h3>
                  <p className={`text-sm font-medium uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>{t('challenges.noChallengesDesc')}</p>
                </div>
              ) : (
                [...challenges, ...seasonalChallenges].map(challenge => (
                  <ChallengeItem
                    key={challenge.id}
                    challenge={challenge}
                    onClick={handleChallengeClick}
                    isDarkMode={isDarkMode}
                    t={t}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;
