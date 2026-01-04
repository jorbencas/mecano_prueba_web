import React, { useState, useEffect } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../api/stats';

interface KeyStats {
  key: string;
  count: number;
  errors: number;
  avgSpeed: number;
}

const HeatMap: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [keyStats, setKeyStats] = useState<KeyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKeyStats();
  }, [user]);

  const loadKeyStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await statsAPI.get(token, user.id);
      
      // Analyze key performance from recent sessions
      const keyMap = new Map<string, { count: number; errors: number; totalSpeed: number }>();
      
      data.recent.forEach((session: any) => {
        if (session.metadata?.keystrokes) {
          session.metadata.keystrokes.forEach((keystroke: any) => {
            const existing = keyMap.get(keystroke.key) || { count: 0, errors: 0, totalSpeed: 0 };
            keyMap.set(keystroke.key, {
              count: existing.count + 1,
              errors: existing.errors + (keystroke.error ? 1 : 0),
              totalSpeed: existing.totalSpeed + (keystroke.speed || 0)
            });
          });
        }
      });

      const stats = Array.from(keyMap.entries()).map(([key, data]) => ({
        key,
        count: data.count,
        errors: data.errors,
        avgSpeed: data.count > 0 ? data.totalSpeed / data.count : 0
      }));

      setKeyStats(stats);
    } catch (error) {
      console.error('Error loading key stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKeyColor = (key: string) => {
    const stat = keyStats.find(s => s.key === key);
    if (!stat) return isDarkMode ? '#374151' : '#e5e7eb';
    
    const errorRate = stat.errors / stat.count;
    if (errorRate > 0.2) return '#ef4444'; // Red - high error rate
    if (errorRate > 0.1) return '#f59e0b'; // Orange - medium error rate
    if (errorRate > 0.05) return '#eab308'; // Yellow - low error rate
    return '#10b981'; // Green - very low error rate
  };

  const keyboardLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-']
  ];

  if (!user) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Debes iniciar sesión para ver el mapa de calor</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Cargando mapa de calor...</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-2xl font-bold mb-4">🔥 Mapa de Calor del Teclado</h2>
      <p className="mb-6 opacity-75">
        Visualiza tu rendimiento por tecla. Verde = excelente, Amarillo = mejorable, Rojo = necesita práctica
      </p>

      <div className="space-y-2 mb-6">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((key) => {
              const stat = keyStats.find(s => s.key.toLowerCase() === key);
              const errorRate = stat ? (stat.errors / stat.count) * 100 : 0;
              
              return (
                <div
                  key={key}
                  className="relative group"
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: getKeyColor(key),
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                >
                  {key.toUpperCase()}
                  
                  {/* Tooltip */}
                  {stat && (
                    <div className={`absolute bottom-full mb-2 hidden group-hover:block z-10 p-2 rounded text-sm whitespace-nowrap ${
                      isDarkMode ? 'bg-gray-900' : 'bg-gray-800'
                    } text-white`}>
                      <div>Pulsaciones: {stat.count}</div>
                      <div>Errores: {stat.errors} ({errorRate.toFixed(1)}%)</div>
                      <div>Velocidad: {stat.avgSpeed.toFixed(0)} ms</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span>Excelente (&lt;5% errores)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
          <span>Bueno (5-10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Mejorable (10-20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Necesita práctica (&gt;20%)</span>
        </div>
      </div>

      {/* Top Problem Keys */}
      {keyStats.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">Teclas con más errores</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {keyStats
              .filter(s => s.count > 10)
              .sort((a, b) => (b.errors / b.count) - (a.errors / a.count))
              .slice(0, 8)
              .map((stat) => (
                <div key={stat.key} className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="text-2xl font-bold text-center mb-1">{stat.key.toUpperCase()}</div>
                  <div className="text-sm text-center opacity-75">
                    {((stat.errors / stat.count) * 100).toFixed(1)}% errores
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatMap;
