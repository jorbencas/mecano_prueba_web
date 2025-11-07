import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { specialKeyMap } from '../utils/keymapping';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface KeyboardProps {
  activeKey: string;
  levelKeys: string[];
  isFullKeyboard?: boolean;
}

const splitCombo = (k?: string) =>
  String(k ?? '').split('+').map(p => p.trim());

const Keyboard: React.FC<KeyboardProps> = ({ activeKey = '', levelKeys = [], isFullKeyboard = false }) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

 // Distribución del teclado español ISO extendido
  const fullKeyboard = [
    // Fila superior (números y símbolos)
    [
      'º', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
      "'", '¡', '¿', '-', '_', '=', '—'
    ],
    // Fila QWERTY
    [
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      '[', ']', '{', '}', '\\'
    ],
    // Fila ASDF
    [
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ',
      ';', ':', '"'
    ],
    // Fila ZXCV
    [
      'z', 'x', 'c', 'v', 'b', 'n', 'm',
      ',', '.', '/', '?', '!'
    ],
    // Fila modificadores / espacio
    ['Shift', 'Ctrl', 'Alt', ' ', 'AltGr', 'Ctrl'],
  ];

  // Distribución reducida (modo simple)
  const rows = isFullKeyboard
    ? fullKeyboard
    : [
        ['1','2','3','4','5','6','7','8','9','0'],
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l','ñ'],
        ['z','x','c','v','b','n','m'],
        [' '],
      ];

  // Si activeKey es un símbolo especial, mapear a sus teclas; si no, si contiene '+', split,
  // sino array con la propia tecla.
  const activeKeys: string[] = (() => {
    const ak = String(activeKey ?? '');
    if (!ak) return [];
    // si existe en special map (por ejemplo "_")
    const mapped = specialKeyMap[ak];
    if (mapped) return mapped;
    // si es combo "Shift+z" -> ["Shift","z"]
    if (ak.includes('+')) return splitCombo(ak);
    // caso normal: tecla única
    return [ak];
  })();

  // Normalizar level keys: si hay combos en levelKeys, descomponerlos
  const normalizedLevelKeys = levelKeys.flatMap(k => {
    const s = String(k ?? '');
    if (s.includes('+')) return splitCombo(s);
    return [s];
  }).map(s => s.toLowerCase());

  return (
    <div className="keyboard mt-6 flex flex-col items-center space-y-2">
      {rows.map((row, ri) => (
        <div key={ri} className="flex justify-center space-x-2 sm:space-x-4">
          {row.map(key => {
            const keyLower = String(key).toLowerCase();
            // isActive => true si activeKeys contiene esta tecla (case-insensitive)
            const isActive = activeKeys.some(ak => ak.toLowerCase() === keyLower);
            // isInLevel => true si normalizedLevelKeys incluye la tecla
            const isInLevel = normalizedLevelKeys.includes(keyLower);

            const baseClasses = `
              key h-12 flex items-center justify-center border rounded-md 
              transition duration-300 ease-in-out hover:scale-105
              ${key === ' ' ? 'w-48' : String(key).length > 1 ? 'w-20' : 'w-12'}
            `;

            const colorClasses = isActive
              ? 'bg-orange-500 text-white'
              : isInLevel
              ? 'bg-orange-200 text-black'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-300 text-black';

            return (
              <div key={key} className={`${baseClasses} ${colorClasses}`}>
                {key === ' '
                  ? t('keyboard.space', 'Espacio')
                  : t(`keyboard.keys.${key}`, String(key))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
