// Menu.tsx
import React from 'react';
import { FaKeyboard, FaGamepad, FaPen, FaCog } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const MenuItem: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void }> = ({ icon, text, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center p-4 bg-blue-500 text-white rounded-lg shadow-md cursor-pointer transition-colors duration-300 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
    onClick={onClick}
  >
    {icon}
    <span className="ml-3 text-lg font-semibold">{text}</span>
  </motion.div>
);

const Menu: React.FC<{ onSelectOption: (option: string) => void }> = ({ onSelectOption }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex flex-col space-y-4 p-6 ${isDarkMode ? ' text-white' : ' text-black'} rounded-xl shadow-lg max-w-md mx-auto`}>     
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700 dark:text-blue-300">Menú Principal</h1>
      <MenuItem icon={<FaKeyboard className="text-2xl" />} text="Práctica de Mecanografía" onClick={() => onSelectOption('practice')} />
      <MenuItem icon={<FaGamepad className="text-2xl" />} text="Juego de Mecanografía" onClick={() => onSelectOption('game')} />
      <MenuItem icon={<FaPen className="text-2xl" />} text="Crear Texto" onClick={() => onSelectOption('create')} />
      <MenuItem icon={<FaCog className="text-2xl" />} text="Configuración" onClick={() => onSelectOption('settings')} />
    </div>
  );
};

export default Menu;
