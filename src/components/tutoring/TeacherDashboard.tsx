import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Plus, Users, BookOpen, Copy, Check, Calendar } from 'lucide-react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useFetchWithTimeout } from '@/hooks/useFetchWithTimeout';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import UnifiedSpinner from '@/components/UnifiedSpinner';

interface Class {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  student_count: number;
  created_at: string;
  teacher_name?: string;
  teacher_email?: string;
}

const TeacherDashboard: React.FC = () => {
  console.log('TeacherDashboard mounted');
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const fetchWithTimeout = useFetchWithTimeout();
  const [classes, setClasses] = useState<Class[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetchWithTimeout(`${process.env.REACT_APP_API_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // 5 seconds timeout
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        handleError('Error al cargar las clases');
      }
    } catch (error: any) {
      handleError(error, () => fetchClasses());
    } finally {
      setLoading(false);
    }
  }, [token, fetchWithTimeout]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newClassName, description: newClassDesc }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewClassName('');
        setNewClassDesc('');
        fetchClasses();
      } else {
        const errorData = await response.json();
        handleError(errorData.error || 'Error al crear la clase');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const [showTutoringModal, setShowTutoringModal] = useState(false);
  const [tutoringDate, setTutoringDate] = useState('');
  const [tutoringTime, setTutoringTime] = useState('');
  const [tutoringNotes, setTutoringNotes] = useState('');

  // Mock Students Data
  const mockStudents = [
    { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
    { id: '2', name: 'María García', email: 'maria@example.com' },
    { id: '3', name: 'Carlos López', email: 'carlos@example.com' },
    { id: '4', name: 'Ana Martínez', email: 'ana@example.com' },
    { id: '5', name: 'Luis Rodríguez', email: 'luis@example.com' },
  ];

  // Student Selection State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Filter students based on search
  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleScheduleTutoring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedStudents.length === 0) {
      alert('Por favor selecciona al menos un estudiante.');
      return;
    }

    try {
      await import('@/api/tutoring').then(async mod => {
        const promises = selectedStudents.map(studentId => {
          const student = mockStudents.find(s => s.id === studentId);
          return mod.tutoringAPI.scheduleSession(
            user.id,
            user.displayName || 'Profesor',
            studentId,
            student?.email || '',
            tutoringDate,
            tutoringTime,
            tutoringNotes
          );
        });
        await Promise.all(promises);
      });

      setShowTutoringModal(false);
      setSelectedStudents([]);
      setSearchTerm('');
      setTutoringDate('');
      setTutoringTime('');
      setTutoringNotes('');
      // We could use a toast here later, but for now let's keep it simple or use a global info message
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Profesor</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gestiona tus clases y alumnos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTutoringModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Calendar size={20} />
            Programar Tutoría
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Crear Clase
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <UnifiedSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => navigate(`/classes/${cls.id}`)}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cls.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {cls.description || 'Sin descripción'}
              </p>
              
              {cls.teacher_name && (
                <div className="mb-4 text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Profesor: {cls.teacher_name}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Users size={16} />
                  <span className="text-sm">{cls.student_count || 0} alumnos</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyInviteCode(cls.invite_code);
                  }}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Copiar código de invitación"
                >
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {cls.invite_code}
                  </span>
                  {copiedCode === cls.invite_code ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tienes clases activas</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Crea tu primera clase para empezar a invitar alumnos.</p>
          </div>
        )}
      </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nueva Clase</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Crea un espacio para compartir ejercicios y realizar seguimiento de tus alumnos.
            </p>
            <form onSubmit={handleCreateClass}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de la clase
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Informática 1º ESO - Grupo A"
                />
                <p className="text-xs text-gray-500 mt-1">Un nombre descriptivo para identificar el grupo.</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Ej: Curso de mecanografía básica para principiantes. Objetivos: alcanzar 40 WPM."
                />
                <p className="text-xs text-gray-500 mt-1">Detalles sobre el contenido o los objetivos del curso.</p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Clase
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Tutoring Modal */}
      {showTutoringModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Programar Tutoría</h2>
            <form onSubmit={handleScheduleTutoring}>
              {/* Student Search & Multi-select */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estudiantes
                </label>
                <div 
                  className="p-2 rounded border border-gray-300 dark:border-gray-600 cursor-pointer flex flex-wrap gap-2 min-h-[42px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                >
                  {selectedStudents.length === 0 && (
                    <span className="text-gray-400">Seleccionar estudiantes...</span>
                  )}
                  {selectedStudents.map(id => {
                    const student = mockStudents.find(s => s.id === id);
                    return (
                      <span key={id} className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        {student?.name}
                        <FaTimes 
                          className="cursor-pointer hover:text-red-200" 
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            toggleStudentSelection(id);
                          }}
                        />
                      </span>
                    );
                  })}
                </div>

                {/* Dropdown */}
                {showStudentDropdown && (
                  <div className="absolute z-10 w-full mt-1 rounded shadow-xl max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border-b border-gray-300 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    {filteredStudents.map(student => (
                      <div
                        key={student.id}
                        onClick={() => toggleStudentSelection(student.id)}
                        className={`p-2 cursor-pointer flex items-center justify-between hover:bg-blue-500/20 ${
                          selectedStudents.includes(student.id) ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                        </div>
                        {selectedStudents.includes(student.id) && <FaCheck className="text-blue-500" />}
                      </div>
                    ))}
                    {filteredStudents.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No se encontraron estudiantes
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={tutoringDate}
                    onChange={(e) => setTutoringDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    required
                    value={tutoringTime}
                    onChange={(e) => setTutoringTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas / Motivo
                </label>
                <textarea
                  value={tutoringNotes}
                  onChange={(e) => setTutoringNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Revisión de progreso, dudas sobre ejercicios..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTutoringModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Programar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
