# 🔧 Guía de Configuración de Supabase - MathBoost

## 📋 Pasos para Configurar Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en "New Project"
4. Completa la información del proyecto:
   - **Name**: `mathboost-app`
   - **Database Password**: Elige una contraseña segura
   - **Region**: Selecciona la región más cercana
5. Haz clic en "Create new project"

### 2. Obtener Credenciales

1. En el dashboard de tu proyecto, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (ej: `https://your-project.supabase.co`)
   - **anon public** key (empieza con `eyJ...`)

### 3. Configurar Variables de Entorno

1. En la raíz de tu proyecto, crea un archivo `.env.local`
2. Agrega las siguientes variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE**: Reemplaza los valores con los de tu proyecto Supabase.

### 4. Configurar Base de Datos

1. Ve a **SQL Editor** en tu proyecto Supabase
2. Ejecuta el siguiente SQL para crear las tablas:

```sql
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
```

### 5. Configurar Autenticación

1. Ve a **Authentication** → **Settings**
2. En **Site URL**, agrega: `http://localhost:3000` (para desarrollo)
3. En **Redirect URLs**, agrega: `http://localhost:3000/auth/callback`
4. Guarda los cambios

### 6. Configurar Email (Opcional)

1. Ve a **Authentication** → **Email Templates**
2. Personaliza las plantillas de email si lo deseas
3. Para desarrollo, puedes usar el email de confirmación automático

### 7. Verificar Configuración

1. Reinicia tu servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre la aplicación en `http://localhost:3000`

3. Intenta crear una cuenta nueva

4. Verifica en **Table Editor** → **user_profiles** que se creó el perfil automáticamente

## 🔍 Verificación de Funcionalidad

### ✅ Criterios de Éxito

1. **Registro de Usuario**:
   - [ ] Se puede crear una cuenta con email y contraseña
   - [ ] Se muestra mensaje de confirmación
   - [ ] Se crea automáticamente un perfil por defecto

2. **Inicio de Sesión**:
   - [ ] Se puede iniciar sesión con credenciales válidas
   - [ ] Se manejan errores de credenciales incorrectas
   - [ ] Se redirige correctamente después del login

3. **Gestión de Perfiles**:
   - [ ] Se muestran los perfiles del usuario
   - [ ] Se puede crear nuevos perfiles
   - [ ] Se puede cambiar entre perfiles

4. **Persistencia de Datos**:
   - [ ] Los datos se guardan en Supabase
   - [ ] Los perfiles persisten entre sesiones
   - [ ] El trigger funciona correctamente

## 🚨 Solución de Problemas

### Error: "Missing Supabase environment variables"

**Solución**: 
1. Verifica que el archivo `.env.local` existe
2. Verifica que las variables están correctamente definidas
3. Reinicia el servidor de desarrollo

### Error: "Invalid login credentials"

**Solución**:
1. Verifica que el usuario existe
2. Verifica que la contraseña es correcta
3. Verifica que el email está confirmado

### Error: "Profile not created automatically"

**Solución**:
1. Verifica que el trigger está creado correctamente
2. Verifica las políticas RLS
3. Revisa los logs en Supabase

### Error: "Permission denied"

**Solución**:
1. Verifica las políticas RLS
2. Verifica que el usuario está autenticado
3. Verifica los permisos de la tabla

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en la consola del navegador
2. Revisa los logs en Supabase Dashboard
3. Verifica que todos los pasos se completaron correctamente
4. Asegúrate de que las variables de entorno están configuradas

## 🎯 Próximos Pasos

Una vez que Supabase esté configurado:

1. **Probar autenticación completa**
2. **Implementar funcionalidades de juego**
3. **Configurar notificaciones**
4. **Desplegar en producción**

---

**¡Con esta configuración, MathBoost estará listo para funcionar con autenticación completa!** 🚀 