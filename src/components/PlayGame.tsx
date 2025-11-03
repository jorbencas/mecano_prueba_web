import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import ErrorModal from './ErrorModal';
import Stats from './Stats';
import MenuLevels from './MenuLevels';
import { useTheme } from '../context/ThemeContext';
import InstruccionesButton from './Instrucciones';
import { getStatsData } from '../utils/getStatsData';

const levels = [
  { keys: ['a', 's', 'd', 'f'], name: "Nivel 1: Fila base izquierda", speed: 1000, errorLimit: 10, wpmGoal: 50, minLetters: 30, maxLetters: 5, maxTime: 60, text: "" },
  { keys: ['j', 'k', 'l', 'ñ'], name: "Nivel 2: Fila base derecha", speed: 900, errorLimit: 5, wpmGoal: 60, minLetters: 40, maxLetters: 6, maxTime: 90, text: "" },
  { keys: ['q', 'w', 'e', 'r'], name: "Nivel 3: Fila superior izquierda", speed: 800, errorLimit: 5, wpmGoal: 70, minLetters: 50, maxLetters: 7, maxTime: 100, text: "" },
  { keys: ['u', 'i', 'o', 'p'], name: "Nivel 4: Fila superior derecha", speed: 700, errorLimit: 5, wpmGoal: 80, minLetters: 60, maxLetters: 8, maxTime: 120, text: "" },
  { keys: ['a','s','d','f','j','k','l','ñ','q','w','e','r','u','i','o','p'], name: "Nivel 5: Todas las letras", speed: 600, errorLimit: 5, wpmGoal: 90, minLetters: 70, maxLetters: 9, maxTime: 150, text: "" },
];

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

const FallingLetterComponent: React.FC<{ 
  letter: FallingLetter, 
  onRemove: () => void, 
  onReachBottom: () => void,
  containerHeight: number,
  isPaused: boolean
}> = ({ letter, onRemove, onReachBottom, containerHeight, isPaused }) => {
  const controls = useAnimation();
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPaused) {
      controls.start({
        y: containerHeight,
        transition: {
          duration: Math.random() * 4 + 5, // ahora entre 5 y 9 segundos
        ease: "easeInOut" // animación más suave
        }
      });
    }
  }, [isPaused, controls, containerHeight]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (letterRef.current && !isPaused) {
        const rect = letterRef.current.getBoundingClientRect();
        const parentRect = letterRef.current.parentElement!.getBoundingClientRect();
        if (rect.bottom >= parentRect.bottom) {
          onReachBottom();
          onRemove();
        }
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isPaused, onRemove, onReachBottom]);

  const isColorDark = (color: string) => {
    const rgb = color.match(/\d+/g);
    if (rgb) {
      const [r, g, b] = rgb.map(Number);
      return (r * 0.299 + g * 0.587 + b * 0.114) < 186;
    }
    return false;
  };

  const textColor = isColorDark(letter.color) ? 'white' : 'black';

  return (
    <motion.div
      ref={letterRef}
      className="absolute font-bold"
      style={{
        left: `${letter.x}%`,
        backgroundColor: letter.color,
        color: textColor,
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px'
      }}
      initial={{ y: -40 }}
      animate={controls}
    >
      <span style={{ fontSize:"24px" }}>{letter.char}</span>
    </motion.div>
  );
};

