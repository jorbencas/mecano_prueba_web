import React, { useState } from 'react';
import { FaKeyboard, FaGamepad, FaPen, FaCog, FaBars } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  isActive: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, onClick, isActive }) => {
  const { isDarkMode } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-4 whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-200 ${
        isActive
          ? 'bg-blue-500 text-white'
          : isDarkMode
          ? 'text-gray-300 hover:bg-gray-700'
          : 'text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </button>
  );
};

interface MenuProps {
  onSelectOption: (option: string) => void;
  currentView: string;
}

const Menu: React.FC<MenuProps> = ({ onSelectOption, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { icon: <FaGamepad className="text-xl" />, text: t('menu.items.game'), option: 'game' },
    { icon: <FaKeyboard className="text-xl" />, text: t('menu.items.practice'), option: 'practice' },
    { icon: <FaPen className="text-xl" />, text: t('menu.items.createText'), option: 'create' },
    { icon: <FaCog className="text-xl" />, text: t('menu.items.settings'), option: 'settings' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {t('menu.title')}
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {menuItems.map((item) => (
                <MenuItem
                  key={item.option}
                  icon={item.icon}
                  text={item.text}
                  onClick={() => onSelectOption(item.option)}
                  isActive={currentView === item.option}
                />
              ))}
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-md ${
                isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaBars className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown for mobile */}
      {isOpen && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {menuItems.map((item) => (
              <MenuItem
                key={item.option}
                icon={item.icon}
                text={item.text}
                onClick={() => {
                  onSelectOption(item.option);
                  setIsOpen(false);
                }}
                isActive={currentView === item.option}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Menu;