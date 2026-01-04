import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, User, ArrowRight } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import UnifiedSpinner from '@/components/UnifiedSpinner';

interface Class {
  id: string;
  name: string;
  description: string;
  teacher_name: string;
  joined_at: string;
}

const StudentClasses: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        handleError('Error al cargar las clases');
      }
    } catch (error) {
      handleError(error, () => fetchClasses());
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/classes/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: inviteCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('¡Te has unido a la clase correctamente!');
        setInviteCode('');
        fetchClasses();
      } else {
        handleError(data.error || 'Error al unirse a la clase');
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Clases</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Accede a tus cursos y tareas pendientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Class List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
             <div className="flex justify-center items-center py-20">
               <UnifiedSpinner size="lg" />
             </div>
          ) : (
            <>
          {classes.map((cls) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all cursor-pointer group"
              onClick={() => navigate(`/classes/${cls.id}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cls.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1 text-sm">
                    <User size={14} />
                    <span>Prof. {cls.teacher_name}</span>
                  </div>
                </div>
                <ArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </motion.div>
          ))}

          {classes.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No estás en ninguna clase</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Usa un código de invitación para unirte a una.</p>
            </div>
          )}
            </>
          )}
        </div>

        {/* Sidebar - Join Class */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Unirse a una clase</h3>
            <form onSubmit={handleJoinClass}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código de invitación
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono uppercase tracking-wider text-center"
                  placeholder="ABC-123"
                  maxLength={6}
                />
              </div>
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-lg">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Unirse
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClasses;
