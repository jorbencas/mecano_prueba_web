// App.tsx
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@store/uiStore';
import { AuthProvider, useAuth } from '@context/AuthContext';
import HorizontalMenu from '@components/HorizontalMenu';
import PlayGame from '@components/PlayGame';
import Levels from '@components/Levels';
import CreateText from '@components/CreateText';
import Settings from '@components/Settings';
import BaseModal from '@components/BaseModal';
import { MultiplayerProvider } from '@context/MultiplayerContext';
import Login from '@components/Login';
import RegistrationModal from '@components/RegistrationModal';

// New components
import FreePractice from '@/components/FreePractice';
import SpeedMode from '@/components/SpeedMode';
import RoomLobby from '@/components/RoomLobby';
import CustomLevelsManager from '@/components/CustomLevelsManager';
import PrecisionMode from '@/components/PrecisionMode';
// import LevelCreator from '@/components/LevelCreator'; // Unused
// import ProgressDashboard from '@/components/ProgressDashboard'; // Unused
import PracticeRoom from '@/components/PracticeRoom';
import RaceMode from '@/components/RaceMode';
import Achievements from '@/components/Achievements';
import Leaderboard from '@/components/Leaderboard';
import UserProfile from '@/components/UserProfile';
import UnifiedSpinner from '@/components/UnifiedSpinner';
import Footer from '@/components/Footer';

// Additional Practice Modes
import ZenMode from '@/components/ZenMode';
import NumbersMode from '@/components/NumbersMode';
import SymbolsMode from '@/components/SymbolsMode';
import CodeMode from '@/components/CodeMode';
import DictationMode from '@/components/DictationMode';
import PublicProfile from '@/components/social/PublicProfile';
import CommunityForum from '@/components/social/CommunityForum';
import AdminDashboard from '@/components/AdminDashboard';
import TeacherDashboard from '@/components/tutoring/TeacherDashboard';
import StudentClasses from '@/components/tutoring/StudentClasses';
import ClassView from '@/components/tutoring/ClassView';
import ChallengePlay from '@/components/ChallengePlay';

// Multiplayer Components

// Daily Challenges
import DailyChallenges from '@/components/DailyChallenges';
import DailyChallengesModal from '@/components/DailyChallengesModal';
import DailyChallengePopup from '@/components/DailyChallengePopup';
import { Challenge } from '@/components/ChallengeItem';
import { getTodayChallenges, 
  markChallengeAsSeen, 
  hasChallengeBeenAccepted
} from '@/utils/dailyChallengeUtils';
import AuthCallback from '@components/AuthCallback';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import ToastNotification from '@components/ToastNotification';
import { challengesAPI } from '@api/challenges';
import { useErrorStore } from '@store/errorStore';
import ErrorBoundary from '@components/ErrorBoundary';
import { AppView } from './types/enums';

const ClassesRoute: React.FC = () => {
  const { user, hasAdminAccess } = useAuth();
  
  console.log('ClassesRoute rendering, user:', user);

  if (!user) {
    console.log('ClassesRoute: No user, redirecting');
    return <Navigate to="/" />;
  }
  
  console.log('ClassesRoute: User role:', user.role);

  if (hasAdminAccess) {
    console.log('ClassesRoute: Rendering TeacherDashboard');
    return <TeacherDashboard />;
  }
  
  console.log('ClassesRoute: Rendering StudentClasses');
  return <StudentClasses />;
};

