import React, { useState, useEffect } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import CustomLevelsViewer from './CustomLevelsViewer';
import LevelCreator from './LevelCreator';
import { FaList, FaPlus, FaArrowLeft } from 'react-icons/fa';

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
        <div className="transition-all duration-300">
          {activeTab === 'view' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <FaList size={24} />
                  </span>
                  {t('customLevels.myLevels')}
                </h1>
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  <FaPlus /> {t('customLevels.createNew')}
                </button>
              </div>

              <CustomLevelsViewer 
                onNavigate={onNavigate} 
                onCreateNew={handleCreateNew}
                onEditLevel={handleEditLevel}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setActiveTab('view')}
                  className={`p-2 rounded-xl transition-all ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
                  }`}
                >
                  <FaArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-black tracking-tight">
                  {localStorage.getItem('editingLevel') 
                    ? t('customLevels.editTitle', 'Editar Nivel') 
                    : t('customLevels.createTitle', 'Crear Nuevo Nivel')
                  }
                </h1>
              </div>

              <LevelCreator 
                onSaved={handleLevelSaved}
                onCancel={() => setActiveTab('view')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomLevelsManager;
