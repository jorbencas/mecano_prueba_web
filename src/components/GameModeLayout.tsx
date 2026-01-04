import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import TypingArea from './TypingArea';
import Keyboard from './Keyboard';
import Stats from './Stats';
import InstruccionesButton from './Instrucciones';
import { GameSource } from '@/types/enums';
import { getStatsData } from '@utils/getStatsData';

interface GameModeLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradientClasses: string;
  accentColorClass: string;
  bgAccentClass: string;
  
  // Game state
  isActive: boolean;
  showStats: boolean;
  currentIndex: number;
  text: string;
  elapsedTime: number;
  timeLeft?: number;
  wpm: number;
  accuracy: number;
  errors: number;
  errorList: { expected: string; actual: string }[];
  
  // Handlers
  onStart: () => void;
  onStop: () => void;
  onKeyPress: (key: string) => void;
  onRepeat: () => void;
  onNext?: () => void;
  onCloseStats: () => void;
  
  // Mode specific
  source: GameSource;
  sourceComponent: 'Levels' | 'PlayGame' | 'CreateText' | 'PrecisionMode' | 'FreePractice' | 'SpeedMode' | 'NeonMode' | 'ZenMode' | 'NumbersMode' | 'SymbolsMode' | 'CodeMode' | 'DictationMode' | 'Challenge';
  instructions: string;
  level?: number;
  levelName?: string;
  wpmGoal?: number;
  errorLimit?: number;
  
  // Optional children for extra controls or info
  children?: React.ReactNode;
  sidebar?: React.ReactNode;
  
  // Keyboard specific
  levelKeys?: string[];
  isFullKeyboard?: boolean;
}

const GameModeLayout: React.FC<GameModeLayoutProps> = ({
  title,
  subtitle,
  icon,
  gradientClasses,
  accentColorClass,
  bgAccentClass,
  isActive,
  showStats,
  currentIndex,
  text,
  elapsedTime,
  timeLeft,
  wpm,
  accuracy,
  errors,
  errorList,
  onStart,
  onStop,
  onKeyPress,
  onRepeat,
  onNext,
  onCloseStats,
  source,
  sourceComponent,
  instructions,
  level = 1,
  levelName,
  wpmGoal = 0,
  errorLimit = 999,
  children,
  sidebar,
  levelKeys = [],
  isFullKeyboard = false,
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  const currentChar = isActive && currentIndex < text.length ? text[currentIndex] : '';
  const displayTime = timeLeft !== undefined ? timeLeft : elapsedTime;

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row">
      {sidebar}

      <div className={`w-full ${sidebar ? 'lg:w-3/4 pl-0 lg:pl-8' : ''}`}>
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-extrabold mb-3 flex items-center justify-center gap-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${gradientClasses}`}>
            {icon}
            {title}
          </h1>
          {subtitle && (
            <p className={`text-lg font-medium ${accentColorClass} opacity-70`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className={`mb-8 p-6 rounded-2xl border backdrop-blur-sm shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800/60 border-gray-700/30' : 'bg-white/80 border-gray-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {levelName || `${t('stats.labels.level')} ${level}`}
            </h2>
            <div className={`text-4xl font-black tracking-tighter ${accentColorClass}`}>
              {displayTime}s
            </div>
          </div>
          
          <div className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : bgAccentClass} text-lg`}>
            <div className="flex flex-col items-center">
              <span className={`text-sm uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>WPM</span>
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{wpm}</span>
            </div>
            <div className="w-px h-8 bg-gray-300/20 hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <span className={`text-sm uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('stats.labels.errors')}</span>
              <span className="text-2xl font-bold text-red-500">{errors}</span>
            </div>
            <div className="w-px h-8 bg-gray-300/20 hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <span className={`text-sm uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('stats.labels.accuracy')}</span>
              <span className="text-2xl font-bold text-blue-500">{accuracy}%</span>
            </div>
          </div>
        </div>

        {children}

        <div className="flex justify-center gap-6 mb-8">
          {!isActive ? (
            <button
              onClick={onStart}
              className={`px-10 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg transition-all hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? `bg-gradient-to-r ${gradientClasses} text-white shadow-blue-500/20` 
                  : `bg-gradient-to-r ${gradientClasses} text-white shadow-blue-500/30`
              }`}
            >
              {t('common.start', 'Comenzar')}
            </button>
          ) : (
            <button
              onClick={onStop}
              className={`px-10 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-red-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' 
                  : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
              }`}
            >
              {t('common.stop', 'Detener')}
            </button>
          )}
        </div>

        {isActive && (
          <div className={`p-6 rounded-2xl border backdrop-blur-sm shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'}`}>
            <div className="mb-8">
              <TypingArea
                text={text}
                currentIndex={currentIndex}
                onKeyPress={onKeyPress}
                standalone={true}
              />
            </div>

            <div className="mb-4">
              <Keyboard activeKey={currentChar} levelKeys={levelKeys} isFullKeyboard={isFullKeyboard} />
            </div>
          </div>
        )}

        {!isActive && !showStats && (
          <>
            <div className={`text-center p-10 rounded-2xl border backdrop-blur-sm mb-6 ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50 text-gray-400' : 'bg-white/60 border-white/60 text-gray-500'}`}>
              <p className="italic text-xl font-serif">"{text}"</p>
            </div>
            <InstruccionesButton
              instructions={instructions}
              source={source}
            />
          </>
        )}

        {showStats && (
          <Stats
            stats={getStatsData({
              wpm,
              accuracy,
              level,
              errors,
              elapsedTime,
              levelCompleted: true,
              levelData: { wpmGoal, errorLimit },
              text
            })}
            errorList={errorList}
            onRepeatLevel={onRepeat}
            onNextLevel={onNext || (() => {})}
            sourceComponent={sourceComponent}
            onClose={onCloseStats}
          />
        )}
      </div>
    </div>
  );
};

export default GameModeLayout;
