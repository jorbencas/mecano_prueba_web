import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { challengesAPI } from '@/api/challenges';

interface SessionData {
  wpm?: number;
  accuracy?: number;
  errors?: number;
  elapsedTime?: number;
  mode?: string;
  level?: number | string;
}

/**
 * Hook to check and complete daily challenges based on practice session data
 */
export const useChallengeChecker = () => {
  const { user } = useAuth();

  /**
   * Check if any challenges were completed with the given session data
   */
  const checkChallenges = useCallback(async (sessionData: SessionData) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Fetch today's challenges
      const { challenges } = await challengesAPI.getDailyChallenges(token);
      if (!challenges || challenges.length === 0) return;

      const completedChallenges: string[] = [];

      for (const challenge of challenges) {
        // Skip already completed challenges
        if (challenge.completed) continue;

        let shouldComplete = false;
        let newProgress = challenge.progress;

        switch (challenge.challenge_type) {
          case 'speed':
            // Challenge: Reach X WPM
            if (sessionData.wpm && sessionData.wpm >= challenge.target_value) {
              shouldComplete = true;
            } else if (sessionData.wpm) {
              newProgress = Math.max(newProgress, sessionData.wpm);
            }
            break;

          case 'accuracy':
            // Challenge: Reach X% accuracy
            if (sessionData.accuracy && sessionData.accuracy >= challenge.target_value) {
              shouldComplete = true;
            } else if (sessionData.accuracy) {
              newProgress = Math.max(newProgress, sessionData.accuracy);
            }
            break;

          case 'consistency':
            // Challenge: Practice X seconds
            if (sessionData.elapsedTime) {
              newProgress += sessionData.elapsedTime;
              if (newProgress >= challenge.target_value) {
                shouldComplete = true;
              }
            }
            break;

          case 'improvement':
            // Challenge: Practice specific mode for X seconds
            if (challenge.mode && sessionData.mode) {
              const normalizedChallengeMode = challenge.mode.toLowerCase().replace(/\s+/g, '');
              const normalizedSessionMode = sessionData.mode.toLowerCase().replace(/\s+/g, '');
              
              if (normalizedChallengeMode.includes(normalizedSessionMode) || 
                  normalizedSessionMode.includes(normalizedChallengeMode)) {
                if (sessionData.elapsedTime) {
                  newProgress += sessionData.elapsedTime;
                  if (newProgress >= challenge.target_value) {
                    shouldComplete = true;
                  }
                }
              }
            }
            break;

          case 'exploration':
            // Challenge: Try a specific mode for X seconds
            if (challenge.mode && sessionData.mode) {
              const normalizedChallengeMode = challenge.mode.toLowerCase().replace(/\s+/g, '');
              const normalizedSessionMode = sessionData.mode.toLowerCase().replace(/\s+/g, '');
              
              if (normalizedChallengeMode.includes(normalizedSessionMode) || 
                  normalizedSessionMode.includes(normalizedChallengeMode)) {
                if (sessionData.elapsedTime) {
                  newProgress += sessionData.elapsedTime;
                  if (newProgress >= challenge.target_value) {
                    shouldComplete = true;
                  }
                }
              }
            }
            break;
        }

        // Update progress or complete challenge
        if (shouldComplete) {
          await challengesAPI.completeChallenge(token, challenge.id);
          completedChallenges.push(challenge.title);
        } else if (newProgress > challenge.progress) {
          await challengesAPI.updateProgress(token, challenge.id, newProgress);
        }
      }

      // Return completed challenges for notification
      return completedChallenges;
    } catch (error) {
      console.error('Error checking challenges:', error);
      return [];
    }
  }, [user]);

  return { checkChallenges };
};
