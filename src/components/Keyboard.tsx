import React from 'react';

interface KeyboardProps {
  activeKey: string;
  levelKeys: string[];
}

import { useTheme } from '../context/ThemeContext';

const Keyboard: React.FC<KeyboardProps> = ({ activeKey, levelKeys }) => {
  const { isDarkMode } = useTheme();

  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], // Números en la parte superior
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    [' '] // Tecla de espacio
  ];

  return (
    <div className={`keyboard grid grid-rows-5 gap-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="row flex justify-center space-x-2 sm:space-x-4">
          {row.map((key) => {
            const isActive = activeKey === key;
            const isInLevel = levelKeys.includes(key);
            return (
              <div 
                key={key} 
                className={`
  key 
  ${key === " " ? "w-48" : "w-12"} 
  h-12 flex items-center justify-center border rounded-md 
  
    ${isActive ? 'bg-orange-500 text-white' : (isInLevel 
    ? (isDarkMode ? "bg-orange-200 text-black" : "bg-orange-200 text-black") 
    : (isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-300 text-black")
            )}
  transition duration-300 ease-in-out hover:scale-105
`}
>
                {key === ' ' ? <span className="text-center">Espacio</span> : key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;