const AppContent: React.FC<{ children?: React.ReactNode; showDefaultContent?: boolean }> = ({ children, showDefaultContent = true }) => {
  const { isDarkMode } = useUIStore();
  const { user, loading, logout, isAdmin } = useAuth();
  const { error, clearError } = useErrorStore();
  const { t } = useDynamicTranslations();
  const [currentView, setCurrentView] = useState<AppView>(AppView.PRACTICE);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const [showChallengePopup, setShowChallengePopup] = useState(false);
  
  // New state for non-invasive notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastAction, setToastAction] = useState<(() => void) | undefined>(undefined);
  const [toastActionLabel, setToastActionLabel] = useState('');
  
  // State for controlled DailyChallengesModal
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  const [dailyChallenges, setDailyChallenges] = useState<any[]>([]);

  const [blockedFeatureName, setBlockedFeatureName] = useState<string>('');

  // Features that require authentication
  const lockedFeatures = [
    AppView.LEADERBOARD, 
    AppView.ACHIEVEMENTS, 
    AppView.CREATE, 
    AppView.CREATE_LEVEL, 
    AppView.STATISTICS, 
    AppView.RACE_MODE, 
    AppView.PRACTICE_ROOM, 
    AppView.FRIENDS, 
    AppView.CHALLENGES, 
    AppView.MY_LEVELS, 
    AppView.ADMIN_DASHBOARD
  ];

  const handleNavigation = (view: AppView) => {
    // Handle login view
    if (view === AppView.LOGIN) {
      setShowLoginModal(true);
      return;
    }
    
    // Check if feature is locked and user is not authenticated
    if (lockedFeatures.includes(view) && !user) {
      setBlockedFeatureName(getFeatureName(view));
      setShowRegistrationModal(true);
      return;
    }

    if (view === AppView.LOGOUT) {
      logout();
      setCurrentView(AppView.PRACTICE);
    } else if (view === AppView.SETTINGS) {
      setShowSettingsModal(true);
    } else {
      setCurrentView(view);
    }
  };

  const getFeatureName = (view: AppView): string => {
    const featureNames: Partial<Record<AppView, string>> = {
      [AppView.LEADERBOARD]: t('leaderboard.title'),
      [AppView.ACHIEVEMENTS]: t('achievements.title'),
      [AppView.CREATE]: t('menu.custom.texts'),
      [AppView.CREATE_LEVEL]: t('menu.custom.levels'),
      [AppView.STATISTICS]: t('progress.title'),
      [AppView.RACE_MODE]: t('multiplayer.lobby.raceTitle'),
      [AppView.PRACTICE_ROOM]: t('multiplayer.lobby.practiceTitle'),
      [AppView.FRIENDS]: t('menu.multiplayer.friends'),
      [AppView.CHALLENGES]: t('challenges.title'),
      [AppView.MY_LEVELS]: t('customLevels.myLevels'),
      [AppView.ADMIN_DASHBOARD]: t('menu.user.admin'),
    };
    return featureNames[view] || view;
  };

  const handleShowLogin = () => {
    setShowSettingsModal(false);
    setShowRegistrationModal(false);
    setShowLoginModal(true);
  };

  const handleAcceptChallenges = (selectedChallenges: Challenge[]) => {
    if (selectedChallenges.length === 0) return;
    
    // Close popup/modal
    setShowChallengePopup(false);
    setShowChallengesModal(false);
    
    // Save active challenges as a queue
    localStorage.setItem('active_challenges_queue', JSON.stringify(selectedChallenges));
    // Also set the first one as active for backward compatibility or immediate use
    localStorage.setItem('active_challenge', JSON.stringify(selectedChallenges[0]));
    
    setCurrentView(AppView.CHALLENGE_PLAY);
  };

  const handleAcceptChallenge = (challengeId: string) => {
    // Find challenge in API data or local utils
    const apiChallenge = dailyChallenges.find(c => c.id === challengeId);
    const localChallenge = getTodayChallenges().find(c => c.id === challengeId);
    const acceptedChallenge = apiChallenge || localChallenge;
    
    if (acceptedChallenge) {
      handleAcceptChallenges([acceptedChallenge]);
    }
  };

  const handleCloseChallenge = () => {
    markChallengeAsSeen();
    setShowChallengePopup(false);
  };

  useEffect(() => {
    if (user) {
      // Check for tutoring notifications
      import('@/api/tutoring').then(mod => {
        mod.tutoringAPI.checkNotifications(user.id).then(sessions => {
          if (sessions.length > 0) {
            setToastMessage(`Tienes ${sessions.length} nuevas sesiones de tutoría`);
            setToastAction(() => () => setCurrentView(AppView.CLASSES));
            setToastActionLabel('Ver Clases');
            setShowToast(true);
          }
        });
      });

          // Check for Daily Challenges (Non-invasive)
          const checkChallenges = async () => {
            try {
              const token = localStorage.getItem('auth_token');
              if (!token) return;

              const data = await challengesAPI.getDailyChallenges(token);
              if (data.challenges && data.challenges.length > 0) {
                const incompleteChallenges = data.challenges.filter((c: any) => !c.completed);
                
                if (incompleteChallenges.length > 0) {
                  setDailyChallenges(incompleteChallenges);
                  
                  // Cache for DailyChallenges.tsx
                  localStorage.setItem('cached_daily_challenges', JSON.stringify(data.challenges));
                  localStorage.setItem('cached_challenges_date', new Date().toDateString());
                  
                  // Show toast instead of modal
                  setToastMessage(`¡Tienes ${incompleteChallenges.length} retos diarios pendientes!`);
                  setToastAction(() => () => {
                    setShowToast(false);
                    setShowChallengesModal(true);
                  });
                  setToastActionLabel('Ver Retos');
                  setShowToast(true);
                }
              }
            } catch (error) {
              console.error('Error checking challenges:', error);
            }
          };
          
          checkChallenges();
    }
  }, [user]);

  if (loading) {
    return <UnifiedSpinner />;
  }

  // Show login modal if requested
  if (showLoginModal) {
    return <Login onBack={() => setShowLoginModal(false)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <HorizontalMenu 
        onSelectOption={handleNavigation} 
        currentView={currentView}
        isAuthenticated={!!user}
        user={user}
      />

      {/* Main Content Area */}
      <div className="pt-20 px-4 container mx-auto">
        {/* Global Error Display */}
        {error.message && (
          <div className={`mb-8 p-6 rounded-none border backdrop-blur-md animate-fade-in ${
            error.type === 'error' 
              ? 'bg-red-500/10 border-red-500/20 text-red-500' 
              : error.type === 'warning'
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl">
                  {error.type === 'error' ? '🚫' : error.type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight mb-1">
                    {error.type === 'error' ? t('common.error', 'Error') : error.type === 'warning' ? t('common.warning', 'Advertencia') : t('common.info', 'Información')}
                  </h3>
                  <p className="text-xs font-medium opacity-80">{error.message}</p>
                </div>
              </div>
              <div className="flex gap-3">
                {error.retryAction && (
                  <button
                    onClick={() => {
                      error.retryAction?.();
                      clearError();
                    }}
                    className={`px-4 py-2 rounded-none font-black text-[10px] uppercase tracking-widest transition-all ${
                      error.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                    }`}
                  >
                    {t('common.retry', 'Reintentar')}
                  </button>
                )}
                <button
                  onClick={clearError}
                  className={`px-4 py-2 rounded-none font-black text-[10px] uppercase tracking-widest border transition-all ${
                    error.type === 'error' ? 'border-red-500/30 hover:bg-red-500/10' : 'border-blue-500/30 hover:bg-blue-500/10'
                  }`}
                >
                  {t('common.close', 'Cerrar')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Practice Section */}
        {showDefaultContent && currentView === AppView.PRACTICE && <Levels />}
        {currentView === AppView.FREE_PRACTICE && <FreePractice />}
        {currentView === AppView.SPEED_MODE && <SpeedMode />}
        {currentView === AppView.PRECISION_MODE && <PrecisionMode />}
        {currentView === AppView.ZEN_MODE && <ZenMode />}
        {currentView === AppView.NUMBERS_MODE && <NumbersMode />}
        {currentView === AppView.SYMBOLS_MODE && <SymbolsMode />}
        {currentView === AppView.CODE_MODE && <CodeMode />}
        {currentView === AppView.DICTATION_MODE && <DictationMode />}
        {currentView === AppView.CHALLENGE_PLAY && <ChallengePlay onBack={() => setCurrentView(AppView.CHALLENGES)} />}
        
        {/* Games Section */}
        {currentView === AppView.GAME && <PlayGame />}
        
        {/* Multiplayer Section */}
        {currentView === AppView.RACE_MODE && user && <RaceMode />}
        {currentView === AppView.PRACTICE_ROOM && user && <PracticeRoom />}
        {currentView === AppView.FRIENDS && user && (
          <RoomLobby 
            mode="practice" // Friends view could just show lobby or specific friends list
            onJoinRoom={() => {}} 
          />
        )}

        {/* Custom Levels Section */}
        {(currentView === AppView.MY_LEVELS || currentView === AppView.CREATE_LEVEL) && user && (
          <CustomLevelsManager onNavigate={(view) => setCurrentView(view as AppView)} />
        )}

        {/* Create Section - Only accessible when authenticated */}
        {currentView === AppView.CREATE && user && <CreateText />}
        {/* LevelCreator is now handled by CustomLevelsManager */}
        
        {/* Progress Section - Only accessible when authenticated */}
        {currentView === AppView.STATISTICS && user && <UserProfile initialTab="stats" />}
        {currentView === AppView.ACHIEVEMENTS && user && <Achievements />}
        {currentView === AppView.LEADERBOARD && user && <Leaderboard />}
        {currentView === AppView.PROFILE && user && <UserProfile initialTab="profile" />}
        {currentView === AppView.ADMIN_DASHBOARD && isAdmin && (
          <AdminDashboard onNavigate={(view) => setCurrentView(view as AppView)} />
        )}

        {currentView === AppView.COMMUNITY && <CommunityForum />}
        {currentView === AppView.PUBLIC_PROFILE && <PublicProfile />}
        {currentView === AppView.CLASSES && <ClassesRoute />}
        
        

        
        {/* Daily Challenges */}
        {currentView === AppView.CHALLENGES && user && (
          <DailyChallenges 
            onNavigate={(view) => setCurrentView(view as AppView)}
          />
        )}
        
        {showSettingsModal && (
          <BaseModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
            <Settings />
          </BaseModal>
        )}

        {showRegistrationModal && (
          <RegistrationModal
            isOpen={showRegistrationModal}
            onClose={() => setShowRegistrationModal(false)}
            onShowLogin={handleShowLogin}
            featureName={blockedFeatureName}
          />
        )}
        
        {/* Daily Challenge Popup */}
        {showChallengePopup && (
        <DailyChallengePopup
          challenges={getTodayChallenges().filter(c => !hasChallengeBeenAccepted(c.id))}
          onClose={handleCloseChallenge}
          onAccept={handleAcceptChallenge}
        />
      )}
        {/* Daily Challenges Modal */}
        <DailyChallengesModal 
          isOpen={showChallengesModal}
          onClose={() => setShowChallengesModal(false)}
          challenges={dailyChallenges}
          onStartChallenges={handleAcceptChallenges}
        />

        <ToastNotification 
          message={toastMessage}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          onAction={toastAction}
          actionLabel={toastActionLabel}
          duration={10000}
        />
        
        {children}
      </div>
      <Footer />
    </div>
  );
};






const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <MultiplayerProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/auth/callback" element={<AppContent><AuthCallback /></AppContent>} />
              <Route path="/classes" element={
                <AppContent showDefaultContent={false}>
                  <ClassesRoute />
                </AppContent>
              } />
              <Route path="/classes/:id" element={<AppContent showDefaultContent={false}><ClassView /></AppContent>} />
              <Route path="*" element={
                <AppContent>
                </AppContent>
              } />
            </Routes>
          </ErrorBoundary>
        </MultiplayerProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;