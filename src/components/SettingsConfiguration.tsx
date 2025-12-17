import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FaCog, FaSave } from 'react-icons/fa';

interface UserPreferences {
  practice_duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  show_keyboard: boolean;
  sound_enabled: boolean;
  auto_advance: boolean;
  mode_preferences: {
    [key: string]: {
      wpm_goal?: number;
      accuracy_goal?: number;
      time_limit?: number;
    };
  };
}

const SettingsConfiguration: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    practice_duration: 15,
    difficulty: 'medium',
    show_keyboard: true,
    sound_enabled: false,
    auto_advance: false,
    mode_preferences: {}
  });
  const [selectedMode, setSelectedMode] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const modes = [
    { id: 'general', name: 'General' },
    { id: 'levels', name: 'Niveles' },
    { id: 'speed', name: 'Modo Velocidad' },
    { id: 'precision', name: 'Modo Precisión' },
    { id: 'zen', name: 'Modo Zen' },
    { id: 'numbers', name: 'Modo Números' },
    { id: 'symbols', name: 'Modo Símbolos' },
    { id: 'code', name: 'Modo Código' },
  ];

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user, loadPreferences]);

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/preferences/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          preferences
        })
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  const updateModePreference = (mode: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      mode_preferences: {
        ...prev.mode_preferences,
        [mode]: {
          ...prev.mode_preferences[mode],
          [key]: value
        }
      }
    }));
  };

  if (!user) {
    return (
      <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">⚙️ Configuración</h1>
          <p>Debes iniciar sesión para configurar tus preferencias</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaCog /> Configuración
          </h1>
          <button
            onClick={savePreferences}
            disabled={saving}
            className={`px-6 py-3 rounded font-bold flex items-center gap-2 ${
              saved ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
            } text-white disabled:opacity-50`}
          >
            <FaSave />
            {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar Cambios'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="font-bold mb-3">Secciones</h2>
            <div className="space-y-1">
              {modes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedMode === mode.id
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* General Settings */}
            {selectedMode === 'general' && (
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-2xl font-bold mb-4">Configuración General</h2>
                
                <div className="space-y-4">
                  {/* Practice Duration */}
                  <div>
                    <label className="block font-semibold mb-2">
                      Duración de práctica predeterminada (minutos)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={preferences.practice_duration}
                      onChange={(e) => setPreferences({...preferences, practice_duration: Number(e.target.value)})}
                      className="w-full"
                    />
                    <div className="text-sm opacity-75 mt-1">{preferences.practice_duration} minutos</div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block font-semibold mb-2">Dificultad predeterminada</label>
                    <select
                      value={preferences.difficulty}
                      onChange={(e) => setPreferences({...preferences, difficulty: e.target.value as any})}
                      className={`w-full p-2 rounded border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="easy">Fácil</option>
                      <option value="medium">Media</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>

                  {/* Show Keyboard */}
                  <div className="flex items-center justify-between">
                    <label className="font-semibold">Mostrar teclado virtual</label>
                    <input
                      type="checkbox"
                      checked={preferences.show_keyboard}
                      onChange={(e) => setPreferences({...preferences, show_keyboard: e.target.checked})}
                      className="w-6 h-6"
                    />
                  </div>

                  {/* Sound */}
                  <div className="flex items-center justify-between">
                    <label className="font-semibold">Sonidos activados</label>
                    <input
                      type="checkbox"
                      checked={preferences.sound_enabled}
                      onChange={(e) => setPreferences({...preferences, sound_enabled: e.target.checked})}
                      className="w-6 h-6"
                    />
                  </div>

                  {/* Auto Advance */}
                  <div className="flex items-center justify-between">
                    <label className="font-semibold">Avanzar automáticamente al siguiente nivel</label>
                    <input
                      type="checkbox"
                      checked={preferences.auto_advance}
                      onChange={(e) => setPreferences({...preferences, auto_advance: e.target.checked})}
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode-Specific Settings */}
            {selectedMode !== 'general' && (
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-2xl font-bold mb-4">
                  Configuración de {modes.find(m => m.id === selectedMode)?.name}
                </h2>
                
                <div className="space-y-4">
                  {/* WPM Goal */}
                  <div>
                    <label className="block font-semibold mb-2">Objetivo de WPM</label>
                    <input
                      type="number"
                      min="20"
                      max="150"
                      value={preferences.mode_preferences[selectedMode]?.wpm_goal || 60}
                      onChange={(e) => updateModePreference(selectedMode, 'wpm_goal', Number(e.target.value))}
                      className={`w-full p-2 rounded border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  {/* Accuracy Goal */}
                  <div>
                    <label className="block font-semibold mb-2">Objetivo de Precisión (%)</label>
                    <input
                      type="number"
                      min="80"
                      max="100"
                      value={preferences.mode_preferences[selectedMode]?.accuracy_goal || 95}
                      onChange={(e) => updateModePreference(selectedMode, 'accuracy_goal', Number(e.target.value))}
                      className={`w-full p-2 rounded border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  {/* Time Limit */}
                  <div>
                    <label className="block font-semibold mb-2">Límite de tiempo (segundos, 0 = sin límite)</label>
                    <input
                      type="number"
                      min="0"
                      max="600"
                      step="30"
                      value={preferences.mode_preferences[selectedMode]?.time_limit || 0}
                      onChange={(e) => updateModePreference(selectedMode, 'time_limit', Number(e.target.value))}
                      className={`w-full p-2 rounded border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className={`p-4 rounded ${isDarkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-100'}`}>
              <h3 className="font-bold mb-2">ℹ️ Información</h3>
              <p className="text-sm opacity-90">
                Estas configuraciones se guardarán en tu perfil y se aplicarán automáticamente cuando practiques.
                Puedes cambiarlas en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsConfiguration;
