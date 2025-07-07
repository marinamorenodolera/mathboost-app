-- Create user_profiles table for MathBoost app
-- This table stores user profile data linked to Supabase auth users

CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    profile_id TEXT NOT NULL,
    profile_name TEXT NOT NULL,
    avatar_emoji TEXT NOT NULL DEFAULT '👤',
    current_level INTEGER NOT NULL DEFAULT 1,
    sessions_this_week INTEGER NOT NULL DEFAULT 0,
    sessions_last_week INTEGER NOT NULL DEFAULT 0,
    average_response_time REAL NOT NULL DEFAULT 0.0,
    last_week_response_time REAL NOT NULL DEFAULT 0.0,
    total_problems_this_week INTEGER NOT NULL DEFAULT 0,
    total_problems_last_week INTEGER NOT NULL DEFAULT 0,
    total_problems_lifetime INTEGER NOT NULL DEFAULT 0,
    total_hours_invested REAL NOT NULL DEFAULT 0.0,
    next_level_problems INTEGER NOT NULL DEFAULT 50,
    current_streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    consecutive_days INTEGER NOT NULL DEFAULT 0,
    best_table INTEGER,
    weakest_table INTEGER,
    average_user_speed REAL NOT NULL DEFAULT 0.0,
    global_ranking INTEGER,
    common_mistakes JSONB NOT NULL DEFAULT '{}',
    strengths TEXT[] NOT NULL DEFAULT '{}',
    weaknesses TEXT[] NOT NULL DEFAULT '{}',
    projection_weeks INTEGER NOT NULL DEFAULT 12,
    projection_text TEXT NOT NULL DEFAULT 'calculadora mental básica',
    next_achievement JSONB NOT NULL DEFAULT '{}',
    practice_heatmap JSONB NOT NULL DEFAULT '[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]]',
    activity_patterns JSONB NOT NULL DEFAULT '{}',
    personal_profile TEXT NOT NULL DEFAULT '',
    last_notification TIMESTAMPTZ,
    notification_preferences JSONB NOT NULL DEFAULT '{"enabled": true, "frequency": "daily", "bestTime": "18:00", "motivationStyle": "encouraging"}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, profile_id),
    CHECK (current_level >= 1 AND current_level <= 15),
    CHECK (sessions_this_week >= 0),
    CHECK (sessions_last_week >= 0),
    CHECK (total_problems_lifetime >= 0),
    CHECK (current_streak >= 0),
    CHECK (best_streak >= 0),
    CHECK (consecutive_days >= 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_id ON user_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_global_ranking ON user_profiles(global_ranking) WHERE global_ranking IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_level ON user_profiles(current_level);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own profiles
CREATE POLICY "Users can view their own profiles" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profiles
CREATE POLICY "Users can insert their own profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profiles
CREATE POLICY "Users can update their own profiles" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own profiles
CREATE POLICY "Users can delete their own profiles" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Public read access for leaderboard (limited fields only)
CREATE POLICY "Public can view leaderboard data" ON user_profiles
    FOR SELECT USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
    profile_name TEXT,
    avatar_emoji TEXT,
    current_level INTEGER,
    total_problems_lifetime INTEGER,
    average_user_speed REAL,
    global_ranking INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.profile_name,
        up.avatar_emoji,
        up.current_level,
        up.total_problems_lifetime,
        up.average_user_speed,
        up.global_ranking
    FROM user_profiles up
    WHERE up.total_problems_lifetime > 0
    ORDER BY 
        up.current_level DESC,
        up.total_problems_lifetime DESC,
        up.average_user_speed ASC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE user_profiles TO authenticated;
GRANT SELECT ON TABLE user_profiles TO anon;
GRANT EXECUTE ON FUNCTION get_leaderboard() TO anon, authenticated;

-- Create automatic profile creation trigger (optional)
-- This will create a default profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (
        user_id,
        profile_id,
        profile_name,
        avatar_emoji,
        personal_profile,
        next_achievement
    ) VALUES (
        NEW.id,
        'default',
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
        '👤',
        'Nuevo usuario comenzando su viaje en el cálculo mental. ¡Bienvenido!',
        '{"name": "Primer Paso", "description": "Completa tu primera sesión de entrenamiento", "progress": 0, "total": 1, "emoji": "🌱"}'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Example data insertion (for testing)
-- INSERT INTO user_profiles (
--     user_id, profile_id, profile_name, avatar_emoji, personal_profile, next_achievement
-- ) VALUES (
--     auth.uid(),
--     'test_profile',
--     'Usuario de Prueba',
--     '🧮',
--     'Perfil de prueba para validar funcionamiento',
--     '{"name": "Primer Paso", "description": "Completa tu primera sesión", "progress": 0, "total": 1, "emoji": "🌱"}'::jsonb
-- ); 