// App.tsx
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import HorizontalMenu from './components/HorizontalMenu';
import PlayGame from './components/PlayGame';
import Levels from './components/Levels';
import CreateText from './components/CreateText';
import Settings from './components/Settings';
import ErrorModal from './components/ErrorModal';
import { LanguageProvider } from './context/LanguageContext';
import { MultiplayerProvider } from './context/MultiplayerContext';
import Login from './components/Login';
import RegistrationModal from './components/RegistrationModal';

// New components
import FreePractice from './components/FreePractice';
import SpeedMode from './components/SpeedMode';
import RoomLobby from './components/RoomLobby';
import CustomLevelsViewer from './components/CustomLevelsViewer';
import PrecisionMode from './components/PrecisionMode';
import LevelCreator from './components/LevelCreator';
import ProgressDashboard from './components/ProgressDashboard';
import PracticeRoom from './components/PracticeRoom';
import RaceMode from './components/RaceMode';
import Achievements from './components/Achievements';
import Leaderboard from './components/Leaderboard';
import UserProfile from './components/UserProfile';

// Additional Practice Modes
import ZenMode from './components/ZenMode';
import NumbersMode from './components/NumbersMode';
import SymbolsMode from './components/SymbolsMode';
import CodeMode from './components/CodeMode';
import DictationMode from './components/DictationMode';
import UserManagement from './components/UserManagement';
import SettingsConfiguration from './components/SettingsConfiguration';
import PublicProfile from './components/social/PublicProfile';
import CommunityForum from './components/social/CommunityForum';
import AdminDashboard from './components/AdminDashboard';

// Multiplayer Components
import FriendsSystem from './components/FriendsSystem';

// Daily Challenges
import DailyChallenges from './components/DailyChallenges';
import DailyChallengesModal from './components/DailyChallengesModal';
import DailyChallengePopup from './components/DailyChallengePopup';
import { getTodayChallenge, hasSeenChallengeToday, markChallengeAsSeen } from './utils/dailyChallengeUtils';
import AuthCallback from './components/AuthCallback';
import { useDynamicTranslations } from './hooks/useDynamicTranslations';

const AppContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const { user, loading, logout } = useAuth();
  const { t } = useDynamicTranslations();
  const [currentView, setCurrentView] = useState<string>('practice');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  const [showChallengePopup, setShowChallengePopup] = useState(false);
  const [todayChallenge, setTodayChallenge] = useState(getTodayChallenge());

  const [blockedFeatureName, setBlockedFeatureName] = useState<string>('');

  // Show daily challenge popup on login
  React.useEffect(() => {
    if (user && !hasSeenChallengeToday()) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setTodayChallenge(getTodayChallenge());
        setShowChallengePopup(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

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
      'create-level': 'Crear Niveles',
      'statistics': 'Estadísticas',
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

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <div className="text-2xl">Cargando...</div>
      </div>
    );
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
        {currentView === 'practice' && <Levels />}
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
        {currentView === 'my-levels' && user && <CustomLevelsViewer />}

        {/* Create Section - Only accessible when authenticated */}
        {currentView === 'create' && user && <CreateText />}
        {currentView === 'create-level' && user && <LevelCreator />}
        
        {/* Progress Section - Only accessible when authenticated */}
        {currentView === 'statistics' && user && <ProgressDashboard />}
        {currentView === 'achievements' && user && <Achievements />}
        {currentView === 'leaderboard' && user && <Leaderboard />}
        {currentView === 'profile' && user && <UserProfile />}
        {currentView === 'admin-dashboard' && user && user.role === 'admin' && <AdminDashboard />}
        {currentView === 'settings-config' && user && <SettingsConfiguration />}
        {currentView === 'community' && <CommunityForum />}
        {currentView === 'public-profile' && <PublicProfile />}
        
        {/* Multiplayer Section */}
        {currentView === 'race-mode' && user && <RaceMode />}
        {currentView === 'practice-room' && user && <PracticeRoom />}
        {currentView === 'friends' && user && <FriendsSystem />}
        
        {/* Daily Challenges */}
        {currentView === 'challenges' && user && <DailyChallenges />}
        
        {showSettingsModal && (
          <ErrorModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
            <Settings 
              onNavigate={(view) => {
                setShowSettingsModal(false);
                setCurrentView(view);
              }}
            />
          </ErrorModal>
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
        {showChallengePopup && user && (
          <DailyChallengePopup
            challenge={todayChallenge}
            onClose={() => {
              setShowChallengePopup(false);
              markChallengeAsSeen();
            }}
            onAccept={() => {
              setShowChallengePopup(false);
              markChallengeAsSeen();
              // Redirect to practice mode
              setCurrentView('practice');
            }}
          />
        )}

        {/* Daily Challenges Modal */}
        <DailyChallengesModal />
        
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