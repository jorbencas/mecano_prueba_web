import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { useActivityTracker } from '../hooks/useActivityTracker';
import Keyboard from './Keyboard';
import Hands from './Hands';
import InstruccionesButton from './Instrucciones';
import { FaRedo, FaCheck, FaKeyboard } from 'react-icons/fa';
import TypingArea from './TypingArea';
import RegistrationModal from './RegistrationModal';
import ParticleExplosion from './ParticleExplosion';

const FreePractice: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const { startTracking, stopTracking } = useActivityTracker('FreePractice', 'freePractice');
  
  const MAX_CHARS_FREE = 100;
  const MAX_CHARS_PREMIUM = 500;
  
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['a', 's', 'd', 'f', 'j', 'k', 'l']);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextKey, setNextKey] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  
  // New states for practice control
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  const generateText = useCallback(() => {
    const maxChars = user ? MAX_CHARS_PREMIUM : MAX_CHARS_FREE;
    const length = Math.min(100, maxChars);
    let text = '';
    for (let i = 0; i < length; i++) {
      text += selectedKeys[Math.floor(Math.random() * selectedKeys.length)];
    }
    return text;
  }, [selectedKeys, user]);

  useEffect(() => {
    const newText = generateText();
    setCurrentText(newText);
    setNextKey(newText[0]);
  }, [generateText]);

  const calculateWPM = useCallback(() => {
    if (!startTime || totalChars === 0) return 0;
    const minutes = (Date.now() - startTime) / 60000;
    return Math.round((totalChars / 5) / minutes);
  }, [startTime, totalChars]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setWpm(calculateWPM());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, calculateWPM]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Only allow typing when practice is active
    if (!isActive) return;
    
    const key = event.key;
    if (!startTime) {
      setStartTime(Date.now());
      startTracking(); // Start tracking when practice begins
    }

    if (key === currentText[currentIndex]) {
      setTotalChars(prev => prev + 1);
      setCurrentIndex(prev => prev + 1);
      
      // Trigger particle explosion
      const colors = ['#4ade80', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setParticles(prev => [...prev, {
        id: Date.now(),
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
        color: randomColor,
      }]);
      
      if (currentIndex + 1 < currentText.length) {
        setNextKey(currentText[currentIndex + 1]);
      } else {
        // Generate new text
        const newText = generateText();
        setCurrentText(newText);
        setCurrentIndex(0);
        setNextKey(newText[0]);
      }
    } else {
      setErrors(prev => prev + 1);
    }

    setAccuracy(Math.round(((totalChars - errors) / Math.max(1, totalChars + 1)) * 100));
  }, [currentText, currentIndex, isActive, startTime, totalChars, errors, generateText, startTracking]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
  
  // Timer effect
  useEffect(() => {
    if (isActive && startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, startTime]);

  const handleStart = () => {
    setIsActive(true);
    setStartTime(Date.now());
    setTimeElapsed(0);
    setCurrentIndex(0);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setTotalChars(0);
    
    const newText = generateText();
    setCurrentText(newText);
    setNextKey(newText[0]);
    
    startTracking();
  };
  
  const handleStop = () => {
    setIsActive(false);
    
    // Stop tracking with metadata
    if (startTime) {
      stopTracking({
        wpm,
        accuracy,
        errors,
        selectedKeys,
      });
    }
  };

  const handleReset = () => {
    // Stop if active
    if (isActive) {
      handleStop();
    }
    
    const newText = generateText();
    setCurrentText(newText);
    setCurrentIndex(0);
    setNextKey(newText[0]);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setTotalChars(0);
    setStartTime(null);
    setTimeElapsed(0);
  };

  const toggleKey = (key: string) => {
    // Don't allow changing keys during active practice
    if (isActive) return;
    
    setSelectedKeys(prev => {
      const newKeys = prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key].sort();
      
      // Save configuration if user is authenticated
      if (user) {
        localStorage.setItem(`freePractice_keys_${user.email}`, JSON.stringify(newKeys));
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2000);
      }
      
      return newKeys;
    });
  };
  
  // Load saved configuration on mount
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`freePractice_keys_${user.email}`);
      if (saved) {
        try {
          setSelectedKeys(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading saved keys:', e);
        }
      }
    }
  }, [user]);

  const allKeys = 'abcdefghijklmnñopqrstuvwxyz'.split('');

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r flex items-center justify-center gap-4 ${isDarkMode ? 'from-blue-400 via-cyan-400 to-teal-400' : 'from-blue-600 via-cyan-600 to-teal-600'}`}>
            <FaKeyboard className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
            {t('freePractice.title', 'Práctica Libre')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Key Selector */}
          <div className={`lg:col-span-1 p-6 rounded-2xl shadow-xl border backdrop-blur-sm transition-all duration-300 ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('freePractice.selectKeys', 'Selecciona Teclas')}</h2>
              {user && configSaved && (
                <div className="flex items-center gap-1 text-green-500 text-sm">
                  <FaCheck />
                  <span>{t('freePractice.saved', 'Guardado')}</span>
                </div>
              )}
            </div>
            
            {isActive && (
              <div className={`mb-3 p-2 rounded text-sm ${isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
                ⚠️ {t('freePractice.keysLocked', 'Teclas bloqueadas durante la práctica')}
              </div>
            )}
            
            {!user && (
              <div className={`mb-3 p-2 rounded text-xs ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                ℹ️ {t('freePractice.limitInfo', `Límite: ${MAX_CHARS_FREE} caracteres. Regístrate para ${MAX_CHARS_PREMIUM} caracteres.`)}
              </div>
            )}
            
            {user && (
              <div className={`mb-3 p-2 rounded text-xs ${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                ✓ {t('freePractice.configSaved', 'Tu configuración se guarda automáticamente')}
              </div>
            )}
            

            
            <div className="grid grid-cols-5 gap-2">
              {allKeys.map(key => (
                <button
                  key={key}
                  onClick={() => toggleKey(key)}
                  disabled={isActive}
                  className={`p-2 rounded font-mono text-lg transition-colors ${
                    selectedKeys.includes(key)
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {key}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              {t('freePractice.keysSelected', 'Teclas seleccionadas')}: {selectedKeys.length}
            </p>
          </div>

          {/* Main Practice Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Control Panel */}
            {!isActive && (
              <div className={`p-8 rounded-2xl text-center shadow-xl border backdrop-blur-sm transition-all duration-300 ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'}`}>
                <h2 className="text-2xl font-bold mb-4">
                  {t('freePractice.readyToStart', '¿Listo para practicar?')}
                </h2>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('freePractice.startInstructions', 'Selecciona tus teclas, luego presiona Comenzar')}
                </p>
                <button
                  onClick={handleStart}
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xl font-bold"
                >
                  {t('freePractice.start', 'Comenzar Práctica')}
                </button>
              </div>
            )}

            {/* Active Practice Indicator */}
            {isActive && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex gap-6 text-lg w-full justify-center">
                    <span>{t('typingArea.stats.wpm')}: {wpm}</span>
                    <span>{t('typingArea.stats.accuracy')}: {accuracy}%</span>
                    <span>{t('typingArea.stats.errors')}: {errors}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats Panel */}
            {isActive && (
              <div className={`p-6 rounded-2xl shadow-lg border backdrop-blur-sm mb-6 ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {t('freePractice.session', 'Sesión de Práctica')}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleStop}
                      className="px-4 py-2 rounded flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold"
                    >
                      {t('freePractice.stop', 'Detener')}
                    </button>
                    <button
                      onClick={handleReset}
                      className={`px-4 py-2 rounded flex items-center gap-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 hover:bg-gray-500'} text-white`}
                    >
                      <FaRedo />
                      {t('freePractice.reset', 'Reiniciar')}
                    </button>
                  </div>
                </div>
                
                <div className={`flex flex-col sm:flex-row justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p className="inline-block mr-0 sm:mr-4 text-lg">
                    {t('typingArea.stats.wpm')}: {wpm}
                  </p>
                  <p className="inline-block mr-0 sm:mr-4 text-lg">
                    {t('typingArea.stats.accuracy')}: {accuracy}%
                  </p>
                  <p className="inline-block text-lg">
                    {t('typingArea.stats.errors')}: {errors}
                  </p>
                </div>
              </div>
            )}

            {/* Text Display */}
            <div className={`p-6 rounded-2xl shadow-lg border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'}`}>
              <TypingArea
                text={currentText}
                currentIndex={currentIndex}
                standalone
                maxHeight="max-h-64 overflow-y-auto"
              />
            </div>

            <Keyboard activeKey={nextKey} levelKeys={selectedKeys} />
            <Hands nextKey={nextKey} />
            <InstruccionesButton
              instructions={t('freePractice.instructions', 'Practica sin límites de tiempo o errores. Selecciona las teclas que quieres practicar y empieza a escribir.')}
              source="FreePractice"
            />
          </div>
        </div>
        
        {/* Registration Modal */}
        {showRegistrationModal && (
          <RegistrationModal
            isOpen={showRegistrationModal}
            onClose={() => setShowRegistrationModal(false)}
            onShowLogin={() => {
              setShowRegistrationModal(false);
              // Navigate to login - this would need to be passed as a prop or use routing
            }}
            featureName={t('freePractice.unlimitedChars', 'Práctica ilimitada')}
          />
        )}
        
        {/* Particle Explosions */}
        {particles.map(particle => (
          <ParticleExplosion
            key={particle.id}
            x={particle.x}
            y={particle.y}
            color={particle.color}
            onComplete={() => setParticles(prev => prev.filter(p => p.id !== particle.id))}
          />
        ))}
      </div>
    </div>
  );
};

export default FreePractice;
