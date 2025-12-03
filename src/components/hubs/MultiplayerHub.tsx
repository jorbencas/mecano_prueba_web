import React from 'react';
import NavigationCard from '../NavigationCard';
import { useDynamicTranslations } from '../../hooks/useDynamicTranslations';
import { FaFlagCheckered, FaUsers, FaUserFriends } from 'react-icons/fa';

interface MultiplayerHubProps {
  onSelectOption: (option: string) => void;
  isAuthenticated: boolean;
}

const MultiplayerHub: React.FC<MultiplayerHubProps> = ({ onSelectOption, isAuthenticated }) => {
  const { t } = useDynamicTranslations();

  const items = [
    { 
      title: t('menu.multiplayer.race', 'Carrera Competitiva'), 
      description: 'Compite en tiempo real contra otros usuarios.',
      icon: <FaFlagCheckered />, 
      option: 'race-mode',
      color: 'red',
      locked: !isAuthenticated
    },
    { 
      title: t('menu.multiplayer.practice', 'Sala de Práctica'), 
      description: 'Únete a salas para practicar en grupo.',
      icon: <FaUsers />, 
      option: 'practice-room',
      color: 'blue',
      locked: !isAuthenticated
    },
    { 
      title: t('menu.multiplayer.friends', 'Amigos'), 
      description: 'Gestiona tu lista de amigos y ver su estado.',
      icon: <FaUserFriends />, 
      option: 'friends',
      color: 'green',
      locked: !isAuthenticated
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl">
      <h2 className="text-3xl font-bold mb-8 dark:text-white">Multijugador</h2>
      {!isAuthenticated && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Inicio de sesión requerido</p>
          <p>Debes iniciar sesión para acceder a las funciones multijugador.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <NavigationCard
            key={item.option}
            title={item.title}
            description={item.description}
            icon={item.icon}
            onClick={() => onSelectOption(item.option)}
            color={item.color}
            locked={item.locked}
          />
        ))}
      </div>
    </div>
  );
};

export default MultiplayerHub;