const PlayGame: React.FC = () => {
  const [level, setLevel] = useState(0);
  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [errorList, setErrorList] = useState<ErrorItem[]>([]);
  const [lettersTypedCount, setLettersTypedCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [time, setTime] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();

  const correctAudio = new Audio(process.env.PUBLIC_URL + '/sounds/correct.mp3');
  const errorAudio = new Audio(process.env.PUBLIC_URL + '/sounds/error.mp3');

  const playCorrectSound = () => correctAudio.play().catch(() => {});
  const playErrorSound = () => errorAudio.play().catch(() => {});

  const endGame = useCallback(() => {
    setGameOver(true);
    setGameStarted(false);
    setGamePaused(false);
    setShowStatsModal(true);
    setFallingLetters([]);
  }, []);

  const addLetter = useCallback(() => {
    if (fallingLetters.length < levels[level].maxLetters && !gameOver && !gamePaused) {
      const keys = levels[level].keys;
      const newLetter = {
        id: Date.now(),
        char: keys[Math.floor(Math.random() * keys.length)],
        x: Math.random() * (90 - 10) + 10,
        color: `rgb(${Math.random() * (255 -100) +100},${Math.random() * (255 -100) +100},${Math.random() * (255 -100) +100})`,
      };
      setFallingLetters(prev => [...prev, newLetter]);
    }
  }, [level, fallingLetters.length, gameOver, gamePaused]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (gameStarted && !gameOver && !gamePaused) {
      intervalId = setInterval(addLetter, levels[level].speed);
    }
    return () => clearInterval(intervalId);
  }, [gameStarted, gameOver, gamePaused, addLetter, level]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gameStarted && !gameOver && !gamePaused) {
      timer = setInterval(() => {
        setTime(prev => {
          const next = prev + 1;
          if (next >= levels[level].maxTime) {
            endGame();
            alert("⏰ Tiempo agotado. Vuelve a intentarlo.");
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameOver, gamePaused, level, endGame]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameStarted || gameOver || gamePaused) return;
    const pressedKey = event.key.toLowerCase();
    const letterIndex = fallingLetters.findIndex(letter => letter.char === pressedKey);

    if (letterIndex !== -1) {
      setFallingLetters(prev => prev.filter((_, index) => index !== letterIndex));
      setScore(prev => prev + 1);
      setLettersTypedCount(prev => prev + 1);
      playCorrectSound();
    } else {
      setErrors(prev => {
        const newErrors = prev + 1;
        if (newErrors >= levels[level].errorLimit) endGame();
        return newErrors;
      });
      setErrorList(prev => {
        const expectedChars = fallingLetters.map(l => l.char).join(', ');
        return [{ expected: expectedChars, actual: pressedKey }, ...prev.slice(0, 4)];
      });
      playErrorSound();
    }
  }, [gameStarted, gameOver, gamePaused, fallingLetters, level, endGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    setCurrentLevel(newLevel);
    setFallingLetters([]);
    setScore(0);
    setErrors(0);
    setTime(0);
    setGameStarted(false);
    setShowMenu(true);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGamePaused(false);
    setScore(0);
    setErrors(0);
    setFallingLetters([]);
    setErrorList([]);
    setLettersTypedCount(0);
    setShowMenu(false);
    setTime(0);
  };

  const pauseGame = () => setGamePaused(true);
  const resumeGame = () => setGamePaused(false);
  const stopGame = () => {
    setGameOver(true);
    setGameStarted(false);
    setGamePaused(false);
    setFallingLetters([]);
    setShowMenu(true);
  };

  const removeLetter = (id: number) => {
    if (gameOver || gamePaused) return;
    setFallingLetters(prev => prev.filter(letter => letter.id !== id));
  };

  const handleLetterReachBottom = useCallback(() => {
    if (gameOver || gamePaused) return;
    endGame();
    playErrorSound();
  }, [gameOver, gamePaused, endGame]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          Juego de Letras Cayendo
        </h1>

        <div className="mb-4">
          {(showMenu || (!gameStarted && !gameOver)) && (
            <button onClick={startGame} className="mr-2 px-4 py-2 bg-green-500 text-white rounded">
              Iniciar Juego
            </button>
          )}
          {gameStarted && !gameOver && !gamePaused && (
            <button onClick={pauseGame} className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded">
              Pausar Juego
            </button>
          )}
          {gameStarted && !gameOver && gamePaused && (
            <button onClick={resumeGame} className="mr-2 px-4 py-2 bg-green-500 text-white rounded">
              Reanudar Juego
            </button>
          )}
          {gameStarted && !gameOver && (
            <button onClick={stopGame} className="mr-2 px-4 py-2 bg-red-500 text-white rounded">
              Detener Juego
            </button>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold">{levels[level].name}</h2>
          <p>Puntuación (WPM): {score}</p>
          <p>Tiempo máximo: {Math.floor(levels[level].maxTime / 60)} min</p>
          {gameStarted && (
            <>
              <p>Errores: {errors}/{levels[level].errorLimit}</p>
              <p>Tiempo: {formatTime(time)}</p>
              <p>Objetivo WPM: {levels[level].wpmGoal}</p>
              <p>Letras mínimas: {levels[level].minLetters}</p>
            </>
          )}
        </div>

        <div ref={containerRef} className="relative h-[calc(100vh-300px)] border-2 border-gray-300 overflow-hidden">
          {fallingLetters.map(letter => (
            <FallingLetterComponent
              key={letter.id}
              letter={letter}
              onRemove={() => removeLetter(letter.id)}
              onReachBottom={handleLetterReachBottom}
              containerHeight={containerRef.current?.clientHeight || 0}
              isPaused={gamePaused}
            />
          ))}
        </div>

        <InstruccionesButton
          instructions="Presiona las teclas correctas antes de que caigan hasta el final. Evita errores, mantén el ritmo y alcanza el WPM objetivo para subir de nivel."
          color="green"
        />
      </div>

      {showStatsModal && (
        <ErrorModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
          <Stats
            stats={getStatsData({
              wpm: score,
              accuracy: Math.round((score / (score + errors)) * 100) || 0,
              level: level + 1,
              errors,
              elapsedTime: time,
              levelCompleted: !gameOver,
              levelData: {
                wpmGoal: levels[level].wpmGoal,
                errorLimit: levels[level].errorLimit,
              },
            })}
            errorList={errorList}
            onRepeatLevel={() => {
              setShowStatsModal(false);
              setShowMenu(true);
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
