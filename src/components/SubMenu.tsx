import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface SubMenuItem {
  text: string;
  option: string;
  locked?: boolean;
}

interface SubMenuProps {
  title: string;
  icon: React.ReactNode;
  items: SubMenuItem[];
  onSelectOption: (option: string) => void;
  currentView: string;
  isOpen: boolean;
  onToggle: () => void;
}

const SubMenu: React.FC<SubMenuProps> = ({ title, icon, items, onSelectOption, currentView, isOpen, onToggle }) => {
  const { isDarkMode } = useTheme();

  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full p-4 transition-colors ${
          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        <div className="flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </div>
        <span>{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className={`pl-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {items.map(item => (
            <button
              key={item.option}
              onClick={() => onSelectOption(item.option)}
              className={`block w-full text-left p-3 flex items-center justify-between ${
                currentView === item.option
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>{item.text}</span>
              {item.locked && <span className="text-yellow-500">🔒</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubMenu;
