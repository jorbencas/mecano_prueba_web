import React, { useState, useEffect } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@context/AuthContext';
import { useDynamicTranslations } from '@hooks/useDynamicTranslations';
import { statsAPI } from '@api/stats';
import { progressAPI } from '@api/progress';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { FaTrophy, FaChartLine, FaClock, FaFileExport, FaChartBar, FaFire, FaStar } from 'react-icons/fa';
import HeatMap from './HeatMap';
import PatternAnalysis from './PatternAnalysis';
import RecommendationEngine from './RecommendationEngine';
import ProgressPredictor from './ProgressPredictor';
import DataExport from './DataExport';

interface ProgressDashboardProps {
  embedded?: boolean;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ embedded = false }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'export'>('overview');
  const [overallStats, setOverallStats] = useState<any>(null);
  const [statsByMode, setStatsByMode] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [wpmProgression, setWpmProgression] = useState<any[]>([]);
  const [progressByMode, setProgressByMode] = useState<any[]>([]);

  useEffect(() => {
    loadAllStats();
  }, [user]);

  const loadAllStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      // Load statistics with abort signal
      const statsPromise = statsAPI.get(token, user.id, controller.signal);
      const progressPromise = progressAPI.getAll(token, user.id, controller.signal);

      const [statsData, progressData] = await Promise.all([statsPromise, progressPromise]);
      clearTimeout(timeoutId);

      if (statsData) {
        setOverallStats(statsData.overall);
        setStatsByMode(statsData.byMode);
        setRecentSessions(statsData.recent);
        setWpmProgression(statsData.wpmProgression);
      }

      if (progressData) {
        setProgressByMode(progressData.progress);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Progress stats request aborted');
      } else {
        console.error('Error loading stats:', error);
      }
      // Set empty data on error to allow UI to render
      setOverallStats((prev: any) => prev || {});
      setStatsByMode((prev: any) => prev || []);
      setRecentSessions((prev: any) => prev || []);
      setWpmProgression((prev: any) => prev || []);
      setProgressByMode((prev: any) => prev || []);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{t('progressDashboard.title')}</h1>
          <p>{t('progressDashboard.loginRequired')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen p-4 flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <div className="text-2xl">{t('progressDashboard.loading')}</div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-7xl mx-auto">
        {!embedded && <h1 className="text-3xl font-bold mb-6">📊 {t('progressDashboard.title')}</h1>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'opacity-75 hover:opacity-100'
            }`}
          >
            <FaChartLine className="inline mr-2" />
            {t('progressDashboard.tabs.overview')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'opacity-75 hover:opacity-100'
            }`}
          >
            <FaChartBar className="inline mr-2" />
            {t('progressDashboard.tabs.analytics')}
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'export'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'opacity-75 hover:opacity-100'
            }`}
          >
            <FaFileExport className="inline mr-2" />
            {t('progressDashboard.tabs.export')}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <FaChartLine className="text-3xl text-blue-500" />
              <span className="text-3xl font-bold">{Math.round(overallStats?.avg_wpm || 0)}</span>
            </div>
            <div className="text-sm opacity-75">{t('progressDashboard.stats.avgWpm')}</div>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <FaTrophy className="text-3xl text-yellow-500" />
              <span className="text-3xl font-bold">{Math.round(overallStats?.max_wpm || 0)}</span>
            </div>
            <div className="text-sm opacity-75">{t('progressDashboard.stats.maxWpm')}</div>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <FaFire className="text-3xl text-orange-500" />
              <span className="text-3xl font-bold">{overallStats?.total_sessions || 0}</span>
            </div>
            <div className="text-sm opacity-75">{t('progressDashboard.stats.totalSessions')}</div>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-orange-900' : 'bg-orange-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <FaClock className="text-3xl text-blue-500" />
              <span className="text-3xl font-bold">{formatDuration(overallStats?.total_time || 0)}</span>
            </div>
            <div className="text-sm opacity-75">{t('progressDashboard.stats.totalTime')}</div>
          </div>
        </div>

        {/* WPM Progression Chart */}
        {wpmProgression.length > 0 && (
          <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-4">{t('progressDashboard.charts.wpmProgression')}</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wpmProgression}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(d) => new Date(d).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  />
                  <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="avg_wpm" name={t('progressDashboard.stats.avgWpm')} stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="max_wpm" name={t('progressDashboard.stats.maxWpm')} stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Stats by Mode */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Mode Distribution */}
          {statsByMode.length > 0 && (
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-4">{t('progressDashboard.charts.modeDistribution')}</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsByMode}
                      dataKey="sessions"
                      nameKey="mode"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.mode}
                    >
                      {statsByMode.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Mode Performance */}
          {statsByMode.length > 0 && (
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-4">{t('progressDashboard.charts.modePerformance')}</h2>
              <div className="space-y-3">
                {statsByMode.map((mode, index) => (
                  <div key={index} className={`p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{mode.mode}</span>
                      <span>{Math.round(mode.avg_wpm)} WPM</span>
                    </div>
                    <div className="flex justify-between text-sm opacity-75">
                      <span>{mode.sessions} {t('progressDashboard.labels.sessions')}</span>
                      <span>{formatDuration(mode.total_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress by Mode */}
        {progressByMode.length > 0 && (
          <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-4">{t('progressDashboard.charts.levelProgress')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progressByMode.map((progress, index) => (
                <div key={index} className={`p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="font-bold text-lg mb-2">{progress.mode}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>{t('progressDashboard.labels.completedLevels')}</span>
                      <span className="font-semibold">{progress.completed_levels}/{progress.total_levels}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('progressDashboard.labels.stars')}</span>
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" />
                        {progress.total_stars}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('progressDashboard.labels.bestWpm')}</span>
                      <span className="font-semibold">{progress.max_wpm}</span>
                    </div>
                  </div>
                  <div className={`mt-2 w-full h-2 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <div
                      className="h-2 rounded bg-blue-500"
                      style={{ width: `${(progress.completed_levels / progress.total_levels) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">{t('progressDashboard.recentSessions.title')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <tr>
                  <th className="text-left p-2">{t('progressDashboard.recentSessions.date')}</th>
                  <th className="text-left p-2">{t('progressDashboard.recentSessions.mode')}</th>
                  <th className="text-left p-2">{t('progressDashboard.recentSessions.level')}</th>
                  <th className="text-left p-2">{t('progressDashboard.recentSessions.wpm')}</th>
                  <th className="text-left p-2">{t('progressDashboard.recentSessions.accuracy')}</th>
                  <th className="text-left p-2">{t('progressDashboard.recentSessions.duration')}</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session, index) => (
                  <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="p-2 text-sm">
                      {new Date(session.created_at).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-2">{session.mode}</td>
                    <td className="p-2">{session.level_number || '-'}</td>
                    <td className="p-2 font-semibold">{session.wpm}</td>
                    <td className="p-2">{session.accuracy}%</td>
                    <td className="p-2">{Math.round(session.duration)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <HeatMap />
            <PatternAnalysis />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecommendationEngine />
              <ProgressPredictor />
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <DataExport />
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;
