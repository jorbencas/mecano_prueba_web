// App.tsx
import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Menu from './components/Menu';
import PlayGame from './components/PlayGame';
import Levels from './components/Levels';
import CreateText from './components/CreateText';
import Settings from './components/Settings';
import VideoPlayer from './components/VideoPlayerWithThumbnails';

const AppContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState<string>('menu');

  const handleNavigation = (view: string) => {
    setCurrentView(view);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="container mx-auto p-4">
        {currentView === 'menu' && <Menu onSelectOption={handleNavigation} />}
        {currentView === 'game' && <PlayGame onBack={() => handleNavigation('menu')} />}
        {currentView === 'practice' && <Levels onBack={() => handleNavigation('menu')} />}
        {currentView === 'create' && <CreateText onBack={() => handleNavigation('menu')} />}
        {currentView === 'settings' && <Settings onBack={() => handleNavigation('menu')} />}
      </div>
      {children}

      <div className="min-h-screen bg-gray-900 flex items-center justify-center">``
      <VideoPlayer
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        poster="https://via.placeholder.com/800x450?text=Video+Not+Found"
        subtitlesUrl="https://example.com/subtitles.vtt"
      />
    </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContainer>
        {<p> </p>}
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;