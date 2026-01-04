import React, { useMemo } from 'react';
import { useTheme } from '@hooks/useTheme';
import { getCombinationForKey } from '@/utils/keymapping';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { FULL_KEYBOARD_LAYOUT, SIMPLE_KEYBOARD_LAYOUT } from '@/constants/keyboardLayout';

interface KeyboardProps {
  activeKey: string;
  levelKeys: string[];
  isFullKeyboard?: boolean;
}

const Keyboard: React.FC<KeyboardProps> = React.memo(({ activeKey = '', levelKeys = [], isFullKeyboard = false }) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  const rows = isFullKeyboard ? FULL_KEYBOARD_LAYOUT : SIMPLE_KEYBOARD_LAYOUT;

  const activeKeys = useMemo(() => {
    return getCombinationForKey(activeKey).map(k => k.toLowerCase());
  }, [activeKey]);

  const normalizedLevelKeys = useMemo(() => {
    return levelKeys.flatMap(k => getCombinationForKey(k)).map(s => s.toLowerCase());
  }, [levelKeys]);

  return (
    <div className="keyboard mt-6 flex flex-col items-center space-y-2">
      {rows.map((row, ri) => (
        <div key={ri} className="flex justify-center space-x-2 sm:space-x-4">
          {row.map(key => {
            const keyLower = String(key).toLowerCase();
            const isActive = activeKeys.includes(keyLower);
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
              <div 
                key={key} 
                className={`${baseClasses} ${colorClasses}`}
                aria-label={key === ' ' ? 'Space' : key}
              >
                {key === ' '
                  ? t('keyboard.space')
                  : t(`keyboard.keys.${key}`, String(key))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});

export default Keyboard;
