// utils/keyMappings.ts

export const specialKeyMap: Record<string, string[]> = {
  // Guiones y rayas
  "_": ["Shift", "-"],
  "—": ["Alt", "0151"], // o puedes simplificarlo a ["Shift", "-"]

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
  "¿": ["Alt", "Control"], // depende del teclado, ejemplo simplificado
  "¡": ["Alt", "Control"],

  // Puntuación y otros
  "?": ["Shift", "'"],
  ";": ["Shift", ","],
  ":": ["Shift", "."],
  "@": ["AltGr", "2"],
  "#": ["AltGr", "3"],
  "€": ["AltGr", "E"],


  

  // AltGr combinaciones típicas
  '{': ['AltGr', '7'],
  '[': ['AltGr', '8'],
  ']': ['AltGr', '9'],
  '}': ['AltGr', '0'],
  '\\': ['AltGr', 'º'],
  '|': ['AltGr', '1'],
  '~': ['AltGr', '4'],
  '¬': ['AltGr', '6'],

  // Espacio especial (sin combinaciones)
  ' ': [' '],
};
