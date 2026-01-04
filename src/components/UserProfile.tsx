import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import ProgressDashboard from '@/components/ProgressDashboard';
import UnifiedSpinner from '@/components/UnifiedSpinner';
import { useUserStore } from '@/store/userStore';

// Sub-components
import ProfileHeader from '@/components/UserProfile/ProfileHeader';
import ProfileTabs from '@/components/UserProfile/ProfileTabs';
import ProfileCard from '@/components/UserProfile/ProfileCard';
import LevelXPProgress from '@/components/UserProfile/LevelXPProgress';
import QuickStats from '@/components/UserProfile/QuickStats';
import Achievements from '@/components/UserProfile/Achievements';
import ActivityHeatmap from '@/components/UserProfile/ActivityHeatmap';
import TutoringSessions from '@/components/UserProfile/TutoringSessions';
import RecentActivity from '@/components/UserProfile/RecentActivity';
import SecuritySettings from '@/components/UserProfile/SecuritySettings';
import UserPreferences from '@/components/UserProfile/UserPreferences';

interface UserProfileProps {
  initialTab?: 'profile' | 'stats' | 'settings';
}

const UserProfile: React.FC<UserProfileProps> = ({ initialTab = 'profile' }) => {
  const { isDarkMode } = useTheme();
  const { user, loading } = useAuth();
  const { t } = useDynamicTranslations();
  const { activeTab, setActiveTab, loadUserData } = useUserStore();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, setActiveTab]);

  useEffect(() => {
    if (user) {
      loadUserData(user);
    }
  }, [user, loadUserData]);

  if (loading) {
    return <UnifiedSpinner />;
  }

  if (!user) {
    return (
      <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{t('profile.title')}</h1>
          <p>{t('profile.notLoggedIn')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader />
        <ProfileTabs />

        {activeTab === 'stats' ? (
          <div className="animate-fade-in">
            <ProgressDashboard embedded />
          </div>
        ) : activeTab === 'settings' ? (
          <div className="animate-fade-in space-y-8">
            <SecuritySettings />
            <UserPreferences />
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ProfileCard />
              <LevelXPProgress />
            </div>

            <QuickStats />
            <Achievements />
            <ActivityHeatmap />
            <TutoringSessions />
            <RecentActivity />
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
