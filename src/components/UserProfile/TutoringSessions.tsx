import React from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { Calendar, Clock } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

const TutoringSessions: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user, isTeacher } = useAuth();
  const { t } = useDynamicTranslations();
  const { tutoringSessions } = useUserStore();

  if (!user || tutoringSessions.length === 0) return null;

  return (
    <div className={`p-6 rounded-none border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
      <h2 className={`text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <Calendar size={20} className="text-purple-500" />
        {t('userProfile.upcomingTutoring')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tutoringSessions.slice(0, 2).map((session) => (
          <div key={session.id} className={`p-4 rounded-none border-l-4 border-purple-500 ${isDarkMode ? 'bg-gray-900/50 border-gray-700/50' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className={`font-black uppercase text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isTeacher ? session.studentEmail : session.teacherName}
                </h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                  {isTeacher ? t('userProfile.studentLabel') : t('userProfile.teacherLabel')}
                </p>
              </div>
              <div className="bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-widest border border-purple-500/20">
                {session.status === 'scheduled' ? t('userProfile.scheduled') : session.status}
              </div>
            </div>
            <div className="flex gap-4 text-[11px] font-bold opacity-70">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>{new Date(session.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{session.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutoringSessions;
