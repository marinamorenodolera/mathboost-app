import { supabase } from './client.js';

// Servicio para manejar el progreso del juego en Supabase

// Guardar sesión de juego completada
export const saveGameSession = async (sessionData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('game_sessions')
      .insert([
        {
          user_id: user.id,
          profile_id: sessionData.profileId,
          session_date: new Date().toISOString(),
          duration_seconds: sessionData.duration,
          total_problems: sessionData.totalProblems,
          correct_answers: sessionData.correctAnswers,
          incorrect_answers: sessionData.incorrectAnswers,
          total_score: sessionData.totalScore,
          average_time: sessionData.averageTime,
          fastest_answer: sessionData.fastestAnswer,
          slowest_answer: sessionData.slowestAnswer,
          level_played: sessionData.level,
          problems_solved: sessionData.problemsSolved || []
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving game session:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Game session saved:', data);
    return { success: true, session: data };
  } catch (error) {
    console.error('❌ Unexpected error saving game session:', error);
    return { success: false, error: 'Error inesperado al guardar la sesión' };
  }
};

// Actualizar estadísticas del perfil
export const updateProfileStats = async (profileId, statsData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Obtener estadísticas actuales
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current profile:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Calcular nuevas estadísticas
    const newStats = {
      total_problems_solved: (currentProfile.total_problems_solved || 0) + statsData.totalProblems,
      total_correct_answers: (currentProfile.total_correct_answers || 0) + statsData.correctAnswers,
      total_incorrect_answers: (currentProfile.total_incorrect_answers || 0) + statsData.incorrectAnswers,
      total_score: (currentProfile.total_score || 0) + statsData.totalScore,
      total_play_time: (currentProfile.total_play_time || 0) + statsData.duration,
      average_response_time: calculateNewAverage(
        currentProfile.average_response_time || 0,
        currentProfile.total_correct_answers || 0,
        statsData.averageTime,
        statsData.correctAnswers
      ),
      fastest_response_time: Math.min(
        currentProfile.fastest_response_time || Infinity,
        statsData.fastestAnswer
      ),
      current_streak: calculateNewStreak(currentProfile.current_streak || 0, statsData),
      longest_streak: Math.max(
        currentProfile.longest_streak || 0,
        calculateNewStreak(currentProfile.current_streak || 0, statsData)
      ),
      last_played: new Date().toISOString()
    };

    // Actualizar perfil
    const { data, error } = await supabase
      .from('user_profiles')
      .update(newStats)
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating profile stats:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Profile stats updated:', data);
    return { success: true, profile: data };
  } catch (error) {
    console.error('❌ Unexpected error updating profile stats:', error);
    return { success: false, error: 'Error inesperado al actualizar estadísticas' };
  }
};

// Calcular nuevo promedio
const calculateNewAverage = (currentAvg, currentCount, newAvg, newCount) => {
  if (currentCount + newCount === 0) return 0;
  return ((currentAvg * currentCount) + (newAvg * newCount)) / (currentCount + newCount);
};

// Calcular nueva racha
const calculateNewStreak = (currentStreak, sessionData) => {
  // Si la precisión es alta (>80%), incrementar racha
  const accuracy = sessionData.correctAnswers / sessionData.totalProblems;
  if (accuracy >= 0.8) {
    return currentStreak + 1;
  }
  // Si la precisión es baja (<50%), resetear racha
  if (accuracy < 0.5) {
    return 0;
  }
  // Mantener racha actual
  return currentStreak;
};

// Obtener historial de sesiones de un perfil
export const getProfileGameHistory = async (profileId, limit = 10) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .order('session_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching game history:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Game history fetched:', data);
    return { success: true, sessions: data };
  } catch (error) {
    console.error('❌ Unexpected error fetching game history:', error);
    return { success: false, error: 'Error inesperado al obtener historial' };
  }
};

// Obtener estadísticas completas de un perfil
export const getProfileStats = async (profileId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('❌ Error fetching profile stats:', error);
      return { success: false, error: error.message };
    }

    // Calcular estadísticas adicionales
    const stats = {
      ...data,
      accuracy: data.total_problems_solved > 0 
        ? (data.total_correct_answers / data.total_problems_solved * 100).toFixed(1)
        : 0,
      average_problems_per_session: data.total_problems_solved > 0 
        ? Math.round(data.total_problems_solved / Math.max(1, data.total_sessions || 1))
        : 0,
      total_sessions: data.total_sessions || 0
    };

    console.log('✅ Profile stats fetched:', stats);
    return { success: true, stats };
  } catch (error) {
    console.error('❌ Unexpected error fetching profile stats:', error);
    return { success: false, error: 'Error inesperado al obtener estadísticas' };
  }
};

// Guardar progreso completo del juego (sesión + estadísticas)
export const saveGameProgress = async (gameData) => {
  try {
    console.log('💾 Saving game progress:', gameData);
    
    // 1. Guardar sesión de juego
    const sessionResult = await saveGameSession(gameData);
    if (!sessionResult.success) {
      return sessionResult;
    }

    // 2. Actualizar estadísticas del perfil
    const statsResult = await updateProfileStats(gameData.profileId, {
      totalProblems: gameData.totalProblems,
      correctAnswers: gameData.correctAnswers,
      incorrectAnswers: gameData.incorrectAnswers,
      totalScore: gameData.totalScore,
      duration: gameData.duration,
      averageTime: gameData.averageTime,
      fastestAnswer: gameData.fastestAnswer,
      slowestAnswer: gameData.slowestAnswer
    });

    if (!statsResult.success) {
      return statsResult;
    }

    console.log('✅ Game progress saved successfully');
    return { 
      success: true, 
      session: sessionResult.session,
      profile: statsResult.profile
    };
  } catch (error) {
    console.error('❌ Unexpected error saving game progress:', error);
    return { success: false, error: 'Error inesperado al guardar progreso' };
  }
};

// Verificar si el progreso se guardó correctamente
export const verifyProgressSaved = async (profileId, sessionId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Verificar que la sesión existe
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return { success: false, error: 'Sesión no encontrada' };
    }

    // Verificar que las estadísticas se actualizaron
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Perfil no encontrado' };
    }

    console.log('✅ Progress verification successful');
    return { 
      success: true, 
      session,
      profile,
      verified: true
    };
  } catch (error) {
    console.error('❌ Error verifying progress:', error);
    return { success: false, error: 'Error al verificar progreso' };
  }
}; 