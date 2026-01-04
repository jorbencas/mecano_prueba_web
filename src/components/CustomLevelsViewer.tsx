import React, { useState, useEffect } from 'react';
import { useTheme } from '@hooks/useTheme';
import { FaPlay, FaEdit, FaTrash, FaFileExport, FaFileImport, FaPlus } from 'react-icons/fa';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';

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
  onCreateNew?: () => void;
  onEditLevel?: (level: CustomLevel) => void;
}

const CustomLevelsViewer: React.FC<CustomLevelsViewerProps> = ({ 
  onNavigate, 
  onPlayLevel, 
  onCreateNew, 
  onEditLevel 
}) => {
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
    if (onEditLevel) {
      onEditLevel(level);
    } else {
      // Fallback for standalone usage
      localStorage.setItem('editingLevel', JSON.stringify(level));
      if (onNavigate) {
        onNavigate('create-level');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="py-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-blue-500/20 pb-6">
          <div>
            <h1 className={`text-3xl md:text-4xl font-black tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('customLevels.myLevels')}
            </h1>
            <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {levels.length} {t('customLevels.totalLevels')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleImport}
              title={t('customLevels.import')}
              className={`px-4 py-2 rounded-none border font-bold text-sm flex items-center gap-2 transition-all active:scale-95 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <FaFileImport className="text-green-500" /> {t('customLevels.import')}
            </button>
            <button
              onClick={() => onCreateNew ? onCreateNew() : (onNavigate && onNavigate('create-level'))}
              title={t('customLevels.createNew')}
              className="px-6 py-2 rounded-none bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-tight shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <FaPlus /> {t('customLevels.createNew')}
            </button>
          </div>
        </div>

        {levels.length === 0 ? (
          <div className={`p-20 rounded-none text-center border backdrop-blur-sm ${
            isDarkMode ? 'bg-gray-900/40 border-gray-800/50' : 'bg-white/80 border-gray-200/50 shadow-sm'
          }`}>
            <div className="text-6xl mb-6 opacity-50">📚</div>
            <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">{t('customLevels.noLevels')}</h2>
            <p className={`text-sm font-medium uppercase tracking-widest mb-8 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
              {t('customLevels.noLevelsDesc')}
            </p>
            <button
              onClick={() => onCreateNew ? onCreateNew() : (onNavigate && onNavigate('create-level'))}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-black uppercase tracking-tight inline-flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
            >
              <FaPlus /> {t('customLevels.createNew')}
            </button>
          </div>
        ) : (
          <div className={`overflow-hidden border backdrop-blur-sm ${
            isDarkMode ? 'bg-gray-900/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'
          } rounded-none`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
                    <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('customLevels.table.name')}
                    </th>
                    <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('customLevels.table.keys')}
                    </th>
                    <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('customLevels.table.config')}
                    </th>
                    <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('customLevels.table.date')}
                    </th>
                    <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('customLevels.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700/30' : 'divide-gray-100'}`}>
                  {levels.map(level => (
                    <tr 
                      key={level.id}
                      className={`group transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-blue-50/30'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-8 ${isDarkMode ? 'bg-blue-500/30' : 'bg-blue-500/20'}`} />
                          <span className={`font-black text-base uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {level.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {level.keys.slice(0, 6).map(key => (
                            <span
                              key={key}
                              className={`px-1.5 py-0.5 rounded-none text-[10px] font-mono border ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-700 text-gray-400' 
                                  : 'bg-gray-100 border-gray-200 text-gray-600'
                              }`}
                            >
                              {key}
                            </span>
                          ))}
                          {level.keys.length > 6 && (
                            <span className="text-[10px] font-bold opacity-50 ml-1">
                              +{level.keys.length - 6}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4 text-[11px] font-bold uppercase tracking-wider">
                          <div className="flex flex-col">
                            <span className="opacity-40 text-[9px]">{t('customLevels.table.speed')}</span>
                            <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>{level.speed}ms</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="opacity-40 text-[9px]">{t('customLevels.table.goal')}</span>
                            <span className={isDarkMode ? 'text-purple-400' : 'text-purple-600'}>{level.wpmGoal} WPM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="opacity-40 text-[9px]">{t('customLevels.table.errors')}</span>
                            <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>{level.errorLimit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium opacity-60">
                        {formatDate(level.createdDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handlePlay(level)}
                            title={t('customLevels.play')}
                            className="px-3 py-1.5 rounded-none bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter"
                          >
                            <FaPlay size={10} /> {t('customLevels.play')}
                          </button>
                          <button
                            onClick={() => handleEdit(level)}
                            title={t('customLevels.edit')}
                            className="px-3 py-1.5 rounded-none bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter"
                          >
                            <FaEdit size={10} /> {t('customLevels.edit')}
                          </button>
                          <button
                            onClick={() => handleExport(level)}
                            title={t('customLevels.export')}
                            className="px-3 py-1.5 rounded-none bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter"
                          >
                            <FaFileExport size={10} /> {t('customLevels.export')}
                          </button>
                          <button
                            onClick={() => handleDelete(level.id)}
                            title={t('customLevels.delete')}
                            className="px-3 py-1.5 rounded-none bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter"
                          >
                            <FaTrash size={10} /> {t('customLevels.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomLevelsViewer;
