-- ✅ SOLUCIÓN: Función + Trigger para crear automáticamente perfiles de usuario
-- Ejecuta este script en Supabase SQL Editor

-- 1. Reemplazar la función actual con una que SÍ cree el perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_username TEXT;
    default_profile_id TEXT;
BEGIN
    -- Extraer username del email (parte antes del @)
    default_username := split_part(NEW.email, '@', 1);
    default_profile_id := lower(default_username);
    
    -- Crear perfil automáticamente cuando se registra el usuario
    INSERT INTO public.user_profiles (
        user_id,
        profile_id,
        profile_name,
        avatar_emoji,
        current_level,
        sessions_this_week,
        sessions_last_week,
        average_response_time,
        last_week_response_time,
        total_problems_this_week,
        total_problems_last_week,
        total_problems_lifetime,
        total_hours_invested,
        next_level_problems,
        current_streak,
        best_streak,
        consecutive_days,
        best_table,
        weakest_table,
        average_user_speed,
        global_ranking,
        common_mistakes,
        strengths,
        weaknesses,
        projection_weeks,
        projection_text,
        next_achievement,
        practice_heatmap,
        activity_patterns,
        personal_profile,
        last_notification,
        notification_preferences,
        last_session_date,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,                           -- user_id
        default_profile_id,               -- profile_id
        default_username,                 -- profile_name
        '👤',                            -- avatar_emoji
        1,                               -- current_level
        0,                               -- sessions_this_week
        0,                               -- sessions_last_week
        0,                               -- average_response_time
        0,                               -- last_week_response_time
        0,                               -- total_problems_this_week
        0,                               -- total_problems_last_week
        0,                               -- total_problems_lifetime
        0,                               -- total_hours_invested
        50,                              -- next_level_problems
        0,                               -- current_streak
        0,                               -- best_streak
        0,                               -- consecutive_days
        NULL,                            -- best_table
        NULL,                            -- weakest_table
        0,                               -- average_user_speed
        NULL,                            -- global_ranking
        '{}',                            -- common_mistakes
        '{}',                            -- strengths
        '{}',                            -- weaknesses
        12,                              -- projection_weeks
        'calculadora mental básica',      -- projection_text
        '{"name": "Primer Paso", "description": "Completa tu primera sesión de entrenamiento", "progress": 0, "total": 1, "emoji": "🌱"}', -- next_achievement
        '[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]]', -- practice_heatmap
        '{"bestDays": [], "bestHours": [], "avgSessionLength": "0 min", "preferredDifficulty": "Principiante"}', -- activity_patterns
        CONCAT(default_username, ' está comenzando su viaje en el cálculo mental. Como nuevo usuario, tiene un gran potencial de crecimiento y mejora. ¡Es el momento perfecto para establecer buenos hábitos de práctica y descubrir sus fortalezas naturales en matemáticas!'), -- personal_profile
        NULL,                            -- last_notification
        '{"enabled": true, "frequency": "daily", "bestTime": "18:00", "motivationStyle": "encouraging"}', -- notification_preferences
        NULL,                            -- last_session_date
        NOW(),                           -- created_at
        NOW()                            -- updated_at
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. El trigger ya existe, pero vamos a recrearlo para asegurar que funciona
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 3. Política adicional para permitir que el trigger inserte datos
-- (El trigger ejecuta con permisos de SECURITY DEFINER, pero por si acaso)
CREATE POLICY "Enable insert for service role" ON user_profiles
    FOR INSERT WITH CHECK (true);

-- 4. Verificar que todo está correcto
-- Puedes ejecutar esto para ver si la función existe:
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' AND routine_name = 'handle_new_user'; 