import React from 'react';

interface MenuProps {
  onLevelPractice: () => void; // Función para practicar por niveles
  onCreateText: () => void; // Función para crear texto personalizado
  onPlayGame: () => void; // Función para jugar
}

const Menu: React.FC<MenuProps> = ({ onLevelPractice, onCreateText, onPlayGame }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">Selecciona una Opción</h2>
      <button 
        onClick={onLevelPractice} 
        className="menu-button mb-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
         aria-label="Iniciar práctica por niveles"
      >
        Practicar por Niveles
      </button>
      <button 
        onClick={onCreateText} 
        className="menu-button mb-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
      >
        Crear Tu Propio Texto
      </button>
      <button 
        onClick={onPlayGame} 
        className="menu-button px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
      >
        Jugar
      </button>
    </div>
  );
};

export default Menu;