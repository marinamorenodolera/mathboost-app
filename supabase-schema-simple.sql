-- Esquema simplificado para MathBoost
-- Basado en el SQL proporcionado por el usuario

-- 1. Crear tabla user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    profile_id TEXT NOT NULL,
    profile_name TEXT NOT NULL,
    avatar_emoji TEXT NOT NULL DEFAULT '👤',
    current_level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, profile_id)
);

-- 2. Función para insertar un perfil automáticamente al crear usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    profile_id, 
    profile_name, 
    avatar_emoji, 
    current_level
  )
  VALUES (
    NEW.id, 
    'default', -- puedes cambiar el valor según necesidad
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
    '👤', -- emoji por defecto
    1 -- nivel por defecto
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear trigger para ejecutar la función automáticamente al registrar usuario
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS básicas
CREATE POLICY "Users can view their own profiles" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Permisos
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE user_profiles TO authenticated;
GRANT SELECT ON TABLE user_profiles TO anon;

-- 7. Función para obtener leaderboard (simplificada)
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
    profile_name TEXT,
    avatar_emoji TEXT,
    current_level INTEGER,
    profile_id TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.profile_name,
        up.avatar_emoji,
        up.current_level,
        up.profile_id
    FROM user_profiles up
    ORDER BY up.current_level DESC, up.created_at ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_leaderboard() TO anon, authenticated; 