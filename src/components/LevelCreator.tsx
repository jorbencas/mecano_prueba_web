import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { FaSave, FaDownload } from 'react-icons/fa';
import InstruccionesButton from './Instrucciones';

const LevelCreator: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  
  const [levelName, setLevelName] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [speed, setSpeed] = useState(1000);
  const [errorLimit, setErrorLimit] = useState(5);
  const [wpmGoal, setWpmGoal] = useState(60);

  const allKeys = 'abcdefghijklmnñopqrstuvwxyz0123456789'.split('');

  const toggleKey = (key: string) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const saveLevel = () => {
    const level = {
      id: Date.now().toString(),
      name: levelName || 'Nivel Personalizado',
      keys: selectedKeys,
      speed,
      errorLimit,
      wpmGoal,
      createdDate: new Date().toISOString(),
    };

    const saved = localStorage.getItem('customLevels');
    const levels = saved ? JSON.parse(saved) : [];
    levels.push(level);
    localStorage.setItem('customLevels', JSON.stringify(levels));
    
    alert(t('levelCreator.saved', 'Nivel guardado correctamente'));
    resetForm();
  };

  const exportLevel = () => {
    const level = {
      name: levelName,
      keys: selectedKeys,
      speed,
      errorLimit,
      wpmGoal,
    };
    
    const dataStr = JSON.stringify(level, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${levelName || 'nivel'}.json`;
    link.click();
  };

  const resetForm = () => {
    setLevelName('');
    setSelectedKeys([]);
    setSpeed(1000);
    setErrorLimit(5);
    setWpmGoal(60);
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('levelCreator.title', 'Creador de Niveles')}</h1>
        
        {/* Instructions */}
        <div className="mb-6">
          <InstruccionesButton
            instructions={t('levelCreator.instructions', 
              'El Creador de Niveles te permite diseñar tus propios ejercicios de mecanografía personalizados. ' +
              'Selecciona las teclas que quieres practicar, establece la velocidad, el límite de errores y el objetivo de WPM. ' +
              'Puedes guardar tus niveles para practicar más tarde o exportarlos para compartirlos. ' +
              'Esto es ideal para practicar combinaciones específicas de teclas o para crear ejercicios adaptados a tus necesidades.'
            )}
            source="LevelCreator"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <div className={`lg:col-span-1 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4">{t('levelCreator.settings', 'Configuración')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2">{t('levelCreator.name', 'Nombre del Nivel')}</label>
                <input
                  type="text"
                  value={levelName}
                  onChange={(e) => setLevelName(e.target.value)}
                  className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                  placeholder={t('levelCreator.namePlaceholder', 'Mi Nivel Personalizado')}
                />
              </div>

              <div>
                <label className="block mb-2">{t('levelCreator.speed', 'Velocidad')} (ms)</label>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                  min="500"
                  max="2000"
                  step="100"
                />
              </div>

              <div>
                <label className="block mb-2">{t('levelCreator.errorLimit', 'Límite de Errores')}</label>
                <input
                  type="number"
                  value={errorLimit}
                  onChange={(e) => setErrorLimit(parseInt(e.target.value))}
                  className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="block mb-2">{t('levelCreator.wpmGoal', 'Objetivo WPM')}</label>
                <input
                  type="number"
                  value={wpmGoal}
                  onChange={(e) => setWpmGoal(parseInt(e.target.value))}
                  className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                  min="20"
                  max="150"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveLevel}
                  disabled={selectedKeys.length === 0}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave className="inline mr-2" />
                  {t('levelCreator.save', 'Guardar')}
                </button>
                <button
                  onClick={exportLevel}
                  disabled={selectedKeys.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaDownload className="inline mr-2" />
                  {t('levelCreator.export', 'Exportar')}
                </button>
              </div>
            </div>
          </div>

          {/* Key Selector */}
          <div className={`lg:col-span-2 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4">
              {t('levelCreator.selectKeys', 'Selecciona Teclas')} ({selectedKeys.length})
            </h2>
            
            <div className="grid grid-cols-10 gap-2">
              {allKeys.map(key => (
                <button
                  key={key}
                  onClick={() => toggleKey(key)}
                  className={`p-4 rounded font-mono text-xl transition-all ${
                    selectedKeys.includes(key)
                      ? 'bg-blue-500 text-white scale-110 shadow-lg'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {selectedKeys.length > 0 && (
              <div className="mt-6 p-4 bg-blue-500 bg-opacity-20 rounded">
                <h3 className="font-bold mb-2">{t('levelCreator.preview', 'Vista Previa')}</h3>
                <p className="text-sm">
                  {t('levelCreator.previewText', 'Este nivel practicará las teclas')}: <span className="font-mono font-bold">{selectedKeys.join(', ')}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelCreator;
