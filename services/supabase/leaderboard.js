import { supabase } from './client.js';
import { DB_CONFIG } from '../../utils/constants.js';

// Servicios del leaderboard
export const leaderboardService = {
  // Cargar leaderboard
  loadLeaderboard: async () => {
    try {
      const { data, error } = await supabase
        .rpc(DB_CONFIG.RPC_FUNCTIONS.GET_LEADERBOARD);

      if (error) throw error;

      return { success: true, leaderboard: data || [] };
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener ranking de un usuario específico
  getUserRank: async (profileId) => {
    try {
      const { data, error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PROFILES)
        .select('profile_id, profile_name, avatar_emoji, current_level, total_problems_lifetime')
        .order('total_problems_lifetime', { ascending: false });

      if (error) throw error;

      const userIndex = data.findIndex(user => user.profile_id === profileId);
      const rank = userIndex !== -1 ? userIndex + 1 : null;

      return { success: true, rank, totalUsers: data.length };
    } catch (error) {
      console.error('Error getting user rank:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener top usuarios por categoría
  getTopUsers: async (limit = 10, category = null) => {
    try {
      let query = supabase
        .from(DB_CONFIG.TABLES.USER_PROFILES)
        .select('profile_id, profile_name, avatar_emoji, current_level, total_problems_lifetime, average_speed_lifetime')
        .order('total_problems_lifetime', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('current_level', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, users: data || [] };
    } catch (error) {
      console.error('Error getting top users:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener estadísticas globales
  getGlobalStats: async () => {
    try {
      const { data, error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PROFILES)
        .select('total_problems_lifetime, average_speed_lifetime, current_level');

      if (error) throw error;

      const stats = {
        totalProblems: data.reduce((sum, user) => sum + (user.total_problems_lifetime || 0), 0),
        averageSpeed: data.reduce((sum, user) => sum + (user.average_speed_lifetime || 5), 0) / data.length,
        totalUsers: data.length,
        levelDistribution: {}
      };

      // Calcular distribución de niveles
      data.forEach(user => {
        const level = user.current_level || 1;
        stats.levelDistribution[level] = (stats.levelDistribution[level] || 0) + 1;
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting global stats:', error);
      return { success: false, error: error.message };
    }
  }
}; 