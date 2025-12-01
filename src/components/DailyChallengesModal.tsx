import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { challengesAPI } from '../api/challenges';
import { FaFire, FaTimes } from 'react-icons/fa';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { motion, AnimatePresence } from 'framer-motion';

interface Challenge {
  id: string;
  challenge_type: string;
  title: string;
  description: string;
  target_value: number;
  difficulty: 'easy' | 'medium' | 'hard';
  mode?: string;
}

const DailyChallengesModal: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkAndShowChallenges();
    }
  }, [user]);

  const checkAndShowChallenges = async () => {
    try {
      // Check if user has already seen challenges today
      const lastSeen = localStorage.getItem('challenges_last_seen');
      const today = new Date().toDateString();

      if (lastSeen === today) {
        return; // Already seen today
      }

      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const data = await challengesAPI.getDailyChallenges(token);
      
      if (data.challenges && data.challenges.length > 0) {
        setChallenges(data.challenges);
        setIsOpen(true);
        localStorage.setItem('challenges_last_seen', today);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t('challenges.difficulty.easy', 'Fácil');
      case 'medium': return t('challenges.difficulty.medium', 'Medio');
      case 'hard': return t('challenges.difficulty.hard', 'Difícil');
      default: return difficulty;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
            }`}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaFire className="text-orange-400 text-3xl animate-pulse" />
                  <h2 className="text-2xl font-bold text-white">
                    {t('challenges.modal.title', '🎯 ¡Tus Retos de Hoy!')}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              <p className="text-white text-opacity-90 mt-2">
                {t('challenges.modal.subtitle', 'Completa estos desafíos para mejorar tus habilidades y ganar puntos')}
              </p>
            </div>

            {/* Challenges List */}
            <div className="p-6 space-y-4">
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${getDifficultyColor(challenge.difficulty)} ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg">{challenge.title}</h3>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {challenge.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ml-3 ${
                      getDifficultyColor(challenge.difficulty)
                    } bg-opacity-20 text-white`}>
                      {getDifficultyLabel(challenge.difficulty)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('challenges.modal.tip', '💡 Los retos se renuevan cada día')}
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                  {t('challenges.modal.start', '¡Vamos!')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyChallengesModal;
