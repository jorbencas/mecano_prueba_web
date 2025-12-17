import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../api/stats';
import { FaRocket, FaBullseye, FaClock } from 'react-icons/fa';

interface Recommendation {
  title: string;
  description: string;
  mode: string;
  priority: number;
  estimatedImprovement: string;
}

const RecommendationEngine: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const generateRecommendations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await statsAPI.get(token, user.id);
      const recs: Recommendation[] = [];

      // Recommendation 1: Focus on weakest mode
      if (data.byMode.length > 0) {
        const weakestMode = data.byMode.reduce((min: any, current: any) => 
          current.avg_wpm < min.avg_wpm ? current : min
        );

        recs.push({
          title: `Mejora tu rendimiento en ${weakestMode.mode}`,
          description: `Tu WPM en ${weakestMode.mode} (${Math.round(weakestMode.avg_wpm)}) está por debajo de tu promedio general (${Math.round(data.overall.avg_wpm)}). Dedica 15 minutos diarios a este modo.`,
          mode: weakestMode.mode,
          priority: 1,
          estimatedImprovement: '+10 WPM en 2 semanas'
        });
      }

      // Recommendation 2: Accuracy improvement
      if (data.overall.avg_accuracy < 95) {
        recs.push({
          title: 'Enfócate en la precisión',
          description: `Tu precisión actual es del ${data.overall.avg_accuracy.toFixed(1)}%. Practica más despacio y enfócate en escribir correctamente antes de aumentar la velocidad.`,
          mode: 'PrecisionMode',
          priority: data.overall.avg_accuracy < 90 ? 1 : 2,
          estimatedImprovement: '+5% precisión en 1 semana'
        });
      }

      // Recommendation 3: Speed improvement
      if (data.overall.avg_wpm < 60 && data.overall.avg_accuracy > 90) {
        recs.push({
          title: 'Aumenta tu velocidad',
          description: 'Tu precisión es buena. Es momento de trabajar en la velocidad. Usa el modo velocidad con textos cortos.',
          mode: 'SpeedMode',
          priority: 2,
          estimatedImprovement: '+15 WPM en 3 semanas'
        });
      }

      // Recommendation 4: Practice consistency
      const recentDays = new Set(data.wpmProgression.map((d: any) => 
        new Date(d.date).toDateString()
      ));
      
      if (recentDays.size < 20) {
        recs.push({
          title: 'Practica más regularmente',
          description: 'La consistencia es clave. Intenta practicar al menos 20 minutos cada día para ver mejoras significativas.',
          mode: 'FreePractice',
          priority: 3,
          estimatedImprovement: 'Mejora general del 30%'
        });
      }

      // Recommendation 5: Advanced techniques
      if (data.overall.avg_wpm > 60 && data.overall.avg_accuracy > 95) {
        recs.push({
          title: 'Practica técnicas avanzadas',
          description: 'Estás listo para desafíos más complejos. Prueba el modo código o dictado para mejorar tu versatilidad.',
          mode: 'CodeMode',
          priority: 2,
          estimatedImprovement: 'Habilidades avanzadas'
        });
      }

      // Sort by priority
      recs.sort((a, b) => a.priority - b.priority);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user, generateRecommendations]);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'border-red-500';
      case 2: return 'border-yellow-500';
      case 3: return 'border-blue-500';
      default: return 'border-gray-500';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Alta';
      case 2: return 'Media';
      case 3: return 'Baja';
      default: return 'Normal';
    }
  };

  if (!user) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Debes iniciar sesión para ver recomendaciones</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Generando recomendaciones personalizadas...</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaRocket /> Recomendaciones Personalizadas
      </h2>
      <p className="mb-6 opacity-75">
        Basadas en tu rendimiento, te sugerimos estos pasos para mejorar
      </p>

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl mb-2">🎯 ¡Estás en el camino correcto!</p>
          <p className="opacity-75">Sigue practicando para recibir recomendaciones personalizadas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-5 rounded-lg border-l-4 ${getPriorityColor(rec.priority)} ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FaBullseye className="text-blue-500" />
                  {rec.title}
                </h3>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  rec.priority === 1 ? 'bg-red-500 bg-opacity-20 text-red-500' :
                  rec.priority === 2 ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                  'bg-blue-500 bg-opacity-20 text-blue-500'
                }`}>
                  Prioridad {getPriorityLabel(rec.priority)}
                </span>
              </div>
              
              <p className="mb-3 opacity-90">{rec.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm opacity-75">
                  <FaClock />
                  <span>{rec.estimatedImprovement}</span>
                </div>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">
                  Practicar {rec.mode}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Plan */}
      {recommendations.length > 0 && (
        <div className={`mt-6 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h3 className="font-bold mb-3">📋 Plan de Acción Sugerido</h3>
          <ol className="space-y-2">
            {recommendations.slice(0, 3).map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="font-bold text-blue-500">{index + 1}.</span>
                <span>{rec.title} - {rec.estimatedImprovement}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default RecommendationEngine;
