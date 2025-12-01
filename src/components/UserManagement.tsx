import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/users';
import { FaUserShield, FaUserGraduate, FaTrash, FaEdit } from 'react-icons/fa';

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
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

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

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'student') => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      await usersAPI.updateRole(token, userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUserId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      await usersAPI.deleteUser(token, userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
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
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>

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
                  {editingUserId === user.id ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'student')}
                      className={`px-2 py-1 rounded ${
                        isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'
                      }`}
                    >
                      <option value="student">Estudiante</option>
                      <option value="admin">Administrador</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        user.role === 'admin'
                          ? 'bg-blue-500 bg-opacity-20 text-blue-500'
                          : 'bg-green-500 bg-opacity-20 text-green-500'
                      }`}
                    >
                      {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
                    </span>
                  )}
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
                          onClick={() => setEditingUserId(editingUserId === user.id ? null : user.id)}
                          className="p-2 rounded hover:bg-blue-500 hover:bg-opacity-20 text-blue-500"
                          title="Editar rol"
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
  );
};

export default UserManagement;
