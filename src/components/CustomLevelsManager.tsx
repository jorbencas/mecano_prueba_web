import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import CustomLevelsViewer from './CustomLevelsViewer';
import LevelCreator from './LevelCreator';
import { FaList, FaPlus } from 'react-icons/fa';

interface CustomLevelsManagerProps {
  onNavigate?: (view: string) => void;
}

const CustomLevelsManager: React.FC<CustomLevelsManagerProps> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');

  // Check if we are editing a level to switch to create tab automatically
  useEffect(() => {
    const editingLevel = localStorage.getItem('editingLevel');
    if (editingLevel) {
      setActiveTab('create');
    }
  }, []);

  const handleLevelSaved = () => {
    setActiveTab('view');
    // Clear editing state if any
    localStorage.removeItem('editingLevel');
  };

  const handleCreateNew = () => {
    localStorage.removeItem('editingLevel'); // Ensure fresh start
    setActiveTab('create');
  };

  const handleEditLevel = (level: any) => {
    localStorage.setItem('editingLevel', JSON.stringify(level));
    setActiveTab('create');
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-2 rounded-md flex items-center gap-2 font-bold transition-all ${
                activeTab === 'view'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaList /> {t('customLevels.myLevels', 'Mis Niveles')}
            </button>
            <button
              onClick={handleCreateNew}
              className={`px-6 py-2 rounded-md flex items-center gap-2 font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaPlus /> {t('customLevels.create', 'Crear / Editar')}
            </button>
          </div>
        </div>

        <div className="transition-all duration-300">
          {activeTab === 'view' ? (
            <CustomLevelsViewer 
              onNavigate={onNavigate} // Pass through for playing or other navs
              onCreateNew={handleCreateNew}
              onEditLevel={handleEditLevel}
            />
          ) : (
            <LevelCreator 
              onSaved={handleLevelSaved}
              onCancel={() => setActiveTab('view')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomLevelsManager;
