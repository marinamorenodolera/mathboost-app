import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock client para desarrollo
const mockSupabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock: Configure Supabase first' } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock: Configure Supabase first' } }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Mock: Configure Supabase first' } }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
  }),
  rpc: () => Promise.resolve({ data: [], error: null })
};

// Configuración del cliente Supabase
let supabase;
let supabaseConfig;
let checkSupabaseConnection;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please create a .env.local file with:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  
  // En desarrollo, usar mock client
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Using mock Supabase client for development');
    
    supabase = mockSupabase;
    supabaseConfig = {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    };
    
    checkSupabaseConnection = async () => {
      console.warn('⚠️ Mock Supabase - no real connection');
      return false;
    };
  } else {
    throw new Error('Missing Supabase environment variables');
  }
} else {
  // Cliente Supabase real
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });

  supabaseConfig = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  };

  checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) {
        console.error('❌ Supabase connection error:', error);
        return false;
      }
      console.log('✅ Supabase connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
  };
}

export { supabase, supabaseConfig, checkSupabaseConnection }; 