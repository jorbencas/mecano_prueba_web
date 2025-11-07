import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { specialKeyMap } from '../utils/keymapping';

// Tu fingerMap actual (ajusta si lo necesitas).  
// La clave aquí es que los valores 'finger' deben poder normalizarse
// a uno de: 'pinky'|'ring'|'middle'|'index'|'thumb' (o sus equivalentes)
// Si tu fingerMap usa español, lo normalizamos abajo.
const fingerMap: { [key: string]: { hand: 'left'|'right'; finger: string } } = {
    // Fila superior (números y símbolos principales)
  '1': { hand: 'left', finger: 'pinky' },
  '!': { hand: 'left', finger: 'pinky' },
  '2': { hand: 'left', finger: 'ring' },
  '"': { hand: 'left', finger: 'ring' },
  '3': { hand: 'left', finger: 'middle' },
  '·': { hand: 'left', finger: 'middle' },
  '4': { hand: 'left', finger: 'index' },
  '$': { hand: 'left', finger: 'index' },
  '5': { hand: 'left', finger: 'index' },
  '%': { hand: 'left', finger: 'index' },
  '6': { hand: 'right', finger: 'index' },
  '&': { hand: 'right', finger: 'index' },
  '7': { hand: 'right', finger: 'index' },
  '/': { hand: 'right', finger: 'index' },
  '8': { hand: 'right', finger: 'middle' },
  '(': { hand: 'right', finger: 'middle' },
  '9': { hand: 'right', finger: 'ring' },
  ')': { hand: 'right', finger: 'ring' },
  '0': { hand: 'right', finger: 'pinky' },
  '=': { hand: 'right', finger: 'pinky' },
  '?': { hand: 'right', finger: 'pinky' },
  "'": { hand: 'right', finger: 'pinky' },
  '¡': { hand: 'right', finger: 'pinky' },
  '¿': { hand: 'right', finger: 'pinky' },
  '-': { hand: 'right', finger: 'pinky' },
  '_': { hand: 'right', finger: 'pinky' },
  '—': { hand: 'right', finger: 'pinky' },

  // Fila QWERTY
  'q': { hand: 'left', finger: 'pinky' },
  'w': { hand: 'left', finger: 'ring' },
  'e': { hand: 'left', finger: 'middle' },
  'r': { hand: 'left', finger: 'index' },
  't': { hand: 'left', finger: 'index' },
  'y': { hand: 'right', finger: 'index' },
  'u': { hand: 'right', finger: 'index' },
  'i': { hand: 'right', finger: 'middle' },
  'o': { hand: 'right', finger: 'ring' },
  'p': { hand: 'right', finger: 'pinky' },

  // Fila ASDF
  'a': { hand: 'left', finger: 'pinky' },
  's': { hand: 'left', finger: 'ring' },
  'd': { hand: 'left', finger: 'middle' },
  'f': { hand: 'left', finger: 'index' },
  'g': { hand: 'left', finger: 'index' },
  'h': { hand: 'right', finger: 'index' },
  'j': { hand: 'right', finger: 'index' },
  'k': { hand: 'right', finger: 'middle' },
  'l': { hand: 'right', finger: 'ring' },
  'ñ': { hand: 'right', finger: 'pinky' },

  // Fila ZXCV
  'z': { hand: 'left', finger: 'pinky' },
  'x': { hand: 'left', finger: 'ring' },
  'c': { hand: 'left', finger: 'middle' },
  'v': { hand: 'left', finger: 'index' },
  'b': { hand: 'left', finger: 'index' },
  'n': { hand: 'right', finger: 'index' },
  'm': { hand: 'right', finger: 'index' },
  ',': { hand: 'right', finger: 'middle' },
  ';': { hand: 'right', finger: 'middle' },
  '.': { hand: 'right', finger: 'ring' },
  ':': { hand: 'right', finger: 'ring' },
  '-_': { hand: 'right', finger: 'pinky' },

  // Espacio y modificadores
  ' ': { hand: 'right', finger: 'thumb' },
  'space': { hand: 'right', finger: 'thumb' },
  'shift': { hand: 'left', finger: 'pinky' },
  'ctrl': { hand: 'left', finger: 'pinky' },
  'alt': { hand: 'left', finger: 'thumb' },
  'altgr': { hand: 'right', finger: 'thumb' },
};

interface HandsProps { nextKey: string; }

const splitCombo = (k?: string) => String(k ?? '').split('+').map(s => s.trim()).filter(Boolean);

const normalize = (s?: string) => String(s ?? '').trim().toLowerCase();

