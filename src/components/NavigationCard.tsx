import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaLock } from 'react-icons/fa';

interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  locked?: boolean;
  color?: string; // Color name: 'blue', 'green', 'red', etc.
}

// HSL to Hex conversion
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Generate comprehensive color palette - 120 colors
const generateColorMap = () => {
  const colors: Record<string, {
    border: string;
    borderHover: string;
    iconBg: string;
    iconBgDark: string;
    iconText: string;
    iconTextDark: string;
    bgDecorative: string;
  }> = {};

  // Base colors with semantic names
  const baseColors = [
    { name: 'blue', hue: 210 },
    { name: 'sky', hue: 200 },
    { name: 'cyan', hue: 180 },
    { name: 'teal', hue: 170 },
    { name: 'emerald', hue: 150 },
    { name: 'green', hue: 140 },
    { name: 'lime', hue: 90 },
    { name: 'yellow', hue: 60 },
    { name: 'amber', hue: 45 },
    { name: 'orange', hue: 30 },
    { name: 'red', hue: 0 },
    { name: 'rose', hue: 350 },
    { name: 'pink', hue: 330 },
    { name: 'fuchsia', hue: 300 },
    { name: 'purple', hue: 270 },
    { name: 'violet', hue: 260 },
    { name: 'indigo', hue: 240 },
    { name: 'slate', hue: 215 },
  ];

  // Generate base semantic colors
  baseColors.forEach(({ name, hue }) => {
    colors[name] = {
      border: '#e5e7eb',
      borderHover: hslToHex(hue, 75, 55),
      iconBg: hslToHex(hue, 70, 95),
      iconBgDark: '#374151',
      iconText: hslToHex(hue, 75, 45),
      iconTextDark: hslToHex(hue, 70, 65),
      bgDecorative: hslToHex(hue, 75, 55),
    };
  });

  // Generate numbered variations (color-1 to color-100)
  for (let i = 1; i <= 100; i++) {
    const hue = (i * 3.6) % 360; // Distribute evenly across color wheel
    const saturation = 60 + (i % 3) * 10; // Vary saturation: 60, 70, 80
    
    colors[`color-${i}`] = {
      border: '#e5e7eb',
      borderHover: hslToHex(hue, saturation, 55),
      iconBg: hslToHex(hue, saturation - 10, 95),
      iconBgDark: '#374151',
      iconText: hslToHex(hue, saturation, 45),
      iconTextDark: hslToHex(hue, saturation - 10, 65),
      bgDecorative: hslToHex(hue, saturation, 55),
    };
  }

  // Add grayscale variations
  for (let i = 1; i <= 10; i++) {
    const lightness = 30 + i * 5;
    colors[`gray-${i}`] = {
      border: '#e5e7eb',
      borderHover: hslToHex(0, 0, lightness),
      iconBg: hslToHex(0, 0, 95),
      iconBgDark: '#374151',
      iconText: hslToHex(0, 0, lightness - 10),
      iconTextDark: hslToHex(0, 0, lightness + 20),
      bgDecorative: hslToHex(0, 0, lightness),
    };
  }

  return colors;
};

const colorMap = generateColorMap();

const NavigationCard: React.FC<NavigationCardProps> = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  locked = false,
  color = 'blue'
}) => {
  const { isDarkMode } = useTheme();
  const colors = colorMap[color] || colorMap.blue;


  return (
    <div 
      onClick={locked ? undefined : onClick}
      className={`group relative overflow-hidden rounded-xl p-2 md:p-3 transition-all duration-300 cursor-pointer border ${
        isDarkMode 
          ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-blue-500/50' 
          : 'bg-white/80 border-gray-200/50 hover:bg-white hover:border-blue-500/50 hover:shadow-lg'
      } hover:scale-[1.02] active:scale-[0.98]
      ${locked ? 'opacity-75 cursor-not-allowed grayscale' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-1.5">
        <div 
          className="w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-lg md:text-xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
          style={{
            backgroundColor: isDarkMode ? colors.iconBgDark : colors.iconBg,
            color: isDarkMode ? colors.iconTextDark : colors.iconText,
          }}
        >
          {icon}
        </div>
        {locked && <FaLock className="text-gray-400 text-[10px] md:text-xs" />}
      </div>
      
      <h3 className={`text-sm md:text-base font-bold mb-0.5 break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      <p className={`text-[10px] md:text-xs break-words ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {description}
      </p>

      {/* Decorative background element */}
      <div 
        className="absolute -bottom-4 -right-4 w-20 h-20 md:w-24 md:h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          backgroundColor: isDarkMode ? '#ffffff' : colors.bgDecorative,
        }}
      />
      
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.borderHover}10, transparent 70%)`,
        }}
      />
    </div>
  );
};

export default NavigationCard;
