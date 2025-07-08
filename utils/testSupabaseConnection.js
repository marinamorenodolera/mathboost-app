// utils/testSupabaseConnection.js
// Script para testear la conexión con Supabase

import { supabase } from '../services/supabase/client.js';

export async function testSupabaseConnection() {
  console.log('🔍 Iniciando test de conexión Supabase...');
  
  try {
    // Test 1: Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('📋 Variables de entorno:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        error: 'Variables de entorno faltantes',
        details: {
          url: !!supabaseUrl,
          key: !!supabaseAnonKey
        }
      };
    }
    
    // Test 2: Verificar cliente Supabase
    if (!supabase) {
      return {
        success: false,
        error: 'Cliente Supabase no inicializado'
      };
    }
    
    console.log('✅ Cliente Supabase inicializado');
    
    // Test 3: Intentar conexión básica
    console.log('🌐 Probando conexión...');
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return {
        success: false,
        error: 'Error de conexión a Supabase',
        details: error
      };
    }
    
    console.log('✅ Conexión exitosa');
    console.log('📊 Datos recibidos:', data);
    
    return {
      success: true,
      message: 'Conexión a Supabase exitosa',
      data: data
    };
    
  } catch (error) {
    console.error('❌ Excepción durante el test:', error);
    return {
      success: false,
      error: 'Excepción durante el test',
      details: error.message
    };
  }
}

// Función para testear desde el navegador
export function testConnectionInBrowser() {
  if (typeof window !== 'undefined') {
    testSupabaseConnection().then(result => {
      if (result.success) {
        alert('✅ Conexión a Supabase exitosa!');
        console.log('Test completo:', result);
      } else {
        alert(`❌ Error de conexión: ${result.error}`);
        console.error('Test falló:', result);
      }
    });
  }
} 