import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../api/stats';
import { FaExclamationTriangle, FaLightbulb, FaChartBar } from 'react-icons/fa';

interface Pattern {
  type: 'common_error' | 'slow_combination' | 'accuracy_drop';
  description: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
}

const PatternAnalysis: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzePatterns();
  }, [user]);

  const analyzePatterns = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await statsAPI.get(token, user.id);
      const detectedPatterns: Pattern[] = [];

      // Analyze accuracy trends
      if (data.overall.avg_accuracy < 90) {
        detectedPatterns.push({
          type: 'accuracy_drop',
          description: 'Tu precisión promedio está por debajo del 90%',
          frequency: 100 - data.overall.avg_accuracy,
          impact: 'high',
          suggestion: 'Practica más despacio enfocándote en la precisión antes que en la velocidad'
        });
      }

      // Analyze WPM consistency
      const wpmVariance = data.wpmProgression.reduce((sum: number, day: any) => {
        return sum + Math.abs(day.avg_wpm - data.overall.avg_wpm);
      }, 0) / data.wpmProgression.length;

      if (wpmVariance > 15) {
        detectedPatterns.push({
          type: 'common_error',
          description: 'Tu velocidad varía mucho entre sesiones',
          frequency: wpmVariance,
          impact: 'medium',
          suggestion: 'Mantén un ritmo constante y practica regularmente para mejorar la consistencia'
        });
      }

      // Analyze mode-specific performance
      const modePerformance = data.byMode.map((mode: any) => ({
        mode: mode.mode,
        wpm: mode.avg_wpm,
        accuracy: mode.avg_accuracy
      }));

      const weakestMode = modePerformance.reduce((min: any, current: any) => 
        current.wpm < min.wpm ? current : min
      , modePerformance[0]);

      if (weakestMode && weakestMode.wpm < data.overall.avg_wpm - 10) {
        detectedPatterns.push({
          type: 'slow_combination',
          description: `El modo "${weakestMode.mode}" es tu punto más débil`,
          frequency: data.overall.avg_wpm - weakestMode.wpm,
          impact: 'medium',
          suggestion: `Dedica más tiempo a practicar ${weakestMode.mode} para equilibrar tu rendimiento`
        });
      }

      // Analyze practice frequency
      const recentDays = new Set(data.wpmProgression.map((d: any) => 
        new Date(d.date).toDateString()
      ));
      
      if (recentDays.size < 7) {
        detectedPatterns.push({
          type: 'common_error',
          description: 'Practicas menos de 7 días a la semana',
          frequency: 7 - recentDays.size,
          impact: 'low',
          suggestion: 'La práctica diaria mejorará significativamente tu progreso'
        });
      }

      setPatterns(detectedPatterns);
    } catch (error) {
      console.error('Error analyzing patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactBg = (impact: string) => {
    switch (impact) {
      case 'high': return isDarkMode ? 'bg-red-900' : 'bg-red-100';
      case 'medium': return isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100';
      case 'low': return isDarkMode ? 'bg-blue-900' : 'bg-blue-100';
      default: return isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Debes iniciar sesión para ver el análisis de patrones</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Analizando patrones...</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaChartBar /> Análisis de Patrones
      </h2>
      <p className="mb-6 opacity-75">
        Identificamos patrones en tu mecanografía para ayudarte a mejorar
      </p>

      {patterns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl mb-2">🎉 ¡Excelente trabajo!</p>
          <p className="opacity-75">No hemos detectado patrones problemáticos en tu mecanografía</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patterns.map((pattern, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${getImpactBg(pattern.impact)}`}
            >
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className={`text-2xl mt-1 ${getImpactColor(pattern.impact)}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{pattern.description}</h3>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getImpactColor(pattern.impact)}`}>
                      {pattern.impact === 'high' ? 'Alta prioridad' : 
                       pattern.impact === 'medium' ? 'Media prioridad' : 
                       'Baja prioridad'}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2 mt-3">
                    <FaLightbulb className="text-yellow-500 mt-1" />
                    <p className="opacity-90">{pattern.suggestion}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className={`mt-6 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className="font-bold mb-2">Resumen del Análisis</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-500">
              {patterns.filter(p => p.impact === 'high').length}
            </div>
            <div className="text-sm opacity-75">Alta prioridad</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {patterns.filter(p => p.impact === 'medium').length}
            </div>
            <div className="text-sm opacity-75">Media prioridad</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">
              {patterns.filter(p => p.impact === 'low').length}
            </div>
            <div className="text-sm opacity-75">Baja prioridad</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternAnalysis;
