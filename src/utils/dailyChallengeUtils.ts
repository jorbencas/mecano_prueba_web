// Utilidades para el sistema de retos diarios
import { awardXP, XP_REWARDS } from './userLevelSystem';
import { completeChallenge, trackChallengeProgress } from './challengeTracker';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  motivationalMessage: string;
  goal: string;
  targetValue: number;
  currentProgress: number;
  theme: string;
  color: string;
  gradient: string;
  icon: string;
  date: string;
}

// Retos temáticos según la fecha
const themedChallenges: Record<string, Omit<DailyChallenge, 'id' | 'currentProgress' | 'date'>> = {
  // Navidad
  '12-25': {
    title: '🎄 Reto de Navidad',
    description: '¡Escribe como Santa entrega regalos: rápido y preciso!',
    motivationalMessage: '¡Ho ho ho! Hoy es un día especial. ¡Demuestra tu velocidad navideña! 🎅',
    goal: 'Escribe 800 palabras',
    targetValue: 800,
    theme: 'christmas',
    color: '#dc2626',
    gradient: 'from-red-500 via-green-500 to-red-600',
    icon: '🎄'
  },
  // Año Nuevo
  '01-01': {
    title: '🎆 Reto de Año Nuevo',
    description: '¡Comienza el año con energía y determinación!',
    motivationalMessage: '¡Feliz Año Nuevo! Este es tu momento para brillar. ✨',
    goal: 'Escribe 1000 palabras',
    targetValue: 1000,
    theme: 'newyear',
    color: '#eab308',
    gradient: 'from-yellow-400 via-orange-500 to-pink-500',
    icon: '🎆'
  },
  // Halloween
  '10-31': {
    title: '🎃 Reto de Halloween',
    description: '¡Escribe tan rápido que asustes al teclado!',
    motivationalMessage: '¡Boo! Hoy es noche de sustos... ¡y de escribir rápido! 👻',
    goal: 'Escribe 666 palabras',
    targetValue: 666,
    theme: 'halloween',
    color: '#f97316',
    gradient: 'from-orange-600 via-purple-600 to-black',
    icon: '🎃'
  },
  // San Valentín
  '02-14': {
    title: '💖 Reto de San Valentín',
    description: '¡Escribe con amor y pasión!',
    motivationalMessage: 'El amor está en el aire... ¡y en tus dedos! 💕',
    goal: 'Escribe 500 palabras',
    targetValue: 500,
    theme: 'valentine',
    color: '#ec4899',
    gradient: 'from-pink-500 via-red-500 to-pink-600',
    icon: '💖'
  }
};

// Retos genéricos para días sin tema especial
const genericChallenges: Omit<DailyChallenge, 'id' | 'currentProgress' | 'date'>[] = [
  {
    title: '⚡ Reto Velocidad',
    description: '¡Supera tu récord de velocidad!',
    motivationalMessage: '¡Hoy es tu día! Demuestra de qué estás hecho. 💪',
    goal: 'Alcanza 60 PPM',
    targetValue: 60,
    theme: 'speed',
    color: '#3b82f6',
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    icon: '⚡'
  },
  {
    title: '🎯 Reto Precisión',
    description: '¡Escribe sin errores!',
    motivationalMessage: 'La perfección está a tu alcance. ¡Concéntrate! 🧘',
    goal: 'Alcanza 98% precisión',
    targetValue: 98,
    theme: 'accuracy',
    color: '#10b981',
    gradient: 'from-green-500 via-emerald-500 to-green-600',
    icon: '🎯'
  },
  {
    title: '🔥 Reto Resistencia',
    description: '¡Practica sin parar!',
    motivationalMessage: '¡Eres imparable! Sigue así y llegarás lejos. 🚀',
    goal: 'Practica 30 minutos',
    targetValue: 30,
    theme: 'endurance',
    color: '#f59e0b',
    gradient: 'from-orange-500 via-red-500 to-orange-600',
    icon: '🔥'
  },
  {
    title: '🌟 Reto Estrella',
    description: '¡Sé una estrella del teclado!',
    motivationalMessage: 'Brilla con luz propia. ¡Tú puedes! ✨',
    goal: 'Completa 5 niveles',
    targetValue: 5,
    theme: 'star',
    color: '#8b5cf6',
    gradient: 'from-purple-500 via-pink-500 to-purple-600',
    icon: '🌟'
  },
  {
    title: '💎 Reto Diamante',
    description: '¡Pulir tus habilidades!',
    motivationalMessage: 'Como un diamante, cada práctica te hace más brillante. 💎',
    goal: 'Escribe 600 palabras',
    targetValue: 600,
    theme: 'diamond',
    color: '#06b6d4',
    gradient: 'from-cyan-500 via-blue-500 to-cyan-600',
    icon: '💎'
  }
];

