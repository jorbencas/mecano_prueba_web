import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { startActivity, endActivity, ActivityLog } from '../utils/activityTracker';

/**
 * Hook personalizado para rastrear la actividad del usuario
 * 
 * Este hook permite registrar cuánto tiempo pasa un usuario en cada componente
 * y guardar métricas de rendimiento (WPM, precisión, errores, etc.)
 * 
 * @param component - Nombre del componente (ej: 'SpeedMode', 'PlayGame')
 * @param activityType - Tipo de actividad (ej: 'speedMode', 'game')
 * @returns Objeto con funciones startTracking y stopTracking
 * 
 * @example
 * ```tsx
 * const { startTracking, stopTracking } = useActivityTracker('SpeedMode', 'speedMode');
 * 
 * // Al iniciar la actividad
 * const handleStart = () => {
 *   startTracking();
 * };
 * 
 * // Al finalizar, con metadatos opcionales
 * const handleFinish = () => {
 *   stopTracking({ wpm: 45, accuracy: 95, errors: 3, completed: true });
 * };
 * ```
 */
export const useActivityTracker = (
  component: string,
  activityType: ActivityLog['activityType']
) => {
  const { user } = useAuth();
  
  // Estado para guardar el ID de la actividad actual
  const [activityId, setActivityId] = useState<string | null>(null);
  
  // Estado para saber si estamos rastreando actualmente
  const [isTracking, setIsTracking] = useState(false);

  /**
   * Inicia el rastreo de una actividad
   * - Guarda el timestamp de inicio
   * - Genera un ID único para esta actividad
   */
  const startTracking = useCallback(() => {
    if (!user) return; // Solo rastrear usuarios autenticados
    if (isTracking) return; // Evitar iniciar si ya está rastreando

    // Crear actividad y obtener su ID
    const id = startActivity(user.email || user.id, activityType, component);
    setActivityId(id);
    setIsTracking(true);
  }, [user, activityType, component, isTracking]);

  /**
   * Detiene el rastreo y guarda los datos
   * 
   * @param metadata - Datos opcionales (WPM, precisión, errores, etc.)
   * 
   * Calcula automáticamente:
   * - Duración total (tiempo final - tiempo inicial)
   * - Guarda todo en localStorage
   */
  const stopTracking = useCallback((metadata?: ActivityLog['metadata']) => {
    if (!activityId) return; // No hay actividad para detener
    if (!isTracking) return; // No está rastreando

    // Finalizar actividad y guardar en localStorage
    endActivity(activityId, metadata);
    setActivityId(null);
    setIsTracking(false);
  }, [activityId, isTracking]);

  /**
   * Cleanup: Detener rastreo cuando el componente se desmonta
   * Esto evita memory leaks si el usuario cierra la página
   * mientras una actividad está en progreso
   */
  useEffect(() => {
    return () => {
      if (activityId && isTracking) {
        endActivity(activityId);
      }
    };
  }, [activityId, isTracking]);

  return {
    startTracking,
    stopTracking,
    isTracking,
  };
};
