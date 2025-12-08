// Sistema de niveles y experiencia (XP) para usuarios
export interface UserLevel {
  userId: string;
  level: number;
  totalXP: number;
  xpHistory: XPEntry[];
}

export interface XPEntry {
  date: string;
  amount: number;
  reason: string;
  source?: string; // challengeId, activityId, etc.
}

export interface LevelProgress {
  level: number;
  currentXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number; // 0-100
  xpToNextLevel: number;
}

// Fórmula de XP requerido por nivel: 100 * N * (N - 1) / 2
// Nivel 1: 0 XP
// Nivel 2: 100 XP
// Nivel 3: 250 XP
// Nivel 4: 450 XP
// Nivel 5: 700 XP
export const calculateXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(100 * level * (level - 1) / 2);
};

// Calcula el nivel basado en XP total
export const calculateLevelFromXP = (totalXP: number): number => {
  let level = 1;
  while (calculateXPForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
};

// Obtiene el progreso detallado del nivel actual
export const getXPProgress = (totalXP: number): LevelProgress => {
  const level = calculateLevelFromXP(totalXP);
  const currentLevelXP = calculateXPForLevel(level);
  const nextLevelXP = calculateXPForLevel(level + 1);
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progress = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));

  return {
    level,
    currentXP: totalXP,
    currentLevelXP,
    nextLevelXP,
    progress,
    xpToNextLevel: nextLevelXP - totalXP,
  };
};

// Obtiene los datos de nivel de un usuario desde localStorage
export const getUserLevel = (userId: string): UserLevel => {
  const key = `user_level_${userId}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Usuario nuevo, nivel 1
  return {
    userId,
    level: 1,
    totalXP: 0,
    xpHistory: [],
  };
};

// Guarda los datos de nivel de un usuario
const saveUserLevel = (userLevel: UserLevel): void => {
  const key = `user_level_${userLevel.userId}`;
  localStorage.setItem(key, JSON.stringify(userLevel));
};

// Otorga XP a un usuario y actualiza su nivel
export const awardXP = (
  userId: string,
  amount: number,
  reason: string,
  source?: string
): { newLevel: number; leveledUp: boolean; totalXP: number } => {
  const userLevel = getUserLevel(userId);
  const oldLevel = userLevel.level;
  
  // Añadir XP
  userLevel.totalXP += amount;
  
  // Añadir entrada al historial
  userLevel.xpHistory.push({
    date: new Date().toISOString(),
    amount,
    reason,
    source,
  });
  
  // Recalcular nivel
  userLevel.level = calculateLevelFromXP(userLevel.totalXP);
  const leveledUp = userLevel.level > oldLevel;
  
  // Guardar
  saveUserLevel(userLevel);
  
  return {
    newLevel: userLevel.level,
    leveledUp,
    totalXP: userLevel.totalXP,
  };
};

// Obtiene el historial de XP de un usuario (últimas N entradas)
export const getXPHistory = (userId: string, limit: number = 10): XPEntry[] => {
  const userLevel = getUserLevel(userId);
  return userLevel.xpHistory.slice(-limit).reverse();
};

// Obtiene todos los usuarios con sus niveles (para admin dashboard)
export const getAllUsersLevels = (): UserLevel[] => {
  const users: UserLevel[] = [];
  
  // Iterar sobre todas las claves de localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_level_')) {
      const stored = localStorage.getItem(key);
      if (stored) {
        users.push(JSON.parse(stored));
      }
    }
  }
  
  // Ordenar por nivel descendente
  return users.sort((a, b) => b.level - a.level || b.totalXP - a.totalXP);
};

// Constantes de XP por actividad
export const XP_REWARDS = {
  DAILY_CHALLENGE: 50,
  COMPLETE_LEVEL: 20,
  TEN_MINUTES_PRACTICE: 10,
  REACH_60_WPM: 30,
  REACH_95_ACCURACY: 25,
  COMPLETE_GAME: 15,
  FIRST_PRACTICE_OF_DAY: 5,
};

// Calcula XP basado en rendimiento de una actividad
export const calculateActivityXP = (metadata: {
  duration: number;
  wpm?: number;
  accuracy?: number;
  completed?: boolean;
}): number => {
  let xp = 0;
  
  // XP base por tiempo (10 XP por cada 10 minutos)
  const minutes = Math.floor(metadata.duration / 60);
  xp += Math.floor(minutes / 10) * XP_REWARDS.TEN_MINUTES_PRACTICE;
  
  // Bonus por WPM
  if (metadata.wpm && metadata.wpm >= 60) {
    xp += XP_REWARDS.REACH_60_WPM;
  }
  
  // Bonus por precisión
  if (metadata.accuracy && metadata.accuracy >= 95) {
    xp += XP_REWARDS.REACH_95_ACCURACY;
  }
  
  // Bonus por completar
  if (metadata.completed) {
    xp += XP_REWARDS.COMPLETE_LEVEL;
  }
  
  return xp;
};
