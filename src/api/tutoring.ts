// Mock API for Tutoring System

export interface TutoringSession {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentEmail: string;
  date: string; // ISO string
  time: string; // HH:mm
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

const STORAGE_KEY = 'mecano_tutoring_sessions';

const getSessions = (): TutoringSession[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveSessions = (sessions: TutoringSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const tutoringAPI = {
  /**
   * Schedule a new tutoring session
   */
  scheduleSession: async (
    teacherId: string, 
    teacherName: string,
    studentId: string, 
    studentEmail: string,
    date: string, 
    time: string, 
    notes: string
  ): Promise<TutoringSession> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const sessions = getSessions();
    const newSession: TutoringSession = {
      id: `session-${Date.now()}`,
      teacherId,
      teacherName,
      studentId,
      studentEmail,
      date,
      time,
      notes,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    sessions.push(newSession);
    saveSessions(sessions);
    
    return newSession;
  },

  /**
   * Get sessions for a teacher
   */
  getTeacherSessions: async (teacherId: string): Promise<TutoringSession[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const sessions = getSessions();
    return sessions.filter(s => s.teacherId === teacherId).sort((a, b) => 
      new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );
  },

  /**
   * Get sessions for a student
   */
  getStudentSessions: async (studentId: string): Promise<TutoringSession[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const sessions = getSessions();
    return sessions.filter(s => s.studentId === studentId).sort((a, b) => 
      new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );
  },

  /**
   * Check for new notifications (sessions created recently)
   */
  checkNotifications: async (studentId: string): Promise<TutoringSession[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const sessions = getSessions();
    const lastCheck = localStorage.getItem(`tutoring_last_check_${studentId}`);
    
    // Filter sessions for this student that were created after the last check
    const newSessions = sessions.filter(s => 
      s.studentId === studentId && 
      s.status === 'scheduled' &&
      (!lastCheck || new Date(s.createdAt).getTime() > new Date(lastCheck).getTime())
    );

    if (newSessions.length > 0) {
      localStorage.setItem(`tutoring_last_check_${studentId}`, new Date().toISOString());
    }

    return newSessions;
  }
};
