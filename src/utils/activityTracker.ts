// Activity Tracking System
// Tracks user activity, time spent, and performance metrics

export interface ActivityLog {
  id: string;
  userId: string;
  timestamp: Date;
  activityType: 'practice' | 'level' | 'game' | 'speedMode' | 'precisionMode' | 'createText' | 'freePractice';
  component: string;
  duration: number; // seconds
  metadata?: {
    level?: number;
    wpm?: number;
    accuracy?: number;
    errors?: number;
    completed?: boolean;
    selectedKeys?: string[];
  };
}

export interface UserSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  activities: ActivityLog[];
  totalDuration: number;
}

interface ActiveActivity {
  id: string;
  userId: string;
  startTime: Date;
  activityType: string;
  component: string;
}

// In-memory storage for active activities
const activeActivities = new Map<string, ActiveActivity>();

/**
 * Generate unique ID for activity
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Start tracking an activity
 * @param userId User identifier
 * @param activityType Type of activity
 * @param component Component name
 * @returns Activity ID
 */
export function startActivity(
  userId: string,
  activityType: ActivityLog['activityType'],
  component: string
): string {
  const id = generateId();
  const activity: ActiveActivity = {
    id,
    userId,
    startTime: new Date(),
    activityType,
    component,
  };

  activeActivities.set(id, activity);
  return id;
}

/**
 * End tracking an activity and save to localStorage
 * @param activityId Activity ID from startActivity
 * @param metadata Optional metadata (WPM, accuracy, etc.)
 */
export function endActivity(activityId: string, metadata?: ActivityLog['metadata']): void {
  const activity = activeActivities.get(activityId);
  if (!activity) {
    console.warn(`Activity ${activityId} not found`);
    return;
  }

  const endTime = new Date();
  const duration = Math.round((endTime.getTime() - activity.startTime.getTime()) / 1000);

  const log: ActivityLog = {
    id: activity.id,
    userId: activity.userId,
    timestamp: activity.startTime,
    activityType: activity.activityType as ActivityLog['activityType'],
    component: activity.component,
    duration,
    metadata,
  };

  saveActivityLog(log);
  activeActivities.delete(activityId);
}

/**
 * Save activity log to localStorage
 * @param log Activity log to save
 */
export function saveActivityLog(log: ActivityLog): void {
  try {
    const key = `activityLogs_${log.userId}`;
    const existing = localStorage.getItem(key);
    const logs: ActivityLog[] = existing ? JSON.parse(existing) : [];

    // Add new log
    logs.push({
      ...log,
      timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp,
    } as any);

    // Keep only last 1000 logs to avoid storage issues
    const trimmedLogs = logs.slice(-1000);

    localStorage.setItem(key, JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Error saving activity log:', error);
  }
}

/**
 * Get activity logs for a user
 * @param userId User identifier
 * @param dateRange Optional date range filter
 * @returns Array of activity logs
 */
export function getActivityLogs(
  userId: string,
  dateRange?: { start: Date; end: Date }
): ActivityLog[] {
  try {
    const key = `activityLogs_${userId}`;
    const data = localStorage.getItem(key);
    if (!data) return [];

    let logs: ActivityLog[] = JSON.parse(data);

    // Convert timestamp strings back to Date objects
    logs = logs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp),
    }));

    // Filter by date range if provided
    if (dateRange) {
      logs = logs.filter(
        log =>
          log.timestamp >= dateRange.start && log.timestamp <= dateRange.end
      );
    }

    return logs;
  } catch (error) {
    console.error('Error loading activity logs:', error);
    return [];
  }
}

/**
 * Get aggregated statistics for a user
 * @param userId User identifier
 * @returns Aggregated statistics
 */
export function getActivityStats(userId: string) {
  const logs = getActivityLogs(userId);

  if (logs.length === 0) {
    return {
      totalTime: 0,
      totalActivities: 0,
      byComponent: {},
      byActivityType: {},
      averageWPM: 0,
      averageAccuracy: 0,
      totalCompleted: 0,
    };
  }

  const totalTime = logs.reduce((sum, log) => sum + log.duration, 0);
  const totalActivities = logs.length;

  // Group by component
  const byComponent: Record<string, { count: number; time: number }> = {};
  logs.forEach(log => {
    if (!byComponent[log.component]) {
      byComponent[log.component] = { count: 0, time: 0 };
    }
    byComponent[log.component].count++;
    byComponent[log.component].time += log.duration;
  });

  // Group by activity type
  const byActivityType: Record<string, { count: number; time: number }> = {};
  logs.forEach(log => {
    if (!byActivityType[log.activityType]) {
      byActivityType[log.activityType] = { count: 0, time: 0 };
    }
    byActivityType[log.activityType].count++;
    byActivityType[log.activityType].time += log.duration;
  });

  // Calculate averages
  const logsWithWPM = logs.filter(log => log.metadata?.wpm);
  const averageWPM = logsWithWPM.length > 0
    ? logsWithWPM.reduce((sum, log) => sum + (log.metadata?.wpm || 0), 0) / logsWithWPM.length
    : 0;

  const logsWithAccuracy = logs.filter(log => log.metadata?.accuracy);
  const averageAccuracy = logsWithAccuracy.length > 0
    ? logsWithAccuracy.reduce((sum, log) => sum + (log.metadata?.accuracy || 0), 0) / logsWithAccuracy.length
    : 0;

  const totalCompleted = logs.filter(log => log.metadata?.completed).length;

  return {
    totalTime,
    totalActivities,
    byComponent,
    byActivityType,
    averageWPM: Math.round(averageWPM),
    averageAccuracy: Math.round(averageAccuracy),
    totalCompleted,
  };
}

/**
 * Clear all activity logs for a user
 * @param userId User identifier
 */
export function clearActivityLogs(userId: string): void {
  const key = `activityLogs_${userId}`;
  localStorage.removeItem(key);
}

/**
 * Get recent activities (last N activities)
 * @param userId User identifier
 * @param limit Number of activities to return
 * @returns Array of recent activity logs
 */
export function getRecentActivities(userId: string, limit: number = 20): ActivityLog[] {
  const logs = getActivityLogs(userId);
  return logs.slice(-limit).reverse();
}
