// Sistema de tracking para retos diarios
export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  date: string;
  progress: number;
  targetValue: number;
  completed: boolean;
  xpAwarded: number;
  completedAt?: string;
}

export interface ChallengeHistory {
  userId: string;
  challenges: ChallengeProgress[];
}

// Obtiene el historial de retos de un usuario
export const getChallengeHistory = (userId: string): ChallengeHistory => {
  const key = `challenge_history_${userId}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    userId,
    challenges: [],
  };
};

// Guarda el historial de retos
const saveChallengeHistory = (history: ChallengeHistory): void => {
  const key = `challenge_history_${history.userId}`;
  localStorage.setItem(key, JSON.stringify(history));
};

// Actualiza el progreso de un reto
export const trackChallengeProgress = (
  userId: string,
  challengeId: string,
  progress: number,
  targetValue: number
): void => {
  const history = getChallengeHistory(userId);
  
  // Buscar si ya existe este reto
  const existingIndex = history.challenges.findIndex(c => c.challengeId === challengeId);
  
  if (existingIndex >= 0) {
    // Actualizar progreso existente
    history.challenges[existingIndex].progress = progress;
  } else {
    // Crear nueva entrada
    history.challenges.push({
      challengeId,
      userId,
      date: new Date().toISOString().split('T')[0],
      progress,
      targetValue,
      completed: false,
      xpAwarded: 0,
    });
  }
  
  saveChallengeHistory(history);
};

// Marca un reto como completado y otorga XP
export const completeChallenge = (
  userId: string,
  challengeId: string,
  xpAwarded: number
): void => {
  const history = getChallengeHistory(userId);
  
  const challenge = history.challenges.find(c => c.challengeId === challengeId);
  
  if (challenge && !challenge.completed) {
    challenge.completed = true;
    challenge.completedAt = new Date().toISOString();
    challenge.xpAwarded = xpAwarded;
    challenge.progress = challenge.targetValue; // 100% completado
    
    saveChallengeHistory(history);
  }
};

// Obtiene el progreso actual de un reto específico
export const getChallengeProgress = (userId: string, challengeId: string): ChallengeProgress | null => {
  const history = getChallengeHistory(userId);
  return history.challenges.find(c => c.challengeId === challengeId) || null;
};

// Obtiene retos completados hoy
export const getTodayCompletedChallenges = (userId: string): number => {
  const history = getChallengeHistory(userId);
  const today = new Date().toISOString().split('T')[0];
  
  return history.challenges.filter(
    c => c.completed && c.date === today
  ).length;
};

// Obtiene total de retos completados
export const getTotalCompletedChallenges = (userId: string): number => {
  const history = getChallengeHistory(userId);
  return history.challenges.filter(c => c.completed).length;
};

// Obtiene todos los usuarios con sus retos (para admin dashboard)
export const getAllUsersChallenges = (): Map<string, ChallengeHistory> => {
  const usersMap = new Map<string, ChallengeHistory>();
  
  // Iterar sobre todas las claves de localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('challenge_history_')) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const history: ChallengeHistory = JSON.parse(stored);
        usersMap.set(history.userId, history);
      }
    }
  }
  
  return usersMap;
};

// Obtiene estadísticas globales de retos
export const getGlobalChallengeStats = (): {
  totalChallengesCompleted: number;
  challengesCompletedToday: number;
  totalUsers: number;
  averageChallengesPerUser: number;
} => {
  const allChallenges = getAllUsersChallenges();
  const today = new Date().toISOString().split('T')[0];
  
  let totalCompleted = 0;
  let completedToday = 0;
  
  allChallenges.forEach(history => {
    history.challenges.forEach(challenge => {
      if (challenge.completed) {
        totalCompleted++;
        if (challenge.date === today) {
          completedToday++;
        }
      }
    });
  });
  
  return {
    totalChallengesCompleted: totalCompleted,
    challengesCompletedToday: completedToday,
    totalUsers: allChallenges.size,
    averageChallengesPerUser: allChallenges.size > 0 ? Math.round(totalCompleted / allChallenges.size) : 0,
  };
};