// Obtener retos del día (puede incluir temático y genérico)
export const getTodayChallenges = (): DailyChallenge[] => {
  const today = new Date();
  const dateKey = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dateString = today.toISOString().split('T')[0];
  
  const challenges: DailyChallenge[] = [];

  // 1. Verificar si hay un reto temático para hoy
  if (themedChallenges[dateKey]) {
    const themed = themedChallenges[dateKey];
    challenges.push({
      ...themed,
      id: `challenge-themed-${dateString}`,
      currentProgress: 0,
      date: dateString
    });
  }
  
  // 2. Siempre agregar un reto genérico basado en el día del año
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const genericIndex = dayOfYear % genericChallenges.length;
  const generic = genericChallenges[genericIndex];
  
  challenges.push({
    ...generic,
    id: `challenge-generic-${dateString}`,
    currentProgress: 0,
    date: dateString
  });
  
  return challenges;
};

// Verificar si ya se mostró el reto hoy
export const hasSeenChallengeToday = (): boolean => {
  const lastSeen = localStorage.getItem('lastChallengeSeenDate');
  const today = new Date().toISOString().split('T')[0];
  return lastSeen === today;
};

// Marcar reto como visto
export const markChallengeAsSeen = (): void => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('lastChallengeSeenDate', today);
};

// Obtener progreso del reto actual
export const getChallengeProgress = (challengeId: string): number => {
  const progress = localStorage.getItem(`challenge-progress-${challengeId}`);
  return progress ? parseInt(progress, 10) : 0;
};

// Actualizar progreso del reto
export const updateChallengeProgress = (challengeId: string, progress: number): void => {
  localStorage.setItem(`challenge-progress-${challengeId}`, progress.toString());
};

// Verificar si el reto fue aceptado
export const hasChallengeBeenAccepted = (challengeId: string): boolean => {
  return localStorage.getItem(`challenge-accepted-${challengeId}`) === 'true';
};

// Marcar reto como aceptado
export const acceptChallenge = (challengeId: string): void => {
  localStorage.setItem(`challenge-accepted-${challengeId}`, 'true');
};

// Completar reto diario y otorgar XP
export const completeDailyChallenge = (
  userId: string,
  challengeId: string
): { xpAwarded: number; newLevel: number; leveledUp: boolean } => {
  // Otorgar XP
  const result = awardXP(userId, XP_REWARDS.DAILY_CHALLENGE, 'Completar reto diario', challengeId);
  
  // Marcar como completado en el tracker
  completeChallenge(userId, challengeId, XP_REWARDS.DAILY_CHALLENGE);
  
  return {
    xpAwarded: XP_REWARDS.DAILY_CHALLENGE,
    newLevel: result.newLevel,
    leveledUp: result.leveledUp,
  };
};

// Actualizar progreso del reto y verificar si se completó
export const updateAndCheckChallenge = (
  userId: string,
  challengeId: string,
  progress: number,
  targetValue: number
): { completed: boolean; xpAwarded?: number; newLevel?: number; leveledUp?: boolean } => {
  // Actualizar progreso en localStorage
  updateChallengeProgress(challengeId, progress);
  
  // Actualizar en el tracker
  trackChallengeProgress(userId, challengeId, progress, targetValue);
  
  // Verificar si se completó
  if (progress >= targetValue) {
    const result = completeDailyChallenge(userId, challengeId);
    return {
      completed: true,
      ...result,
    };
  }
  
  return { completed: false };
};
