import React, { useMemo } from 'react';
import { useTheme } from '@hooks/useTheme';
import { getCombinationForKey } from '@/utils/keymapping';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { FINGER_MAP } from '@/constants/fingerMap';

interface HandsProps { nextKey: string; }

const normalize = (s?: string) => String(s ?? '').trim().toLowerCase();

const HandSVG = React.memo(({ isLeft, activeFingers, isDarkMode }: { isLeft: boolean; activeFingers: Set<string>; isDarkMode: boolean }) => {
  const has = (finger: string) => activeFingers.has(finger);
  
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
      <g transform={isLeft ? '' : 'scale(-1,1) translate(-200,0)'}>
        {/* Palma */}
        <rect x="40" y="80" width="120" height="100" rx="10" ry="10"
          fill={isDarkMode ? '#6B46C1' : '#FFE5B4'} stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />

        {/* Meñique */}
        <circle cx="60" cy="70" r="15"
          fill={has('pinky') ? '#FFD700' : (isDarkMode ? '#F6AD55' : '#FFB3BA')}
          stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />

        {/* Anular */}
        <circle cx="90" cy="50" r="15"
          fill={has('ring') ? '#FFD700' : (isDarkMode ? '#F6AD55' : '#BAFFC9')}
          stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />

        {/* Medio */}
        <circle cx="120" cy="40" r="15"
          fill={has('middle') ? '#FFD700' : (isDarkMode ? '#F6AD55' : '#BAE1FF')}
          stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />

        {/* Índice */}
        <circle cx="150" cy="50" r="15"
          fill={has('index') ? '#FFD700' : (isDarkMode ? '#F6AD55' : '#FFFFBA')}
          stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />

        {/* Pulgar */}
        <ellipse cx="170" cy="100" rx="10" ry="20"
          fill={has('thumb') ? '#FFD700' : (isDarkMode ? '#F6AD55' : '#FFD9BA')}
          stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />
      </g>
    </svg>
  );
});

const Hands: React.FC<HandsProps> = React.memo(({ nextKey }) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  // 1) calcular partes activas por nextKey
  const activeParts = useMemo(() => {
    return getCombinationForKey(nextKey).map(normalize);
  }, [nextKey]);

  // 2) para cada parte, buscar fingerMap[parte], y llenar sets por mano
  const { leftActive, rightActive } = useMemo(() => {
    const left = new Set<string>();
    const right = new Set<string>();

    activeParts.forEach(part => {
      const fm = FINGER_MAP[part] || FINGER_MAP[normalize(part)];
      if (fm) {
        if (fm.hand === 'left') left.add(fm.finger);
        else right.add(fm.finger);
      }
    });
    return { leftActive: left, rightActive: right };
  }, [activeParts]);

  return (
    <div className={`flex flex-col items-center my-8 ${isDarkMode ? ' text-white' : ' text-black'}`}>
      <div className="mb-4 text-center" aria-live="polite">
        <span className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-500'} text-lg`}>
          {activeParts.length === 0 ? '' : `  ${t('hands.title')} : ${activeParts.join(', ')}`}
        </span>
      </div>

      <div className="flex justify-center space-x-8">
        <div className={`border p-4 rounded-lg ${leftActive.size > 0 ? (isDarkMode ? 'bg-blue-900' : 'bg-cyan-100') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}`}>
          <HandSVG isLeft={true} activeFingers={leftActive} isDarkMode={isDarkMode} />
          <span className={`block mt-2 text-center text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('hands.hands.left')}
          </span>
        </div>
        <div className={`border p-4 rounded-lg ${rightActive.size > 0 ? (isDarkMode ? 'bg-blue-900' : 'bg-cyan-100') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}`}>
          <HandSVG isLeft={false} activeFingers={rightActive} isDarkMode={isDarkMode} />
          <span className={`block mt-2 text-center text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('hands.hands.right')}
          </span>
        </div>
      </div>
    </div>
  );
});

export default Hands;
