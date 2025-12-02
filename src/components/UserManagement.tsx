import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/users';
import { FaUserShield, FaUserGraduate, FaTrash, FaEdit, FaTimes, FaHistory } from 'react-icons/fa';

interface User {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  role: 'admin' | 'student';
  created_at: string;
  last_login: string | null;
}

const UserManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ email: '', display_name: '', role: 'student' as 'admin' | 'student' });
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      const data = await usersAPI.getAll(token);
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      display_name: user.display_name || '',
      role: user.role
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    // Build confirmation message with changes
    const changes = [];
    if (editForm.email !== editingUser.email) changes.push(`Email: ${editingUser.email} → ${editForm.email}`);
    if (editForm.display_name !== (editingUser.display_name || '')) changes.push(`Nombre: ${editingUser.display_name || '(vacío)'} → ${editForm.display_name}`);
    if (editForm.role !== editingUser.role) changes.push(`Rol: ${editingUser.role} → ${editForm.role}`);

    if (changes.length === 0) {
      alert('No hay cambios para guardar');
      return;
    }

    const confirmMessage = `¿Confirmar los siguientes cambios para ${editingUser.email}?\n\n${changes.join('\n')}\n\nEsta acción quedará registrada en el historial.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      await usersAPI.updateUser(token, editingUser.id, editForm);
      
      // Update local state
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
      setEditingUser(null);
      alert('Usuario actualizado correctamente');
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const confirmMessage = `⚠️ ADVERTENCIA: Esta acción es irreversible\n\n¿Estás seguro de que quieres eliminar al usuario?\n\nEmail: ${userToDelete.email}\nNombre: ${userToDelete.display_name || 'Sin nombre'}\nRol: ${userToDelete.role}\n\nTodos sus datos serán eliminados permanentemente.\nEsta acción quedará registrada en el historial.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      await usersAPI.deleteUser(token, userId);
      setUsers(users.filter(u => u.id !== userId));
      alert('Usuario eliminado correctamente');
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const loadAuditLogs = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/users/audit-logs?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load audit logs');

      const data = await response.json();
      setAuditLogs(data.logs);
      setShowAuditLogs(true);
    } catch (err: any) {
      alert(err.message || 'Failed to load audit logs');
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={loadUsers}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <button
            onClick={loadAuditLogs}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold flex items-center gap-2"
          >
            <FaHistory />
            Ver Historial
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <th className="text-left p-3">Usuario</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Rol</th>
                <th className="text-left p-3">Registrado</th>
                <th className="text-left p-3">Último acceso</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? (
                        <FaUserShield className="text-blue-500" />
                      ) : (
                        <FaUserGraduate className="text-green-500" />
                      )}
                      {user.display_name || 'Sin nombre'}
                    </div>
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        user.role === 'admin'
                          ? 'bg-blue-500 bg-opacity-20 text-blue-500'
                          : 'bg-green-500 bg-opacity-20 text-green-500'
                      }`}
                    >
                      {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {user.id !== currentUser?.id && (
                        <>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 rounded hover:bg-blue-500 hover:bg-opacity-20 text-blue-500"
                            title="Editar usuario"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
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

        <div className="mt-6 text-sm opacity-75">
          Total de usuarios: {users.length} ({users.filter(u => u.role === 'admin').length} administradores, {users.filter(u => u.role === 'student').length} estudiantes)
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Editar Usuario</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-black'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-black'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'student' })}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="student">Estudiante</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className={`flex-1 px-4 py-2 rounded ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Historial de Cambios</h3>
                <button
                  onClick={() => setShowAuditLogs(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {auditLogs.length === 0 ? (
                <p className="text-center opacity-75">No hay registros en el historial</p>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 rounded-lg border ${
                        isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            log.action === 'DELETE_USER' 
                              ? 'bg-red-500 bg-opacity-20 text-red-500'
                              : 'bg-blue-500 bg-opacity-20 text-blue-500'
                          }`}>
                            {log.action === 'DELETE_USER' ? 'ELIMINACIÓN' : 'MODIFICACIÓN'}
                          </span>
                        </div>
                        <span className="text-sm opacity-75">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Administrador:</strong> {log.admin_name || log.admin_email || 'Desconocido'}
                        </p>
                        <p>
                          <strong>Usuario afectado:</strong> {log.target_user_email}
                        </p>
                        
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="mt-2">
                            <strong>Cambios:</strong>
                            <ul className="ml-4 mt-1 space-y-1">
                              {Object.entries(log.changes).map(([key, value]: [string, any]) => {
                                if (key === 'deleted_user') {
                                  return (
                                    <li key={key} className="text-red-500">
                                      Usuario eliminado: {value.display_name || value.email}
                                    </li>
                                  );
                                }
                                return (
                                  <li key={key}>
                                    <span className="capitalize">{key}:</span>{' '}
                                    <span className="opacity-75">{value.from || '(vacío)'}</span>
                                    {' → '}
                                    <span className="font-bold">{value.to}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;
