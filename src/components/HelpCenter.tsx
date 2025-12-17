import React, { useState } from 'react';
import { 
  FaQuestionCircle, FaKeyboard, FaTrophy, FaUsers, 
  FaChalkboardTeacher, FaRocket, FaLightbulb, FaChevronRight, FaUserShield 
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { motion, AnimatePresence } from 'framer-motion';

const HelpCenter: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Primeros Pasos',
      icon: <FaRocket className="text-blue-500" />,
      content: [
        {
          q: '¿Cómo empiezo a practicar?',
          a: 'Te recomendamos comenzar con los "Niveles Guiados". Estos niveles están diseñados para enseñarte la posición correcta de los dedos y aumentar tu velocidad progresivamente.'
        },
        {
          q: '¿Es necesario registrarse?',
          a: 'No es obligatorio, pero registrarte te permite guardar tu progreso, ganar XP, subir de nivel y competir en la clasificación global.'
        }
      ]
    },
    {
      id: 'practice-modes',
      title: 'Modos de Práctica',
      icon: <FaKeyboard className="text-green-500" />,
      content: [
        {
          q: '¿Qué diferencia hay entre los modos?',
          a: 'El modo Velocidad se enfoca en WPM, el modo Precisión en no cometer errores, y el modo Zen es para practicar sin presión de tiempo.'
        },
        {
          q: '¿Cómo funcionan los niveles personalizados?',
          a: 'Puedes crear tus propios textos o niveles en la sección "Personalizado". Esto es ideal para practicar vocabulario específico o fragmentos de código.'
        }
      ]
    },
    {
      id: 'xp-levels',
      title: 'XP y Niveles',
      icon: <FaTrophy className="text-yellow-500" />,
      content: [
        {
          q: '¿Cómo gano XP?',
          a: 'Ganas XP completando niveles, retos diarios y simplemente practicando. Cuanto mejor sea tu precisión y velocidad, más XP recibirás.'
        },
        {
          q: '¿Para qué sirven los niveles?',
          a: 'Los niveles muestran tu veteranía en la plataforma. Algunos logros y características futuras podrían requerir un nivel mínimo.'
        }
      ]
    },
    {
      id: 'social',
      title: 'Social y Competición',
      icon: <FaUsers className="text-purple-500" />,
      content: [
        {
          q: '¿Cómo funcionan las carreras?',
          a: 'En el modo Multijugador, puedes unirte a una carrera en tiempo real. Todos los jugadores escriben el mismo texto y gana el que termine primero con mayor precisión.'
        },
        {
          q: '¿Puedo agregar amigos?',
          a: 'Sí, puedes buscar usuarios en la clasificación y enviarles solicitudes de amistad para seguir su progreso.'
        }
      ]
    },
    {
      id: 'tutoring',
      title: 'Clases y Tutorías',
      icon: <FaChalkboardTeacher className="text-indigo-500" />,
      content: [
        {
          q: 'Soy profesor, ¿cómo creo una clase?',
          a: 'Si tienes el rol de profesor, verás una pestaña de "Clases" donde puedes crear grupos y generar códigos de invitación para tus alumnos.'
        },
        {
          q: '¿Cómo veo mis tareas?',
          a: 'Si estás en una clase, tus tareas aparecerán en la sección de Clases. Al completarlas, tu profesor podrá ver tus resultados.'
        }
      ]
    },
    {
      id: 'admin-guide',
      title: 'Guía de Administrador',
      icon: <FaUserShield className="text-red-500" />,
      content: [
        {
          q: '¿Cómo gestiono los usuarios?',
          a: 'En el Panel de Admin, puedes ver la lista completa de usuarios, editar sus perfiles, cambiar sus roles (Hacer Admin/Quitar Admin) o eliminarlos si es necesario.'
        },
        {
          q: '¿Qué es el Tracking Detallado?',
          a: 'Es una herramienta avanzada que registra cada acción importante en la plataforma. Te permite ver qué modos de práctica son los más populares y detectar posibles problemas de uso.'
        },
        {
          q: '¿Cómo funcionan los logs de auditoría?',
          a: 'Los logs de auditoría registran todas las acciones administrativas realizadas. Esto garantiza la transparencia y seguridad en la gestión de la plataforma.'
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-4 rounded-full bg-blue-500/10 mb-4"
        >
          <FaQuestionCircle className="text-5xl text-blue-500" />
        </motion.div>
        <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Centro de Ayuda
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Todo lo que necesitas saber para dominar Mecano
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                activeSection === section.id
                  ? isDarkMode ? 'bg-gray-800 text-white shadow-lg border border-gray-700' : 'bg-white text-blue-600 shadow-lg border border-blue-100'
                  : isDarkMode ? 'text-gray-400 hover:bg-gray-800/50' : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.icon}</span>
                <span className="font-bold">{section.title}</span>
              </div>
              <FaChevronRight className={`transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className={`p-8 rounded-3xl border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              } shadow-xl`}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-gray-500/10">
                  {sections.find(s => s.id === activeSection)?.icon}
                </div>
                <h2 className="text-2xl font-black">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
              </div>

              <div className="space-y-6">
                {sections.find(s => s.id === activeSection)?.content.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] ${
                      isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-blue-500/50' : 'bg-gray-50 border-gray-100 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-1.5 rounded-lg bg-blue-500/20 text-blue-500">
                        <FaLightbulb size={14} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2 text-blue-500">
                          {item.q}
                        </h3>
                        <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips Footer */}
              <div className={`mt-12 p-6 rounded-2xl border-2 border-dashed ${
                isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'
              }`}>
                <p className={`text-sm text-center italic ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  ¿No encuentras lo que buscas? ¡Pregunta en la comunidad o contacta con un administrador!
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
