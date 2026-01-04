import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Users, FileText, BarChart2, Plus, ArrowLeft, Calendar, CheckCircle, Trash2 } from 'lucide-react';

interface Student {
  id: string;
  display_name: string;
  email: string;
  photo_url: string;
  joined_at: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: string;
  due_date: string;
  completed: boolean;
  topic?: string;
  xpReward?: number;
}

interface ClassDetails {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  is_teacher: boolean;
  members?: Student[];
}

const ClassView: React.FC = () => {
  const { id: classId } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassDetails | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<'students' | 'assignments' | 'stats'>('assignments');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for new assignment
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignDesc, setNewAssignDesc] = useState('');
  const [newAssignType, setNewAssignType] = useState('practice');
  const [newAssignDate, setNewAssignDate] = useState('');
  const [newAssignTopic, setNewAssignTopic] = useState('');
  const [newAssignXp, setNewAssignXp] = useState(50);
  const [assignmentSteps, setAssignmentSteps] = useState<any[]>([]);

  const addStep = () => {
    setAssignmentSteps([...assignmentSteps, { type: 'text', content: '', duration: 0 }]);
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...assignmentSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setAssignmentSteps(newSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = assignmentSteps.filter((_, i) => i !== index);
    setAssignmentSteps(newSteps);
  };

  useEffect(() => {
    if (classId && token) {
      loadData();
    }
  }, [classId, token]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchClassDetails(), fetchAssignments()]);
    } catch (err) {
      console.error('Error loading class data:', err);
      setError('Error al cargar la información de la clase');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setClassData(data);
        // Default to students tab if teacher, assignments if student
        if (data.is_teacher) setActiveTab('students');
      } else {
        throw new Error('Failed to fetch class details');
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      throw error;
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/assignments/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: classId,
          title: newAssignTitle,
          description: newAssignDesc,
          type: newAssignType,
          dueDate: newAssignDate || null,
          topic: newAssignTopic || 'General',
          xpReward: newAssignXp,
          config: { steps: assignmentSteps }, // Store steps in config
          requirements: {} 
        }),
      });

      if (response.ok) {
        setShowAssignModal(false);
        setNewAssignTitle('');
        setNewAssignDesc('');
        setNewAssignTopic('');
        setNewAssignXp(50);
        setAssignmentSteps([]);
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{error || 'No se pudo cargar la clase'}</p>
          <button 
            onClick={() => navigate('/classes')}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Volver a mis clases
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{classData.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{classData.description}</p>
          </div>
          {classData.is_teacher && (
            <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">
                Código de invitación
              </p>
              <p className="text-xl font-mono font-bold text-blue-700 dark:text-blue-300">
                {classData.invite_code}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-6 mt-8 border-b border-gray-200 dark:border-gray-700">
          {classData.is_teacher && (
            <button
              onClick={() => setActiveTab('students')}
              className={`pb-4 px-2 flex items-center gap-2 font-medium transition-colors relative ${
                activeTab === 'students'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Users size={18} />
              Alumnos
              {activeTab === 'students' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-4 px-2 flex items-center gap-2 font-medium transition-colors relative ${
              activeTab === 'assignments'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileText size={18} />
            Tareas
            {activeTab === 'assignments' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          {classData.is_teacher && (
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-4 px-2 flex items-center gap-2 font-medium transition-colors relative ${
                activeTab === 'stats'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <BarChart2 size={18} />
              Estadísticas
              {activeTab === 'stats' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'students' && classData.members && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alumno</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha de ingreso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {classData.members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold mr-3">
                          {member.display_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{member.display_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {classData.members.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay alumnos en esta clase todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            {classData.is_teacher && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  Nueva Tarea
                </button>
              </div>
            )}

            <div className="space-y-8">
              {Object.entries(assignments.reduce((acc, assign) => {
                const topic = assign.topic || 'General';
                if (!acc[topic]) acc[topic] = [];
                acc[topic].push(assign);
                return acc;
              }, {} as Record<string, Assignment[]>)).map(([topic, topicAssignments]) => (
                <div key={topic}>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 pl-2 border-l-4 border-blue-500">
                    {topic}
                  </h3>
                  <div className="grid gap-4">
                    {topicAssignments.map((assign) => (
                      <div key={assign.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex justify-between items-center relative overflow-hidden">
                        {/* XP Badge */}
                        {assign.xpReward && (
                          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                            <span className="text-sm">🏆</span> {assign.xpReward} XP
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{assign.title}</h3>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full uppercase">
                              {assign.type}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{assign.description}</p>
                          {assign.due_date && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                              <Calendar size={12} />
                              Vence: {new Date(assign.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                          {assign.completed ? (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                              <CheckCircle size={20} />
                              Completada
                            </div>
                          ) : (
                            !classData.is_teacher && (
                              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Empezar
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {assignments.length === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay tareas asignadas</h3>
                  {classData.is_teacher && (
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Crea la primera tarea para tus alumnos.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <BarChart2 size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">WPM Promedio</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">45.2</h3>
                  </div>
                </div>
                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <span className="bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">+2.4</span> vs semana anterior
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Precisión Promedio</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">96.8%</h3>
                  </div>
                </div>
                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <span className="bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">+0.5%</span> vs semana anterior
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">XP Total Clase</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12,450</h3>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Acumulado por todos los alumnos
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Progreso por Alumno</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alumno</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tareas Completadas</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">WPM Promedio</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">XP Ganado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {classData.members?.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {member.display_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {Math.floor(Math.random() * 5)} / {assignments.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {40 + Math.floor(Math.random() * 20)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400 font-bold">
                          {Math.floor(Math.random() * 500)} XP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nueva Tarea</h2>
            <form onSubmit={handleCreateAssignment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={newAssignTitle}
                  onChange={(e) => setNewAssignTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Práctica de velocidad semanal"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newAssignDesc}
                  onChange={(e) => setNewAssignDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tema / Unidad
                  </label>
                  <input
                    type="text"
                    value={newAssignTopic}
                    onChange={(e) => setNewAssignTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ej: Unidad 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recompensa XP
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={newAssignXp}
                    onChange={(e) => setNewAssignXp(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newAssignType}
                    onChange={(e) => setNewAssignType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="practice">Práctica Libre</option>
                    <option value="speed">Velocidad</option>
                    <option value="accuracy">Precisión</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de entrega (Opcional)
                </label>
                <input
                  type="date"
                  value={newAssignDate}
                  onChange={(e) => setNewAssignDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pasos / Ejercicios
                  </label>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Añadir Paso
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {assignmentSteps.map((step, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-gray-500">Paso {index + 1}</span>
                        <button type="button" onClick={() => removeStep(index)} className="text-red-500 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <select
                        value={step.type}
                        onChange={(e) => updateStep(index, 'type', e.target.value)}
                        className="w-full mb-2 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                      >
                        <option value="text">Lectura / Texto</option>
                        <option value="practice">Práctica Libre</option>
                        <option value="speed">Velocidad</option>
                      </select>
                      <input
                        type="text"
                        value={step.content}
                        onChange={(e) => updateStep(index, 'content', e.target.value)}
                        placeholder="Instrucciones o contenido..."
                        className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                      />
                    </div>
                  ))}
                  {assignmentSteps.length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      No hay pasos definidos. Se creará una tarea simple.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Asignar Tarea
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClassView;
