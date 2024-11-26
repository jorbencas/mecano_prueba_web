import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import ErrorModal from './ErrorModal';
import Stats from './Stats';

// Importa los sonidos
import correctSound from '../public/sounds/correct.mp3';
import errorSound from '../public/sounds/error.mp3';

const levels = [
  { keys: ['a', 's', 'd', 'f'], name: "Nivel 1: Fila base izquierda", speed: 1000, errorLimit: 5 },
  { keys: ['j', 'k', 'l', 'ñ'], name: "Nivel 2: Fila base derecha", speed: 900, errorLimit: 5 },
  { keys: ['q', 'w', 'e', 'r'], name: "Nivel 3: Fila superior izquierda", speed: 800, errorLimit: 5 },
  { keys: ['u', 'i', 'o', 'p'], name: "Nivel 4: Fila superior derecha", speed: 700, errorLimit: 5 },
  { keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ñ', 'q', 'w', 'e', 'r', 'u', 'i', 'o', 'p'], name: "Nivel 5: Todas las letras", speed: 600, errorLimit: 5 },
];

const FallingLetter = ({ letter, onRemove }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      y: window.innerHeight,
      rotate: Math.random() * 360 - 180,
      transition: {
        duration: 5 + Math.random() * 2,
        ease: "easeIn",
        y: { type: "spring", stiffness: 50, damping: 10 }
      }
    });
  }, [controls]);

  return (
    <motion.div
      className="absolute w-10 h-10 flex items-center justify-center text-xl font-bold border-2 border-black rounded"
      style={{
        left: letter.x,
        backgroundColor: letter.color,
      }}
      initial={{ y: -50 }}
      animate={controls}
      onAnimationComplete={onRemove}
    >
      {letter.char}
    </motion.div>
  );
};

const PlayGame = ({ onBack }) => {
  const [level, setLevel] = useState(0);
  const [fallingLetters, setFallingLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const playCorrectSound = () => {
    new Audio(correctSound).play();
  };

  const playErrorSound = () => {
    new Audio(errorSound).play();
  };

  const addLetter = useCallback(() => {
    if (fallingLetters.length < 5) {
      const keys = levels[level].keys;
      const newLetter = {
        id: Date.now(),
        char: keys[Math.floor(Math.random() * keys.length)],
        x: Math.random() * (window.innerWidth - 50),
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
      };
      setFallingLetters(prev => [...prev, newLetter]);
    }
  }, [level, fallingLetters.length]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const intervalId = setInterval(addLetter, levels[level].speed);
      return () => clearInterval(intervalId);
    }
  }, [gameStarted, gameOver, addLetter, level]);

  useEffect(() => {
    if (errors >= levels[level].errorLimit) {
      setGameOver(true);
      setShowStatsModal(true);
    }
  }, [errors, level]);

  const handleKeyPress = useCallback((event) => {
    if (!gameStarted || gameOver) return;

    const pressedKey = event.key.toLowerCase();
    const letterIndex = fallingLetters.findIndex(letter => letter.char === pressedKey);

    if (letterIndex !== -1) {
      setFallingLetters(prev => prev.filter((_, index) => index !== letterIndex));
      setScore(prev => prev + 1);
      playCorrectSound();
    } else {
      setErrors(prev => prev + 1);
      setErrorList(prev => [...prev, { expected: "cualquiera", actual: pressedKey }].slice(-5));
      playErrorSound();
    }
  }, [gameStarted, gameOver, fallingLetters]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setErrors(0);
    setFallingLetters([]);
    setErrorList([]);
  };

  const stopGame = () => {
    setGameStarted(false);
    setGameOver(true);
    setShowStatsModal(true);
  };

  const removeLetter = (id) => {
    setFallingLetters(prev => prev.filter(letter => letter.id !== id));
    setErrors(prev => prev + 1);
    playErrorSound();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Juego de Letras Cayendo</h1>
      
      <div className="mb-4">
        <button onClick={startGame} className="mr-2 px-4 py-2 bg-green-500 text-white rounded">Iniciar Juego</button>
        <button onClick={stopGame} className="mr-2 px-4 py-2 bg-red-500 text-white rounded">Detener Juego</button>
        <button onClick={onBack} className="px-4 py-2 bg-blue-500 text-white rounded">Volver al Menú</button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold">Nivel: {levels[level].name}</h2>
        <p>Puntuación: {score}</p>
        <p>Errores: {errors}/{levels[level].errorLimit}</p>
      </div>

      <div className="relative h-96 border-2 border-gray-300">
        {fallingLetters.map((letter) => (
          <FallingLetter
            key={letter.id}
            letter={letter}
            onRemove={() => removeLetter(letter.id)}
          />
        ))}
      </div>

      {showStatsModal && (
        <ErrorModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
          <Stats
            wpm={score}
            accuracy={Math.round((score / (score + errors)) * 100) || 0}
            level={level + 1}
            errors={errors}
            wpmGoal={0}
            elapsedTime={null}
            errorList={errorList}
            levelCompleted={!gameOver}
            errorLimit={levels[level].errorLimit}
            onRepeatLevel={() => { setShowStatsModal(false); startGame(); }}
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
