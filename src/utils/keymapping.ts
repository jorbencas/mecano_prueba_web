// utils/keyMappings.ts

export const specialKeyMap: Record<string, string[]> = {
  // Guiones y rayas
  "_": ["Shift", "-"],
  "—": ["Alt", "—"], 

  // Signos de puntuación
  "!": ["Shift", "1"],
  "\"": ["Shift", "2"],
  "·": ["Shift", "3"],
  "$": ["Shift", "4"],
  "%": ["Shift", "5"],
  "&": ["Shift", "6"],
  "/": ["Shift", "7"],
  "(": ["Shift", "8"],
  ")": ["Shift", "9"],
  "=": ["Shift", "0"],

  // Signos invertidos (español)
  "¿": ["Shift", "+"], 
  "¡": ["Shift", "¡"], // En algunos teclados es directo, en otros shift

  // Puntuación y otros
  "?": ["Shift", "'"],
  ";": ["Shift", ","],
  ":": ["Shift", "."],
  "^": ["Shift", "`"],
  "*": ["Shift", "+"],
  
  // AltGr combinaciones típicas
  '@': ['AltGr', '2'],
  '#': ['AltGr', '3'],
  '€': ['AltGr', 'E'],
  '{': ['AltGr', "'"], // Corregido para ES ISO
  '[': ['AltGr', '`'], // Corregido para ES ISO
  ']': ['AltGr', '+'], // Corregido para ES ISO
  '}': ['AltGr', 'ç'], // Corregido para ES ISO
  '\\': ['AltGr', 'º'],
  '|': ['AltGr', '1'],
  '~': ['AltGr', '4'],
  '¬': ['AltGr', '6'],

  // Espacio especial (sin combinaciones)
  ' ': [' '],
  
  // Nota: Las vocales acentuadas (á, é, í, ó, ú) y comillas tipográficas (" ")
  // se tratan como caracteres directos para simplificar la mecanografía
};

export const getCombinationForKey = (key: string): string[] => {
  if (!key) return [];
  const k = String(key);
  
  // 1. Check special map
  if (specialKeyMap[k]) return specialKeyMap[k];
  
  // 2. Check if uppercase (needs Shift)
  if (k.length === 1 && k.match(/[A-ZÑÁÉÍÓÚ]/) && k !== ' ') {
    return ['Shift', k.toLowerCase()];
  }
  
  // 3. Check if explicit combo (e.g. "Ctrl+c")
  if (k.includes('+')) {
    return k.split('+').map(p => p.trim());
  }

  // 4. Default
  return [k];
};
