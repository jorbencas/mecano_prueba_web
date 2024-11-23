import React, { useEffect } from 'react';

interface TypingAreaProps {
  text: string;
  currentIndex: number;
  onKeyPress: (key: string) => void;
  wpm: number;
  accuracy: number;
  errors: { [key: number]: { expected: string; actual: string } };
}

const TypingArea: React.FC<TypingAreaProps> = ({ text, currentIndex, onKeyPress, wpm, accuracy, errors }) => {
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      onKeyPress(event.key);
    };

    // Agregar event listener para capturar teclas
    document.addEventListener('keydown', handleKeyDown);

    // Limpiar el event listener al desmontar el componente
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onKeyPress]);

  return (
    <div className="typing-area">
      <p className="text-2xl border-2 border-gray-300 rounded-lg p-4 bg-pastel-green mb-4">
        {text.split('').map((char, index) => {
          if (index < currentIndex) {
            // Colorear los caracteres ya escritos
            return (
              <span key={index} className="text-green-500">
                {char}
              </span>
            );
          } else if (index === currentIndex) {
            // Resaltar la letra actual que se debe escribir
            return (
              <span key={index} className="font-bold text-blue-500">
                {char}
              </span>
            );
          } else {
            // Letras aún no escritas
            return (
              <span key={index}>
                {char}
              </span>
            );
          }
        })}
      </p>
      <div className="flex justify-between">
        <p className="inline-block mr-4 text-lg">WPM: {wpm}</p>
        <p className="inline-block mr-4 text-lg">Precisión: {accuracy}%</p>
        <p className="inline-block text-lg">Errores: {Object.keys(errors).length}</p>
      </div>
    </div>
  );
};

export default TypingArea;