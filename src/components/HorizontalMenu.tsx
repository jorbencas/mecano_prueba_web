import React, { useState } from 'react';
import {
  FaKeyboard, FaGamepad, FaPen, FaCog, FaChartLine,
  FaTrophy, FaUsers, FaChalkboardTeacher, FaUser, FaSignOutAlt, FaSignInAlt,
  FaRunning, FaBullseye, FaSpa, FaSortNumericDown, FaCode,
  FaMicrophone, FaHashtag, FaFlagCheckered, FaUserFriends,
  FaChevronDown, FaChevronUp, FaGraduationCap, FaQuestionCircle,
  FaUserCircle
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import NavigationCard from './NavigationCard';

interface HorizontalMenuProps {
  onSelectOption: (option: string) => void;
  currentView: string;
  isAuthenticated?: boolean;
  user?: any;
}

const HorizontalMenu: React.FC<HorizontalMenuProps> = ({ 
  onSelectOption, 
  currentView, 
  isAuthenticated = false, 
  user = null 
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const classesItems = [
    { title: t('menu.classes'), description: t('menu.classesDesc'), icon: <FaChalkboardTeacher />, option: 'classes', color: 'from-indigo-500 to-purple-600', badge: 'New' },
  ];

  const communityItems = [
    { title: t('menu.community'), description: t('menu.communityDesc'), icon: <FaUsers />, option: 'community', color: 'from-pink-500 to-rose-500' },
  ];

  const practiceItems = [
    { title: t('menu.practice.guided'), description: t('menu.practice.guidedDesc'), icon: <FaKeyboard />, option: 'practice', color: 'blue' },
    { title: t('menu.practice.free'), description: t('menu.practice.freeDesc'), icon: <FaKeyboard />, option: 'free-practice', color: 'green' },
    { title: t('menu.practice.speed'), description: t('menu.practice.speedDesc'), icon: <FaRunning />, option: 'speed-mode', color: 'red' },
    { title: t('menu.practice.precision'), description: t('menu.practice.precisionDesc'), icon: <FaBullseye />, option: 'precision-mode', color: 'purple' },
    { title: t('menu.practice.zen'), description: t('menu.practice.zenDesc'), icon: <FaSpa />, option: 'zen-mode', color: 'teal' },
    { title: t('menu.practice.numbers'), description: t('menu.practice.numbersDesc'), icon: <FaSortNumericDown />, option: 'numbers-mode', color: 'orange' },
    { title: t('menu.practice.symbols'), description: t('menu.practice.symbolsDesc'), icon: <FaHashtag />, option: 'symbols-mode', color: 'indigo' },
    { title: t('menu.practice.code'), description: t('menu.practice.codeDesc'), icon: <FaCode />, option: 'code-mode', color: 'gray' },
    { title: t('menu.practice.dictation'), description: t('menu.practice.dictationDesc'), icon: <FaMicrophone />, option: 'dictation-mode', color: 'pink' },
  ];

  const gamesItems = [
    { title: t('menu.games.falling'), description: t('menu.games.fallingDesc'), icon: <FaGamepad />, option: 'game', color: 'purple' },
  ];

  const multiplayerItems = [
    { title: t('menu.multiplayer.race'), description: t('menu.multiplayer.raceDesc'), icon: <FaFlagCheckered />, option: 'race-mode', color: 'red' },
    { title: t('menu.multiplayer.practice'), description: t('menu.multiplayer.practiceDesc'), icon: <FaUsers />, option: 'practice-room', color: 'blue' },
    { title: t('menu.multiplayer.friends'), description: t('menu.multiplayer.friendsDesc'), icon: <FaUserFriends />, option: 'friends', color: 'green' },
  ];

  const customItems = [
    { title: t('menu.custom.texts'), description: t('menu.custom.textsDesc'), icon: <FaPen />, option: 'create', color: 'blue' },
    { title: t('menu.custom.levels'), description: t('menu.custom.levelsDesc'), icon: <FaTrophy />, option: 'my-levels', color: 'purple' },
  ];

  const progressItems = [
    { title: t('menu.progress.achievements'), description: t('menu.progress.achievementsDesc'), icon: <FaTrophy />, option: 'achievements', color: 'yellow' },
    { title: t('menu.progress.leaderboard'), description: t('menu.progress.leaderboardDesc'), icon: <FaTrophy />, option: 'leaderboard', color: 'orange' },
    { title: t('menu.progress.challenges'), description: t('menu.progress.challengesDesc'), icon: <FaTrophy />, option: 'challenges', color: 'green' },
  ];

  const renderDropdown = (items: any[], columns: number = 3) => {
    return (
      <div 
        className={`absolute left-0 right-0 md:left-0 md:right-auto mt-2 p-3 md:p-6 rounded-xl shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md ${isDarkMode ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/90 border border-gray-200/50'}`}
        style={isMobile ? { backdropFilter: 'blur(12px)' } : { 
          minWidth: '280px',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div 
          className="grid gap-4 w-full"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            width: '100%'
          }}
        >
          {items.map((item) => (
            <NavigationCard
              key={item.option}
              title={item.title}
              description={item.description}
              icon={item.icon}
              onClick={() => {
                onSelectOption(item.option);
                setActiveDropdown(null);
              }}
              color={item.color}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Dropdown Overlay */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setActiveDropdown(null)}
        />
      )}
      
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 backdrop-blur-md border-b ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-slate-50/80 border-gray-200/50'} shadow-sm`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer`}>
              {t('menu.title')}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Practice */}
            <div 
              className="relative"
              onMouseEnter={() => !isMobile && setActiveDropdown('practice')}
              onMouseLeave={() => !isMobile && setActiveDropdown(null)}
            >
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'practice' ? null : 'practice')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 hover:scale-105 ${
                  activeDropdown === 'practice' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                <FaKeyboard className="text-blue-500" />
                <span>{t('menu.sections.practice')}</span>
              </div>
  {activeDropdown === 'practice' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </button>
              {activeDropdown === 'practice' && renderDropdown(practiceItems, 3)}
            </div>

            {/* Games */}
            <div 
              className="relative"
              onMouseEnter={() => !isMobile && setActiveDropdown('games')}
              onMouseLeave={() => !isMobile && setActiveDropdown(null)}
            >
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'games' ? null : 'games')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  activeDropdown === 'games' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                <FaGamepad className="text-purple-500" />
                <span>{t('menu.sections.games')}</span>
              </div>
  <FaChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === 'games' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'games' && renderDropdown(gamesItems, 1)}
            </div>

            {/* Multiplayer */}
            <div 
              className="relative"
              onMouseEnter={() => !isMobile && setActiveDropdown('multiplayer')}
              onMouseLeave={() => !isMobile && setActiveDropdown(null)}
            >
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'multiplayer' ? null : 'multiplayer')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  activeDropdown === 'multiplayer' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                <FaUsers className="text-blue-500" />
                <span>{t('menu.sections.multiplayer')}</span>
              </div>
  <FaChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === 'multiplayer' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'multiplayer' && renderDropdown(multiplayerItems, 3)}
            </div>

            {/* Custom */}
            <div 
              className="relative"
              onMouseEnter={() => !isMobile && setActiveDropdown('custom')}
              onMouseLeave={() => !isMobile && setActiveDropdown(null)}
            >
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'custom' ? null : 'custom')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  activeDropdown === 'custom' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                <FaPen className="text-green-500" />
                <span>{t('menu.sections.custom')}</span>
              </div>
  <FaChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === 'custom' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'custom' && renderDropdown(customItems, 2)}
            </div>

            {/* Classes - Only if authenticated */}
            {isAuthenticated && (
              <button 
                onClick={() => onSelectOption('classes')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  currentView === 'classes' || currentView === 'teacher' || currentView === 'student' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                <FaChalkboardTeacher className="text-indigo-500" />
                <span>{t('menu.sections.classes')}</span>
              </div>
</button>
            )}

            {/* Progress */}
            <div 
              className="relative"
              onMouseEnter={() => !isMobile && setActiveDropdown('progress')}
              onMouseLeave={() => !isMobile && setActiveDropdown(null)}
            >
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'progress' ? null : 'progress')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  activeDropdown === 'progress' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                <FaChartLine className="text-orange-500" />
                <span>{t('menu.sections.progress')}</span>
              </div>
  <FaChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === 'progress' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'progress' && renderDropdown(progressItems, 2)}
            </div>
            
            {/* Community */}
            <div 
              className="relative"
              onMouseEnter={() => !isMobile && setActiveDropdown('community')}
              onMouseLeave={() => !isMobile && setActiveDropdown(null)}
            >
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'community' ? null : 'community')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  activeDropdown === 'community' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                <FaUsers className="text-pink-500" />
                <span>{t('menu.sections.community')}</span>
              </div>
  <FaChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === 'community' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'community' && renderDropdown(communityItems, 1)}
            </div>
            
            

            {/* Settings or Profile */}
            {!isAuthenticated && (
              <button
                onClick={() => onSelectOption('settings')}
                className={`flex items-center px-4 py-2 rounded transition-colors ${currentView === 'settings' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <div className="flex items-center gap-2">
                <FaCog className="text-gray-500" />
                <span>{t('menu.items.settings')}</span>
              </div>
</button>
            )}

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div 
                className="relative"
                onMouseEnter={() => !isMobile && setActiveDropdown('user')}
                onMouseLeave={() => !isMobile && setActiveDropdown(null)}
              >
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    activeDropdown === 'user' ? 'bg-blue-500' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white font-bold`}>
                      {(user.displayName || user.email || t('menu.user.defaultName'))[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline">{user.displayName || user.email}</span>
                </button>
                {activeDropdown === 'user' && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl backdrop-blur-md border ${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/90 border-gray-200/50'}`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className="font-semibold">{user.displayName || t('menu.user.defaultName')}</p>
                      <p className="text-sm opacity-75">{user.email}</p>
                    </div>
                    <button onClick={() => { onSelectOption('profile'); setActiveDropdown(null); }} className={`block w-full text-left px-4 py-3 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                      <FaUser className="inline mr-2" /> {t('menu.user.profile')}
                    </button>
                    {user.role === 'admin' && (
                      <button onClick={() => { onSelectOption('admin-dashboard'); setActiveDropdown(null); }} className={`block w-full text-left px-4 py-3 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <FaChartLine className="inline mr-2" /> {t('menu.user.admin')}
                      </button>
                    )}
                    <button onClick={() => { onSelectOption('settings'); setActiveDropdown(null); }} className={`block w-full text-left px-4 py-3 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                      <FaCog className="inline mr-2" /> {t('menu.user.settings')}
                    </button>
                    
                    <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button onClick={() => { onSelectOption('logout'); setActiveDropdown(null); }} className="block w-full text-left px-4 py-3 text-red-500 hover:bg-red-50">
                        <FaSignOutAlt className="inline mr-2" /> {t('menu.user.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onSelectOption('login')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${
                  currentView === 'login' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                <FaUserCircle className="text-gray-500" />
                <span>{user ? (user.display_name || user.email) : t('menu.items.login')}</span>
              </div>
  <span className="lg:hidden">{t('menu.loginShort')}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden pb-4 backdrop-blur-md border-t ${isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-slate-50/95 border-gray-200/50'}`}>
            <div className="space-y-1 px-2">
              {/* Practice */}
              <div>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'practice' ? null : 'practice')}
                  className={`w-full text-left px-4 py-2 rounded flex items-center justify-between ${
                    activeDropdown === 'practice' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <span><FaKeyboard className="inline mr-2" /> {t('menu.sections.practice')}</span>
                  <FaChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === 'practice' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'practice' && (
                  <div className="mt-2 space-y-2 px-2">
                    {practiceItems.map(item => (
                      <NavigationCard
                        key={item.option}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        onClick={() => {
                          onSelectOption(item.option);
                          setMobileMenuOpen(false);
                          setActiveDropdown(null);
                        }}
                        color={item.color}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Games */}
              <div>
                <button onClick={() => { onSelectOption('game'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <FaGamepad className="inline mr-2" /> {t('menu.games.falling')}
                </button>
              </div>

              {/* Multiplayer */}
              <div>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'multiplayer' ? null : 'multiplayer')}
                  className={`w-full text-left px-4 py-2 rounded flex items-center justify-between ${
                    activeDropdown === 'multiplayer' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <span><FaUsers className="inline mr-2" /> {t('menu.sections.multiplayer')}</span>
                  {activeDropdown === 'multiplayer' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                {activeDropdown === 'multiplayer' && (
                  <div className="mt-2 space-y-2 px-2">
                    {multiplayerItems.map(item => (
                      <NavigationCard
                        key={item.option}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        onClick={() => {
                          onSelectOption(item.option);
                          setMobileMenuOpen(false);
                          setActiveDropdown(null);
                        }}
                        color={item.color}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Custom */}
              <div>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'custom' ? null : 'custom')}
                  className={`w-full text-left px-4 py-2 rounded flex items-center justify-between ${
                    activeDropdown === 'custom' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <span><FaPen className="inline mr-2" /> {t('menu.sections.custom')}</span>
                  {activeDropdown === 'custom' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                {activeDropdown === 'custom' && (
                  <div className="mt-2 space-y-2 px-2">
                    {customItems.map(item => (
                      <NavigationCard
                        key={item.option}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        onClick={() => {
                          onSelectOption(item.option);
                          setMobileMenuOpen(false);
                          setActiveDropdown(null);
                        }}
                        color={item.color}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Classes */}
              {isAuthenticated && (
                <div>
                  <button onClick={() => { onSelectOption('classes'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <FaGraduationCap className="inline mr-2" /> {t('menu.sections.classes')}
                  </button>
                </div>
              )}

              {/* Progress */}
              <div>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'progress' ? null : 'progress')}
                  className={`w-full text-left px-4 py-2 rounded flex items-center justify-between ${
                    activeDropdown === 'progress' ? 'bg-blue-500 text-white' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <span><FaChartLine className="inline mr-2" /> {t('menu.sections.progress')}</span>
                  {activeDropdown === 'progress' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                {activeDropdown === 'progress' && (
                  <div className="mt-2 space-y-2 px-2">
                    {progressItems.map(item => (
                      <NavigationCard
                        key={item.option}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        onClick={() => {
                          onSelectOption(item.option);
                          setMobileMenuOpen(false);
                          setActiveDropdown(null);
                        }}
                        color={item.color}
                      />
                    ))}
                  </div>
                )}
              </div>

              

              {/* User Section */}
              {!isAuthenticated && (
                <button onClick={() => { onSelectOption('login'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <FaSignInAlt className="inline mr-2" /> {t('menu.items.login')}
                </button>
              )}

              {isAuthenticated && user && (
                <>
                  <button onClick={() => { onSelectOption('profile'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <FaUser className="inline mr-2" /> {t('menu.user.profile')}
                  </button>
                  {user.role === 'admin' && (
                    <button onClick={() => { onSelectOption('admin-dashboard'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                      <FaChartLine className="inline mr-2" /> {t('menu.user.admin')}
                    </button>
                  )}
                  <button onClick={() => { onSelectOption('settings'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <FaCog className="inline mr-2" /> {t('menu.user.settings')}
                  </button>
                  <button onClick={() => { onSelectOption('logout'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded text-red-500">
                    <FaSignOutAlt className="inline mr-2" /> {t('menu.user.logout')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default HorizontalMenu;
