# 🎯 Guía de Pruebas de Persistencia - MathBoost

## 📋 Plan de Pruebas Completo

### **FASE 1: Verificación de Configuración**

#### **1.1 Verificar Base de Datos**
- [ ] Ejecutar esquema SQL en Supabase
- [ ] Verificar tablas `game_sessions` y `user_profiles` extendida
- [ ] Confirmar políticas RLS activas
- [ ] Verificar funciones RPC creadas

#### **1.2 Verificar Variables de Entorno**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] Cliente Supabase conectando correctamente

#### **1.3 Verificar Servicios**
- [ ] `services/supabase/gameProgress.js` funcionando
- [ ] `hooks/useGameStats.js` cargando datos
- [ ] Motor de juego integrando persistencia

### **FASE 2: Pruebas de Guardado**

#### **2.1 Prueba de Sesión Completa**
1. **Iniciar sesión** con usuario existente
2. **Jugar una partida completa** (60 segundos)
3. **Verificar guardado automático** al terminar tiempo
4. **Comprobar datos en Supabase**:
   - Tabla `game_sessions` con nueva entrada
   - Tabla `user_profiles` con estadísticas actualizadas

#### **2.2 Prueba de Múltiples Sesiones**
1. **Jugar 3-5 partidas consecutivas**
2. **Verificar acumulación correcta** de estadísticas
3. **Comprobar cálculos precisos**:
   - Total de problemas resueltos
   - Promedio de tiempo de respuesta
   - Racha actual y más larga
   - Puntuación total

#### **2.3 Prueba de Verificación**
1. **Usar función `verifyProgressSaved`**
2. **Confirmar sesión existe** en base de datos
3. **Verificar estadísticas actualizadas** correctamente

### **FASE 3: Pruebas de Recuperación**

#### **3.1 Prueba de Persistencia**
1. **Jugar una partida** y guardar progreso
2. **Cerrar sesión** completamente
3. **Iniciar sesión nuevamente**
4. **Verificar estadísticas** se cargan correctamente
5. **Comprobar historial** de sesiones disponible

#### **3.2 Prueba de Múltiples Perfiles**
1. **Crear 2-3 perfiles** diferentes
2. **Jugar con cada perfil** por separado
3. **Verificar aislamiento** de datos entre perfiles
4. **Comprobar estadísticas** específicas por perfil

#### **3.3 Prueba de Carga de Datos**
1. **Verificar pantalla de estadísticas** carga datos reales
2. **Comprobar historial** de sesiones reciente
3. **Verificar cálculos** de precisión y promedios

### **FASE 4: Pruebas de Edge Cases**

#### **4.1 Prueba de Errores de Red**
1. **Simular desconexión** durante guardado
2. **Verificar manejo de errores** apropiado
3. **Comprobar reintentos** automáticos
4. **Verificar feedback** al usuario

#### **4.2 Prueba de Datos Inválidos**
1. **Intentar guardar** con datos corruptos
2. **Verificar validación** de datos
3. **Comprobar rollback** en caso de error

#### **4.3 Prueba de Concurrencia**
1. **Múltiples sesiones** del mismo usuario
2. **Verificar integridad** de datos
3. **Comprobar no pérdida** de información

### **FASE 5: Pruebas de Rendimiento**

#### **5.1 Prueba de Carga**
1. **Usuario con muchas sesiones** (100+)
2. **Verificar tiempo de carga** aceptable
3. **Comprobar paginación** si es necesaria

#### **5.2 Prueba de Escalabilidad**
1. **Múltiples usuarios** jugando simultáneamente
2. **Verificar rendimiento** de base de datos
3. **Comprobar no bloqueos** o timeouts

### **FASE 6: Pruebas de UX**

#### **6.1 Prueba de Feedback Visual**
1. **Indicador de guardado** durante juego
2. **Mensajes de error** claros
3. **Estados de carga** apropiados

#### **6.2 Prueba de Navegación**
1. **Flujo completo** de juego → guardado → estadísticas
2. **Verificar consistencia** de datos mostrados
3. **Comprobar actualizaciones** en tiempo real

## 🧪 Pasos de Prueba Detallados

### **Paso 1: Configuración Inicial**
```bash
# 1. Verificar aplicación funcionando
curl http://localhost:3000

# 2. Verificar variables de entorno
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Ejecutar esquema SQL en Supabase
# Copiar contenido de supabase-game-progress-schema.sql
```

