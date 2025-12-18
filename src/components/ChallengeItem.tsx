import React from 'react';
import { FaStar, FaCalendarAlt, FaChevronRight, FaCheck } from 'react-icons/fa';

export interface Challenge {
  id: string;
  challenge_type: string;
  title: string;
  description: string;
  target_value: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  theme?: string;
  mode?: string;
  progress?: number;
  current_value?: number;
  date?: string;
}

interface ChallengeItemProps {
  challenge: Challenge;
  onClick: (challenge: Challenge) => void;
  isDarkMode: boolean;
  t: (key: string, defaultValue?: string) => string;
  variant?: 'grid' | 'list';
}

const SEASONAL_THEMES = ['christmas', 'halloween', 'newyear', 'valentine', 'starwars', 'earthday', 'summer', 'backtoschool'];

export const ChallengeItem: React.FC<ChallengeItemProps> = ({ 
  challenge, 
  onClick, 
  isDarkMode, 
  t,
  variant = 'grid'
}) => {
  const isSeasonal = challenge.theme && SEASONAL_THEMES.includes(challenge.theme);
  
  const getProgressPercentage = () => {
    if (challenge.completed) return 100;
    if (challenge.progress !== undefined) return challenge.progress;
    if (challenge.current_value !== undefined && challenge.target_value) {
      return Math.min(Math.round((challenge.current_value / challenge.target_value) * 100), 100);
    }
    return 0;
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t('challenges.difficulty.easy');
      case 'medium': return t('challenges.difficulty.medium');
      case 'hard': return t('challenges.difficulty.hard');
      default: return difficulty;
    }
  };

  const progress = getProgressPercentage();
  const isList = variant === 'list';

  return (
    <div
      onClick={() => onClick(challenge)}
      className={`group relative rounded-none border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm ${
        isList ? 'p-3' : 'p-5 h-full flex flex-col'
      } ${
        challenge.completed 
          ? 'opacity-50 grayscale pointer-events-none' 
          : 'hover:scale-[1.02] hover:shadow-lg'
      } ${
        isDarkMode 
          ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-blue-500/50' 
          : 'bg-white/80 border-gray-200/50 hover:bg-white hover:border-blue-500/50'
      }`}
    >
      {/* Subtle Accent Bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${
        isSeasonal ? 'bg-purple-500' : 'bg-blue-500'
      }`} />

      <div className={`relative z-10 flex ${isList ? 'items-center gap-3' : 'flex-col h-full'}`}>
        {/* Icon & Badges Header */}
        <div className={`flex ${isList ? 'shrink-0' : 'items-center justify-between mb-3'}`}>
          <div className={`p-2.5 rounded-none ${
            isSeasonal 
              ? 'bg-purple-500/10 text-purple-500' 
              : 'bg-blue-500/10 text-blue-500'
          }`}>
            {isSeasonal ? <FaStar size={isList ? 18 : 22} /> : <FaCalendarAlt size={isList ? 18 : 22} />}
          </div>
          
          {!isList && (
            <div className="flex gap-1.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-none uppercase tracking-wider border ${
                isSeasonal 
                  ? 'border-purple-500/30 text-purple-500 bg-purple-500/5' 
                  : 'border-blue-500/30 text-blue-500 bg-blue-500/5'
              }`}>
                {isSeasonal ? t('challenges.seasonal') : t('challenges.daily')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`${isList ? 'flex-grow min-w-0' : 'flex-grow'}`}>
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-black tracking-tight truncate uppercase ${
              isList ? 'text-sm' : 'text-base leading-none'
            } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {challenge.title}
            </h3>
            {isList && challenge.completed && (
              <span className="bg-green-500/20 text-green-500 text-[8px] font-black px-1.5 py-0.5 rounded-none uppercase tracking-widest border border-green-500/30 shrink-0">
                {t('challenges.completed')}
              </span>
            )}
          </div>

          <p className={`leading-tight line-clamp-1 ${
            isList ? 'text-[10px]' : 'text-xs mb-4'
          } ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
            {challenge.description}
          </p>

          {!isList && (
            <div className="mt-auto">
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {getDifficultyLabel(challenge.difficulty)}
                </span>
                {!challenge.completed && (
                  <span className={`text-[10px] font-black ${isSeasonal ? 'text-purple-500' : 'text-blue-500'}`}>
                    {progress}%
                  </span>
                )}
              </div>
              
              <div className={`w-full h-1.5 rounded-none overflow-hidden ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'
              } border ${isDarkMode ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
                <div
                  className={`h-full transition-all duration-1000 ease-out ${
                    challenge.completed 
                      ? 'bg-green-500' 
                      : isSeasonal 
                        ? 'bg-purple-500' 
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {isList && (
          <div className={`shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-300'
          }`}>
            <FaChevronRight size={14} />
          </div>
        )}
      </div>
    </div>
  );
};

