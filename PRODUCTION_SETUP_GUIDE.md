# 🚀 Guía de Configuración de Producción - MathBoost

## 📋 Checklist de Configuración Completa

### ✅ ETAPA 1: Configuración de Supabase

#### 1.1. Crear proyecto en Supabase
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Haz clic en "New Project"
3. Elige tu organización
4. Nombre del proyecto: `mathboost-prod`
5. Contraseña de base de datos: (guarda esta contraseña)
6. Región: Elige la más cercana a tus usuarios
7. Haz clic en "Create new project"

#### 1.2. Configurar base de datos
1. Ve a **SQL Editor** en tu proyecto
2. Copia y pega todo el contenido de `supabase-setup.sql`
3. Haz clic en "Run" para ejecutar el script
4. Verifica que aparezcan las tablas creadas

#### 1.3. Obtener credenciales de API
1. Ve a **Settings** > **API**
2. Copia estos valores:
   - **Project URL**: `https://tu-project-id.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 1.4. Configurar autenticación
1. Ve a **Authentication** > **URL Configuration**
2. Agrega estos dominios:
   - `https://tu-dominio.com` (tu dominio de producción)
   - `http://localhost:3000` (para desarrollo local)
   - `http://localhost:3001` (puerto alternativo)

### ✅ ETAPA 2: Configuración de Variables de Entorno

#### 2.1. Desarrollo local
Edita el archivo `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

#### 2.2. Producción en Vercel
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** > **Environment Variables**
3. Agrega estas variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://tu-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `tu-anon-key-aqui`
4. Haz clic en "Save"
5. Redespliega tu aplicación

#### 2.3. Producción en Netlify
1. Ve a tu proyecto en [netlify.com](https://netlify.com)
2. Ve a **Site settings** > **Environment variables**
3. Agrega las mismas variables que en Vercel
4. Haz clic en "Save"
5. Redespliega tu aplicación

### ✅ ETAPA 3: Verificación de Configuración

#### 3.1. Test de conexión local
1. Ejecuta `npm run dev`
2. Abre la app en el navegador
3. Haz clic en **"Testear Conexión Supabase"**
4. Deberías ver: "✅ Conexión a Supabase exitosa!"

#### 3.2. Test de conexión en producción
1. Ve a tu app publicada
2. Haz clic en **"Testear Conexión Supabase"**
3. Deberías ver el mismo mensaje de éxito

#### 3.3. Verificar tablas en Supabase
1. Ve a **Table Editor** en Supabase
2. Deberías ver estas tablas:
   - `user_profiles`
   - `game_progress`
   - `leaderboard`
   - `game_sessions`

### ✅ ETAPA 4: Configuración de Seguridad

#### 4.1. Verificar políticas RLS
1. Ve a **Authentication** > **Policies**
2. Verifica que cada tabla tenga las políticas correctas
3. Las políticas deben permitir:
   - Usuarios autenticados pueden ver/editar sus propios datos
   - Leaderboard es público para lectura
   - Solo usuarios autenticados pueden insertar datos

#### 4.2. Configurar CORS (si es necesario)
1. Ve a **Settings** > **API**
2. En "CORS Origins" agrega:
   - `https://tu-dominio.com`
   - `http://localhost:3000`

### ✅ ETAPA 5: Optimización de Rendimiento

#### 5.1. Configurar índices
Los índices ya están creados por el script SQL, pero puedes verificar:
1. Ve a **SQL Editor**
2. Ejecuta: `\d+ user_profiles` (para ver índices)

#### 5.2. Configurar caché
1. Ve a **Settings** > **API**
2. Habilita "Enable realtime" si necesitas actualizaciones en tiempo real

## 🔍 Diagnóstico de Problemas Comunes

### Error: "Missing Supabase environment variables"
**Solución:**
- Verifica que `.env.local` existe y tiene las variables correctas
- En producción, verifica las variables en tu plataforma de hosting

### Error: "Invalid API key"
**Solución:**
- Verifica que copiaste la clave "anon public" completa
- Asegúrate de que no hay espacios extra

### Error: "relation does not exist"
**Solución:**
- Ejecuta el script `supabase-setup.sql` en Supabase SQL Editor
- Verifica que las tablas se crearon correctamente

### Error: "Failed to fetch"
**Solución:**
- Verifica que tu dominio está en la lista de URLs permitidas
- Revisa la configuración de CORS en Supabase

### Error: "CORS error"
**Solución:**
- Agrega tu dominio a la configuración de CORS en Supabase
- Verifica que estás usando HTTPS en producción

## 📊 Monitoreo y Mantenimiento

### 1. Monitorear uso de la base de datos
1. Ve a **Dashboard** en Supabase
2. Revisa métricas de uso
3. Monitorea consultas lentas

### 2. Backup automático
1. Supabase hace backups automáticos
2. Puedes configurar backups manuales si es necesario

### 3. Escalado
1. Si necesitas más recursos, actualiza tu plan en Supabase
2. Considera usar Edge Functions para lógica compleja

## 🎯 Verificación Final

### Checklist de verificación:
- [ ] Proyecto Supabase creado y configurado
- [ ] Tablas creadas con el script SQL
- [ ] Variables de entorno configuradas en desarrollo
- [ ] Variables de entorno configuradas en producción
- [ ] Dominios autorizados en Supabase
- [ ] Test de conexión exitoso en desarrollo
- [ ] Test de conexión exitoso en producción
- [ ] Políticas RLS configuradas correctamente
- [ ] App funcionando correctamente

### Comandos de verificación:
```bash
# Verificar variables de entorno
node -e "console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌')"

# Test de conexión
npm run dev
# Luego haz clic en "Testear Conexión Supabase"
```

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador
2. Verifica la configuración paso a paso
3. Consulta la documentación de Supabase
4. Contacta al administrador del proyecto

---

**¡MathBoost está listo para producción! 🚀** 