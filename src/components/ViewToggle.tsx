import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex p-1 rounded-none border backdrop-blur-sm ${
      isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'
    }`}>
      <button
        onClick={() => onViewChange('grid')}
        aria-label="Vista de cuadrícula"
        aria-pressed={view === 'grid'}
        className={`p-2 transition-all rounded-none ${
          view === 'grid'
            ? 'bg-blue-600 text-white shadow-lg'
            : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
        }`}
        title="Vista de cuadrícula"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => onViewChange('list')}
        aria-label="Vista de lista"
        aria-pressed={view === 'list'}
        className={`p-2 transition-all rounded-none ${
          view === 'list'
            ? 'bg-blue-600 text-white shadow-lg'
            : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
        }`}
        title="Vista de lista"
      >
        <List size={18} />
      </button>
    </div>
  );
};

export default ViewToggle;
