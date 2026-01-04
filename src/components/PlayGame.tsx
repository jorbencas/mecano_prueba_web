// src/components/PlayGame.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Stats from './Stats';
import MenuLevels from './MenuLevels';
import { useTheme } from '@hooks/useTheme';
import InstruccionesButton from './Instrucciones';
import { getStatsData } from '@utils/getStatsData';
import levels from '@data/playgames.json';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { useKeyboardHandler } from '@hooks/useKeyboardHandler';
import { useActivityTracker } from '@hooks/useActivityTracker';
import { GameSource } from '@/types/enums';

interface FallingLetter {
  id: number;
  char: string;
  x: number;
  color: string;
}

interface ErrorItem {
  expected: string;
  actual: string;
}

/* -----------------------
   FallingLetterComponent
   - controla pausa/resume sin saltos usando controls.set + controls.start
   ----------------------- */
const FallingLetterComponent: React.FC<{
  letter: FallingLetter;
  onRemove: () => void;
  onReachBottom: () => void;
  containerHeight: number;
  isPaused: boolean;
}> = ({ letter, onRemove, onReachBottom, containerHeight, isPaused }) => {
  const controls = useAnimation();
  const elRef = useRef<HTMLDivElement | null>(null);

  // extraer translateY actual del transform computado
  const getTranslateYFromComputed = (transform: string | null): number => {
    if (!transform || transform === 'none') return 0;
    // matrix(a, b, c, d, tx, ty) -> ty is index 5
    const m = transform.match(/matrix\(([^)]+)\)/);
    if (m) {
      const parts = m[1].split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 6) return parts[5];
    }
    // matrix3d(...)
    const m3 = transform.match(/matrix3d\(([^)]+)\)/);
    if (m3) {
      const parts = m3[1].split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 16) return parts[13];
    }
    return 0;
  };

  // administrar animación en función de isPaused
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // pausa: fijar posición actual y detener controles
    if (isPaused) {
      const computed = window.getComputedStyle(el).transform;
      const y = getTranslateYFromComputed(computed);
      // fijamos la posición en el motor de FM y detenemos la animación
      controls.set({ y });
      controls.stop();
      return;
    }

    // reanudar: leer transform actual y animar desde ahí hasta bottom
    const computed = window.getComputedStyle(el).transform;
    const yStart = getTranslateYFromComputed(computed);
    controls.set({ y: yStart });

    // calcular duración aproximada proporcional (evita saltos)
    const distance = Math.max(0, (containerHeight || 0) - yStart);
    const speed = 60; // px/s base
    const duration = Math.max(0.5, distance / speed);

    // requestAnimationFrame para garantizar que set se haya aplicado
    requestAnimationFrame(() => {
      controls.start({
        y: containerHeight,
        scale: 1,
        opacity: 1,
        rotate: 0,
        transition: { 
          y: { duration, ease: 'linear' },
          scale: { duration: 0.4, type: 'spring' },
          opacity: { duration: 0.2 },
          rotate: { duration: 0.4 }
        },
      });
    });
  }, [isPaused, containerHeight, controls]);

  // comprobación de colisión (solo cuando no está pausado)
  useEffect(() => {
    const id = window.setInterval(() => {
      const el = elRef.current;
      if (!el || isPaused) return;
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement!.getBoundingClientRect();
      if (rect.bottom >= parentRect.bottom - 1) {
        onReachBottom();
        onRemove();
      }
    }, 120);
    return () => clearInterval(id);
  }, [isPaused, onRemove, onReachBottom]);


  return (
    <motion.div
      ref={elRef}
      className="absolute font-bold flex items-center justify-center rounded-xl backdrop-blur-sm transition-all duration-200"
      style={{
        left: `${letter.x}%`,
        backgroundColor: `${letter.color}40`, // 25% opacity background
        borderColor: letter.color,
        borderWidth: '2px',
        color: '#fff', // Always white text for neon contrast
        width: 56,
        height: 56,
        boxShadow: `0 0 15px ${letter.color}, inset 0 0 10px ${letter.color}40`,
        textShadow: `0 0 5px ${letter.color}, 0 0 10px #fff`,
        zIndex: 10
      }}
      initial={{ y: -60, scale: 0, opacity: 0, rotate: -180 }}
      animate={controls}
      onUpdate={(latest) => {
        // Ensure scale/opacity are set if controls doesn't handle them explicitly after initial
        if (typeof latest.y === 'number' && latest.y > 0) {
           // This is just a hook, visual updates are handled by style/className
        }
      }}
    >
      <span className="text-3xl font-mono">{letter.char.toUpperCase()}</span>
    </motion.div>
  );
};

/* -----------------------
   PlayGame (principal)
   ----------------------- */
