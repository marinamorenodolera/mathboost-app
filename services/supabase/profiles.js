import { supabase } from './client.js';
import { DB_CONFIG } from '../../utils/constants.js';

// Servicios de perfiles de usuario
export const profileService = {
  // Cargar perfiles de un usuario
  loadUserProfiles: async (userId) => {
    try {
      const { data, error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PROFILES)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Convertir array a objeto con profile_id como key
      const profilesObject = {};
      data.forEach(profile => {
        profilesObject[profile.profile_id] = {
          ...profile,
          name: profile.profile_name,
          avatar: profile.avatar_emoji,
          currentLevel: profile.current_level,
          // Valores por defecto para campos faltantes
          practiceHeatmap: [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
          ],
          activityPatterns: {
            bestDays: [],
            bestHours: [],
            avgSessionLength: '0 min',
            preferredDifficulty: 'Principiante'
          },
          commonMistakes: {},
          strengths: [],
          weaknesses: [],
          notificationPreferences: {
            enabled: true,
            frequency: 'daily',
            bestTime: '18:00',
            motivationStyle: 'encouraging'
          }
        };
      });

      return { success: true, profiles: profilesObject };
    } catch (error) {
      console.error('Error loading user profiles:', error);
      return { success: false, error: error.message };
    }
  },

  // Crear nuevo perfil
  createProfile: async (profileData) => {
    try {
      const { data, error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PROFILES)
        .insert([{
          user_id: profileData.userId,
          profile_name: profileData.name,
          avatar_emoji: profileData.avatar,
          current_level: 1,
          total_problems_lifetime: 0,
          total_problems_this_week: 0,
          average_speed_lifetime: 5.0,
          average_speed_this_week: 5.0,
          best_speed_lifetime: 5.0,
          best_speed_this_week: 5.0,
          current_streak: 0,
          longest_streak: 0,
          last_practice_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, profile: data };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar perfil
  updateProfile: async (profileId, updates) => {
    try {
      const { data, error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PROFILES)
        .update(updates)
        .eq('profile_id', profileId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, profile: data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar perfil
  deleteProfile: async (profileId) => {
    try {
      const { error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PROFILES)
        .delete()
        .eq('profile_id', profileId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener perfil por ID
  getProfileById: async (profileId) => {
    try {
      const { data, error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PROFILES)
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error) throw error;

      return { success: true, profile: data };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar estadísticas del perfil
  updateProfileStats: async (profileId, stats) => {
    try {
      const { data, error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PROFILES)
        .update({
          total_problems_lifetime: stats.totalProblems,
          total_problems_this_week: stats.weeklyProblems,
          average_speed_lifetime: stats.avgSpeed,
          average_speed_this_week: stats.weeklyAvgSpeed,
          best_speed_lifetime: stats.bestSpeed,
          best_speed_this_week: stats.weeklyBestSpeed,
          current_streak: stats.currentStreak,
          longest_streak: stats.longestStreak,
          last_practice_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', profileId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, profile: data };
    } catch (error) {
      console.error('Error updating profile stats:', error);
      return { success: false, error: error.message };
    }
  }
}; 