### **Paso 2: Prueba de Usuario Nuevo**
1. **Registrar nuevo usuario**
2. **Crear perfil** con nombre y avatar
3. **Verificar perfil** se crea con estadísticas en 0
4. **Jugar primera partida**
5. **Verificar guardado** automático
6. **Comprobar estadísticas** se actualizan

### **Paso 3: Prueba de Usuario Existente**
1. **Iniciar sesión** con usuario existente
2. **Verificar carga** de estadísticas previas
3. **Jugar nueva partida**
4. **Verificar acumulación** correcta de datos
5. **Comprobar cálculos** de promedios

### **Paso 4: Prueba de Persistencia**
1. **Jugar partida completa**
2. **Cerrar navegador** completamente
3. **Abrir nueva ventana** y ir a la app
4. **Iniciar sesión** nuevamente
5. **Verificar estadísticas** se mantienen
6. **Comprobar historial** de sesiones

### **Paso 5: Prueba de Múltiples Perfiles**
1. **Crear segundo perfil**
2. **Jugar con cada perfil** por separado
3. **Verificar aislamiento** de datos
4. **Comprobar estadísticas** específicas

## 📊 Criterios de Éxito

### **✅ Funcionalidad Básica**
- [ ] Progreso se guarda automáticamente al terminar partida
- [ ] Estadísticas se acumulan correctamente
- [ ] Datos persisten tras cerrar sesión
- [ ] Estadísticas se cargan al iniciar sesión

### **✅ Integridad de Datos**
- [ ] No pérdida de información
- [ ] Cálculos precisos de promedios
- [ ] Rachas se calculan correctamente
- [ ] Aislamiento entre perfiles

### **✅ Experiencia de Usuario**
- [ ] Feedback visual durante guardado
- [ ] Manejo elegante de errores
- [ ] Tiempos de carga aceptables
- [ ] Navegación fluida

### **✅ Rendimiento**
- [ ] Guardado en < 2 segundos
- [ ] Carga de estadísticas en < 3 segundos
- [ ] No bloqueos con múltiples usuarios
- [ ] Escalabilidad demostrada

## 🐛 Manejo de Errores

### **Errores Comunes y Soluciones**

#### **Error: "Usuario no autenticado"**
- **Causa**: Sesión expirada o no válida
- **Solución**: Verificar autenticación antes de guardar

#### **Error: "Perfil no encontrado"**
- **Causa**: profile_id no válido
- **Solución**: Verificar creación correcta de perfiles

#### **Error: "Error de conexión"**
- **Causa**: Problemas de red o Supabase
- **Solución**: Implementar reintentos y fallback

#### **Error: "Datos corruptos"**
- **Causa**: Validación fallida
- **Solución**: Sanitizar datos antes de guardar

## 📈 Métricas de Prueba

### **Métricas de Rendimiento**
- Tiempo de guardado: < 2s
- Tiempo de carga: < 3s
- Tasa de éxito: > 99%
- Tiempo de respuesta: < 1s

### **Métricas de Calidad**
- Precisión de cálculos: 100%
- Integridad de datos: 100%
- Aislamiento de usuarios: 100%
- Persistencia: 100%

## 🔄 Proceso de Verificación

### **Verificación Automática**
1. **Tests unitarios** para funciones de guardado
2. **Tests de integración** para flujo completo
3. **Tests de carga** para rendimiento
4. **Tests de regresión** para cambios

### **Verificación Manual**
1. **Pruebas de usuario** reales
2. **Verificación visual** de datos
3. **Comprobación** en Supabase Dashboard
4. **Validación** de cálculos manual

## 📝 Documentación de Cambios

### **Cambios Implementados**
1. **Servicio de progreso** (`gameProgress.js`)
2. **Hook de estadísticas** (`useGameStats.js`)
3. **Esquema de base de datos** (`supabase-game-progress-schema.sql`)
4. **Integración en motor de juego**
5. **Actualización de pantallas**

### **Archivos Modificados**
- `components/game/GameEngine.jsx`
- `components/screens/GameScreen.jsx`
- `components/screens/StatsScreen.jsx`
- `components/MathBoost.jsx`

### **Nuevos Archivos**
- `services/supabase/gameProgress.js`
- `hooks/useGameStats.js`
- `supabase-game-progress-schema.sql`
- `PERSISTENCE_TESTING_GUIDE.md`

---

**¡El sistema de persistencia está completamente implementado y listo para pruebas!** 🎉 