import {
  startActivity,
  endActivity,
  saveActivityLog,
  getActivityLogs,
  getActivityStats,
  getRecentActivities,
  clearActivityLogs,
  ActivityLog,
} from '../../utils/activityTracker';

describe('Activity Tracker Utilities', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('startActivity', () => {
    test('returns a unique activity ID', () => {
      const id1 = startActivity(testUserId, 'freePractice', 'FreePractice');
      const id2 = startActivity(testUserId, 'level', 'Levels');
      
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    test('creates activity with correct properties', () => {
      const id = startActivity(testUserId, 'freePractice', 'FreePractice');
      expect(id).toMatch(/^\d+_[a-z0-9]+$/);
    });
  });

  describe('endActivity', () => {
    test('saves activity log with duration', () => {
      const id = startActivity(testUserId, 'freePractice', 'FreePractice');
      
      // Wait a bit
      setTimeout(() => {
        endActivity(id, { wpm: 50, accuracy: 95 });
        
        const logs = getActivityLogs(testUserId);
        expect(logs).toHaveLength(1);
        expect(logs[0].userId).toBe(testUserId);
        expect(logs[0].activityType).toBe('freePractice');
        expect(logs[0].component).toBe('FreePractice');
        expect(logs[0].duration).toBeGreaterThan(0);
        expect(logs[0].metadata?.wpm).toBe(50);
        expect(logs[0].metadata?.accuracy).toBe(95);
      }, 100);
    });

    test('handles non-existent activity gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      endActivity('non-existent-id');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('saveActivityLog', () => {
    test('saves log to localStorage', () => {
      const log: ActivityLog = {
        id: 'test-1',
        userId: testUserId,
        timestamp: new Date(),
        activityType: 'freePractice',
        component: 'FreePractice',
        duration: 120,
        metadata: { wpm: 50, accuracy: 95 },
      };

      saveActivityLog(log);

      const saved = localStorage.getItem(`activityLogs_${testUserId}`);
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('test-1');
    });

    test('limits logs to 1000 entries', () => {
      // Create 1100 logs
      for (let i = 0; i < 1100; i++) {
        const log: ActivityLog = {
          id: `test-${i}`,
          userId: testUserId,
          timestamp: new Date(),
          activityType: 'freePractice',
          component: 'FreePractice',
          duration: 10,
        };
        saveActivityLog(log);
      }

      const logs = getActivityLogs(testUserId);
      expect(logs.length).toBe(1000);
    });
  });

  describe('getActivityLogs', () => {
    test('returns empty array when no logs exist', () => {
      const logs = getActivityLogs(testUserId);
      expect(logs).toEqual([]);
    });

    test('returns all logs for user', () => {
      const log1: ActivityLog = {
        id: 'test-1',
        userId: testUserId,
        timestamp: new Date(),
        activityType: 'freePractice',
        component: 'FreePractice',
        duration: 120,
      };
      const log2: ActivityLog = {
        id: 'test-2',
        userId: testUserId,
        timestamp: new Date(),
        activityType: 'level',
        component: 'Levels',
        duration: 180,
      };

      saveActivityLog(log1);
      saveActivityLog(log2);

      const logs = getActivityLogs(testUserId);
      expect(logs).toHaveLength(2);
    });

    test('filters by date range', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const today = new Date();
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const log1: ActivityLog = {
        id: 'test-1',
        userId: testUserId,
        timestamp: yesterday,
        activityType: 'freePractice',
        component: 'FreePractice',
        duration: 120,
      };
      const log2: ActivityLog = {
        id: 'test-2',
        userId: testUserId,
        timestamp: today,
        activityType: 'level',
        component: 'Levels',
        duration: 180,
      };

      saveActivityLog(log1);
      saveActivityLog(log2);

      const logs = getActivityLogs(testUserId, {
        start: today,
        end: tomorrow,
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBe('test-2');
    });
  });

  describe('getActivityStats', () => {
    test('returns zero stats when no logs exist', () => {
      const stats = getActivityStats(testUserId);
      
      expect(stats.totalTime).toBe(0);
      expect(stats.totalActivities).toBe(0);
      expect(stats.averageWPM).toBe(0);
      expect(stats.averageAccuracy).toBe(0);
    });

    test('calculates correct statistics', () => {
      const log1: ActivityLog = {
        id: 'test-1',
        userId: testUserId,
        timestamp: new Date(),
        activityType: 'freePractice',
        component: 'FreePractice',
        duration: 120,
        metadata: { wpm: 50, accuracy: 95, completed: true },
      };
      const log2: ActivityLog = {
        id: 'test-2',
        userId: testUserId,
        timestamp: new Date(),
        activityType: 'level',
        component: 'Levels',
        duration: 180,
        metadata: { wpm: 60, accuracy: 90, completed: true },
      };

      saveActivityLog(log1);
      saveActivityLog(log2);

      const stats = getActivityStats(testUserId);

      expect(stats.totalTime).toBe(300);
      expect(stats.totalActivities).toBe(2);
      expect(stats.averageWPM).toBe(55); // (50 + 60) / 2
      expect(stats.averageAccuracy).toBe(93); // rounded (95 + 90) / 2
      expect(stats.totalCompleted).toBe(2);
    });

    test('groups by component correctly', () => {
      const log1: ActivityLog = {
        id: 'test-1',
        userId: testUserId,
        timestamp: new Date(),
        activityType: 'freePractice',
        component: 'FreePractice',
        duration: 120,
      };
      const log2: ActivityLog = {
        id: 'test-2',
        userId: testUserId,
        timestamp: new Date(),
        activityType: 'freePractice',
        component: 'FreePractice',
        duration: 180,
      };

      saveActivityLog(log1);
      saveActivityLog(log2);

      const stats = getActivityStats(testUserId);

      expect(stats.byComponent['FreePractice']).toEqual({
        count: 2,
        time: 300,
      });
    });
  });

  describe('getRecentActivities', () => {
    test('returns most recent activities', () => {
      for (let i = 0; i < 30; i++) {
        const log: ActivityLog = {
          id: `test-${i}`,
          userId: testUserId,
          timestamp: new Date(Date.now() + i * 1000),
          activityType: 'freePractice',
          component: 'FreePractice',
          duration: 60,
        };
        saveActivityLog(log);
      }

      const recent = getRecentActivities(testUserId, 10);
      expect(recent).toHaveLength(10);
      // Should be in reverse order (most recent first)
      expect(recent[0].id).toBe('test-29');
    });
  });

  describe('clearActivityLogs', () => {
    test('clears all logs for user', () => {
      const log: ActivityLog = {
        id: 'test-1',
        userId: testUserId,
        timestamp: new Date(),
        activityType: 'freePractice',
        component: 'FreePractice',
        duration: 120,
      };

      saveActivityLog(log);
      expect(getActivityLogs(testUserId)).toHaveLength(1);

      clearActivityLogs(testUserId);
      expect(getActivityLogs(testUserId)).toHaveLength(0);
    });
  });
});
