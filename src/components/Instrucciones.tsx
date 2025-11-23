import React from "react";
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from "../hooks/useDynamicTranslations";
import { FaKeyboard, FaHandPaper, FaBullseye, FaLightbulb } from 'react-icons/fa';

interface InstruccionesButtonProps {
  instructions?: string;
  source?: 'Levels' | 'PlayGame' | 'CreateText' | 'LevelCreator' | 'FreePractice' | 'SpeedMode' | 'PrecisionMode';
  showKeyboardShortcuts?: boolean;
}

const InstruccionesButton: React.FC<InstruccionesButtonProps> = ({
  instructions,
  source,
  showKeyboardShortcuts = false
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  const getComponentTips = () => {
    switch (source) {
      case 'Levels':
        return [
          { 
            icon: <FaBullseye />, 
            text: t('instructions.tips.levels.goal', 'Alcanza el objetivo de WPM y mantén >95% de precisión para avanzar al siguiente nivel')
          },
          { 
            icon: <FaKeyboard />, 
            text: t('instructions.tips.levels.keys', 'Cada nivel introduce nuevas teclas. Practica solo las teclas resaltadas en naranja')
          },
          { 
            icon: <FaHandPaper />, 
            text: t('instructions.tips.levels.hands', 'Observa las manos animadas para aprender la posición correcta de cada dedo')
          },
          { 
            icon: <FaLightbulb />, 
            text: t('instructions.tips.levels.strategy', 'Empieza despacio priorizando precisión. La velocidad vendrá con la práctica')
          },
        ];
      case 'PlayGame':
        return [
          { 
            icon: <FaBullseye />, 
            text: t('instructions.tips.playgame.catch', 'Presiona las teclas correctas antes de que las letras lleguen al fondo')
          },
          { 
            icon: <FaKeyboard />, 
            text: t('instructions.tips.playgame.speed', 'Cada nivel es más rápido y tiene más letras simultáneas')
          },
          { 
            icon: <FaLightbulb />, 
            text: t('instructions.tips.playgame.errors', 'Tienes un límite de errores. Presionar teclas incorrectas cuenta como error')
          },
          { 
            icon: <FaHandPaper />, 
            text: t('instructions.tips.playgame.focus', 'Mantén la vista en la pantalla, no en el teclado. Usa la memoria muscular')
          },
        ];
      case 'CreateText':
        return [
          { 
            icon: <FaKeyboard />, 
            text: t('instructions.tips.createtext.custom', 'Crea textos personalizados para practicar vocabulario específico de tu trabajo')
          },
          { 
            icon: <FaBullseye />, 
            text: t('instructions.tips.createtext.goals', 'Establece objetivos de WPM y límites de errores personalizados para cada texto')
          },
          { 
            icon: <FaLightbulb />, 
            text: t('instructions.tips.createtext.practice', 'Usa textos reales de documentos, emails o código para práctica contextual')
          },
          { 
            icon: <FaHandPaper />, 
            text: t('instructions.tips.createtext.length', 'Los textos más largos (100+ caracteres) dan mejores métricas de WPM')
          },
        ];
      default:
        return [];
    }
  };

  const getKeyboardShortcuts = () => {
    if (!showKeyboardShortcuts) return [];
    
    return [
      { key: 'ESC', action: t('instructions.shortcuts.pause', 'Pausar/Reanudar') },
      { key: 'Tab', action: t('instructions.shortcuts.restart', 'Reiniciar nivel') },
    ];
  };

  const getDetailedInstructions = () => {
    switch (source) {
      case 'Levels':
        return instructions || t('instructions.levels.detailed', 
          'Los Niveles Guiados te enseñan mecanografía paso a paso. Cada nivel introduce nuevas teclas mientras refuerzas las anteriores. ' +
          'Debes alcanzar el objetivo de WPM (palabras por minuto) y mantener una precisión superior al 95% para avanzar. ' +
          'Las teclas del nivel actual se resaltan en naranja en el teclado. Observa las manos animadas para aprender la posición correcta de cada dedo. ' +
          'No mires el teclado físico - confía en la memoria muscular y las guías visuales.'
        );
      case 'PlayGame':
        return instructions || t('instructions.playgame.detailed',
          'El Juego de Letras Cayendo es una forma divertida de practicar mecanografía bajo presión. ' +
          'Las letras caen desde la parte superior de la pantalla y debes presionar la tecla correcta antes de que lleguen al fondo. ' +
          'Cada nivel aumenta la velocidad y el número de letras simultáneas. Tienes un límite de errores - si lo superas, debes reintentar el nivel. ' +
          'Este modo mejora tu velocidad de reacción y te ayuda a desarrollar automatismos en la escritura.'
        );
      case 'CreateText':
        return instructions || t('instructions.createtext.detailed',
          'El modo Textos Personalizados te permite practicar con contenido real de tu día a día. ' +
          'Puedes crear textos personalizados copiando fragmentos de documentos, emails, código o cualquier contenido que escribas frecuentemente. ' +
          'Establece tus propios objetivos de WPM y límites de errores para cada texto. ' +
          'Los textos más largos (100+ caracteres) proporcionan métricas más precisas. ' +
          'Esta es la mejor forma de mejorar tu velocidad en contextos reales de trabajo.'
        );
      default:
        return instructions || t("instructions.default");
    }
  };

  const tips = getComponentTips();
  const shortcuts = getKeyboardShortcuts();
  const detailedInstructions = getDetailedInstructions();

  return (
    <div className={`p-6 rounded-2xl w-full ${isDarkMode 
                ? 'bg-gray-700 text-white' 
                : 'bg-white text-black'}`}>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FaLightbulb className="text-yellow-500" />
        {t("instructions.title")}
      </h2>
      <p className="mb-4 leading-relaxed text-base">
        {detailedInstructions}
      </p>
      
      {tips.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-3 text-lg">{t('instructions.tips.title', 'Consejos')}:</h3>
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className={`mt-1 text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {tip.icon}
                </span>
                <span className="flex-1">{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shortcuts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-300">
          <h3 className="font-semibold mb-3">{t('instructions.shortcuts.title', 'Atajos de teclado')}:</h3>
          <div className="grid grid-cols-2 gap-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center gap-2">
                <kbd className={`px-2 py-1 rounded text-sm font-mono ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  {shortcut.key}
                </kbd>
                <span className="text-sm">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstruccionesButton;
