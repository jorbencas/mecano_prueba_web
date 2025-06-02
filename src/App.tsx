// App.tsx
import React, {  useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Menu from './components/Menu';
import PlayGame from './components/PlayGame';
import Levels from './components/Levels';
import CreateText from './components/CreateText';
import Settings from './components/Settings';
import ErrorModal from './components/ErrorModal';
import { LanguageProvider } from './context/LanguageContext';

const AppContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState<string>('game');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleNavigation = (view: string) => {
    if (view === 'settings') {
      setShowSettingsModal(true);
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <Menu onSelectOption={handleNavigation} currentView={currentView}/>
      <div className="container mx-auto p-4 pt-20">
        {currentView === 'game' && <PlayGame />}
        {currentView === 'practice' && <Levels />}
        {currentView === 'create' && <CreateText />}
        {showSettingsModal && (
          <ErrorModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
            <Settings />
          </ErrorModal>
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
      <AppContainer>
        <p></p>
      </AppContainer>
    </ThemeProvider>
    </LanguageProvider>

  );
};

export default App;