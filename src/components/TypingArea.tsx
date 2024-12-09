import React, { useEffect, useRef } from 'react';

interface TypingAreaProps {
  text: string;
  currentIndex: number; 
  onKeyPress: (key: string) => void;
  wpm: number;
  accuracy: number;
  errors: { [key: number]: { expected: string; actual: string } };
  source?: string;
}

const TypingArea: React.FC<TypingAreaProps> = ({ text, currentIndex, onKeyPress, wpm, accuracy, errors, source }) => {

    const textAreaRef = useRef<HTMLParagraphElement>(null);

useEffect(() => {
  const handleKeyPress = (event: KeyboardEvent) => {--
    if (event.key === text[currentIndex]) {
      onKeyPress(event.key);
    } 
  };

  window.addEventListener('keydown', handleKeyPress);

  return () => {
    window.removeEventListener('keydown', handleKeyPress);
  };
}, [onKeyPress]);

useEffect(() => {
  if (source === 'CreateText' && textAreaRef.current) {
    textAreaRef.current.style.height = 'auto';
    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
  }
}, [text, source]);

  return (
    <div className="typing-area">
      <p 
        ref={textAreaRef}
        className={`text-lg sm:text-xl lg:text-2xl border-2 border-gray-300 rounded-lg p-4 bg-green-100 mb-4 
          ${source === 'CreateText' ? 'min-h-[6rem] h-auto whitespace-pre-wrap break-words' : ''}`}
      >
        {text.split('').map((char, index) => (
          <span key={index} className={
            index < currentIndex ? "text-green-500" :
            index === currentIndex ? "font-bold text-blue-500" : ""
          }>
            {char}
          </span>
        ))}
      </p>
      <div className="flex flex-col sm:flex-row justify-between">
        <p className="inline-block mr-0 sm:mr-4 text-lg">WPM: {wpm}</p>
        <p className="inline-block mr-0 sm:mr-4 text-lg">Precisión: {accuracy}%</p>
        <p className="inline-block text-lg">Errores: {Object.keys(errors).length}</p>
      </div>
    </div>
  );
};

export default TypingArea;