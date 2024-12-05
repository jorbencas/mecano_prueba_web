import React from 'react';

interface MenuProps {
  onLevelPractice: () => void;
  onCreateText: () => void;
  onPlayGame: () => void;
}

const Menu: React.FC<MenuProps> = ({ onLevelPractice, onCreateText, onPlayGame }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Selecciona una Opción</h2>
      <div className="w-full max-w-md space-y-4">
        <button 
          onClick={onLevelPractice} 
          className="menu-button w-full px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 text-sm sm:text-base"
          aria-label="Iniciar práctica por niveles"
        >
          Practicar por Niveles
        </button>
        <button 
          onClick={onCreateText} 
          className="menu-button w-full px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 text-sm sm:text-base"
        >
          Crear Tu Propio Texto
        </button>
        <button 
          onClick={onPlayGame} 
          className="menu-button w-full px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 text-sm sm:text-base"
        >
          Jugar
        </button>
      </div>
    </div>
  );
};

export default Menu;