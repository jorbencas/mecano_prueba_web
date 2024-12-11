// App.tsx
import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Menu from './components/Menu';
import PlayGame from './components/PlayGame';
import Levels from './components/Levels';
import CreateText from './components/CreateText';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('menu');

  const handleNavigation = (view: string) => {
    setCurrentView(view);
  };

  return (
    <ThemeProvider>
      <div className="App">
        {currentView === 'menu' && <Menu onSelectOption={handleNavigation} />}
        {currentView === 'game' && <PlayGame onBack={() => handleNavigation('menu')} />}
        {currentView === 'practice' && <Levels onBack={() => handleNavigation('menu')} />}
        {currentView === 'create' && <CreateText onBack={() => handleNavigation('menu')} />}
        {currentView === 'settings' && <Settings onBack={() => handleNavigation('menu')} />}
      </div>
    </ThemeProvider>
  );
};

export default App;
