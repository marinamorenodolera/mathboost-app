-- =====================================================
-- CONFIGURACIÓN COMPLETA DE SUPABASE PARA MATHBOOST
-- =====================================================

-- 1. HABILITAR EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREAR TABLA DE PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👤',
  current_level INTEGER DEFAULT 1,
  total_score INTEGER DEFAULT 0,
  total_problems_solved INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_incorrect_answers INTEGER DEFAULT 0,
  total_play_time INTEGER DEFAULT 0,
  average_response_time DECIMAL(5,2) DEFAULT 0,
  fastest_response_time DECIMAL(5,2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREAR TABLA DE PROGRESO DEL JUEGO
CREATE TABLE IF NOT EXISTS game_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  play_time INTEGER DEFAULT 0,
  average_response_time DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREAR TABLA DE LEADERBOARD
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  score INTEGER NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREAR TABLA DE SESIONES DE JUEGO
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  total_score INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  play_time INTEGER DEFAULT 0,
  average_response_time DECIMAL(5,2) DEFAULT 0
);

-- 6. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_profile_id ON game_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_profile_id ON leaderboard(profile_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_profile_id ON game_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_level ON leaderboard(level);

-- 7. CREAR FUNCIÓN PARA ACTUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. CREAR TRIGGER PARA ACTUALIZAR TIMESTAMP
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. CREAR POLÍTICAS RLS (ROW LEVEL SECURITY)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- 10. POLÍTICAS PARA USER_PROFILES
CREATE POLICY "Users can view their own profiles" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 11. POLÍTICAS PARA GAME_PROGRESS
CREATE POLICY "Users can view their own game progress" ON game_progress
    FOR SELECT USING (
        profile_id IN (
            SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own game progress" ON game_progress
    FOR INSERT WITH CHECK (
        profile_id IN (
            SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- 12. POLÍTICAS PARA LEADERBOARD (público para lectura)
CREATE POLICY "Anyone can view leaderboard" ON leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own leaderboard entries" ON leaderboard
    FOR INSERT WITH CHECK (
        profile_id IN (
            SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- 13. POLÍTICAS PARA GAME_SESSIONS
CREATE POLICY "Users can view their own game sessions" ON game_sessions
    FOR SELECT USING (
        profile_id IN (
            SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (
        profile_id IN (
            SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- 14. CREAR FUNCIÓN PARA CALCULAR ESTADÍSTICAS
CREATE OR REPLACE FUNCTION calculate_user_stats(user_profile_id UUID)
RETURNS TABLE (
    total_problems_solved BIGINT,
    total_correct_answers BIGINT,
    total_incorrect_answers BIGINT,
    total_score BIGINT,
    average_response_time DECIMAL(5,2),
    fastest_response_time DECIMAL(5,2),
    current_streak INTEGER,
    longest_streak INTEGER,
    accuracy DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(gp.problems_solved), 0) as total_problems_solved,
        COALESCE(SUM(gp.correct_answers), 0) as total_correct_answers,
        COALESCE(SUM(gp.incorrect_answers), 0) as total_incorrect_answers,
        COALESCE(SUM(gp.score), 0) as total_score,
        COALESCE(AVG(gp.average_response_time), 0) as average_response_time,
        COALESCE(MIN(gp.average_response_time), 0) as fastest_response_time,
        up.current_streak,
        up.longest_streak,
        CASE 
            WHEN COALESCE(SUM(gp.correct_answers + gp.incorrect_answers), 0) > 0 
            THEN ROUND(
                (COALESCE(SUM(gp.correct_answers), 0)::DECIMAL / 
                 COALESCE(SUM(gp.correct_answers + gp.incorrect_answers), 1)::DECIMAL) * 100, 2
            )
            ELSE 0 
        END as accuracy
    FROM user_profiles up
    LEFT JOIN game_progress gp ON up.profile_id = gp.profile_id
    WHERE up.profile_id = user_profile_id
    GROUP BY up.profile_id, up.current_streak, up.longest_streak;
END;
$$ LANGUAGE plpgsql;

-- 15. VERIFICAR QUE TODO SE CREÓ CORRECTAMENTE
SELECT 'Tablas creadas:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'game_progress', 'leaderboard', 'game_sessions');

SELECT 'Políticas RLS creadas:' as status;
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename IN ('user_profiles', 'game_progress', 'leaderboard', 'game_sessions'); 