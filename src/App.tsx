// App.tsx
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import Menu from './components/Menu';
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
import PrecisionMode from './components/PrecisionMode';
import LevelCreator from './components/LevelCreator';
import ProgressDashboard from './components/ProgressDashboard';
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

// Multiplayer Components
import RaceMode from './components/RaceMode';
import PracticeRoom from './components/PracticeRoom';
import FriendsSystem from './components/FriendsSystem';

// Daily Challenges
import DailyChallenges from './components/DailyChallenges';
import DailyChallengesModal from './components/DailyChallengesModal';
import AuthCallback from './components/AuthCallback';

const AppContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<string>('practice');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [blockedFeatureName, setBlockedFeatureName] = useState<string>('');

  // Features that require authentication
  const lockedFeatures = ['leaderboard', 'achievements', 'create', 'create-level', 'statistics'];

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
      if (window.confirm('¿Seguro que quieres cerrar sesión?')) {
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <Menu onSelectOption={handleNavigation} currentView={currentView} isAuthenticated={!!user} user={user} />
      <div className="container mx-auto p-4 pt-20">
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
        
        {/* Create Section - Only accessible when authenticated */}
        {currentView === 'create' && user && <CreateText />}
        {currentView === 'create-level' && user && <LevelCreator />}
        
        {/* Progress Section - Only accessible when authenticated */}
        {currentView === 'statistics' && user && <ProgressDashboard />}
        {currentView === 'achievements' && user && <Achievements />}
        {currentView === 'leaderboard' && user && <Leaderboard />}
        {currentView === 'profile' && user && <UserProfile />}
        {currentView === 'user-management' && user && user.role === 'admin' && <UserManagement />}
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
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={
                    <AppContainer>
                      <p></p>
                    </AppContainer>
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