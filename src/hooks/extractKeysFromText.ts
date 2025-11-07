// utils/extractKeysFromText.ts
const extractKeysFromText = (text: string): string[] => {
  if (!text) return [];

  const basicChars = text
    .split("")
    .filter((ch) => ch.trim() !== "") // elimina espacios vacíos
    .map((ch) => ch.toLowerCase());

  const uniqueKeys = Array.from(new Set(basicChars));

  return uniqueKeys;
};

export default extractKeysFromText;
