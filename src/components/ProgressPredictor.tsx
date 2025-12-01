import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../api/stats';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaChartLine, FaCalendar, FaFlag } from 'react-icons/fa';

interface Prediction {
  targetWPM: number;
  currentWPM: number;
  estimatedDays: number;
  confidence: number;
  milestones: { wpm: number; days: number }[];
}

const ProgressPredictor: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [targetWPM, setTargetWPM] = useState(80);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    predictProgress();
  }, [user, targetWPM]);

  const predictProgress = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await statsAPI.get(token, user.id);
      
      // Calculate improvement rate
      const progression = data.wpmProgression;
      if (progression.length < 5) {
        setLoading(false);
        return;
      }

      // Linear regression to estimate improvement rate
      const n = progression.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      
      progression.forEach((point: any, index: number) => {
        sumX += index;
        sumY += point.avg_wpm;
        sumXY += index * point.avg_wpm;
        sumX2 += index * index;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Predict days to reach target
      const currentWPM = data.overall.avg_wpm;
      const wpmToGain = targetWPM - currentWPM;
      const daysNeeded = slope > 0 ? Math.ceil(wpmToGain / slope) : -1;

      // Generate milestones
      const milestones = [];
      const step = wpmToGain / 4;
      for (let i = 1; i <= 4; i++) {
        const milestoneWPM = currentWPM + (step * i);
        const milestoneDays = slope > 0 ? Math.ceil((step * i) / slope) : -1;
        milestones.push({
          wpm: Math.round(milestoneWPM),
          days: milestoneDays
        });
      }

      // Calculate confidence based on consistency
      const variance = progression.reduce((sum: number, point: any) => {
        const predicted = intercept + slope * progression.indexOf(point);
        return sum + Math.pow(point.avg_wpm - predicted, 2);
      }, 0) / n;
      
      const confidence = Math.max(0, Math.min(100, 100 - (variance / currentWPM) * 100));

      setPrediction({
        targetWPM,
        currentWPM: Math.round(currentWPM),
        estimatedDays: daysNeeded,
        confidence: Math.round(confidence),
        milestones
      });
    } catch (error) {
      console.error('Error predicting progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Debes iniciar sesión para ver predicciones</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Calculando predicciones...</p>
      </div>
    );
  }

  if (!prediction || prediction.estimatedDays < 0) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <h2 className="text-2xl font-bold mb-4">📈 Predictor de Progreso</h2>
        <p className="opacity-75">
          Necesitas más datos de práctica para generar predicciones precisas. Sigue practicando!
        </p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaChartLine /> Predictor de Progreso
      </h2>

      {/* Target Selector */}
      <div className="mb-6">
        <label htmlFor="target-wpm" className="block mb-2 font-semibold">Establece tu objetivo de WPM:</label>
        <input
          id="target-wpm"
          type="range"
          min={prediction.currentWPM + 5}
          max={150}
          value={targetWPM}
          onChange={(e) => setTargetWPM(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm opacity-75 mt-1">
          <span>{prediction.currentWPM + 5} WPM</span>
          <span className="font-bold text-blue-500">{targetWPM} WPM</span>
          <span>150 WPM</span>
        </div>
      </div>

      {/* Prediction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaFlag className="text-blue-500" />
            <span className="font-semibold">Objetivo</span>
          </div>
          <div className="text-3xl font-bold">{targetWPM} WPM</div>
          <div className="text-sm opacity-75">+{targetWPM - prediction.currentWPM} desde ahora</div>
        </div>

        <div className={`p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaCalendar className="text-green-500" />
            <span className="font-semibold">Tiempo Estimado</span>
          </div>
          <div className="text-3xl font-bold">{prediction.estimatedDays} días</div>
          <div className="text-sm opacity-75">
            {Math.ceil(prediction.estimatedDays / 7)} semanas aprox.
          </div>
        </div>

        <div className={`p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-purple-500" />
            <span className="font-semibold">Confianza</span>
          </div>
          <div className="text-3xl font-bold">{prediction.confidence}%</div>
          <div className="text-sm opacity-75">
            {prediction.confidence > 70 ? 'Alta precisión' : 
             prediction.confidence > 50 ? 'Media precisión' : 
             'Baja precisión'}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-3">🎯 Hitos del Camino</h3>
        <div className="space-y-3">
          {prediction.milestones.map((milestone, index) => (
            <div
              key={index}
              className={`p-3 rounded flex items-center justify-between ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-blue-500' :
                  index === 1 ? 'bg-green-500' :
                  index === 2 ? 'bg-yellow-500' :
                  'bg-purple-500'
                } text-white`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold">{milestone.wpm} WPM</div>
                  <div className="text-sm opacity-75">Hito {index + 1}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{milestone.days} días</div>
                <div className="text-sm opacity-75">{Math.ceil(milestone.days / 7)} semanas</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className={`p-4 rounded ${isDarkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-100'}`}>
        <h3 className="font-bold mb-2">💡 Consejos para Alcanzar tu Objetivo</h3>
        <ul className="space-y-1 text-sm opacity-90">
          <li>• Practica al menos 20 minutos diarios de forma consistente</li>
          <li>• Enfócate en la precisión antes que en la velocidad</li>
          <li>• Varía entre diferentes modos de práctica</li>
          <li>• Descansa cuando sientas fatiga para evitar malos hábitos</li>
          <li>• Revisa regularmente tus estadísticas y ajusta tu práctica</li>
        </ul>
      </div>
    </div>
  );
};

export default ProgressPredictor;
