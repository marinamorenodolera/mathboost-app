import { supabase } from './client.js';

// Función para registrar un nuevo usuario
export const signUpWithEmail = async (email, password) => {
  try {
    console.log('🔐 Attempting to sign up user:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: email.split('@')[0], // Usar parte del email como nombre por defecto
          email: email
        }
      }
    });

    if (error) {
      console.error('❌ Sign up error:', error);
      
      // Manejar errores específicos
      if (error.message.includes('already registered')) {
        return { success: false, error: 'Este email ya está registrado. Intenta iniciar sesión.' };
      }
      if (error.message.includes('password')) {
        return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
      }
      if (error.message.includes('email')) {
        return { success: false, error: 'Por favor, ingresa un email válido.' };
      }
      
      return { success: false, error: error.message || 'Error al crear la cuenta' };
    }

    if (data.user) {
      console.log('✅ User created successfully:', data.user.id);
      
      // Verificar si se creó el perfil automáticamente
      await verifyProfileCreation(data.user.id);
      
      return { 
        success: true, 
        user: data.user,
        message: 'Cuenta creada exitosamente. Revisa tu email para confirmar.'
      };
    }

    return { success: false, error: 'No se pudo crear el usuario' };
  } catch (error) {
    console.error('❌ Unexpected error during sign up:', error);
    return { success: false, error: 'Error inesperado. Intenta de nuevo.' };
  }
};

// Función para iniciar sesión
export const signInWithEmail = async (email, password) => {
  try {
    console.log('🔑 Attempting to sign in user:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Sign in error:', error);
      
      // Manejar errores específicos
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Email o contraseña incorrectos.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Por favor, confirma tu email antes de iniciar sesión.' };
      }
      
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    }

    if (data.user) {
      console.log('✅ User signed in successfully:', data.user.id);
      return { success: true, user: data.user };
    }

    return { success: false, error: 'No se pudo iniciar sesión' };
  } catch (error) {
    console.error('❌ Unexpected error during sign in:', error);
    return { success: false, error: 'Error inesperado. Intenta de nuevo.' };
  }
};

// Función para cerrar sesión
export const signOut = async () => {
  try {
    console.log('🚪 Signing out user');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Sign out error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error during sign out:', error);
    return { success: false, error: 'Error inesperado al cerrar sesión.' };
  }
};

// Función para obtener la sesión actual
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Get session error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, session: data.session };
  } catch (error) {
    console.error('❌ Unexpected error getting session:', error);
    return { success: false, error: 'Error inesperado al obtener la sesión.' };
  }
};

// Función para verificar la creación automática de perfil
export const verifyProfileCreation = async (userId) => {
  try {
    console.log('🔍 Verifying profile creation for user:', userId);
    
    // Esperar un momento para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('❌ Error checking profile creation:', error);
      return false;
    }

    if (data && data.length > 0) {
      console.log('✅ Profile created automatically:', data[0]);
      return true;
    } else {
      console.warn('⚠️ No profile found, creating manually...');
      return await createDefaultProfile(userId);
    }
  } catch (error) {
    console.error('❌ Error verifying profile creation:', error);
    return false;
  }
};

// Función para crear un perfil por defecto manualmente
export const createDefaultProfile = async (userId) => {
  try {
    console.log('👤 Creating default profile for user:', userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: userId,
          profile_id: 'default',
          profile_name: 'Mi Perfil',
          avatar_emoji: '👤',
          current_level: 1
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating default profile:', error);
      return false;
    }

    console.log('✅ Default profile created:', data);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error creating default profile:', error);
    return false;
  }
};

// Función para crear un perfil personalizado
export const createCustomProfile = async (profileData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    console.log('👤 Creating custom profile:', profileData);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: user.id,
          profile_id: `profile_${Date.now()}`,
          profile_name: profileData.name,
          avatar_emoji: profileData.avatar,
          current_level: 1
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating custom profile:', error);
      
      if (error.message.includes('duplicate key')) {
        return { success: false, error: 'Ya existe un perfil con ese nombre' };
      }
      
      return { success: false, error: error.message };
    }

    console.log('✅ Custom profile created:', data);
    return { success: true, profile: data };
  } catch (error) {
    console.error('❌ Unexpected error creating custom profile:', error);
    return { success: false, error: 'Error inesperado al crear el perfil.' };
  }
};

// Función para obtener todos los perfiles del usuario
export const getUserProfiles = async (userId) => {
  try {
    console.log('📋 Getting profiles for user:', userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error getting user profiles:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ User profiles retrieved:', data);
    return { success: true, profiles: data };
  } catch (error) {
    console.error('❌ Unexpected error getting user profiles:', error);
    return { success: false, error: 'Error inesperado al obtener los perfiles.' };
  }
}; 