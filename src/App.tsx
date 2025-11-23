// App.tsx
import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Menu from './components/Menu';
import PlayGame from './components/PlayGame';
import Levels from './components/Levels';
import CreateText from './components/CreateText';
import Settings from './components/Settings';
import ErrorModal from './components/ErrorModal';
import { LanguageProvider } from './context/LanguageContext';
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

const AppContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const { user, loading } = useAuth();
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

    if (view === 'settings') {
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
      <Menu onSelectOption={handleNavigation} currentView={currentView} isAuthenticated={!!user} />
      <div className="container mx-auto p-4 pt-20">
        {/* Practice Section */}
        {currentView === 'practice' && <Levels />}
        {currentView === 'free-practice' && <FreePractice />}
        {currentView === 'speed-mode' && <SpeedMode />}
        {currentView === 'precision-mode' && <PrecisionMode />}
        
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
        
        {showSettingsModal && (
          <ErrorModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
            <Settings 
              onShowLogin={handleShowLogin}
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
        {children}
      </div>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContainer>
            <p></p>
          </AppContainer>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;