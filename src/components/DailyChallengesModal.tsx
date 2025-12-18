import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { challengesAPI } from '../api/challenges';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { FaFire, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ChallengeItem, Challenge } from './ChallengeItem';

interface DailyChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: Challenge[];
  onSelectChallenge?: (challenge: Challenge) => void;
}

const DailyChallengesModal: React.FC<DailyChallengesModalProps> = ({ isOpen, onClose, challenges, onSelectChallenge }) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`max-w-md w-full overflow-hidden rounded-none border backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-gray-900/90 border-gray-700/50 shadow-2xl' 
                : 'bg-white/95 border-gray-200/50 shadow-xl'
            }`}
          >
            {/* Header */}
            <div className={`relative p-6 pb-4 border-b ${
              isDarkMode ? 'border-gray-700/50 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-none border ${
                    isDarkMode ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-orange-500 text-white border-orange-600'
                  }`}>
                    <FaFire className="text-xl" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-black tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('challenges.modal.title')}
                    </h2>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('challenges.modal.subtitle')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-none transition-all border ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 border-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 border-gray-200 text-gray-400'
                  } hover:rotate-90`}
                >
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            {/* Challenges List */}
            <div className={`px-6 py-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar ${
              isDarkMode ? 'bg-gray-900/30' : 'bg-gray-50/30'
            }`}>
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChallengeItem
                    challenge={challenge}
                    onClick={(c) => {
                      if (onSelectChallenge) {
                        onSelectChallenge(c);
                        onClose();
                      }
                    }}
                    isDarkMode={isDarkMode}
                    t={t}
                    variant="list"
                  />
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${
              isDarkMode ? 'border-gray-700/50 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'
            }`}>
              <button
                onClick={() => {
                  if (onSelectChallenge && challenges.length > 0) {
                    const firstIncomplete = challenges.find(c => !c.completed) || challenges[0];
                    onSelectChallenge(firstIncomplete);
                    onClose();
                  } else {
                    onClose();
                  }
                }}
                className={`w-full py-4 rounded-none font-black text-lg uppercase tracking-tight transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                  isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                }`}
              >
                {t('challenges.modal.start')}
              </button>
              
              <p className={`text-center mt-4 text-[9px] font-bold tracking-[0.2em] uppercase ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {t('challenges.modal.tip')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyChallengesModal;
