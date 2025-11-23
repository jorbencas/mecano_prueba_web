import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { startActivity, endActivity, ActivityLog } from '../utils/activityTracker';

/**
 * Custom hook for tracking user activity
 * @param component Component name
 * @param activityType Type of activity
 * @returns Object with startTracking and stopTracking functions
 */
export const useActivityTracker = (
  component: string,
  activityType: ActivityLog['activityType']
) => {
  const { user } = useAuth();
  const [activityId, setActivityId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  /**
   * Start tracking activity
   */
  const startTracking = useCallback(() => {
    if (!user) return;
    if (isTracking) return; // Already tracking

    const id = startActivity(user.email || user.id, activityType, component);
    setActivityId(id);
    setIsTracking(true);
  }, [user, activityType, component, isTracking]);

  /**
   * Stop tracking activity
   * @param metadata Optional metadata to save with the activity
   */
  const stopTracking = useCallback((metadata?: ActivityLog['metadata']) => {
    if (!activityId) return;
    if (!isTracking) return;

    endActivity(activityId, metadata);
    setActivityId(null);
    setIsTracking(false);
  }, [activityId, isTracking]);

  /**
   * Cleanup: stop tracking when component unmounts
   */
  useEffect(() => {
    return () => {
      if (activityId && isTracking) {
        endActivity(activityId);
      }
    };
  }, [activityId, isTracking]);

  return {
    startTracking,
    stopTracking,
    isTracking,
  };
};
