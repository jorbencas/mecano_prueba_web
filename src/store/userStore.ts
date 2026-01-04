import { create } from 'zustand';
import { ActivityLog, getActivityStats, getRecentActivities } from '@/utils/activityTracker';
import { getXPProgress, getUserLevel } from '@/utils/userLevelSystem';
import { getTodayCompletedChallenges, getTotalCompletedChallenges } from '@/utils/challengeTracker';
import { tutoringAPI } from '@/api/tutoring';

interface UserProfileState {
  activeTab: 'profile' | 'stats' | 'settings';
  stats: ReturnType<typeof getActivityStats> | null;
  recentActivities: ActivityLog[];
  levelData: ReturnType<typeof getXPProgress> | null;
  challengesCompleted: { today: number; total: number };
  tutoringSessions: any[];
  isUpdating: boolean;
  
  // Actions
  setActiveTab: (tab: 'profile' | 'stats' | 'settings') => void;
  loadUserData: (user: any) => Promise<void>;
  setTutoringSessions: (sessions: any[]) => void;
  setIsUpdating: (isUpdating: boolean) => void;
}

export const useUserStore = create<UserProfileState>((set) => ({
  activeTab: 'profile',
  stats: null,
  recentActivities: [],
  levelData: null,
  challengesCompleted: { today: 0, total: 0 },
  tutoringSessions: [],
  isUpdating: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  
  loadUserData: async (user) => {
    if (!user) return;
    
    const userId = user.email || user.id;
    const stats = getActivityStats(userId);
    const recentActivities = getRecentActivities(userId, 10);
    const userLevel = getUserLevel(userId);
    const levelData = getXPProgress(userLevel.totalXP);
    const challengesCompleted = {
      today: getTodayCompletedChallenges(userId),
      total: getTotalCompletedChallenges(userId),
    };

    set({
      stats,
      recentActivities,
      levelData,
      challengesCompleted,
    });

    try {
      const method = user.role === 'teacher' ? 'getTeacherSessions' : 'getStudentSessions';
      const sessions = await tutoringAPI[method](user.id);
      set({ tutoringSessions: sessions });
    } catch (error) {
      console.error('Failed to load tutoring sessions:', error);
    }
  },

  setTutoringSessions: (sessions) => set({ tutoringSessions: sessions }),
  setIsUpdating: (isUpdating) => set({ isUpdating }),
}));
