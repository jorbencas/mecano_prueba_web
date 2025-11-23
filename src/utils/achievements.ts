export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'consistency' | 'completion';
  requirement: number;
  unlocked: boolean;
  unlockedDate?: string;
}

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedDate'>[] = [
  // Speed
  { id: 'speed_50', name: 'Velocista Novato', description: 'Alcanza 50 WPM', icon: '🚀', category: 'speed', requirement: 50 },
  { id: 'speed_75', name: 'Mecanógrafo Rápido', description: 'Alcanza 75 WPM', icon: '⚡', category: 'speed', requirement: 75 },
  { id: 'speed_100', name: 'Experto en Velocidad', description: 'Alcanza 100 WPM', icon: '🏎️', category: 'speed', requirement: 100 },
  { id: 'speed_125', name: 'Maestro de la Velocidad', description: 'Alcanza 125 WPM', icon: '🚄', category: 'speed', requirement: 125 },
  
  // Accuracy
  { id: 'acc_95', name: 'Precisión Buena', description: 'Mantén 95% de precisión', icon: '🎯', category: 'accuracy', requirement: 95 },
  { id: 'acc_98', name: 'Precisión Excelente', description: 'Mantén 98% de precisión', icon: '🎪', category: 'accuracy', requirement: 98 },
  { id: 'acc_100', name: 'Perfección Absoluta', description: 'Completa un nivel sin errores', icon: '💎', category: 'accuracy', requirement: 100 },
  
  // Consistency
  { id: 'streak_7', name: 'Semana Completa', description: 'Practica 7 días seguidos', icon: '📅', category: 'consistency', requirement: 7 },
  { id: 'streak_30', name: 'Mes Dedicado', description: 'Practica 30 días seguidos', icon: '📆', category: 'consistency', requirement: 30 },
  
  // Completion
  { id: 'levels_all', name: 'Completista', description: 'Completa todos los niveles', icon: '🏆', category: 'completion', requirement: 100 },
];

export const checkAchievements = (stats: any[]): Achievement[] => {
  const achievements: Achievement[] = ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: false,
  }));

  const savedAchievements = localStorage.getItem('achievements');
  if (savedAchievements) {
    const saved = JSON.parse(savedAchievements);
    saved.forEach((sa: Achievement) => {
      const index = achievements.findIndex(a => a.id === sa.id);
      if (index !== -1) {
        achievements[index] = sa;
      }
    });
  }

  // Check speed achievements
  const maxWPM = stats.length > 0 ? Math.max(...stats.map(s => s.wpm)) : 0;
  achievements.forEach(a => {
    if (a.category === 'speed' && !a.unlocked && maxWPM >= a.requirement) {
      a.unlocked = true;
      a.unlockedDate = new Date().toISOString();
    }
  });

  // Check accuracy achievements
  const perfectRuns = stats.filter(s => s.accuracy === 100).length;
  if (perfectRuns > 0) {
    const acc100 = achievements.find(a => a.id === 'acc_100');
    if (acc100 && !acc100.unlocked) {
      acc100.unlocked = true;
      acc100.unlockedDate = new Date().toISOString();
    }
  }

  localStorage.setItem('achievements', JSON.stringify(achievements));
  return achievements;
};
