import { useState, useEffect, useCallback } from 'react';
import { leaderboardService } from '../services/supabase/leaderboard.js';

// Hook del leaderboard
export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);

  // Cargar leaderboard
  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await leaderboardService.loadLeaderboard();
      
      if (result.success) {
        setLeaderboard(result.leaderboard);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas globales
  const loadGlobalStats = useCallback(async () => {
    try {
      const result = await leaderboardService.getGlobalStats();
      
      if (result.success) {
        setGlobalStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading global stats:', error);
    }
  }, []);

  // Obtener ranking de un usuario
  const getUserRank = useCallback(async (profileId) => {
    try {
      const result = await leaderboardService.getUserRank(profileId);
      return result;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Obtener top usuarios
  const getTopUsers = useCallback(async (limit = 10, category = null) => {
    try {
      const result = await leaderboardService.getTopUsers(limit, category);
      return result;
    } catch (error) {
      console.error('Error getting top users:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadLeaderboard();
    loadGlobalStats();
  }, [loadLeaderboard, loadGlobalStats]);

  // Función para obtener emoji de ranking
  const getRankEmoji = useCallback((rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    if (rank <= 50) return '⭐';
    return '👤';
  }, []);

  // Función para formatear números
  const formatNumber = useCallback((number) => {
    return number.toLocaleString();
  }, []);

  // Función para obtener nivel de un usuario
  const getUserLevel = useCallback((user) => {
    return user?.current_level || 1;
  }, []);

  return {
    // Estado
    leaderboard,
    loading,
    error,
    globalStats,
    
    // Acciones
    loadLeaderboard,
    loadGlobalStats,
    getUserRank,
    getTopUsers,
    
    // Utilidades
    getRankEmoji,
    formatNumber,
    getUserLevel
  };
}; 