const PlayGame: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const { startTracking, stopTracking } = useActivityTracker('PlayGame', 'game');

  const [level, setLevel] = useState(0);
  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [errorList, setErrorList] = useState<ErrorItem[]>([]);
  const [time, setTime] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const letterIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // audio refs (cargados una vez)
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    correctAudioRef.current = new Audio(`${process.env.PUBLIC_URL}/sounds/correct.mp3`);
    errorAudioRef.current = new Audio(`${process.env.PUBLIC_URL}/sounds/error.mp3`);
  }, []);

  const playCorrectSound = () => correctAudioRef.current?.play().catch(() => {});
  const playErrorSound = () => errorAudioRef.current?.play().catch(() => {});

  // limpia los intervalos (letras + timer)
  const clearAllIntervals = useCallback(() => {
    if (letterIntervalRef.current) {
      window.clearInterval(letterIntervalRef.current);
      letterIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // finalizar juego (detiene intervalos y muestra estadísticas)
  const endGame = useCallback(() => {
    clearAllIntervals();
    setGameOver(true);
    setGameStarted(false);
    setGamePaused(false);
    setShowStatsModal(true);
    setFallingLetters([]); // limpiar letras (evita que sigan visualmente)
    
    stopTracking({
      level,
      wpm: score,
      accuracy: Math.round((score / Math.max(1, (score + errors))) * 100) || 0,
      errors,
      completed: errors < (levels[level]?.errorLimit ?? 99),
    });
  }, [clearAllIntervals, stopTracking, level, score, errors]);

  // generación de letras y timer: se recrea cuando cambia gameStarted/gamePaused/level/gameOver
  useEffect(() => {
    // zona segura: primero limpiar cualquier intervalo previo
    clearAllIntervals();

    if (gameStarted && !gameOver && !gamePaused) {
      // añadir letras periódicamente
      letterIntervalRef.current = window.setInterval(() => {
        setFallingLetters(prev => {
          const max = (levels[level]?.maxLetters ?? 6);
          if (prev.length >= max) return prev;
          const keysArr = (levels[level]?.keys ?? []).map(String);
          const char = keysArr.length ? keysArr[Math.floor(Math.random() * keysArr.length)] : 'a';
          const newLetter: FallingLetter = {
            id: Date.now() + Math.random(),
            char,
            x: Math.random() * 80 + 10,
            color: `rgb(${Math.floor(Math.random() * 155 + 100)}, ${Math.floor(Math.random() * 155 + 100)}, ${Math.floor(Math.random() * 155 + 100)})`,
          };
          return [...prev, newLetter];
        });
      }, levels[level]?.speed ?? 1000);

      // contador de tiempo
      timerIntervalRef.current = window.setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }

    // cleanup al desmontar o cuando deps cambien
    return () => clearAllIntervals();
  }, [gameStarted, gameOver, gamePaused, level, clearAllIntervals]);

  // manejo de teclas: se usa setFallingLetters en callback para evitar stale closures
  const handleKeyPress = useCallback((key: string) => {
    if (!gameStarted || gameOver || gamePaused) return;
    const pressedKey = key.toLowerCase();

    setFallingLetters(prev => {
      const idx = prev.findIndex(l => l.char === pressedKey);
      if (idx !== -1) {
        const newArr = prev.slice();
        newArr.splice(idx, 1);
        setScore(s => s + 1);
        playCorrectSound();
        return newArr;
      } else {
        // fallo
        setErrors(prevErr => {
          const ne = prevErr + 1;
          if (ne >= (levels[level]?.errorLimit ?? 99)) {
            endGame();
          }
          return ne;
        });

        setErrorList(prevErrList => {
          const expected = prev.map(l => l.char).join(', ');
          return [{ expected, actual: pressedKey }, ...prevErrList.slice(0, 4)];
        });

        playErrorSound();
        return prev;
      }
    });
  }, [gameStarted, gameOver, gamePaused, level, endGame]);

  // Hook de teclado centralizado (usa tu hook)
  useKeyboardHandler(handleKeyPress);

  // start / pause / resume / stop
  const startGame = () => {
    clearAllIntervals();
    setGameStarted(true);
    setGameOver(false);
    setGamePaused(false);
    setScore(0);
    setErrors(0);
    setFallingLetters([]);
    setTime(0);
    setShowStatsModal(false);
    startTracking();
  };

  const pauseGame = () => {
    // detenemos intervalos (las letras quedan fijadas por cada componente)
    clearAllIntervals();
    setGamePaused(true);
  };

  const resumeGame = () => {
    // al cambiar gamePaused a false, el efecto que crea intervalos se disparará
    setGamePaused(false);
  };

  const stopGame = () => {
    clearAllIntervals();
    setGameOver(true);
    setGameStarted(false);
    setGamePaused(false);
    setFallingLetters([]);
    setScore(0);
    setErrors(0);
    setTime(0);
    setShowStatsModal(false);
  };

  const removeLetter = (id: number) => {
    setFallingLetters(prev => prev.filter(l => l.id !== id));
  };

  const handleLetterReachBottom = useCallback(() => {
    playErrorSound();
    endGame();
  }, [endGame]);



  // cambiar nivel desde el menú
  const handleLevelChange = (n: number) => {
    setLevel(n);
    setCurrentLevel(n);
    setFallingLetters([]);
    setTime(0);
    // detener y dejar que el usuario inicie
    setGameStarted(false);
    setGamePaused(false);
  };

  return (
    <div className="container mx-auto p-4 flex">
      <MenuLevels
        source={GameSource.PLAY_GAME}
        onLevelChange={handleLevelChange}
        currentLevel={currentLevel}
        levels={levels}
      />

      <div className="w-full lg:w-3/4">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-indigo-400 via-purple-400 to-pink-400' : 'from-indigo-600 via-purple-600 to-pink-600'}`}>
            {t('playgame.title')}
          </h1>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {!gameStarted && (
            <button 
              onClick={startGame} 
              className={`px-10 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              }`}
            >
              {t('playgame.start')}
            </button>
          )}
          {gameStarted && !gamePaused && (
            <button 
              onClick={pauseGame} 
              className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-yellow-500/30 transition-all hover:scale-105 hover:shadow-yellow-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white' 
                  : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
              }`}
            >
              {t('playgame.pause')}
            </button>
          )}
          {gamePaused && (
            <button 
              onClick={resumeGame} 
              className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              }`}
            >
              {t('playgame.resume')}
            </button>
          )}
          {gameStarted && (
            <button 
              onClick={stopGame} 
              className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-red-500/40 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' 
                  : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
              }`}
            >
              {t('playgame.stop')}
            </button>
          )}
        </div>

        {/* Stats Bar - Glassmorphism */}
        <div className={`mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4`}>
          <div className={`p-4 rounded-xl border backdrop-blur-md shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${
            isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white/50'
          }`}>
            <span className="text-sm uppercase tracking-wider opacity-70 mb-1">{t('playgame.score')}</span>
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
              {score}
            </span>
          </div>
          
          <div className={`p-4 rounded-xl border backdrop-blur-md shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${
            isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white/50'
          }`}>
            <span className="text-sm uppercase tracking-wider opacity-70 mb-1">{t('playgame.errors')}</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black ${errors > 0 ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {errors}
              </span>
              <span className="text-sm opacity-50">/{levels[level]?.errorLimit ?? '-'}</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border backdrop-blur-md shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${
            isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white/50'
          }`}>
            <span className="text-sm uppercase tracking-wider opacity-70 mb-1">{t('playgame.accuracy', 'Precisión')}</span>
            <span className={`text-3xl font-black ${
              (Math.round((score / Math.max(1, (score + errors))) * 100) || 0) >= 90 ? 'text-blue-500' : 'text-yellow-500'
            }`}>
              {Math.round((score / Math.max(1, (score + errors))) * 100) || 0}%
            </span>
          </div>
        </div>

        {/* Game Container - Modern & Neon */}
        <div 
          ref={containerRef} 
          className={`relative h-[calc(100vh-350px)] min-h-[400px] rounded-2xl overflow-hidden border-2 transition-colors duration-500 shadow-2xl ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700 shadow-blue-900/20' 
              : 'bg-slate-50 border-gray-200 shadow-blue-100'
          }`}
        >
          {/* Background Grid Effect */}
          <div className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: `linear-gradient(${isDarkMode ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDarkMode ? '#fff' : '#000'} 1px, transparent 1px)`, 
              backgroundSize: '40px 40px' 
            }} 
          />
          
          {/* Danger Zone Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-500/10 to-transparent pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-50" />

          {fallingLetters.map(letter => (
            <FallingLetterComponent
              key={letter.id}
              letter={letter}
              onRemove={() => removeLetter(letter.id)}
              onReachBottom={handleLetterReachBottom}
              containerHeight={containerRef.current?.clientHeight || 0}
              isPaused={gamePaused || gameOver}
            />
          ))}
        </div>

        <InstruccionesButton
          instructions={t('playgame.instructions')}
          source={GameSource.PLAY_GAME}
        />
      </div>

      {showStatsModal && (
        <Stats
          stats={getStatsData({
            wpm: score,
            accuracy: Math.round((score / Math.max(1, (score + errors))) * 100) || 0,
            level: level + 1,
            errors,
            elapsedTime: time,
            levelCompleted: !gameOver,
            levelData: {
              wpmGoal: levels[level]?.wpmGoal ?? 0,
              errorLimit: levels[level]?.errorLimit ?? 0,
            },
          })}
          errorList={errorList}
          onRepeatLevel={() => {
            setShowStatsModal(false);
          }}
          onNextLevel={() => {
            if (level < levels.length - 1) {
              setLevel(prev => prev + 1);
              setShowStatsModal(false);
              startGame();
            }
          }}
          sourceComponent="PlayGame"
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  );
};

export default PlayGame;