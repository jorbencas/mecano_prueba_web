import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface KeyboardProps {
  activeKey: string;
  levelKeys: string[];
  isFullKeyboard?: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({ activeKey, levelKeys, isFullKeyboard = false }) => {
  const { isDarkMode } = useTheme();

  const fullKeyboard = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ['Shift', 'Ctrl', 'Alt', ' ', 'Alt', 'Ctrl']
];


  const rows = isFullKeyboard ? fullKeyboard : [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  [' ']
];


  return (
    <div className={`keyboard grid grid-rows-5 gap-2+`}>
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
                  ${key === " " ? "w-48" : key.length > 1 ? "w-20" : "w-12"} 
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