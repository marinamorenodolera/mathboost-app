# 🔧 Configuración de Supabase para MathBoost

## 🚨 PROBLEMA ACTUAL
La aplicación no puede conectarse a Supabase porque faltan las variables de entorno.

## 📋 PASOS PARA SOLUCIONAR

### 1. Crear archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz del proyecto con este contenido:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 2. Obtener las credenciales de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Settings** > **API**
4. Copia estos valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Para desarrollo local

El archivo `.env.local` solo funciona en desarrollo local. Para producción:

#### Si usas Vercel:
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** > **Environment Variables**
3. Agrega las mismas variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Si usas Netlify:
1. Ve a tu proyecto en [netlify.com](https://netlify.com)
2. Ve a **Site settings** > **Environment variables**
3. Agrega las mismas variables

### 4. Verificar la conexión

1. Ejecuta `npm run dev`
2. Abre la app en el navegador
3. Haz clic en **"Testear Conexión Supabase"**
4. Deberías ver un mensaje de éxito

## 🔍 DIAGNÓSTICO DE ERRORES

### Error: "Missing Supabase environment variables"
- **Causa**: No existe el archivo `.env.local` o las variables están vacías
- **Solución**: Crear el archivo con las credenciales correctas

### Error: "Invalid API key"
- **Causa**: La clave anon está mal copiada o es incorrecta
- **Solución**: Verificar que copiaste la clave "anon public" completa

### Error: "relation does not exist"
- **Causa**: Las tablas no existen en Supabase
- **Solución**: Ejecutar el script SQL en Supabase SQL Editor

### Error: "Failed to fetch"
- **Causa**: Problema de CORS o dominio no autorizado
- **Solución**: Agregar tu dominio en Supabase > Authentication > URL Configuration

## 📊 TABLAS NECESARIAS

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👤',
  current_level INTEGER DEFAULT 1,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de progreso del juego
CREATE TABLE IF NOT EXISTS game_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  play_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  score INTEGER NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## ✅ VERIFICACIÓN FINAL

1. ✅ Variables de entorno configuradas
2. ✅ Tablas creadas en Supabase
3. ✅ Dominio autorizado en Supabase
4. ✅ Test de conexión exitoso
5. ✅ App funcionando correctamente

## 🆘 SI SIGUES TENIENDO PROBLEMAS

1. Revisa la consola del navegador para errores específicos
2. Verifica que las credenciales estén correctas
3. Asegúrate de que el proyecto Supabase esté activo
4. Contacta al administrador del proyecto 