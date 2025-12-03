import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaPlay, FaEdit, FaTrash, FaFileExport, FaFileImport, FaPlus } from 'react-icons/fa';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface CustomLevel {
  id: string;
  name: string;
  keys: string[];
  speed: number;
  errorLimit: number;
  wpmGoal: number;
  createdDate: string;
}

interface CustomLevelsViewerProps {
  onNavigate?: (view: string) => void;
  onPlayLevel?: (level: CustomLevel) => void;
}

const CustomLevelsViewer: React.FC<CustomLevelsViewerProps> = ({ onNavigate, onPlayLevel }) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const [levels, setLevels] = useState<CustomLevel[]>([]);

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = () => {
    const saved = localStorage.getItem('customLevels');
    if (saved) {
      try {
        setLevels(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading custom levels:', error);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este nivel?')) {
      const updated = levels.filter(level => level.id !== id);
      setLevels(updated);
      localStorage.setItem('customLevels', JSON.stringify(updated));
    }
  };

  const handleExport = (level: CustomLevel) => {
    const dataStr = JSON.stringify(level, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${level.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const level = JSON.parse(event.target?.result as string);
            // Ensure it has an ID and date
            if (!level.id) level.id = Date.now().toString();
            if (!level.createdDate) level.createdDate = new Date().toISOString();
            
            const updated = [...levels, level];
            setLevels(updated);
            localStorage.setItem('customLevels', JSON.stringify(updated));
            alert('Nivel importado correctamente');
          } catch (error) {
            alert('Error al importar el nivel. Verifica que el archivo sea válido.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handlePlay = (level: CustomLevel) => {
    if (onPlayLevel) {
      onPlayLevel(level);
    } else {
      alert('Funcionalidad de juego próximamente. Por ahora puedes usar el modo Práctica Libre.');
    }
  };

  const handleEdit = (level: CustomLevel) => {
    // Store in a temporary location for the editor to load
    localStorage.setItem('editingLevel', JSON.stringify(level));
    if (onNavigate) {
      onNavigate('create-level');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📚 Mis Niveles Personalizados</h1>
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center gap-2 transition-colors"
            >
              <FaFileImport /> Importar
            </button>
            <button
              onClick={() => onNavigate && onNavigate('create-level')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Crear Nuevo
            </button>
          </div>
        </div>

        {levels.length === 0 ? (
          <div className={`p-12 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">No tienes niveles personalizados</h2>
            <p className="mb-6 opacity-75">
              Crea tu primer nivel personalizado para practicar las teclas que quieras
            </p>
            <button
              onClick={() => onNavigate && onNavigate('create-level')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold inline-flex items-center gap-2"
            >
              <FaPlus /> Crear Mi Primer Nivel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map(level => (
              <div
                key={level.id}
                className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <h3 className="text-xl font-bold mb-3 truncate">{level.name}</h3>
                
                <div className="space-y-2 mb-4 text-sm">
                  <div>
                    <strong>Teclas ({level.keys.length}):</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {level.keys.slice(0, 10).map(key => (
                        <span
                          key={key}
                          className={`px-2 py-1 rounded text-xs font-mono ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          {key}
                        </span>
                      ))}
                      {level.keys.length > 10 && (
                        <span className="px-2 py-1 text-xs opacity-75">
                          +{level.keys.length - 10} más
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <strong>Velocidad:</strong>
                      <div>{level.speed}ms</div>
                    </div>
                    <div>
                      <strong>Objetivo:</strong>
                      <div>{level.wpmGoal} WPM</div>
                    </div>
                    <div>
                      <strong>Errores:</strong>
                      <div>Max {level.errorLimit}</div>
                    </div>
                    <div>
                      <strong>Creado:</strong>
                      <div className="text-xs">{formatDate(level.createdDate)}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePlay(level)}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center gap-1 text-sm font-bold transition-colors"
                  >
                    <FaPlay className="text-xs" /> Jugar
                  </button>
                  <button
                    onClick={() => handleEdit(level)}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center gap-1 text-sm font-bold transition-colors"
                  >
                    <FaEdit className="text-xs" /> Editar
                  </button>
                  <button
                    onClick={() => handleExport(level)}
                    className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded flex items-center justify-center gap-1 text-sm font-bold transition-colors"
                  >
                    <FaFileExport className="text-xs" /> Exportar
                  </button>
                  <button
                    onClick={() => handleDelete(level.id)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center gap-1 text-sm font-bold transition-colors"
                  >
                    <FaTrash className="text-xs" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomLevelsViewer;
