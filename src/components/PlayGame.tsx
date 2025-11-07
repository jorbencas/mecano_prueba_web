// src/components/PlayGame.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import ErrorModal from './ErrorModal';
import Stats from './Stats';
import MenuLevels from './MenuLevels';
import { useTheme } from '../context/ThemeContext';
import InstruccionesButton from './Instrucciones';
import { getStatsData } from '../utils/getStatsData';
import levels from '../data/playgames.json';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { useKeyboardHandler } from '../hooks/useKeyboardHandler';

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
        transition: { duration, ease: 'linear' },
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

  const isColorDark = (color: string) => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return false;
    const [r, g, b] = rgb.map(Number);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 186;
  };
  const textColor = isColorDark(letter.color) ? '#fff' : '#000';

  return (
    <motion.div
      ref={elRef}
      className="absolute font-bold"
      style={{
        left: `${letter.x}%`,
        backgroundColor: letter.color,
        color: textColor,
        width: 50,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
      }}
      initial={{ y: -40 }}
      animate={controls}
    >
      <span style={{ fontSize: 24 }}>{letter.char}</span>
    </motion.div>
  );
};

/* -----------------------
   PlayGame (principal)
   ----------------------- */
const PlayGame: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

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
  }, [clearAllIntervals]);

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

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

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
        source="PlayGame"
        onLevelChange={handleLevelChange}
        currentLevel={currentLevel}
        levels={levels}
      />

      <div className="w-3/4">
        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {t('playgame.title', 'Juego de Letras Cayendo')}
        </h1>

        <div className="mb-4">
          {!gameStarted && (
            <button onClick={startGame} className="mr-2 px-4 py-2 bg-green-500 text-white rounded">
              {t('playgame.start', 'Iniciar')}
            </button>
          )}
          {gameStarted && !gamePaused && (
            <button onClick={pauseGame} className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded">
              {t('playgame.pause', 'Pausar')}
            </button>
          )}
          {gamePaused && (
            <button onClick={resumeGame} className="mr-2 px-4 py-2 bg-green-500 text-white rounded">
              {t('playgame.resume', 'Reanudar')}
            </button>
          )}
          {gameStarted && (
            <button onClick={stopGame} className="mr-2 px-4 py-2 bg-red-500 text-white rounded">
              {t('playgame.stop', 'Detener')}
            </button>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold">{levels[level]?.name}</h2>
          <p>{t('playgame.score', 'Puntuación (WPM)')}: {score}</p>
          <p>{t('playgame.errors', 'Errores')}: {errors}/{levels[level]?.errorLimit ?? '-'}</p>
          <p>{t('playgame.time', 'Tiempo')}: {formatTime(time)}</p>
        </div>

        <div ref={containerRef} className="relative h-[calc(100vh-300px)] border-2 border-gray-300 overflow-hidden">
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
          instructions={t('playgame.instructions', 'Presiona las teclas correctas.')}
        />
      </div>

      {showStatsModal && (
        <ErrorModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
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
          />
        </ErrorModal>
      )}
    </div>
  );
};

export default PlayGame;