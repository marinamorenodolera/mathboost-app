import { useState, useEffect, useCallback } from 'react';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signOut, 
  getCurrentSession,
  verifyProfileCreation,
  createCustomProfile,
  getUserProfiles
} from '../services/supabase/auth.js';
import { supabase } from '../services/supabase/client.js';

export const useAuth = () => {
  // Estados de autenticación
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de perfiles
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  // Usuario actual calculado
  const user = currentUser ? users[currentUser] : null;

  // Inicializar autenticación
  useEffect(() => {
    console.log('🔐 Initializing authentication...');
    
    // Obtener sesión inicial
    const initializeAuth = async () => {
      try {
        const { success, session: currentSession } = await getCurrentSession();
        
        if (success && currentSession) {
          console.log('✅ Initial session found:', currentSession.user.id);
          setSession(currentSession);
          
          // Cargar perfiles del usuario
          await loadUserProfiles(currentSession.user.id);
        } else {
          console.log('ℹ️ No initial session found');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 Auth state changed:', event, newSession?.user?.id);
        
        setSession(newSession);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && newSession) {
          console.log('✅ User signed in:', newSession.user.id);
          await loadUserProfiles(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out');
          setUsers({});
          setCurrentUser(null);
          setShowUserSelection(false);
          setShowCreateProfile(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Cargar perfiles del usuario
  const loadUserProfiles = useCallback(async (userId) => {
    if (!userId) return;

    try {
      console.log('📋 Loading profiles for user:', userId);
      
      const { success, profiles } = await getUserProfiles(userId);
      
      if (success && profiles) {
        // Convertir array a objeto con profile_id como key
        const profilesObject = {};
        profiles.forEach(profile => {
          profilesObject[profile.profile_id] = {
            ...profile,
            name: profile.profile_name,
            avatar: profile.avatar_emoji,
            currentLevel: profile.current_level
          };
        });

        setUsers(profilesObject);
        console.log('✅ Profiles loaded:', Object.keys(profilesObject));
        
        // Si solo hay un perfil, seleccionarlo automáticamente
        if (Object.keys(profilesObject).length === 1) {
          const profileId = Object.keys(profilesObject)[0];
          setCurrentUser(profileId);
          setShowUserSelection(false);
          setShowCreateProfile(false);
        } else if (Object.keys(profilesObject).length > 1) {
          setShowUserSelection(true);
          setShowCreateProfile(false);
        } else {
          setShowCreateProfile(true);
          setShowUserSelection(false);
        }
      } else {
        console.warn('⚠️ No profiles found, showing create profile screen');
        setShowCreateProfile(true);
        setShowUserSelection(false);
      }
    } catch (error) {
      console.error('❌ Error loading user profiles:', error);
      setShowCreateProfile(true);
    }
  }, []);

  // Función para registrar usuario
  const signUp = useCallback(async (email, password) => {
    try {
      console.log('🔐 Signing up user:', email);
      
      const result = await signUpWithEmail(email, password);
      
      if (result.success) {
        console.log('✅ Sign up successful');
        // La navegación se maneja automáticamente en el useEffect
        return result;
      } else {
        console.error('❌ Sign up failed:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Unexpected error during sign up:', error);
      return { success: false, error: 'Error inesperado durante el registro.' };
    }
  }, []);

  // Función para iniciar sesión
  const signIn = useCallback(async (email, password) => {
    try {
      console.log('🔑 Signing in user:', email);
      
      const result = await signInWithEmail(email, password);
      
      if (result.success) {
        console.log('✅ Sign in successful');
        // La navegación se maneja automáticamente en el useEffect
        return result;
      } else {
        console.error('❌ Sign in failed:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Unexpected error during sign in:', error);
      return { success: false, error: 'Error inesperado durante el inicio de sesión.' };
    }
  }, []);

  // Función para cerrar sesión
  const handleSignOut = useCallback(async () => {
    try {
      console.log('🚪 Signing out user');
      
      const result = await signOut();
      
      if (result.success) {
        console.log('✅ Sign out successful');
        setSession(null);
        setUsers({});
        setCurrentUser(null);
        setShowUserSelection(false);
        setShowCreateProfile(false);
        return result;
      } else {
        console.error('❌ Sign out failed:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Unexpected error during sign out:', error);
      return { success: false, error: 'Error inesperado al cerrar sesión.' };
    }
  }, []);

  // Generador de username único
  const generateUsername = (displayName) => {
    return (
      'user_' +
      displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10) +
      '_' +
      Math.random().toString(36).substring(2, 8)
    );
  };

  // Función para crear perfil (estructura 100% alineada con la tabla real)
  const createProfile = useCallback(async (profileData) => {
    try {
      console.log('👤 [createProfile] Intentando crear perfil (estructura real):', profileData);
      const { name, avatar } = profileData;
      if (!session?.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }
      if (!session.user.email) {
        return { success: false, error: 'El usuario no tiene email asociado' };
      }
      const user = session.user;
      const now = new Date().toISOString();
      const username = `user_${user.id.substring(0, 8)}`;
      // Intentar insertar SOLO con los campos reales
      const { data, error: supabaseError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: user.id,
            username,
            display_name: name.trim(),
            avatar_emoji: avatar,
            email: user.email,
            created_at: now,
            updated_at: now
          }
        ])
        .select()
        .single();
      if (supabaseError) {
        // Si es error de clave duplicada, hacer update
        if (supabaseError.code === '23505' || (supabaseError.message && supabaseError.message.includes('duplicate'))) {
          console.warn('[createProfile] Perfil ya existe, actualizando...');
          const { data: updated, error: updateError } = await supabase
            .from('user_profiles')
            .update({
              username,
              display_name: name.trim(),
              avatar_emoji: avatar,
              email: user.email,
              updated_at: now
            })
            .eq('id', user.id)
            .select()
            .single();
          if (updateError) {
            console.error('[createProfile] Error al actualizar perfil:', updateError);
            return { success: false, error: updateError.message };
          }
          return { success: true, profile: updated };
        }
        console.error('[createProfile] Error al crear perfil:', supabaseError);
        return { success: false, error: supabaseError.message };
      }
      return { success: true, profile: data };
    } catch (error) {
      console.error('[createProfile] Excepción inesperada:', error);
      return { success: false, error: error.message || 'Error inesperado al crear el perfil.' };
    }
  }, [session]);

  // Función para cambiar de usuario
  const switchUser = useCallback((profileId) => {
    console.log('🔄 Switching to profile:', profileId);
    setCurrentUser(profileId);
    setShowUserSelection(false);
    setShowCreateProfile(false);
  }, []);

  return {
    // Estados
    session,
    loading,
    users,
    currentUser,
    user,
    showUserSelection,
    showCreateProfile,
    
    // Funciones
    signUp,
    signIn,
    signOut: handleSignOut,
    createProfile,
    switchUser,
    
    // Setters
    setShowUserSelection,
    setShowCreateProfile,
    setCurrentUser
  };
}; 