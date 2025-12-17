// App.tsx
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import HorizontalMenu from './components/HorizontalMenu';
import PlayGame from './components/PlayGame';
import Levels from './components/Levels';
import CreateText from './components/CreateText';
import Settings from './components/Settings';
import BaseModal from './components/BaseModal';
import { LanguageProvider } from './context/LanguageContext';
import { MultiplayerProvider } from './context/MultiplayerContext';
import Login from './components/Login';
import RegistrationModal from './components/RegistrationModal';

// New components
import FreePractice from './components/FreePractice';
import SpeedMode from './components/SpeedMode';
import RoomLobby from './components/RoomLobby';
import CustomLevelsManager from './components/CustomLevelsManager';
import PrecisionMode from './components/PrecisionMode';
import LevelCreator from './components/LevelCreator'; // Kept for type safety if needed, but unused in render
import ProgressDashboard from './components/ProgressDashboard'; // Kept for type safety if needed, but unused in render
import PracticeRoom from './components/PracticeRoom';
import RaceMode from './components/RaceMode';
import Achievements from './components/Achievements';
import Leaderboard from './components/Leaderboard';
import UserProfile from './components/UserProfile';
import LoadingScreen from './components/LoadingScreen';
import HelpCenter from './components/HelpCenter';

// Additional Practice Modes
import ZenMode from './components/ZenMode';
import NumbersMode from './components/NumbersMode';
import SymbolsMode from './components/SymbolsMode';
import CodeMode from './components/CodeMode';
import DictationMode from './components/DictationMode';
import PublicProfile from './components/social/PublicProfile';
import CommunityForum from './components/social/CommunityForum';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/tutoring/TeacherDashboard';
import StudentClasses from './components/tutoring/StudentClasses';
import ClassView from './components/tutoring/ClassView';

// Multiplayer Components
import FriendsSystem from './components/FriendsSystem';

// Daily Challenges
import DailyChallenges from './components/DailyChallenges';
import DailyChallengesModal from './components/DailyChallengesModal';
import DailyChallengePopup from './components/DailyChallengePopup';
import { getTodayChallenges, 
  hasSeenChallengeToday, 
  markChallengeAsSeen, 
  hasChallengeBeenAccepted,
  acceptChallenge
} from './utils/dailyChallengeUtils';
import AuthCallback from './components/AuthCallback';
import { useDynamicTranslations } from './hooks/useDynamicTranslations';
import ToastNotification from './components/ToastNotification';
import { challengesAPI } from './api/challenges';

const ClassesRoute: React.FC = () => {
  const { user } = useAuth();
  
  console.log('ClassesRoute rendering, user:', user);

  if (!user) {
    console.log('ClassesRoute: No user, redirecting');
    return <Navigate to="/" />;
  }
  
  console.log('ClassesRoute: User role:', user.role);

  if (user.role === 'admin' || user.role === 'teacher') {
    console.log('ClassesRoute: Rendering TeacherDashboard');
    return <TeacherDashboard />;
  }
  
  console.log('ClassesRoute: Rendering StudentClasses');
  return <StudentClasses />;
};

