import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { FaUsers, FaClock, FaTrophy, FaChartLine, FaFilter, FaSearch, FaEdit, FaTrash, FaTimes, FaUserShield, FaUserGraduate, FaStar, FaAward, FaQuestionCircle } from 'react-icons/fa';
import ActivityChart from './ActivityChart';
import Achievements from './Achievements';
import { usersAPI } from '../api/users';
import { getAllUsersLevels, getXPProgress } from '../utils/userLevelSystem';
import { getAllUsersChallenges, getGlobalChallengeStats } from '../utils/challengeTracker';

interface UserActivityData {
  userId: string;
  email: string;
  totalTime: number;
  totalActivities: number;
  averageWPM: number;
  averageAccuracy: number;
  totalCompleted: number;
  byComponent: Record<string, { count: number; time: number }>;
  byActivityType: Record<string, { count: number; time: number }>;
  lastActivity?: Date;
  role?: string;
}

const AdminDashboard: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();

  const renderHelpIcon = (sectionId: string) => (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        if (onNavigate) onNavigate('help');
      }}
      className="ml-2 text-blue-500 hover:text-blue-400 transition-colors"
      title="Ver ayuda sobre esta sección"
    >
      <FaQuestionCircle size={14} />
    </button>
  );
  
  const [usersData, setUsersData] = useState<UserActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'activities' | 'wpm' | 'accuracy'>('time');
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'achievements' | 'challenges' | 'tracking' | 'history'>('users');
  const [selectedUser, setSelectedUser] = useState<{ userId: string; email: string } | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // User Management state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ email: '', display_name: '', role: 'student' as 'admin' | 'student' });

  useEffect(() => {
    if (user?.role !== 'admin') {
      return;
    }
    fetchAllUsersActivity();
  }, [user, dateRange]);

  const fetchAllUsersActivity = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/activity?start=${dateRange.start}&end=${dateRange.end}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsersData(data);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const filteredAndSortedUsers = usersData
    .filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return b.totalTime - a.totalTime;
        case 'activities':
          return b.totalActivities - a.totalActivities;
        case 'wpm':
          return b.averageWPM - a.averageWPM;
        case 'accuracy':
          return b.averageAccuracy - a.averageAccuracy;
        default:
          return 0;
      }
    });

  const totalStats = usersData.reduce(
    (acc, user) => ({
      totalTime: acc.totalTime + user.totalTime,
      totalActivities: acc.totalActivities + user.totalActivities,
      avgWPM: acc.avgWPM + user.averageWPM,
      avgAccuracy: acc.avgAccuracy + user.averageAccuracy,
    }),
    { totalTime: 0, totalActivities: 0, avgWPM: 0, avgAccuracy: 0 }
  );

  const updateUserRole = async (userId: string, newRole: 'admin' | 'student') => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        // Refresh data
        fetchAllUsersActivity();
        alert(t('alerts.roleUpdated', { role: newRole }));
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(t('alerts.roleUpdateError'));
    }
  };

  // User Management Functions
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      const data = await usersAPI.getAll(token);
      setUsers(data.users);
    } catch (err: any) {
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      display_name: user.display_name || '',
      role: user.role
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    const changes = [];
    if (editForm.email !== editingUser.email) changes.push(`Email: ${editingUser.email} → ${editForm.email}`);
    if (editForm.display_name !== (editingUser.display_name || '')) changes.push(`Nombre: ${editingUser.display_name || '(vacío)'} → ${editForm.display_name}`);
    if (editForm.role !== editingUser.role) changes.push(`Rol: ${editingUser.role} → ${editForm.role}`);

    if (changes.length === 0) {
      alert(t('alerts.noChanges', 'No hay cambios'));
      return;
    }

    const confirmMessage = `¿Confirmar los siguientes cambios para ${editingUser.email}?\n\n${changes.join('\n')}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      await usersAPI.updateUser(token, editingUser.id, editForm);
      
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
      setEditingUser(null);
      alert(t('alerts.userUpdated', 'Usuario actualizado'));
    } catch (err: any) {
      alert(t('alerts.userUpdateError', 'Error al actualizar usuario'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    if (!window.confirm(t('confirmations.deleteUser', `¿Eliminar usuario ${userToDelete.email}?`))) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      await usersAPI.deleteUser(token, userId);
      setUsers(users.filter(u => u.id !== userId));
      alert(t('alerts.userDeleted', 'Usuario eliminado'));
    } catch (err: any) {
      alert(t('alerts.userDeleteError', 'Error al eliminar usuario'));
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'users') {
      loadUsers();
    }
  }, [user, activeTab]);

  if (user?.role !== 'admin') {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
            isDarkMode ? 'from-purple-400 via-pink-400 to-red-400' : 'from-purple-600 via-pink-600 to-red-600'
          }`}>
            Admin Dashboard
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor user activity and engagement
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => {
              setActiveTab('users');
              setSelectedUser(null);
            }}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'users'
                ? isDarkMode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaUserShield className="inline mr-2" />
            {t('adminDashboard.tabs.users', 'Gestión de Usuarios')}
          </button>
          <button
            onClick={() => {
              setActiveTab('activity');
              setSelectedUser(null);
            }}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'activity'
                ? isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaChartLine className="inline mr-2" />
            {t('adminDashboard.tabs.activity', 'Actividad y Estadísticas')}
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'achievements'
                ? isDarkMode
                  ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-lg shadow-yellow-500/30'
                  : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaTrophy className="inline mr-2" />
            {t('adminDashboard.tabs.achievements', 'Logros de Usuarios')}
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'challenges'
                ? isDarkMode
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaStar className="inline mr-2" />
            Retos y Niveles
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'tracking'
                ? isDarkMode
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaClock className="inline mr-2" />
            {t('adminDashboard.tabs.tracking', 'Tracking Detallado')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'history'
                ? isDarkMode
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaFilter className="inline mr-2" />
            {t('adminDashboard.tabs.history', 'Historial de Auditoría')}
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
            isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
          }`}>
            <h2 className="text-2xl font-bold mb-6">
              <FaUserShield className="inline mr-3 text-purple-500" />
              {t('adminDashboard.userManagement', 'Gestión de Usuarios')}
              {renderHelpIcon('admin-guide')}
            </h2>
            
            {usersLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <p className="mt-4">Cargando usuarios...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="text-left p-4 font-bold">Usuario</th>
                      <th className="text-left p-4 font-bold">Email</th>
                      <th className="text-left p-4 font-bold">Rol</th>
                      <th className="text-left p-4 font-bold">Registrado</th>
                      <th className="text-left p-4 font-bold">Último acceso</th>
                      <th className="text-left p-4 font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr 
                        key={userItem.id}
                        className={`border-b transition-colors ${
                          isDarkMode 
                            ? 'border-gray-700 hover:bg-gray-700/50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {userItem.role === 'admin' ? (
                              <FaUserShield className="text-blue-500" />
                            ) : (
                              <FaUserGraduate className="text-green-500" />
                            )}
                            {userItem.display_name || 'Sin nombre'}
                          </div>
                        </td>
                        <td className="p-4">{userItem.email}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            userItem.role === 'admin'
                              ? 'bg-blue-500 bg-opacity-20 text-blue-500'
                              : 'bg-green-500 bg-opacity-20 text-green-500'
                          }`}>
                            {userItem.role === 'admin' ? 'Administrador' : 'Estudiante'}
                          </span>
                        </td>
                        <td className="p-4 text-sm">
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm">
                          {userItem.last_login ? new Date(userItem.last_login).toLocaleDateString() : 'Nunca'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {userItem.id !== user?.id && (
                              <>
                                <button
                                  onClick={() => handleEditClick(userItem)}
                                  className="p-2 rounded hover:bg-blue-500 hover:bg-opacity-20 text-blue-500"
                                  title="Editar usuario"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(userItem.id)}
                                  className="p-2 rounded hover:bg-red-500 hover:bg-opacity-20 text-red-500"
                                  title="Eliminar usuario"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingUser(null)}
          >
            <div 
              className={`max-w-md w-full rounded-2xl shadow-2xl p-6 ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Editar Usuario</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 rounded hover:bg-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Nombre</label>
                  <input
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Rol</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'student' })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  >
                    <option value="student">Estudiante</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSaveEdit}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    }`}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <>
            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
                isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <FaUsers className="text-2xl text-blue-500" />
                  <span className="text-sm uppercase tracking-wider opacity-70">Total Usuarios</span>
                </div>
                <div className="text-3xl font-black">{usersData.length}</div>
              </div>

              <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
                isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <FaClock className="text-2xl text-green-500" />
                  <span className="text-sm uppercase tracking-wider opacity-70">Tiempo Total</span>
                  {renderHelpIcon('xp-levels')}
                </div>
                <div className="text-3xl font-black">{formatTime(totalStats.totalTime)}</div>
              </div>

              <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
                isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <FaChartLine className="text-2xl text-purple-500" />
                  <span className="text-sm uppercase tracking-wider opacity-70">PPM Promedio</span>
                </div>
                <div className="text-3xl font-black">
                  {usersData.length > 0 ? Math.round(totalStats.avgWPM / usersData.length) : 0}
                </div>
              </div>

              <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
                isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <FaTrophy className="text-2xl text-yellow-500" />
                  <span className="text-sm uppercase tracking-wider opacity-70">Precisión Promedio</span>
                </div>
                <div className="text-3xl font-black">
                  {usersData.length > 0 ? Math.round(totalStats.avgAccuracy / usersData.length) : 0}%
                </div>
              </div>
            </div>
          </>
        )}

        {/* Filters */}
        <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg mb-6 ${
          isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
        }`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-bold mb-2">
                <FaSearch className="inline mr-2" />
                Buscar Usuarios
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por email..."
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-bold mb-2">
                <FaFilter className="inline mr-2" />
                Ordenar Por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
              >
                <option value="time">Tiempo Total</option>
                <option value="activities">Actividades</option>
                <option value="wpm">PPM</option>
                <option value="accuracy">Precisión</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-bold mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Fecha Fin</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Visualizations */}
        {!loading && usersData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ActivityChart
              data={Object.entries(
                usersData.reduce((acc, user) => {
                  Object.entries(user.byComponent).forEach(([component, data]) => {
                    if (!acc[component]) {
                      acc[component] = { count: 0, time: 0 };
                    }
                    acc[component].count += data.count;
                    acc[component].time += data.time;
                  });
                  return acc;
                }, {} as Record<string, { count: number; time: number }>)
              ).map(([component, data]) => ({
                component,
                count: data.count,
                time: data.time,
              }))}
              title="Actividad por Componente"
            />
            
            <ActivityChart
              data={Object.entries(
                usersData.reduce((acc, user) => {
                  Object.entries(user.byActivityType).forEach(([type, data]) => {
                    if (!acc[type]) {
                      acc[type] = { count: 0, time: 0 };
                    }
                    acc[type].count += data.count;
                    acc[type].time += data.time;
                  });
                  return acc;
                }, {} as Record<string, { count: number; time: number }>)
              ).map(([component, data]) => ({
                component,
                count: data.count,
                time: data.time,
              }))}
              title="Actividad por Tipo"
            />
          </div>
        )}

        {/* Users Table */}
        <div className={`rounded-xl border backdrop-blur-md shadow-lg overflow-hidden ${
          isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
        }`}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="mt-4">Cargando datos de actividad...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Tiempo Total</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actividades</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">PPM Promedio</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Precisión</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Completadas</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredAndSortedUsers.map((userData) => (
                    <tr key={userData.userId} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{userData.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          userData.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {userData.role || 'student'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatTime(userData.totalTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userData.totalActivities}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-500 font-bold">{userData.averageWPM}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-blue-500 font-bold">{userData.averageAccuracy}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userData.totalCompleted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userData.userId !== user?.id && (
                          <button
                            onClick={() => updateUserRole(
                              userData.userId, 
                              userData.role === 'admin' ? 'student' : 'admin'
                            )}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                              userData.role === 'admin'
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }`}
                          >
                            {userData.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
            isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
          }`}>
            <h2 className="text-2xl font-bold mb-6">
              <FaTrophy className="inline mr-3 text-yellow-500" />
              {t('adminDashboard.userAchievements', 'Logros de Usuarios')}
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left p-4 font-bold">{t('adminDashboard.table.email', 'Email')}</th>
                    <th className="text-left p-4 font-bold">{t('adminDashboard.table.role', 'Rol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.map(user => (
                    <tr 
                      key={user.userId}
                      onDoubleClick={() => setSelectedUser({ userId: user.userId, email: user.email })}
                      className={`border-b transition-colors cursor-pointer ${
                        isDarkMode 
                          ? 'border-gray-700 hover:bg-gray-700/50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      title={t('adminDashboard.doubleClickToView', 'Doble click para ver logros')}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaTrophy className="text-yellow-500" />
                          <span className="font-medium">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {user.role === 'admin' ? (
                          <span className="px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-bold">
                            Admin
                          </span>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            Estudiante
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`text-sm mt-4 text-center opacity-75`}>
              {t('adminDashboard.doubleClickHint', '💡 Haz doble click en cualquier fila para ver los logros del usuario')}
            </p>
          </div>
        )}

        {/* Challenges and Levels Tab */}
        {activeTab === 'challenges' && (() => {
          const usersLevels = getAllUsersLevels();
          const challengeStats = getGlobalChallengeStats();
          const usersChallenges = getAllUsersChallenges();
          
          return (
            <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
              isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
            }`}>
              <h2 className="text-2xl font-bold mb-6">
                <FaStar className="inline mr-3 text-orange-500" />
                Retos y Niveles de Usuarios
              </h2>

              {/* Global Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <FaStar className="text-2xl text-yellow-500" />
                    <span className="text-sm uppercase tracking-wider opacity-70">Nivel Promedio</span>
                  </div>
                  <div className="text-3xl font-black">
                    {usersLevels.length > 0 
                      ? Math.round(usersLevels.reduce((sum, u) => sum + u.level, 0) / usersLevels.length)
                      : 0}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <FaTrophy className="text-2xl text-purple-500" />
                    <span className="text-sm uppercase tracking-wider opacity-70">XP Total Sistema</span>
                  </div>
                  <div className="text-3xl font-black">
                    {usersLevels.reduce((sum, u) => sum + u.totalXP, 0).toLocaleString()}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <FaAward className="text-2xl text-green-500" />
                    <span className="text-sm uppercase tracking-wider opacity-70">Retos Hoy</span>
                  </div>
                  <div className="text-3xl font-black">{challengeStats.challengesCompletedToday}</div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <FaChartLine className="text-2xl text-blue-500" />
                    <span className="text-sm uppercase tracking-wider opacity-70">Retos Totales</span>
                  </div>
                  <div className="text-3xl font-black">{challengeStats.totalChallengesCompleted}</div>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Nivel</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">XP Total</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Progreso</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Retos Completados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {usersLevels.map((userLevel) => {
                      const challenges = usersChallenges.get(userLevel.userId);
                      const completedChallenges = challenges?.challenges.filter(c => c.completed).length || 0;
                      const progress = getXPProgress(userLevel.totalXP);
                      
                      return (
                        <tr 
                          key={userLevel.userId}
                          className={`transition-colors ${
                            isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{userLevel.userId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black">
                                {userLevel.level}
                              </div>
                              <span className="font-bold">Nivel {userLevel.level}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-purple-500">{userLevel.totalXP.toLocaleString()} XP</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-full">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{progress.progress}%</span>
                                <span>{progress.xpToNextLevel} XP restantes</span>
                              </div>
                              <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                                <div
                                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all"
                                  style={{ width: `${progress.progress}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FaTrophy className="text-yellow-500" />
                              <span className="font-bold">{completedChallenges}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {usersLevels.length === 0 && (
                <p className="text-center py-8 opacity-70">
                  No hay datos de niveles disponibles
                </p>
              )}
            </div>
          );
        })()}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
            isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
          }`}>
            <h2 className="text-2xl font-bold mb-6">
              <FaClock className="inline mr-3 text-green-500" />
              {t('adminDashboard.trackingDetailed', 'Tracking Detallado de Actividad')}
            </h2>
            
            <p className="text-center py-12 opacity-75">
              📊 Vista detallada de tracking por usuario<br/>
              Incluye: Progreso temporal, métricas por componente, y exportación de datos<br/>
              <span className="text-sm">(Funcionalidad completa disponible en la pestaña "Actividad y Estadísticas")</span>
            </p>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
            isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
          }`}>
            <h2 className="text-2xl font-bold mb-6">
              <FaFilter className="inline mr-3 text-orange-500" />
              {t('adminDashboard.auditHistory', 'Historial de Auditoría')}
            </h2>
            
            <p className="text-center py-12 opacity-75">
              📜 Registro completo de acciones administrativas<br/>
              Incluye: Cambios de roles, ediciones de usuarios, y eliminaciones<br/>
              <span className="text-sm">(Sistema de auditoría en desarrollo)</span>
            </p>
          </div>
        )}

        {/* Achievements Modal */}
        {selectedUser && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedUser(null)}
          >
            <div 
              className={`max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`sticky top-0 z-10 p-6 border-b backdrop-blur-sm ${
                isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-gray-100/95 border-gray-200'
              }`}>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    <FaTrophy className="inline mr-3 text-yellow-500" />
                    {t('adminDashboard.achievementsFor', 'Logros de')} {selectedUser.email}
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-white text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    ✕ {t('common.close', 'Cerrar')}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <Achievements
                  userId={selectedUser.userId}
                  userEmail={selectedUser.email}
                  readOnly={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
