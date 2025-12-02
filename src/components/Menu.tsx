import React, { useState } from 'react';
import { FaKeyboard, FaGamepad, FaPen, FaCog, FaBars, FaChartLine, FaTrophy, FaPlay, FaBolt, FaBullseye, FaBook, FaSignInAlt, FaUsers, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import SubMenu from './SubMenu';

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
  isAuthenticated?: boolean;
  user?: any;
}

const Menu: React.FC<MenuProps> = ({ onSelectOption, currentView, isAuthenticated = false, user = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    practice: false,
    games: false,
    create: false,
    progress: false,
  });
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleSubMenu = (key: string) => {
    setOpenSubMenus(prev => ({ ...prev, [key]: !prev[key] }));
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

  const createItems = [
    { text: t('menu.create.texts', 'Textos Personalizados'), option: 'create' },
    { text: t('menu.create.levels', 'Niveles Personalizados'), option: 'create-level' },
  ];

  const progressItems = [
    { text: t('menu.progress.stats', 'Estadísticas'), option: 'statistics', locked: !isAuthenticated },
    { text: t('menu.progress.achievements', 'Logros'), option: 'achievements', locked: !isAuthenticated },
    { text: t('menu.progress.leaderboard', 'Clasificación'), option: 'leaderboard', locked: !isAuthenticated },
    { text: t('menu.progress.challenges', 'Retos Diarios'), option: 'challenges', locked: !isAuthenticated },
  ];

  const createItemsWithLock = [
    { text: t('menu.create.texts', 'Textos Personalizados'), option: 'create', locked: !isAuthenticated },
    { text: t('menu.create.levels', 'Niveles Personalizados'), option: 'create-level', locked: !isAuthenticated },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {t('menu.title')}
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="relative group">
              <button className={`flex items-center px-4 py-2 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                <FaKeyboard className="mr-2" />
                {t('menu.sections.practice', 'Práctica')}
              </button>
              <div className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
                {practiceItems.map(item => (
                  <button
                    key={item.option}
                    onClick={() => onSelectOption(item.option)}
                    className={`block w-full text-left px-4 py-3 ${currentView === item.option ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <button className={`flex items-center px-4 py-2 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                <FaGamepad className="mr-2" />
                {t('menu.sections.games', 'Juegos')}
              </button>
              <div className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
                {gamesItems.map(item => (
                  <button
                    key={item.option}
                    onClick={() => onSelectOption(item.option)}
                    className={`block w-full text-left px-4 py-3 ${currentView === item.option ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <button className={`flex items-center px-4 py-2 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                <FaPen className="mr-2" />
                {t('menu.sections.create', 'Crear')}
              </button>
              <div className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
                {createItemsWithLock.map(item => (
                  <button
                    key={item.option}
                    onClick={() => onSelectOption(item.option)}
                    className={`block w-full text-left px-4 py-3 flex items-center justify-between ${currentView === item.option ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  >
                    <span>{item.text}</span>
                    {item.locked && <span className="text-yellow-500">🔒</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <button className={`flex items-center px-4 py-2 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                <FaChartLine className="mr-2" />
                {t('menu.sections.progress', 'Progreso')}
              </button>
              <div className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
                {progressItems.map(item => (
                  <button
                    key={item.option}
                    onClick={() => onSelectOption(item.option)}
                    className={`block w-full text-left px-4 py-3 flex items-center justify-between ${currentView === item.option ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  >
                    <span>{item.text}</span>
                    {item.locked && <span className="text-yellow-500">🔒</span>}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Settings - Only show when NOT authenticated */}
            {!isAuthenticated && (
              <button
                onClick={() => onSelectOption('settings')}
                className={`flex items-center px-4 py-2 rounded transition-colors ${currentView === 'settings' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <FaCog className="mr-2" />
                {t('menu.items.settings')}
              </button>
            )}
            
            {/* User Profile Dropdown */}
            {isAuthenticated && user ? (
              <div className="relative group">
                <button className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || user.email} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white font-bold`}>
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline">{user.displayName || user.email}</span>
                  <span className="text-xs">▼</span>
                </button>
                <div className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || user.email} className="w-12 h-12 rounded-full" />
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white font-bold text-xl`}>
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{user.displayName || 'Usuario'}</p>
                        <p className="text-sm opacity-75 truncate">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500 bg-opacity-20 text-yellow-500 text-xs rounded">
                            Administrador
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectOption('profile')}
                    className={`block w-full text-left px-4 py-3 ${currentView === 'profile' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  >
                    <FaUser className="inline mr-2" />
                    Ver Perfil
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => onSelectOption('user-management')}
                      className={`block w-full text-left px-4 py-3 ${currentView === 'user-management' ? 'bg-yellow-500 text-white' : isDarkMode ? 'hover:bg-gray-600 text-yellow-500' : 'hover:bg-gray-100 text-yellow-600'}`}
                    >
                      <FaUsers className="inline mr-2" />
                      Gestión de Usuarios
                    </button>
                  )}
                  <button
                    onClick={() => onSelectOption('settings')}
                    className={`block w-full text-left px-4 py-3 ${currentView === 'settings' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  >
                    <FaCog className="inline mr-2" />
                    Configuración
                  </button>
                  <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button
                      onClick={() => onSelectOption('logout')}
                      className={`block w-full text-left px-4 py-3 text-red-500 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                    >
                      <FaSignOutAlt className="inline mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onSelectOption('login')}
                className={`flex items-center px-4 py-2 rounded transition-colors ${currentView === 'login' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <FaSignInAlt className="mr-2" />
                {t('menu.items.login', 'Iniciar Sesión')}
              </button>
            )}
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

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <SubMenu
              title={t('menu.sections.practice', 'Práctica')}
              icon={<FaKeyboard className="text-xl" />}
              items={practiceItems}
              onSelectOption={(option) => {
                onSelectOption(option);
                setIsOpen(false);
              }}
              currentView={currentView}
              isOpen={openSubMenus.practice}
              onToggle={() => toggleSubMenu('practice')}
            />
            <SubMenu
              title={t('menu.sections.games', 'Juegos')}
              icon={<FaGamepad className="text-xl" />}
              items={gamesItems}
              onSelectOption={(option) => {
                onSelectOption(option);
                setIsOpen(false);
              }}
              currentView={currentView}
              isOpen={openSubMenus.games}
              onToggle={() => toggleSubMenu('games')}
            />
            <SubMenu
              title={t('menu.sections.create', 'Crear')}
              icon={<FaPen className="text-xl" />}
              items={createItemsWithLock}
              onSelectOption={(option) => {
                onSelectOption(option);
                setIsOpen(false);
              }}
              currentView={currentView}
              isOpen={openSubMenus.create}
              onToggle={() => toggleSubMenu('create')}
            />
            <SubMenu
              title={t('menu.sections.progress', 'Progreso')}
              icon={<FaChartLine className="text-xl" />}
              items={progressItems}
              onSelectOption={(option) => {
                onSelectOption(option);
                setIsOpen(false);
              }}
              currentView={currentView}
              isOpen={openSubMenus.progress}
              onToggle={() => toggleSubMenu('progress')}
            />
            
            {/* User Profile Section - Mobile */}
            {isAuthenticated && user ? (
              <>
                <div className={`p-4 border-t border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || user.email} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white font-bold`}>
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{user.displayName || 'Usuario'}</p>
                      <p className="text-xs opacity-75 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                <MenuItem
                  icon={<FaUser className="text-xl" />}
                  text="Ver Perfil"
                  onClick={() => {
                    onSelectOption('profile');
                    setIsOpen(false);
                  }}
                  isActive={currentView === 'profile'}
                />
                {user.role === 'admin' && (
                  <MenuItem
                    icon={<FaUsers className="text-xl" />}
                    text="Gestión de Usuarios"
                    onClick={() => {
                      onSelectOption('user-management');
                      setIsOpen(false);
                    }}
                    isActive={currentView === 'user-management'}
                  />
                )}
                <MenuItem
                  icon={<FaSignOutAlt className="text-xl" />}
                  text="Cerrar Sesión"
                  onClick={() => {
                    onSelectOption('logout');
                    setIsOpen(false);
                  }}
                  isActive={false}
                />
              </>
            ) : (
              <>
                <MenuItem
                  icon={<FaCog className="text-xl" />}
                  text={t('menu.items.settings')}
                  onClick={() => {
                    onSelectOption('settings');
                    setIsOpen(false);
                  }}
                  isActive={currentView === 'settings'}
                />
                <MenuItem
                  icon={<FaSignInAlt className="text-xl" />}
                  text={t('menu.items.login', 'Iniciar Sesión')}
                  onClick={() => {
                    onSelectOption('login');
                    setIsOpen(false);
                  }}
                  isActive={currentView === 'login'}
                />
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Menu;