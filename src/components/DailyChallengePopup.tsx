import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DailyChallenge } from '../utils/dailyChallengeUtils';
import { FaTimes, FaFire, FaRocket } from 'react-icons/fa';

interface DailyChallengePopupProps {
  challenges: DailyChallenge[];
  onClose: () => void;
  onAccept: (challengeId: string) => void;
}

const DailyChallengePopup: React.FC<DailyChallengePopupProps> = ({ challenges, onClose, onAccept }) => {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAccept = (challengeId: string) => {
    setIsClosing(true);
    setTimeout(() => {
      onAccept(challengeId);
    }, 300);
  };

  if (challenges.length === 0) return null;

  const activeChallenge = challenges[activeTab];
  const progressPercentage = Math.min(100, (activeChallenge.currentProgress / activeChallenge.targetValue) * 100);

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transition-all duration-300 ${
        isVisible && !isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ maxWidth: '400px', width: 'calc(100vw - 2rem)' }}
    >
      {/* Popup Container */}
      <div
        className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-white/50 bg-white'
        }`}
      >
        {/* Dynamic Background based on active challenge */}
        <div 
          className="absolute inset-0 opacity-10 transition-colors duration-500"
          style={{
            background: `linear-gradient(135deg, ${activeChallenge.color} 0%, ${activeChallenge.color} 100%)`
          }}
        />

        {/* Animated Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${activeChallenge.gradient} opacity-5 animate-pulse transition-all duration-500`}
          style={{ animationDuration: '3s' }}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all hover:scale-110 z-20 ${
            isDarkMode ? 'bg-gray-800/80 hover:bg-gray-700 text-gray-300' : 'bg-white/80 hover:bg-white text-gray-700'
          }`}
          aria-label="Cerrar"
        >
          <FaTimes />
        </button>

        {/* Tabs if multiple challenges */}
        {challenges.length > 1 && (
          <div className="flex p-2 gap-2 relative z-10 bg-black/5 dark:bg-white/5 backdrop-blur-sm">
            {challenges.map((challenge, index) => (
              <button
                key={challenge.id}
                onClick={() => setActiveTab(index)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === index
                    ? isDarkMode 
                      ? 'bg-gray-800 text-white shadow-lg' 
                      : 'bg-white text-gray-900 shadow-lg'
                    : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>{challenge.icon}</span>
                <span className="truncate">{challenge.theme === 'christmas' || challenge.theme === 'halloween' ? 'Especial' : 'Diario'}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative p-6">
          {/* Icon and Title */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="text-5xl animate-bounce"
              style={{ animationDuration: '2s' }}
            >
              {activeChallenge.icon}
            </div>
            <div className="flex-1">
              <h3
                className="text-2xl font-black mb-1 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${activeChallenge.color}, ${activeChallenge.color}dd)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {activeChallenge.title}
              </h3>
              <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {activeChallenge.description}
              </p>
            </div>
          </div>

          {/* Motivational Message */}
          <div
            className={`p-4 rounded-xl mb-4 border-l-4 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}
            style={{ borderColor: activeChallenge.color }}
          >
            <div className="flex items-start gap-2">
              <FaFire className="text-orange-500 mt-1 flex-shrink-0" />
              <p className={`font-bold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {activeChallenge.motivationalMessage}
              </p>
            </div>
          </div>

          {/* Goal */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                🎯 Objetivo:
              </span>
              <span
                className="font-black text-lg transition-colors duration-300"
                style={{ color: activeChallenge.color }}
              >
                {activeChallenge.goal}
              </span>
            </div>

            {/* Progress Bar */}
            <div className={`w-full h-3 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className={`h-full bg-gradient-to-r ${activeChallenge.gradient} transition-all duration-500 relative overflow-hidden`}
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                  style={{ animationDuration: '2s' }}
                />
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                {activeChallenge.currentProgress} / {activeChallenge.targetValue}
              </span>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleAccept(activeChallenge.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r ${activeChallenge.gradient}`}
              style={{
                boxShadow: `0 4px 20px ${activeChallenge.color}40`,
              }}
            >
              <FaRocket />
              ¡Aceptar Reto!
            </button>
            <button
              onClick={handleClose}
              className={`px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
          <div
            className={`w-full h-full rounded-full bg-gradient-to-br ${activeChallenge.gradient} blur-2xl transition-all duration-500`}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 pointer-events-none">
          <div
            className={`w-full h-full rounded-full bg-gradient-to-tr ${activeChallenge.gradient} blur-2xl transition-all duration-500`}
          />
        </div>
      </div>

      {/* Custom CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default DailyChallengePopup;
