import React, { useState } from 'react';
import { 
  FaKeyboard, FaGamepad, FaPen, FaCog, FaChartLine, 
  FaTrophy, FaUsers, FaUser, FaSignOutAlt, FaSignInAlt, 
  FaChevronDown, FaChevronRight, FaBars, FaTimes 
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface SidebarProps {
  onSelectOption: (option: string) => void;
  currentView: string;
  isAuthenticated?: boolean;
  user?: any;
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarItemProps {
  icon?: React.ReactNode;
  text: string;
  onClick: () => void;
  isActive: boolean;
  isSubItem?: boolean;
  locked?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, onClick, isActive, isSubItem = false }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-3 transition-colors duration-200 
        ${isSubItem ? 'pl-10 text-sm' : 'pl-4'}
        ${isActive 
          ? 'bg-blue-600 text-white' 
          : isDarkMode 
            ? 'text-gray-300 hover:bg-gray-700' 
            : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {icon && <span className="mr-3 text-lg">{icon}</span>}
      <span className="flex-1 text-left">{text}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  onSelectOption, 
  currentView, 
  isAuthenticated = false, 
  user = null,
  isOpen,
  toggleSidebar
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    practice: true,
    games: false,
    multiplayer: false,
    custom: false,
    progress: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const practiceItems = [
    { text: t('menu.practice.guided', 'Niveles Guiados'), option: 'practice' },
    { text: t('menu.practice.free', 'Práctica Libre'), option: 'free-practice' },
    { text: t('menu.practice.speed', 'Modo Velocidad'), option: 'speed-mode' },
    { text: t('menu.practice.precision', 'Modo Precisión'), option: 'precision-mode' },
    { text: t('menu.practice.zen', 'Modo Zen'), option: 'zen-mode' },
    { text: t('menu.practice.numbers', 'Modo Números'), option: 'numbers-mode' },
    { text: t('menu.practice.symbols', 'Modo Símbolos'), option: 'symbols-mode' },
    { text: t('menu.practice.code', 'Modo Código'), option: 'code-mode' },
    { text: t('menu.practice.dictation', 'Modo Dictado'), option: 'dictation-mode' },
  ];

  const gamesItems = [
    { text: t('menu.games.falling', 'Letras Cayendo'), option: 'game' },
  ];

  const customItems = [
    { text: t('menu.custom.texts', 'Textos Personalizados'), option: 'create' },
    { text: t('menu.custom.myLevels', 'Mis Niveles'), option: 'my-levels' },
  ];

  const multiplayerItems = [
    { text: t('menu.multiplayer.race', 'Carrera Competitiva'), option: 'race-mode' },
    { text: t('menu.multiplayer.practice', 'Sala de Práctica'), option: 'practice-room' },
    { text: t('menu.multiplayer.friends', 'Amigos'), option: 'friends' },
  ];

  const progressItems = [
    { text: t('menu.progress.stats', 'Estadísticas'), option: 'statistics' },
    { text: t('menu.progress.achievements', 'Logros'), option: 'achievements' },
    { text: t('menu.progress.leaderboard', 'Clasificación'), option: 'leaderboard' },
    { text: t('menu.progress.challenges', 'Retos Diarios'), option: 'challenges' },
  ];

  const renderSection = (title: string, icon: React.ReactNode, items: any[], sectionKey: string) => (
    <div className="mb-1">
      <button
        onClick={() => toggleSection(sectionKey)}
        className={`flex items-center w-full p-3 font-semibold transition-colors
          ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}
        `}
      >
        <span className="mr-3 text-xl">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        {expandedSections[sectionKey] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
      </button>
      
      {expandedSections[sectionKey] && (
        <div className={`overflow-hidden transition-all duration-300 p-2 space-y-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {items.map(item => (
            <button
              key={item.option}
              onClick={() => {
                onSelectOption(item.option);
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={`
                w-full p-3 rounded-lg text-left text-sm font-medium transition-all duration-200
                ${currentView === item.option 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-sm' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200'
                }
                hover:transform hover:scale-102
              `}
            >
              <span>{item.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${isDarkMode ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-200'}
        flex flex-col
      `}>
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-600'}`}>
            {t('menu.title', 'MecanoWeb')}
          </h1>
          <button onClick={toggleSidebar} className="md:hidden text-gray-500">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {renderSection(t('menu.sections.practice', 'Práctica'), <FaKeyboard />, practiceItems, 'practice')}
          {renderSection(t('menu.sections.games', 'Juegos'), <FaGamepad />, gamesItems, 'games')}
          {renderSection(t('menu.sections.multiplayer', 'Multijugador'), <FaUsers />, multiplayerItems, 'multiplayer')}
          {renderSection(t('menu.sections.custom', 'Personalizado'), <FaPen />, customItems, 'custom')}
          {renderSection(t('menu.sections.progress', 'Progreso'), <FaChartLine />, progressItems, 'progress')}
        </div>

        {/* Footer (User Profile & Settings) */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          {isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white font-bold`}>
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user.displayName || 'Usuario'}
                  </p>
                  <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.email}
                  </p>
                </div>
              </div>
              
              <SidebarItem 
                icon={<FaUser />} 
                text="Ver Perfil" 
                onClick={() => onSelectOption('profile')} 
                isActive={currentView === 'profile'} 
              />
              
              {user.role === 'admin' && (
                <SidebarItem 
                  icon={<FaUsers />} 
                  text="Gestión Usuarios" 
                  onClick={() => onSelectOption('user-management')} 
                  isActive={currentView === 'user-management'} 
                />
              )}

              <SidebarItem 
                icon={<FaCog />} 
                text="Configuración" 
                onClick={() => onSelectOption('settings')} 
                isActive={currentView === 'settings'} 
              />

              <button
                onClick={() => onSelectOption('logout')}
                className={`flex items-center w-full p-2 text-sm text-red-500 hover:bg-red-50 rounded transition-colors`}
              >
                <FaSignOutAlt className="mr-3" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <SidebarItem 
                icon={<FaCog />} 
                text={t('menu.items.settings')} 
                onClick={() => onSelectOption('settings')} 
                isActive={currentView === 'settings'} 
              />
              <button
                onClick={() => onSelectOption('login')}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <FaSignInAlt />
                {t('menu.items.login', 'Iniciar Sesión')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
