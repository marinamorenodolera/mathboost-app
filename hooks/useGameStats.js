import { useState, useEffect, useCallback } from 'react';
import { getProfileStats, getProfileGameHistory } from '../services/supabase/gameProgress.js';

export const useGameStats = (profileId) => {
  const [stats, setStats] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar estadísticas del perfil
  const loadStats = useCallback(async () => {
    if (!profileId) {
      setError('No hay perfil de usuario disponible');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas del perfil
      const statsResult = await getProfileStats(profileId);
      if (statsResult.success) {
        setStats(statsResult.stats);
      } else {
        setError(statsResult.error);
      }

      // Cargar historial de juegos
      const historyResult = await getProfileGameHistory(profileId, 10);
      if (historyResult.success) {
        setGameHistory(historyResult.sessions);
      }

    } catch (error) {
      console.error('Error loading game stats:', error);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // Recargar estadísticas
  const refreshStats = useCallback(() => {
    loadStats();
  }, [loadStats]);

  // Cargar estadísticas al cambiar el perfil
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Calcular estadísticas adicionales
  const calculatedStats = stats ? {
    ...stats,
    accuracy: stats.total_problems_solved > 0 
      ? (stats.total_correct_answers / stats.total_problems_solved * 100).toFixed(1)
      : 0,
    average_problems_per_session: stats.total_problems_solved > 0 
      ? Math.round(stats.total_problems_solved / Math.max(1, stats.total_sessions || 1))
      : 0,
    total_play_time_hours: Math.round(stats.total_play_time / 3600 * 10) / 10,
    average_score_per_session: stats.total_sessions > 0 
      ? Math.round(stats.total_score / stats.total_sessions)
      : 0
  } : null;

  return {
    // Estado
    stats: calculatedStats,
    gameHistory,
    loading,
    error,
    
    // Acciones
    loadStats,
    refreshStats
  };
}; 