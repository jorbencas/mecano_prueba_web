import React from 'react';
import NavigationCard from '../NavigationCard';
import { useDynamicTranslations } from '../../hooks/useDynamicTranslations';
import { 
  FaKeyboard, FaRunning, FaBullseye, FaSpa, 
  FaSortNumericDown, FaCode, FaMicrophone, FaHashtag 
} from 'react-icons/fa';

interface PracticeHubProps {
  onSelectOption: (option: string) => void;
}

const PracticeHub: React.FC<PracticeHubProps> = ({ onSelectOption }) => {
  const { t } = useDynamicTranslations();

  const items = [
    { 
      title: t('menu.practice.guided', 'Niveles Guiados'), 
      description: 'Aprende paso a paso con lecciones estructuradas.',
      icon: <FaKeyboard />, 
      option: 'practice',
      color: 'blue'
    },
    { 
      title: t('menu.practice.free', 'Práctica Libre'), 
      description: 'Escribe a tu ritmo sin límites ni presiones.',
      icon: <FaKeyboard />, 
      option: 'free-practice',
      color: 'green'
    },
    { 
      title: t('menu.practice.speed', 'Modo Velocidad'), 
      description: 'Pon a prueba tu rapidez contra el reloj.',
      icon: <FaRunning />, 
      option: 'speed-mode',
      color: 'red'
    },
    { 
      title: t('menu.practice.precision', 'Modo Precisión'), 
      description: 'Enfócate en la exactitud, los errores penalizan.',
      icon: <FaBullseye />, 
      option: 'precision-mode',
      color: 'purple'
    },
    { 
      title: t('menu.practice.zen', 'Modo Zen'), 
      description: 'Relájate y escribe con sonidos ambientales.',
      icon: <FaSpa />, 
      option: 'zen-mode',
      color: 'teal'
    },
    { 
      title: t('menu.practice.numbers', 'Modo Números'), 
      description: 'Practica exclusivamente con el teclado numérico.',
      icon: <FaSortNumericDown />, 
      option: 'numbers-mode',
      color: 'orange'
    },
    { 
      title: t('menu.practice.symbols', 'Modo Símbolos'), 
      description: 'Domina los caracteres especiales y símbolos.',
      icon: <FaHashtag />, 
      option: 'symbols-mode',
      color: 'indigo'
    },
    { 
      title: t('menu.practice.code', 'Modo Código'), 
      description: 'Practica sintaxis de programación real.',
      icon: <FaCode />, 
      option: 'code-mode',
      color: 'gray'
    },
    { 
      title: t('menu.practice.dictation', 'Modo Dictado'), 
      description: 'Escucha y escribe lo que oyes.',
      icon: <FaMicrophone />, 
      option: 'dictation-mode',
      color: 'pink'
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl">
      <h2 className="text-3xl font-bold mb-8 dark:text-white">Zona de Práctica</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <NavigationCard
            key={item.option}
            title={item.title}
            description={item.description}
            icon={item.icon}
            onClick={() => onSelectOption(item.option)}
            color={item.color}
          />
        ))}
      </div>
    </div>
  );
};

export default PracticeHub;
