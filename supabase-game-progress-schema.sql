-- Esquema de base de datos para persistencia de progreso del juego MathBoost

-- Tabla para sesiones de juego
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER NOT NULL,
  total_problems INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  average_time DECIMAL(5,2) NOT NULL DEFAULT 0,
  fastest_answer DECIMAL(5,2) NOT NULL DEFAULT 0,
  slowest_answer DECIMAL(5,2) NOT NULL DEFAULT 0,
  level_played INTEGER NOT NULL DEFAULT 1,
  problems_solved JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para estadísticas de usuario (extender user_profiles existente)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_problems_solved INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_correct_answers INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_incorrect_answers INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_play_time INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS average_response_time DECIMAL(5,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fastest_response_time DECIMAL(5,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_profile_id ON game_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_date ON game_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stats ON user_profiles(total_score DESC, total_problems_solved DESC);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_game_sessions_updated_at 
  BEFORE UPDATE ON game_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función RPC para obtener leaderboard con estadísticas
CREATE OR REPLACE FUNCTION get_leaderboard_with_stats(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  profile_id TEXT,
  profile_name TEXT,
  avatar_emoji TEXT,
  total_score INTEGER,
  total_problems_solved INTEGER,
  accuracy DECIMAL(5,2),
  current_level INTEGER,
  rank_position INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.profile_id,
    up.profile_name,
    up.avatar_emoji,
    up.total_score,
    up.total_problems_solved,
    CASE 
      WHEN up.total_problems_solved > 0 
      THEN (up.total_correct_answers::DECIMAL / up.total_problems_solved * 100)
      ELSE 0 
    END as accuracy,
    up.current_level,
    ROW_NUMBER() OVER (ORDER BY up.total_score DESC, up.total_problems_solved DESC) as rank_position
  FROM user_profiles up
  WHERE up.total_score > 0
  ORDER BY up.total_score DESC, up.total_problems_solved DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de un perfil específico
CREATE OR REPLACE FUNCTION get_profile_stats(target_profile_id TEXT)
RETURNS TABLE (
  profile_id TEXT,
  profile_name TEXT,
  avatar_emoji TEXT,
  current_level INTEGER,
  total_problems_solved INTEGER,
  total_correct_answers INTEGER,
  total_incorrect_answers INTEGER,
  total_score INTEGER,
  total_play_time INTEGER,
  average_response_time DECIMAL(5,2),
  fastest_response_time DECIMAL(5,2),
  current_streak INTEGER,
  longest_streak INTEGER,
  accuracy DECIMAL(5,2),
  total_sessions INTEGER,
  last_played TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.profile_id,
    up.profile_name,
    up.avatar_emoji,
    up.current_level,
    up.total_problems_solved,
    up.total_correct_answers,
    up.total_incorrect_answers,
    up.total_score,
    up.total_play_time,
    up.average_response_time,
    up.fastest_response_time,
    up.current_streak,
    up.longest_streak,
    CASE 
      WHEN up.total_problems_solved > 0 
      THEN (up.total_correct_answers::DECIMAL / up.total_problems_solved * 100)
      ELSE 0 
    END as accuracy,
    up.total_sessions,
    up.last_played
  FROM user_profiles up
  WHERE up.profile_id = target_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Políticas RLS para seguridad
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Usuarios solo pueden ver sus propias sesiones
CREATE POLICY "Users can view own game sessions" ON game_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Usuarios solo pueden insertar sus propias sesiones
CREATE POLICY "Users can insert own game sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuarios solo pueden actualizar sus propias sesiones
CREATE POLICY "Users can update own game sessions" ON game_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_profiles (si no existen)
CREATE POLICY IF NOT EXISTS "Users can view own profiles" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own profiles" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Función para verificar y crear estadísticas iniciales
CREATE OR REPLACE FUNCTION ensure_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Asegurar que las columnas de estadísticas tengan valores por defecto
  NEW.total_problems_solved = COALESCE(NEW.total_problems_solved, 0);
  NEW.total_correct_answers = COALESCE(NEW.total_correct_answers, 0);
  NEW.total_incorrect_answers = COALESCE(NEW.total_incorrect_answers, 0);
  NEW.total_score = COALESCE(NEW.total_score, 0);
  NEW.total_play_time = COALESCE(NEW.total_play_time, 0);
  NEW.average_response_time = COALESCE(NEW.average_response_time, 0);
  NEW.fastest_response_time = COALESCE(NEW.fastest_response_time, 0);
  NEW.current_streak = COALESCE(NEW.current_streak, 0);
  NEW.longest_streak = COALESCE(NEW.longest_streak, 0);
  NEW.total_sessions = COALESCE(NEW.total_sessions, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asegurar estadísticas iniciales
CREATE TRIGGER ensure_profile_stats_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION ensure_profile_stats();

-- Comentarios para documentación
COMMENT ON TABLE game_sessions IS 'Almacena las sesiones de juego de cada usuario';
COMMENT ON COLUMN game_sessions.problems_solved IS 'JSON array con detalles de problemas resueltos en la sesión';
COMMENT ON FUNCTION get_leaderboard_with_stats IS 'Obtiene el ranking global con estadísticas de usuarios';
COMMENT ON FUNCTION get_profile_stats IS 'Obtiene estadísticas completas de un perfil específico'; 