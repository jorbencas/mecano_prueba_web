import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DailyChallenge } from '../utils/dailyChallengeUtils';
import { FaTimes, FaFire, FaRocket } from 'react-icons/fa';

interface DailyChallengePopupProps {
  challenge: DailyChallenge;
  onClose: () => void;
  onAccept: () => void;
}

const DailyChallengePopup: React.FC<DailyChallengePopupProps> = ({ challenge, onClose, onAccept }) => {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

  const handleAccept = () => {
    setIsClosing(true);
    setTimeout(() => {
      onAccept();
    }, 300);
  };

  const progressPercentage = Math.min(100, (challenge.currentProgress / challenge.targetValue) * 100);

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transition-all duration-300 ${
        isVisible && !isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ maxWidth: '400px', width: 'calc(100vw - 2rem)' }}
    >
      {/* Popup Container */}
      <div
        className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 ${
          isDarkMode ? 'border-gray-700' : 'border-white/50'
        }`}
        style={{
          background: isDarkMode
            ? `linear-gradient(135deg, ${challenge.color}15 0%, ${challenge.color}30 100%)`
            : `linear-gradient(135deg, ${challenge.color}20 0%, ${challenge.color}40 100%)`,
        }}
      >
        {/* Animated Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${challenge.gradient} opacity-10 animate-pulse`}
          style={{ animationDuration: '3s' }}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all hover:scale-110 z-10 ${
            isDarkMode ? 'bg-gray-800/80 hover:bg-gray-700' : 'bg-white/80 hover:bg-white'
          }`}
          aria-label="Cerrar"
        >
          <FaTimes className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
        </button>

        {/* Content */}
        <div className="relative p-6">
          {/* Icon and Title */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="text-5xl animate-bounce"
              style={{ animationDuration: '2s' }}
            >
              {challenge.icon}
            </div>
            <div className="flex-1">
              <h3
                className="text-2xl font-black mb-1"
                style={{
                  background: `linear-gradient(135deg, ${challenge.color}, ${challenge.color}dd)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {challenge.title}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {challenge.description}
              </p>
            </div>
          </div>

          {/* Motivational Message */}
          <div
            className={`p-4 rounded-xl mb-4 border-l-4 ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
            }`}
            style={{ borderColor: challenge.color }}
          >
            <div className="flex items-start gap-2">
              <FaFire className="text-orange-500 mt-1 flex-shrink-0" />
              <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {challenge.motivationalMessage}
              </p>
            </div>
          </div>

          {/* Goal */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                🎯 Objetivo:
              </span>
              <span
                className="font-black text-lg"
                style={{ color: challenge.color }}
              >
                {challenge.goal}
              </span>
            </div>

            {/* Progress Bar */}
            <div className={`w-full h-3 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`}>
              <div
                className={`h-full bg-gradient-to-r ${challenge.gradient} transition-all duration-500 relative overflow-hidden`}
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
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {challenge.currentProgress} / {challenge.targetValue}
              </span>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r ${challenge.gradient}`}
              style={{
                boxShadow: `0 4px 20px ${challenge.color}40`,
              }}
            >
              <FaRocket />
              ¡Aceptar Reto!
            </button>
            <button
              onClick={handleClose}
              className={`px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div
            className={`w-full h-full rounded-full bg-gradient-to-br ${challenge.gradient} blur-2xl`}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
          <div
            className={`w-full h-full rounded-full bg-gradient-to-tr ${challenge.gradient} blur-2xl`}
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