const AppContent: React.FC<{ children?: React.ReactNode; showDefaultContent?: boolean }> = ({ children, showDefaultContent = true }) => {
  const { isDarkMode } = useTheme();
  const { user, loading, logout } = useAuth();
  const { t } = useDynamicTranslations();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<string>('practice');
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
  const lockedFeatures = ['leaderboard', 'achievements', 'create', 'create-level', 'statistics', 'race-mode', 'practice-room', 'friends', 'challenges', 'my-levels', 'admin-dashboard'];

  const handleNavigation = (view: string) => {
    // Handle login view
    if (view === 'login') {
      setShowLoginModal(true);
      return;
    }
    
    // Check if feature is locked and user is not authenticated
    if (lockedFeatures.includes(view) && !user) {
      setBlockedFeatureName(getFeatureName(view));
      setShowRegistrationModal(true);
      return;
    }

    if (view === 'logout') {
      if (window.confirm(t('confirmations.logout'))) {
        logout();
        setCurrentView('practice');
      }
    } else if (view === 'settings') {
      setShowSettingsModal(true);
    } else {
      setCurrentView(view);
    }
  };

  const getFeatureName = (view: string): string => {
    const featureNames: Record<string, string> = {
      'leaderboard': 'Clasificación',
      'achievements': 'Logros',
      'create': 'Crear Textos',
      'create-level': 'Gestor de Niveles',
      'statistics': 'Perfil y Estadísticas',
      'race-mode': 'Carrera Competitiva',
      'practice-room': 'Sala de Práctica',
      'friends': 'Sistema de Amigos',
      'challenges': 'Retos Diarios',
      'my-levels': 'Mis Niveles Personalizados',
      'admin-dashboard': 'Panel de Administrador',
    };
    return featureNames[view] || view;
  };

  const handleShowLogin = () => {
    setShowSettingsModal(false);
    setShowRegistrationModal(false);
    setShowLoginModal(true);
  };

  const handleAcceptChallenge = (challengeId: string) => {
    acceptChallenge(challengeId);
    
    // Find challenge in API data or local utils
    const apiChallenge = dailyChallenges.find(c => c.id === challengeId);
    const localChallenge = getTodayChallenges().find(c => c.id === challengeId);
    const acceptedChallenge = apiChallenge || localChallenge;
    
    // Close popup/modal
    setShowChallengePopup(false);
    setShowChallengesModal(false);
    
    if (acceptedChallenge) {
      // Save active challenge
      localStorage.setItem('active_challenge', JSON.stringify(acceptedChallenge));

      // Navigate based on mode or theme
      if (acceptedChallenge.mode) {
        // Handle API mode mapping
        const modeMap: Record<string, string> = {
          'speed-mode': 'speed-mode',
          'precision-mode': 'precision-mode',
          'zen-mode': 'zen-mode',
          'practice': 'practice'
        };
        setCurrentView(modeMap[acceptedChallenge.mode] || 'practice');
      } else if (acceptedChallenge.theme) {
        // Handle legacy local theme mapping
        if (['speed', 'christmas', 'halloween'].includes(acceptedChallenge.theme)) {
          setCurrentView('speed-mode');
        } else if (['accuracy', 'valentine'].includes(acceptedChallenge.theme)) {
          setCurrentView('precision-mode');
        } else {
          setCurrentView('practice');
        }
      } else {
        setCurrentView('practice');
      }
    } else {
      setCurrentView('practice');
    }
  };

  const handleCloseChallenge = () => {
    markChallengeAsSeen();
    setShowChallengePopup(false);
  };

  useEffect(() => {
    if (user) {
      // Check for tutoring notifications
      import('./api/tutoring').then(mod => {
        mod.tutoringAPI.checkNotifications(user.id).then(sessions => {
          if (sessions.length > 0) {
            setToastMessage(`Tienes ${sessions.length} nuevas sesiones de tutoría`);
            setToastAction(() => () => setCurrentView('classes'));
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
    return <LoadingScreen />;
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
        {/* Practice Section */}
        {showDefaultContent && currentView === 'practice' && <Levels />}
        {currentView === 'free-practice' && <FreePractice />}
        {currentView === 'speed-mode' && <SpeedMode />}
        {currentView === 'precision-mode' && <PrecisionMode />}
        {currentView === 'zen-mode' && <ZenMode />}
        {currentView === 'numbers-mode' && <NumbersMode />}
        {currentView === 'symbols-mode' && <SymbolsMode />}
        {currentView === 'code-mode' && <CodeMode />}
        {currentView === 'dictation-mode' && <DictationMode />}
        
        {/* Games Section */}
        {currentView === 'game' && <PlayGame />}
        
        {/* Multiplayer Section */}
        {currentView === 'race-mode' && user && <RaceMode />}
        {currentView === 'practice-room' && user && <PracticeRoom />}
        {currentView === 'friends' && user && (
          <RoomLobby 
            mode="practice" // Friends view could just show lobby or specific friends list
            onJoinRoom={() => {}} 
          />
        )}

        {/* Custom Levels Section */}
        {(currentView === 'my-levels' || currentView === 'create-level') && user && (
          <CustomLevelsManager onNavigate={(view) => setCurrentView(view)} />
        )}

        {/* Create Section - Only accessible when authenticated */}
        {currentView === 'create' && user && <CreateText />}
        {/* LevelCreator is now handled by CustomLevelsManager */}
        
        {/* Progress Section - Only accessible when authenticated */}
        {currentView === 'statistics' && user && <UserProfile initialTab="stats" />}
        {currentView === 'achievements' && user && <Achievements />}
        {currentView === 'leaderboard' && user && <Leaderboard />}
        {currentView === 'profile' && user && <UserProfile initialTab="profile" />}
        {currentView === 'admin-dashboard' && user && user.role === 'admin' && (
          <AdminDashboard onNavigate={(view) => setCurrentView(view)} />
        )}

        {currentView === 'community' && <CommunityForum />}
        {currentView === 'public-profile' && <PublicProfile />}
        {currentView === 'classes' && <ClassesRoute />}
        
        {currentView === 'help' && <HelpCenter />}
        

        
        {/* Daily Challenges */}
        {currentView === 'challenges' && user && (
          <DailyChallenges 
            onNavigate={(view) => setCurrentView(view)}
          />
        )}
        
        {showSettingsModal && (
          <BaseModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
            <Settings 
              onNavigate={(view) => {
                setShowSettingsModal(false);
                setCurrentView(view);
              }}
            />
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
          onSelectChallenge={(challenge) => handleAcceptChallenge(challenge.id)}
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
    </div>
  );
};






const App: React.FC = () => {
  return (
    <Router>
      <LanguageProvider>
        <AccessibilityProvider>
          <ThemeProvider>
            <AuthProvider>
              <MultiplayerProvider>
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
              </MultiplayerProvider>
            </AuthProvider>
          </ThemeProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;