import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface HandsProps {
  nextKey: string;
}

const fingerMap: { [key: string]: { hand: 'left' | 'right'; finger: string } } = {
  'q': { hand: 'left', finger: 'meñique' },
  'a': { hand: 'left', finger: 'meñique' },
  'z': { hand: 'left', finger: 'meñique' },
  'w': { hand: 'left', finger: 'anular' },
  's': { hand: 'left', finger: 'anular' },
  'x': { hand: 'left', finger: 'anular' },
  'e': { hand: 'left', finger: 'medio' },
  'd': { hand: 'left', finger: 'medio' },
  'c': { hand: 'left', finger: 'medio' },
  'r': { hand: 'left', finger: 'índice' },
  'f': { hand: 'left', finger: 'índice' },
  'v': { hand: 'left', finger: 'índice' },
  't': { hand: 'left', finger: 'índice' },
  'g': { hand: 'left', finger: 'índice' },
  'b': { hand: 'left', finger: 'índice' },
  'y': { hand: 'right', finger: 'índice' },
  'h': { hand: 'right', finger: 'índice' },
  'n': { hand: 'right', finger: 'índice' },
  'u': { hand: 'right', finger: 'índice' },
  'j': { hand: 'right', finger: 'índice' },
  'm': { hand: 'right', finger: 'índice' },
  'i': { hand: 'right', finger: 'medio' },
  'k': { hand: 'right', finger: 'medio' },
  ',': { hand: 'right', finger: 'medio' },
  'o': { hand: 'right', finger: 'anular' },
  'l': { hand: 'right', finger: 'anular' },
  '.': { hand: 'right', finger: 'anular' },
  'p': { hand: 'right', finger: 'meñique' },
  'ñ': { hand: 'right', finger: 'meñique' },
  '-': { hand: 'right', finger: 'meñique' },
  '1': { hand: 'left', finger: 'índice' },   
  '2': { hand: 'left', finger: 'índice' },   
  '3': { hand: 'left', finger: 'medio' },    
  '4': { hand: 'right', finger: 'índice' },  
  '5': { hand: 'right', finger: 'índice' },  
  '6': { hand: 'right', finger: 'medio' },    
  '7': { hand: 'right', finger: 'anular' },   
  '8': { hand: 'right', finger: 'anular' },   
  '9': { hand: 'right', finger: 'meñique' },  
  '0': { hand: 'right', finger: 'meñique' }, 
  ' ': { hand: 'right', finger: 'pulgar' },
};

const Hands: React.FC<HandsProps> = ({ nextKey }) => {
   const { isDarkMode } = useTheme();
  const activeHand = fingerMap[nextKey]?.hand || null;
  const activeFinger = fingerMap[nextKey]?.finger || null;

  const getFingerDescription = (hand: string, finger: string) => {
    const handText = hand === 'left' ? 'left' : 'right';
    return `${finger.charAt(0).toUpperCase() + finger.slice(1)} ${handText}`;
  };

  const HandSVG = ({ isLeft }: { isLeft: boolean }) => (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <g transform={isLeft ? '' : "scale(-1,1) translate(-200,0)"}>
        {/* Palma cuadrada */}
        <rect x="40" y="80" width="120" height="100" rx="10" ry="10"
              fill={isDarkMode ? "#6B46C1" : "#FFE5B4"} stroke={isDarkMode ? "#E2E8F0" : "#000"} strokeWidth="2" />
        
        {/* Dedos redondeados */}
        <circle cx="60" cy="70" r="15" 
                fill={activeFinger === "meñique" && ((isLeft && activeHand === "left") || (!isLeft && activeHand === "right")) ? "#FFD700" : (isDarkMode ? "#F6AD55" : "#FFB3BA")} 
                stroke={isDarkMode ? "#E2E8F0" : "#000"} strokeWidth="2" />
        
        <circle cx="90" cy="50" r="15" 
                fill={activeFinger === "anular" && ((isLeft && activeHand === "left") || (!isLeft && activeHand === "right")) ? "#FFD700" : (isDarkMode ? "#F6AD55" : "#BAFFC9")} 
                stroke={isDarkMode ? "#E2E8F0" : "#000"} strokeWidth="2" />
        
        <circle cx="120" cy="40" r="15" 
                fill={activeFinger === "medio" && ((isLeft && activeHand === "left") || (!isLeft && activeHand === "right")) ? "#FFD700" : (isDarkMode ? "#F6AD55" : "#BAE1FF")} 
                stroke={isDarkMode ? "#E2E8F0" : "#000"} strokeWidth="2" />
        
        <circle cx="150" cy="50" r="15" 
                fill={activeFinger === "índice" && ((isLeft && activeHand === "left") || (!isLeft && activeHand === "right")) ? "#FFD700" : (isDarkMode ? "#F6AD55" : "#FFFFBA")} 
                stroke={isDarkMode ? "#E2E8F0" : "#000"} strokeWidth="2" />
        
        <ellipse cx="170" cy="100" rx="10" ry="20"
                 fill={activeFinger === "pulgar" && ((isLeft && activeHand === "left") || (!isLeft && activeHand === "right")) ? "#FFD700" : (isDarkMode ? "#F6AD55" : "#FFD9BA")} 
                 stroke={isDarkMode ? "#E2E8F0" : "#000"} strokeWidth="2"/>
      </g>
    </svg>
  );

  return (
    <div className={`flex flex-col items-center my-8 ${isDarkMode ? ' text-white' : ' text-black'}`}>
      <div className="mb-4 text-center">
        <span className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-500'} text-lg`}>
          {activeHand && activeFinger ? getFingerDescription(activeHand, activeFinger) : ""}
        </span>
      </div>

      <div className="flex justify-center space-x-8">
        <div className={` border border-red-600   p-4 rounded-lg ${activeHand === 'left' ? (isDarkMode ? 'bg-blue-900' : 'bg-cyan-100') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}`}>
          <HandSVG isLeft={true} />
          <span className={` top-2 left-2 text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>left</span>
        </div>
        <div className={`border border-red-600 p-4 rounded-lg ${activeHand === 'right' ? (isDarkMode ? 'bg-blue-900' : 'bg-cyan-100') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}`}>
          <HandSVG isLeft={false} />
          <span className={` top-2 right-2 text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>right</span>
        </div>
      </div>
    </div>
  );
};

export default Hands;