// si tu fingerMap usa palabras en español, normalízalas a los ids que usa el SVG
const normalizeFingerName = (raw: string) => {
  const r = raw.toLowerCase();
  if (['meñique','meñq','pinky','p'].includes(r)) return 'pinky';
  if (['anular','ring'].includes(r)) return 'ring';
  if (['medio','middle'].includes(r)) return 'middle';
  if (['índice','indice','index'].includes(r)) return 'index';
  if (['pulgar','thumb'].includes(r)) return 'thumb';
  return r; // fallback
};

const Hands: React.FC<HandsProps> = ({ nextKey }) => {
  const { isDarkMode } = useTheme();

  // 1) calcular partes activas por nextKey: si existe mapping especial, usarlo
  const activeParts = (() => {
    if (!nextKey) return [];
    const mapped = specialKeyMap[nextKey];
    if (mapped) return mapped;
    if (nextKey.includes('+')) return splitCombo(nextKey);
    return [nextKey];
  })().map(normalize);

  // 2) para cada parte, buscar fingerMap[parte], y llenar sets por mano
  const leftActive = new Set<string>();
  const rightActive = new Set<string>();

  activeParts.forEach(part => {
    const fm = fingerMap[part];
    if (fm) {
      const fingerNorm = normalizeFingerName(fm.finger);
      if (fm.hand === 'left') leftActive.add(fingerNorm);
      else rightActive.add(fingerNorm);
    } else {
      // si no existe en fingerMap, intentar 'space' o literal
      const alt = fingerMap[part] || fingerMap[normalize(part)];
      if (alt) {
        const fn = normalizeFingerName(alt.finger);
        if (alt.hand === 'left') leftActive.add(fn); else rightActive.add(fn);
      }
    }
  });

  // helper para chequear si un dedo concreto debe estar activo en left/right
  const leftHas = (fingerId: string) => leftActive.has(fingerId);
  const rightHas = (fingerId: string) => rightActive.has(fingerId);

  const HandSVG = ({ isLeft }: { isLeft: boolean }) => (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <g transform={isLeft ? '' : 'scale(-1,1) translate(-200,0)'}>
        {/* Palma */}
        <rect x="40" y="80" width="120" height="100" rx="10" ry="10"
          fill={isDarkMode ? '#6B46C1' : '#FFE5B4'} stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />

        {/* Meñique */}
        <circle cx="60" cy="70" r="15"
          fill={(isLeft ? leftHas('pinky') : rightHas('pinky')) ? '#FFD700' : (isDarkMode ? '#F6AD55' : '#FFB3BA')}
          stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />

        {/* Anular */}
        <circle cx="90" cy="50" r="15"
          fill={(isLeft ? leftHas('ring') : rightHas('ring')) ? '#FFD700' : (isDarkMode ? '#F6AD55' : '#BAFFC9')}
          stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />

        {/* Medio */}
        <circle cx="120" cy="40" r="15"
          fill={(isLeft ? leftHas('middle') : rightHas('middle')) ? '#FFD700' : (isDarkMode ? '#F6AD55' : '#BAE1FF')}
          stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />

        {/* Índice */}
        <circle cx="150" cy="50" r="15"
          fill={(isLeft ? leftHas('index') : rightHas('index')) ? '#FFD700' : (isDarkMode ? '#F6AD55' : '#FFFFBA')}
          stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />

        {/* Pulgar */}
        <ellipse cx="170" cy="100" rx="10" ry="20"
          fill={(isLeft ? leftHas('thumb') : rightHas('thumb')) ? '#FFD700' : (isDarkMode ? '#F6AD55' : '#FFD9BA')}
          stroke={isDarkMode ? '#E2E8F0' : '#000'} strokeWidth="2" />
      </g>
    </svg>
  );

  return (
    <div className={`flex flex-col items-center my-8 ${isDarkMode ? ' text-white' : ' text-black'}`}>
      <div className="mb-4 text-center">
        <span className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-500'} text-lg`}>
          {/* Puedes mostrar info extra si quieres */}
          {activeParts.length === 0 ? '' : `Tecla(s): ${activeParts.join(', ')}`}
        </span>
      </div>

      <div className="flex justify-center space-x-8">
        <div className={`border p-4 rounded-lg ${leftActive.size > 0 ? (isDarkMode ? 'bg-blue-900' : 'bg-cyan-100') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}`}>
          <HandSVG isLeft={true} />
          <span className={` top-2 left-2 text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('hands.hands.left')}</span>
        </div>
        <div className={`border p-4 rounded-lg ${rightActive.size > 0 ? (isDarkMode ? 'bg-blue-900' : 'bg-cyan-100') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}`}>
          <HandSVG isLeft={false} />
          <span className={` top-2 right-2 text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('hands.hands.right')}</span>
        </div>
      </div>
    </div>
  );
};

export default Hands;
