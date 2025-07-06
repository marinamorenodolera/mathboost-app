-- MathBoost Supabase Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL,
    profile_name TEXT NOT NULL,
    avatar_emoji TEXT NOT NULL DEFAULT '👤',
    current_level INTEGER NOT NULL DEFAULT 1,
    sessions_this_week INTEGER NOT NULL DEFAULT 0,
    sessions_last_week INTEGER NOT NULL DEFAULT 0,
    average_response_time DECIMAL(5,2) NOT NULL DEFAULT 0,
    last_week_response_time DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_problems_this_week INTEGER NOT NULL DEFAULT 0,
    total_problems_last_week INTEGER NOT NULL DEFAULT 0,
    total_problems_lifetime INTEGER NOT NULL DEFAULT 0,
    total_hours_invested DECIMAL(8,2) NOT NULL DEFAULT 0,
    next_level_problems INTEGER NOT NULL DEFAULT 50,
    current_streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    consecutive_days INTEGER NOT NULL DEFAULT 0,
    best_table INTEGER,
    weakest_table INTEGER,
    average_user_speed DECIMAL(5,2) NOT NULL DEFAULT 0,
    global_ranking INTEGER,
    common_mistakes JSONB NOT NULL DEFAULT '{}',
    strengths TEXT[] NOT NULL DEFAULT '{}',
    weaknesses TEXT[] NOT NULL DEFAULT '{}',
    projection_weeks INTEGER NOT NULL DEFAULT 12,
    projection_text TEXT NOT NULL DEFAULT 'calculadora mental básica',
    next_achievement JSONB NOT NULL DEFAULT '{"name": "Primer Paso", "description": "Completa tu primera sesión de entrenamiento", "progress": 0, "total": 1, "emoji": "🌱"}',
    practice_heatmap JSONB NOT NULL DEFAULT '[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]]',
    activity_patterns JSONB NOT NULL DEFAULT '{"bestDays": [], "bestHours": [], "avgSessionLength": "0 min", "preferredDifficulty": "Principiante"}',
    personal_profile TEXT NOT NULL DEFAULT '',
    last_notification TIMESTAMP WITH TIME ZONE,
    notification_preferences JSONB NOT NULL DEFAULT '{"enabled": true, "frequency": "daily", "bestTime": "18:00", "motivationStyle": "encouraging"}',
    last_session_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, profile_id)
);

-- Create game_sessions table for tracking individual sessions
CREATE TABLE IF NOT EXISTS game_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL,
    session_type TEXT NOT NULL, -- 'regular', 'tricks'
    operation TEXT NOT NULL,
    selected_tables INTEGER[],
    number_range TEXT,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_answers INTEGER NOT NULL DEFAULT 0,
    average_time DECIMAL(5,2) NOT NULL DEFAULT 0,
    session_duration INTEGER NOT NULL DEFAULT 0, -- in seconds
    errors JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- PUBLIC LEADERBOARD POLICIES
-- Allow public read access to basic profile info for leaderboard
CREATE POLICY "Public profiles viewable for leaderboard" ON user_profiles
    FOR SELECT USING (true);

-- PRIVATE DATA POLICIES
-- Users can only modify their own profiles
CREATE POLICY "Users can insert their own profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Game sessions policies
CREATE POLICY "Users can view their own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game sessions" ON game_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_id ON user_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_level ON user_profiles(current_level DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_problems ON user_profiles(total_problems_lifetime DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_profile_id ON game_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be used to set up default data for new users
    -- For now, we'll just return the new user
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
    profile_id TEXT,
    profile_name TEXT,
    avatar_emoji TEXT,
    current_level INTEGER,
    total_problems_lifetime INTEGER,
    global_ranking INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.profile_id,
        up.profile_name,
        up.avatar_emoji,
        up.current_level,
        up.total_problems_lifetime,
        ROW_NUMBER() OVER (ORDER BY up.current_level DESC, up.total_problems_lifetime DESC) as global_ranking
    FROM user_profiles up
    ORDER BY up.current_level DESC, up.total_problems_lifetime DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 