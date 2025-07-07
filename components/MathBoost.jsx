import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Settings, BarChart3, Lightbulb, User, X, ArrowLeft, Clock, RotateCcw, Trophy, Target, Zap, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MathBoost = () => {
  // Supabase auth state management
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados del componente - organizados por funcionalidad
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [gameMode, setGameMode] = useState('loading');
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmoji, setNewProfileEmoji] = useState('👤');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  
  // Sistema de niveles completo
  const levelSystem = [
    { level: 1, name: 'Aprendiz Numérico', category: 'Aprendiz', weeklyProblemsMin: 50, weeklyProblemsMax: 100, speedTarget: 5.0, emoji: '🌱' },
    { level: 2, name: 'Explorador Matemático', category: 'Aprendiz', weeklyProblemsMin: 75, weeklyProblemsMax: 125, speedTarget: 4.5, emoji: '🔍' },
    { level: 3, name: 'Estudiante Dedicado', category: 'Aprendiz', weeklyProblemsMin: 100, weeklyProblemsMax: 150, speedTarget: 4.0, emoji: '📚' },
    { level: 4, name: 'Calculador Emergente', category: 'Calculador', weeklyProblemsMin: 150, weeklyProblemsMax: 250, speedTarget: 3.5, emoji: '⚡' },
    { level: 5, name: 'Procesador Rápido', category: 'Calculador', weeklyProblemsMin: 200, weeklyProblemsMax: 300, speedTarget: 3.2, emoji: '🚀' },
    { level: 6, name: 'Computador Mental', category: 'Calculador', weeklyProblemsMin: 250, weeklyProblemsMax: 400, speedTarget: 3.0, emoji: '🧠' },
    { level: 7, name: 'Matemático Líquido', category: 'Matemático', weeklyProblemsMin: 350, weeklyProblemsMax: 500, speedTarget: 2.8, emoji: '🌊' },
    { level: 8, name: 'Artista Numérico', category: 'Matemático', weeklyProblemsMin: 400, weeklyProblemsMax: 600, speedTarget: 2.5, emoji: '🎨' },
    { level: 9, name: 'Maestro de Patrones', category: 'Matemático', weeklyProblemsMin: 500, weeklyProblemsMax: 750, speedTarget: 2.3, emoji: '🔮' },
    { level: 10, name: 'Experto Intuitivo', category: 'Experto', weeklyProblemsMin: 600, weeklyProblemsMax: 900, speedTarget: 2.1, emoji: '💎' },
    { level: 11, name: 'Virtuoso del Cálculo', category: 'Experto', weeklyProblemsMin: 800, weeklyProblemsMax: 1100, speedTarget: 2.0, emoji: '🎭' },
    { level: 12, name: 'Ninja Matemático', category: 'Experto', weeklyProblemsMin: 900, weeklyProblemsMax: 1200, speedTarget: 1.8, emoji: '🥷' },
    { level: 13, name: 'Maestro Cuántico', category: 'Maestro', weeklyProblemsMin: 1000, weeklyProblemsMax: 1400, speedTarget: 1.6, emoji: '⚛️' },
    { level: 14, name: 'Genio Computacional', category: 'Maestro', weeklyProblemsMin: 1200, weeklyProblemsMax: 1600, speedTarget: 1.4, emoji: '🧬' },
    { level: 15, name: 'Dios Matemático', category: 'Maestro', weeklyProblemsMin: 1500, weeklyProblemsMax: 2000, speedTarget: 1.2, emoji: '🌟' }
  ];

  // Sistema de notificaciones por usuario
  const [notificationTimeouts, setNotificationTimeouts] = useState({});

  // Add useRef for the name input
  const nameInputRef = useRef(null);

  // Available emojis for profile creation
  const availableEmojis = [
    '👤', '👩‍💻', '👨‍💼', '🧑‍🎓', '👩‍🏫', '👨‍🔬', '🧑‍💼', '👩‍🚀', 
    '👨‍🎨', '🧑‍🍳', '👩‍⚕️', '👨‍🏭', '🧑‍🎤', '👩‍🎯', '👨‍🏫', '🧑‍🔬',
    '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🧚‍♀️', '🧚‍♂️', '🥷', '🤖',
    '😀', '😃', '😄', '😁', '😊', '😍', '🤩', '😎', '🤓', '🧐',
    '🌟', '⚡', '🔥', '💎', '🚀', '🧠', '💪', '🎯', '🏆', '👑'
  ];

  // Usuario actual calculado
  const user = currentUser ? users[currentUser] : null;
  
  // Estadísticas de sesión
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    averageTime: 0,
    streak: 0,
    sessionDuration: 0,
    errors: []
  });

  // Supabase authentication setup
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      setLoading(false);
      
      // Handle email confirmation
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user profiles from Supabase
  const loadUserProfiles = useCallback(async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error loading user profiles:', error);
        return;
      }

      // Convert array to object with profile_id as key
      const profilesObject = {};
      data.forEach(profile => {
        profilesObject[profile.profile_id] = {
          ...profile,
          name: profile.profile_name,
          avatar: profile.avatar_emoji,
          currentLevel: profile.current_level,
          // Default values for missing fields in simplified schema
          practiceHeatmap: [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
          ],
          activityPatterns: {
            bestDays: [],
            bestHours: [],
            avgSessionLength: '0 min',
            preferredDifficulty: 'Principiante'
          },
          commonMistakes: {},
          strengths: [],
          weaknesses: [],
          notificationPreferences: {
            enabled: true,
            frequency: 'daily',
            bestTime: '18:00',
            motivationStyle: 'encouraging'
          }
        };
      });

      setUsers(profilesObject);
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }, [session]);

  // Load profiles when session changes
  useEffect(() => {
    if (session?.user) {
      loadUserProfiles().then(() => {
        // After loading profiles, check if user has any profiles
        // This will be handled in the next render cycle when users state updates
      });
    } else {
      // Clear users when session is null
      setUsers({});
      setCurrentUser(null);
      setShowUserSelection(false);
      setShowCreateProfile(false);
    }
  }, [session, loadUserProfiles]);

  // Handle navigation after profiles are loaded
  useEffect(() => {
    if (session?.user && !loading) {
      const hasProfiles = Object.keys(users).length > 0;
      
      if (!hasProfiles && !showCreateProfile && !showUserSelection) {
        // User has no profiles, show create profile screen
        setShowCreateProfile(true);
        setShowUserSelection(false);
      } else if (hasProfiles && !showCreateProfile && !showUserSelection && !currentUser) {
        // User has profiles but none selected, show user selection
        setShowUserSelection(true);
      }
    }
  }, [session, users, loading, showCreateProfile, showUserSelection, currentUser]);

  // Load leaderboard data
  const loadLeaderboard = useCallback(async () => {
    try {
      setLeaderboardLoading(true);
      const { data, error } = await supabase
        .rpc('get_leaderboard');

      if (error) {
        console.error('Error loading leaderboard:', error);
        return;
      }

      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  // Create demo data for testing
  const createDemoData = async () => {
    try {
      // Check if demo data already exists
      const { data: existingData } = await supabase
        .from('user_profiles')
        .select('profile_name')
        .in('profile_name', ['marina', 'pieter']);

      if (existingData && existingData.length >= 2) {
        return; // Demo data already exists
      }

      // Create Marina's profile
      const marinaProfile = {
        user_id: 'demo-marina',
        profile_id: 'marina',
        profile_name: 'marina',
        avatar_emoji: '👩‍💻',
        current_level: 3,
        sessions_this_week: 12,
        sessions_last_week: 8,
        average_response_time: 3.2,
        last_week_response_time: 4.1,
        total_problems_this_week: 450,
        total_problems_last_week: 320,
        total_problems_lifetime: 2840,
        total_hours_invested: 28.5,
        next_level_problems: 600,
        current_streak: 7,
        best_streak: 12,
        consecutive_days: 15,
        best_table: 7,
        weakest_table: 9,
        average_user_speed: 3.8,
        global_ranking: 2,
        common_mistakes: { '7×9': 3, '8×6': 2 },
        strengths: ['Multiplicación rápida', 'Patrones numéricos'],
        weaknesses: ['Tabla del 9'],
        projection_weeks: 8,
        projection_text: 'Matemático Líquido',
        next_achievement: {
          name: 'Velocidad Suprema',
          description: 'Alcanza menos de 3s promedio',
          progress: 2,
          total: 3,
          emoji: '⚡'
        },
        practice_heatmap: [
          [2, 3, 1, 2, 3, 2, 1],
          [1, 2, 3, 2, 1, 2, 3],
          [3, 2, 1, 3, 2, 1, 2],
          [2, 1, 2, 1, 3, 2, 1]
        ],
        activity_patterns: {
          bestDays: ['Lunes', 'Miércoles', 'Viernes'],
          bestHours: ['18:00', '20:00'],
          avgSessionLength: '8 min',
          preferredDifficulty: 'Intermedio'
        },
        personal_profile: 'Marina es una calculadora mental dedicada que ha desarrollado una excelente velocidad en multiplicaciones. Su consistencia diaria y enfoque en patrones numéricos la han llevado al nivel 3. Destaca especialmente en la tabla del 7, pero busca mejorar en la tabla del 9.',
        last_notification: new Date().toISOString(),
        notification_preferences: {
          enabled: true,
          frequency: 'daily',
          bestTime: '18:00',
          motivationStyle: 'encouraging'
        },
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create Pieter's profile
      const pieterProfile = {
        user_id: 'demo-pieter',
        profile_id: 'pieter',
        profile_name: 'pieter',
        avatar_emoji: '👨‍💼',
        current_level: 5,
        sessions_this_week: 18,
        sessions_last_week: 15,
        average_response_time: 2.8,
        last_week_response_time: 3.1,
        total_problems_this_week: 720,
        total_problems_last_week: 680,
        total_problems_lifetime: 5420,
        total_hours_invested: 45.2,
        next_level_problems: 800,
        current_streak: 14,
        best_streak: 21,
        consecutive_days: 28,
        best_table: 8,
        weakest_table: 6,
        average_user_speed: 3.2,
        global_ranking: 1,
        common_mistakes: { '6×7': 1, '9×8': 1 },
        strengths: ['Velocidad extrema', 'Consistencia', 'Técnicas avanzadas'],
        weaknesses: ['Ocasional distracción'],
        projection_weeks: 6,
        projection_text: 'Experto Intuitivo',
        next_achievement: {
          name: 'Maestro Cuántico',
          description: 'Alcanza el nivel 6',
          progress: 4,
          total: 5,
          emoji: '⚛️'
        },
        practice_heatmap: [
          [3, 2, 3, 2, 3, 2, 3],
          [2, 3, 2, 3, 2, 3, 2],
          [3, 2, 3, 2, 3, 2, 3],
          [2, 3, 2, 3, 2, 3, 2]
        ],
        activity_patterns: {
          bestDays: ['Martes', 'Jueves', 'Sábado'],
          bestHours: ['19:00', '21:00'],
          avgSessionLength: '12 min',
          preferredDifficulty: 'Avanzado'
        },
        personal_profile: 'Pieter es un maestro del cálculo mental que ha alcanzado el nivel 5. Su dedicación diaria y técnicas avanzadas lo han convertido en el líder de la clasificación. Su velocidad promedio de 2.8 segundos es excepcional, y su consistencia en la práctica es un ejemplo para todos.',
        last_notification: new Date().toISOString(),
        notification_preferences: {
          enabled: true,
          frequency: 'daily',
          bestTime: '19:00',
          motivationStyle: 'challenging'
        },
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert demo profiles
      const { error } = await supabase
        .from('user_profiles')
        .upsert([marinaProfile, pieterProfile]);

      if (error) {
        console.error('Error creating demo data:', error);
      } else {
        console.log('Demo data created successfully');
        // Reload leaderboard to show new data
        loadLeaderboard();
      }
    } catch (error) {
      console.error('Error creating demo data:', error);
    }
  };

  // Load leaderboard on mount and periodically
  useEffect(() => {
    loadLeaderboard();
    
    // Create demo data for testing
    createDemoData();
    
    // Refresh leaderboard every 5 minutes
    const interval = setInterval(loadLeaderboard, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadLeaderboard]);

  // Save user profile to Supabase
  const saveUserProfile = async (profileData) => {
    console.log('🔧 saveUserProfile: Function called');
    
    if (!session?.user) {
      console.error('❌ saveUserProfile: No session user', { 
        hasSession: !!session,
        sessionData: session
      });
      return false;
    }

    console.log('✅ saveUserProfile: Starting to save profile', { 
      userId: session.user.id, 
      profileId: profileData.profile_id,
      profileName: profileData.name,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });

    try {
      // Simplified profile data for the new schema
      const profileDataToSave = {
        user_id: session.user.id,
        profile_id: profileData.profile_id,
        profile_name: profileData.name,
        avatar_emoji: profileData.avatar,
        current_level: profileData.currentLevel || 1
      };

      console.log('📤 saveUserProfile: About to send to Supabase', {
        tableName: 'user_profiles',
        operation: 'upsert',
        dataKeys: Object.keys(profileDataToSave),
        profileDataToSave
      });

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileDataToSave);

      if (error) {
        console.error('❌ saveUserProfile: Supabase error', {
          error,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
          errorCode: error.code
        });
        return false;
      }

      console.log('✅ saveUserProfile: Profile saved successfully', { 
        data,
        dataLength: data?.length,
        operation: 'upsert completed'
      });

      // Reload profiles after saving
      console.log('🔄 saveUserProfile: Reloading user profiles...');
      await loadUserProfiles();
      console.log('✅ saveUserProfile: User profiles reloaded');
      return true;
    } catch (error) {
      console.error('💥 saveUserProfile: Exception error', {
        error,
        errorMessage: error.message,
        errorStack: error.stack
      });
      return false;
    }
  };

  // Sign in with email/password
  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign up with email/password
  const signUpWithEmail = async (email, password) => {
    try {
      // Get the current domain for redirect URL
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}` 
        : 'https://mathboost-app.vercel.app';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) {
        console.error('Error signing up:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Trucos matemáticos
  const mathTricks = [
    {
      id: 'multiply-9',
      title: 'multiplicar por 9',
      emoji: '🧮',
      method: 'técnica del 10-1',
      description: 'multiplica por 10 y resta el número original',
      example: '9 × 7 = (10 × 7) - 7 = 70 - 7 = 63',
      useCase: 'ideal para tabla del 9, números hasta 99',
      difficulty: 1
    },
    {
      id: 'multiply-11',
      title: 'multiplicar por 11',
      emoji: '✖️',
      method: 'suma intermedia',
      description: 'suma los dígitos y colócalos en el medio',
      example: '32 × 11: 3+2=5, entonces 352',
      useCase: 'perfecto para números de 2 dígitos × 11',
      difficulty: 1
    },
    {
      id: 'multiply-5',
      title: 'multiplicar por 5',
      emoji: '⚡',
      method: 'doblar y dividir',
      description: 'multiplica por 10 y divide entre 2',
      example: '5 × 8 = (10 × 8) ÷ 2 = 40',
      useCase: 'cualquier número × 5, especialmente pares',
      difficulty: 1
    },
    {
      id: 'square-ending-5',
      title: 'cuadrados terminados en 5',
      emoji: '🔢',
      method: 'patrón n(n+1)',
      description: 'primer dígito × (primer dígito + 1), añade 25',
      example: '25² = 2×3 = 6, entonces 625',
      useCase: 'números que terminan en 5: 15², 25², 35²...',
      difficulty: 2
    },
    {
      id: 'percentage-10',
      title: 'porcentajes del 10%',
      emoji: '📊',
      method: 'punto decimal',
      description: 'mueve el punto decimal una posición izquierda',
      example: '10% de 250 = 25.0',
      useCase: 'cálculos rápidos de descuentos y propinas',
      difficulty: 1
    },
    {
      id: 'double-half',
      title: 'doblar y partir',
      emoji: '⚖️',
      method: 'redistribución',
      description: 'dobla uno y parte el otro por la mitad',
      example: '14 × 25 = 7 × 50 = 350',
      useCase: 'cuando uno es par y el otro múltiplo de 5',
      difficulty: 2
    }
  ];

  // Sistema de colores consistente
  const colors = {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceHover: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    accent: '#F8FAFF',
    accentActive: '#E0E7FF',
    success: '#ECFDF5',
    successText: '#059669',
    error: '#FEF2F2',
    errorText: '#DC2626',
    border: 'rgba(0, 0, 0, 0.05)',
    shadow: 'rgba(0, 0, 0, 0.08)',
    shadowRich: 'rgba(0, 0, 0, 0.12)',
    primary: '#3B82F6',
    primaryLight: '#DBEAFE',
    secondary: '#8B5CF6',
    secondaryLight: '#EDE9FE'
  };

  // Sistema tipográfico consistente
  const typography = {
    // Escala de tamaños (mobile-first)
    sizes: {
      xs: 'text-xs',      // 12px
      sm: 'text-sm',      // 14px
      base: 'text-base',  // 16px
      lg: 'text-lg',      // 18px
      xl: 'text-xl',      // 20px
      '2xl': 'text-2xl',  // 24px
      '3xl': 'text-3xl',  // 30px
      '4xl': 'text-4xl',  // 36px
      '5xl': 'text-5xl',  // 48px
      '6xl': 'text-6xl',  // 60px
      '7xl': 'text-7xl',  // 72px
      '8xl': 'text-8xl',  // 96px
      '9xl': 'text-9xl'   // 128px
    },
    
    // Escala responsiva para operaciones matemáticas
    math: {
      mobile: 'text-6xl',    // 60px
      tablet: 'text-7xl',    // 72px
      desktop: 'text-8xl'    // 96px
    },
    
    // Escala responsiva para respuestas
    answer: {
      mobile: 'text-6xl',    // 60px
      tablet: 'text-7xl',    // 72px
      desktop: 'text-8xl'    // 96px
    },
    
    // Escala responsiva para títulos principales
    h1: {
      mobile: 'text-2xl',    // 24px
      tablet: 'text-3xl',    // 30px
      desktop: 'text-4xl'    // 36px
    },
    
    // Escala responsiva para subtítulos
    h2: {
      mobile: 'text-xl',     // 20px
      tablet: 'text-2xl',    // 24px
      desktop: 'text-3xl'    // 30px
    },
    
    // Escala responsiva para títulos de sección
    h3: {
      mobile: 'text-lg',     // 18px
      tablet: 'text-xl',     // 20px
      desktop: 'text-2xl'    // 24px
    },
    
    // Escala responsiva para títulos de tarjetas
    cardTitle: {
      mobile: 'text-base',   // 16px
      tablet: 'text-lg',     // 18px
      desktop: 'text-xl'     // 20px
    },
    
    // Escala responsiva para texto de cuerpo
    body: {
      mobile: 'text-sm',     // 14px
      tablet: 'text-base',   // 16px
      desktop: 'text-lg'     // 18px
    },
    
    // Escala responsiva para texto secundario
    caption: {
      mobile: 'text-xs',     // 12px
      tablet: 'text-sm',     // 14px
      desktop: 'text-base'   // 16px
    },
    
    // Escala responsiva para navegación
    nav: {
      mobile: 'text-sm',     // 14px
      tablet: 'text-base',   // 16px
      desktop: 'text-lg'     // 18px
    },
    
    // Escala responsiva para botones
    button: {
      mobile: 'text-sm',     // 14px
      tablet: 'text-base',   // 16px
      desktop: 'text-lg'     // 18px
    }
  };

  // Función helper para obtener tamaño tipográfico responsivo
  const getTypeSize = (scale, screenSize) => {
    return typography[scale]?.[screenSize] || typography[scale]?.mobile || 'text-base';
  };

  // Estilo liquid glass - Consistent across all screens
  const liquidGlass = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px) saturate(200%)',
    border: `1px solid ${colors.border}`,
    boxShadow: `0 8px 32px ${colors.shadow}, 0 1px 0 rgba(255, 255, 255, 0.5) inset`,
    borderRadius: '24px'
  };

  const liquidGlassHover = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px) saturate(220%)',
    border: `1px solid ${colors.primary}20`,
    boxShadow: `0 12px 48px ${colors.shadowRich}, 0 1px 0 rgba(255, 255, 255, 0.7) inset`,
    borderRadius: '24px'
  };

  // Consistent card styling helper
  const cardStyle = {
    ...liquidGlass,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer'
  };

  const cardStyleHover = {
    ...liquidGlassHover,
    transform: 'scale(1.02)',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const cardStyleActive = {
    ...liquidGlass,
    transform: 'scale(0.98)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  // Helper function for consistent card styling
  const getCardProps = () => ({
    className: 'rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98',
    style: cardStyle,
    onMouseEnter: (e) => Object.assign(e.target.style, cardStyleHover),
    onMouseLeave: (e) => Object.assign(e.target.style, cardStyle),
    onMouseDown: (e) => Object.assign(e.target.style, cardStyleActive),
    onMouseUp: (e) => Object.assign(e.target.style, cardStyleHover)
  });

  // Helper function for consistent button styling
  const getButtonProps = () => ({
    className: 'transition-all duration-300 hover:scale-102 active:scale-98',
    style: {
      ...liquidGlass,
      color: colors.text,
      fontFamily: 'Inter, -apple-system, sans-serif'
    },
    onMouseEnter: (e) => Object.assign(e.target.style, { ...liquidGlassHover, transform: 'scale(1.02)' }),
    onMouseLeave: (e) => Object.assign(e.target.style, { ...liquidGlass, transform: 'scale(1)' }),
    onMouseDown: (e) => Object.assign(e.target.style, { ...liquidGlass, transform: 'scale(0.98)' }),
    onMouseUp: (e) => Object.assign(e.target.style, { ...liquidGlassHover, transform: 'scale(1.02)' })
  });

  // Responsive
  const [screenSize, setScreenSize] = useState('desktop');
  
  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const responsive = {
    mobile: {
      logoSize: 'text-4xl',
      padding: 'p-4',
      headerPadding: 'p-4',
      gridCols: 'grid-cols-2',
      cardPadding: 'p-4',
      gap: 'gap-4',
      gamePadding: 'p-4 pb-24',
      headerCompact: true,
      gameSpacing: 'space-y-8',
      problemSize: getTypeSize('math', 'mobile'),
      answerSize: getTypeSize('answer', 'mobile'),
      h1: getTypeSize('h1', 'mobile'),
      h2: getTypeSize('h2', 'mobile'),
      h3: getTypeSize('h3', 'mobile'),
      cardTitle: getTypeSize('cardTitle', 'mobile'),
      body: getTypeSize('body', 'mobile'),
      caption: getTypeSize('caption', 'mobile'),
      nav: getTypeSize('nav', 'mobile'),
      button: getTypeSize('button', 'mobile'),
      // Carousel configuration
      carouselCards: 3,
      carouselGap: 'gap-4',
      carouselPadding: 'px-4'
    },
    tablet: {
      logoSize: 'text-6xl',
      padding: 'p-6',
      headerPadding: 'p-5',
      gridCols: 'grid-cols-2',
      cardPadding: 'p-6',
      gap: 'gap-6',
      gamePadding: 'p-6 pb-28',
      headerCompact: false,
      gameSpacing: 'space-y-12',
      problemSize: getTypeSize('math', 'tablet'),
      answerSize: getTypeSize('answer', 'tablet'),
      h1: getTypeSize('h1', 'tablet'),
      h2: getTypeSize('h2', 'tablet'),
      h3: getTypeSize('h3', 'tablet'),
      cardTitle: getTypeSize('cardTitle', 'tablet'),
      body: getTypeSize('body', 'tablet'),
      caption: getTypeSize('caption', 'tablet'),
      nav: getTypeSize('nav', 'tablet'),
      button: getTypeSize('button', 'tablet'),
      // Carousel configuration
      carouselCards: 5,
      carouselGap: 'gap-6',
      carouselPadding: 'px-6'
    },
    desktop: {
      logoSize: 'text-7xl',
      padding: 'p-8',
      headerPadding: 'p-6',
      gridCols: 'grid-cols-2',
      cardPadding: 'p-8',
      gap: 'gap-8',
      gamePadding: 'p-8',
      headerCompact: false,
      gameSpacing: 'space-y-16',
      problemSize: getTypeSize('math', 'desktop'),
      answerSize: getTypeSize('answer', 'desktop'),
      h1: getTypeSize('h1', 'desktop'),
      h2: getTypeSize('h2', 'desktop'),
      h3: getTypeSize('h3', 'desktop'),
      cardTitle: getTypeSize('cardTitle', 'desktop'),
      body: getTypeSize('body', 'desktop'),
      caption: getTypeSize('caption', 'desktop'),
      nav: getTypeSize('nav', 'desktop'),
      button: getTypeSize('button', 'desktop'),
      // Carousel configuration
      carouselCards: 7,
      carouselGap: 'gap-8',
      carouselPadding: 'px-8'
    }
  };

  const r = responsive[screenSize];

  // Propiedades calculadas del usuario
  const getUserLevelData = (user) => user ? levelSystem[user.currentLevel - 1] : null;
  const getUserLevelName = (user) => getUserLevelData(user)?.name || '';
  const getWeeklyProblemsGoal = (user) => getUserLevelData(user)?.weeklyProblemsMax || 0;
  const getWeeklySpeedGoal = (user) => getUserLevelData(user)?.speedTarget || 0;

  // Gestión de usuarios actualizada con Supabase
  const createNewProfile = async () => {
    console.log('🔧 createNewProfile: Function called');
    
    if (isCreatingProfile) {
      console.log('⏳ createNewProfile: Already creating profile, ignoring duplicate call');
      return;
    }
    
    setIsCreatingProfile(true);
    
    if (!newProfileName.trim() || !session?.user) {
      console.error('❌ createNewProfile: Missing required data', { 
        newProfileName: newProfileName,
        newProfileNameTrimmed: newProfileName.trim(),
        hasSession: !!session,
        hasSessionUser: !!session?.user,
        sessionUserId: session?.user?.id
      });
      alert('Error: Faltan datos requeridos. Asegúrate de estar autenticado y tener un nombre válido.');
      setIsCreatingProfile(false);
      return;
    }
    
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ createNewProfile: Supabase not configured', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });
      alert('Error de configuración: Supabase no está configurado correctamente.');
      setIsCreatingProfile(false);
      return;
    }
    
    const profileId = newProfileName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    console.log('✅ createNewProfile: Starting profile creation', { 
      profileId, 
      name: newProfileName,
      emoji: newProfileEmoji,
      userId: session.user.id
    });
    
    try {
      const newUser = {
        profile_id: profileId,
        name: newProfileName.toLowerCase().trim(),
        avatar: newProfileEmoji,
        currentLevel: 1,
        sessionsThisWeek: 0,
        sessionsLastWeek: 0,
        averageResponseTime: 0,
        lastWeekResponseTime: 0,
        totalProblemsThisWeek: 0,
        totalProblemsLastWeek: 0,
        totalProblemsLifetime: 0,
        totalHoursInvested: 0,
        nextLevelProblems: levelSystem[0].weeklyProblemsMin,
        currentStreak: 0,
        bestStreak: 0,
        consecutiveDays: 0,
        bestTable: null,
        weakestTable: null,
        averageUserSpeed: 0,
        globalRanking: null,
        commonMistakes: {},
        strengths: [],
        weaknesses: [],
        projectionWeeks: 12,
        projectionText: 'calculadora mental básica',
        nextAchievement: {
          name: 'Primer Paso',
          description: 'Completa tu primera sesión de entrenamiento',
          progress: 0,
          total: 1,
          emoji: '🌱'
        },
        practiceHeatmap: [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0]
        ],
        activityPatterns: {
          bestDays: [],
          bestHours: [],
          avgSessionLength: '0 min',
          preferredDifficulty: 'Principiante'
        },
        personalProfile: `${newProfileName} está comenzando su viaje en el cálculo mental. Como nuevo usuario, tiene un gran potencial de crecimiento y mejora. ¡Es el momento perfecto para establecer buenos hábitos de práctica y descubrir sus fortalezas naturales en matemáticas!`,
        lastNotification: null,
        createdAt: Date.now(),
        notificationPreferences: {
          enabled: true,
          frequency: 'daily',
          bestTime: '18:00',
          motivationStyle: 'encouraging'
        }
      };

      console.log('📤 createNewProfile: About to save profile', newUser);

      // Save to Supabase
      const success = await saveUserProfile(newUser);
      
      if (success) {
        console.log('✅ createNewProfile: Profile created successfully', { profileId });
        alert(`¡Perfil "${newProfileName}" creado exitosamente!`);
        setCurrentUser(profileId);
        setShowCreateProfile(false);
        setShowUserSelection(false);
        setNewProfileName('');
        setNewProfileEmoji('👤');
        setGameMode('welcome');
        
        scheduleUserNotifications(newUser);
      } else {
        console.error('❌ createNewProfile: Failed to create profile');
        alert('Error al crear el perfil. Revisa la consola del navegador para más detalles, o verifica que la tabla user_profiles exista en Supabase.');
      }
    } catch (error) {
      console.error('💥 createNewProfile: Exception caught', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Error inesperado al crear perfil: ${error.message}. Revisa la consola para más detalles.`);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // Sistema de notificaciones por usuario mejorado
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const cancelUserNotifications = (userId) => {
    if (notificationTimeouts[userId]) {
      clearTimeout(notificationTimeouts[userId]);
      setNotificationTimeouts(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    }
  };

  const getMotivationalMessage = (user) => {
    const { motivationStyle } = user.notificationPreferences;
    
    const messages = {
      encouraging: [
        `¡Hora de brillar, ${user.name}! 🌟 Tu cerebro está listo para el siguiente desafío`,
        `${user.avatar} ¡Cada problema resuelto te hace más fuerte! 💪 ¿Practicamos 5 minutos?`,
        `¡Momento perfecto para entrenar! ✨ ${user.name}, tu mente matemática te está esperando`,
        `🌱 Pequeños pasos, grandes resultados. ¡Vamos ${user.name}, tu futuro te lo agradecerá!`,
        `${user.avatar} El secreto del éxito está en la constancia. ¡Practiquemos juntos! 🎯`
      ],
      challenging: [
        `🔥 Desafío activado, ${user.name}! ¿Puedes superar tu récord de velocidad?`,
        `${user.avatar} Los genios no nacen, se hacen entrenando. ¡Demuestra tu potencial! ⚡`,
        `🎯 Tu mente es tu arma más poderosa. ¡Tiempo de afilarla, ${user.name}!`,
        `¡Alerta de competencia! 🏆 ${user.name}, ¿estás listo para dominar las matemáticas?`,
        `${user.avatar} La zona de confort es el enemigo del progreso. ¡Sal y entrena! 🚀`
      ],
      casual: [
        `¡Hey ${user.name}! 😊 ¿Te apetece un ratito de mates?`,
        `${user.avatar} Cinco minutitos de entrenamiento y luego a lo tuyo. ¡Vamos!`,
        `🎮 Mathboost time! ${user.name}, ¿jugamos un rato?`,
        `¡Hola! 👋 Tu cerebro dice que extraña los números. ¿Le hacemos caso?`,
        `${user.avatar} Pausa perfecta para un poco de diversión matemática, ${user.name} 😄`
      ],
      professional: [
        `${user.name}, optimiza tu rendimiento cognitivo con 5 minutos de entrenamiento. 📊`,
        `${user.avatar} Sesión de desarrollo de habilidades cuantitativas programada. ¡Iniciemos!`,
        `🎯 Inversión en capital intelectual: ${user.name}, mejora tu agilidad mental hoy`,
        `Recordatorio profesional: Tu progreso matemático requiere práctica sistemática. 📈`,
        `${user.avatar} ${user.name}, excellence requires consistency. Training time! 💼`
      ]
    };
    
    const styleMessages = messages[motivationStyle] || messages.encouraging;
    return styleMessages[Math.floor(Math.random() * styleMessages.length)];
  };

  const scheduleUserNotifications = (user) => {
    if (!user.notificationPreferences.enabled || user.notificationPreferences.frequency === 'never') {
      return;
    }

    // Cancelar notificaciones anteriores de este usuario
    cancelUserNotifications(user.name);

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const message = getMotivationalMessage(user);
      
      // Calcular el tiempo hasta la próxima notificación
      const now = new Date();
      const [hours, minutes] = user.notificationPreferences.bestTime.split(':');
      const nextNotification = new Date();
      nextNotification.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Si ya pasó la hora de hoy, programar para mañana
      if (nextNotification <= now) {
        nextNotification.setDate(nextNotification.getDate() + 1);
      }
      
      const timeUntilNotification = nextNotification.getTime() - now.getTime();
      
      const timeoutId = setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification(`MathBoost - ¡${user.name}! 🧮`, {
            body: message,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            tag: `mathboost-${user.name}`,
            renotify: true,
            vibrate: [200, 100, 200]
          });
          
          // Programar la siguiente notificación según la frecuencia
          if (user.notificationPreferences.frequency === 'daily') {
            scheduleUserNotifications(user);
          }
        }
      }, Math.min(timeUntilNotification, 24 * 60 * 60 * 1000)); // Máximo 24 horas
      
      setNotificationTimeouts(prev => ({
        ...prev,
        [user.name]: timeoutId
      }));
    }
  };

  const switchUser = (userId) => {
    // Cancelar notificaciones del usuario anterior
    if (currentUser) {
      cancelUserNotifications(currentUser);
    }
    
    setCurrentUser(userId);
    setShowUserSelection(false);
    
    // Programar notificaciones para el nuevo usuario
    const newUser = users[userId];
    if (newUser) {
      scheduleUserNotifications(newUser);
    }
  };

  // Update user stats after game session
  const updateUserStats = async (sessionStats) => {
    if (!user || !session?.user) return;

    const updatedUser = {
      ...user,
      totalProblemsLifetime: user.totalProblemsLifetime + sessionStats.total,
      totalProblemsThisWeek: user.totalProblemsThisWeek + sessionStats.total,
      sessionsThisWeek: user.sessionsThisWeek + 1,
      totalHoursInvested: user.totalHoursInvested + (sessionStats.sessionDuration / 3600), // Convert seconds to hours
      averageResponseTime: user.averageResponseTime > 0 
        ? ((user.averageResponseTime * user.totalProblemsLifetime) + (sessionStats.averageTime * sessionStats.total)) / (user.totalProblemsLifetime + sessionStats.total)
        : sessionStats.averageTime
    };

    // Update streak logic
    const today = new Date().toDateString();
    const lastSessionDate = user.lastSessionDate;
    
    if (lastSessionDate === today) {
      // Already practiced today, no streak change
    } else if (lastSessionDate === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
      // Consecutive day
      updatedUser.currentStreak = user.currentStreak + 1;
      updatedUser.consecutiveDays = user.consecutiveDays + 1;
      if (updatedUser.currentStreak > user.bestStreak) {
        updatedUser.bestStreak = updatedUser.currentStreak;
      }
    } else {
      // Break in streak
      updatedUser.currentStreak = 1;
      updatedUser.consecutiveDays = 1;
    }

    updatedUser.lastSessionDate = today;

    // Save to Supabase
    await saveUserProfile(updatedUser);
  };

  // Save game session to Supabase
  const saveGameSession = async (sessionStats) => {
    if (!user || !session?.user) return;

    try {
      const { error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: session.user.id,
          profile_id: currentUser,
          session_type: gameMode === 'tricksPlay' ? 'tricks' : 'regular',
          operation: operation,
          selected_tables: selectedTables,
          number_range: numberRange,
          correct_answers: sessionStats.correct,
          total_answers: sessionStats.total,
          average_time: sessionStats.averageTime / 1000, // Convert to seconds
          session_duration: sessionStats.sessionDuration,
          errors: sessionStats.errors
        });

      if (error) {
        console.error('Error saving game session:', error);
      }
    } catch (error) {
      console.error('Error saving game session:', error);
    }
  };

  // Inicializar notificaciones y usuario por defecto
  useEffect(() => {
    requestNotificationPermission();
    
    // Si no hay usuario seleccionado pero hay usuarios disponibles, no seleccionar automáticamente
    // Dejar que el usuario elija
  }, []);

  // Programar notificaciones cuando se selecciona un usuario
  useEffect(() => {
    if (currentUser && users[currentUser]) {
      scheduleUserNotifications(users[currentUser]);
    }
    
    return () => {
      // Limpiar notificaciones al cambiar de usuario o desmontar
      if (currentUser) {
        cancelUserNotifications(currentUser);
      }
    };
  }, [currentUser]);

  // Emojis para selección (ya declarado arriba)

  // Auto-confirmación
  const getExpectedDigits = (answer) => answer.toString().length;
  const shouldAutoConfirm = (userInput, expectedAnswer) => {
    return userInput.length === getExpectedDigits(expectedAnswer);
  };

  // Generar problemas
  const generateProblem = useCallback(() => {
    let num1, num2, correctAnswer;
    
    if (operation === 'multiplication') {
      const tables = selectedTables.length > 0 ? selectedTables : [2, 3, 4, 5];
      num1 = tables[Math.floor(Math.random() * tables.length)];
      num2 = Math.floor(Math.random() * 9) + 1;
      correctAnswer = num1 * num2;
    } else {
      const ranges = {
        '1-9': [1, 9],
        '10-99': [10, 99],
        '100-999': [100, 999]
      };
      const [min, max] = ranges[numberRange];
      
      if (operation === 'addition') {
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * (max - min + 1)) + min;
        correctAnswer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * num1) + 1;
        correctAnswer = num1 - num2;
      }
    }
    
    return { num1, num2, correctAnswer, operation };
  }, [operation, selectedTables, numberRange]);

  const generateTrickProblem = useCallback((trickId) => {
    let num1, num2, correctAnswer;
    
    switch(trickId) {
      case 'multiply-9':
        num1 = 9;
        num2 = Math.floor(Math.random() * 9) + 1;
        correctAnswer = num1 * num2;
        break;
      case 'multiply-11':
        num1 = 11;
        num2 = Math.floor(Math.random() * 90) + 10;
        correctAnswer = num1 * num2;
        break;
      case 'multiply-5':
        num1 = 5;
        num2 = Math.floor(Math.random() * 20) + 1;
        correctAnswer = num1 * num2;
        break;
      case 'square-ending-5':
        const bases = [15, 25, 35, 45, 55, 65, 75, 85, 95];
        num1 = bases[Math.floor(Math.random() * bases.length)];
        num2 = num1;
        correctAnswer = num1 * num1;
        break;
      case 'percentage-10':
        const amounts = [25, 50, 75, 100, 150, 200, 250, 300, 450, 500];
        num1 = amounts[Math.floor(Math.random() * amounts.length)];
        num2 = 10;
        correctAnswer = Math.round(num1 * 0.1);
        break;
      case 'double-half':
        const evenNums = [12, 14, 16, 18, 20, 22, 24, 26, 28];
        num1 = evenNums[Math.floor(Math.random() * evenNums.length)];
        num2 = 25;
        correctAnswer = num1 * num2;
        break;
      default:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        correctAnswer = num1 * num2;
    }
    
    return { num1, num2, correctAnswer, operation: 'multiplication', trick: trickId };
  }, []);

  // Timer de sesión con límite de 5 minutos
  useEffect(() => {
    if (sessionStartTime && (gameMode === 'playing' || gameMode === 'tricksPlay') && !sessionEnded) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        setStats(prev => ({ ...prev, sessionDuration: elapsed }));
        
        if (elapsed >= sessionTimeLimit) {
          setSessionEnded(true);
          setGameMode('sessionComplete');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionStartTime, gameMode, sessionTimeLimit, sessionEnded]);

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((gameMode !== 'playing' && gameMode !== 'tricksPlay') || showFeedback || sessionEnded) return;
      
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        const newAnswer = userAnswer + e.key;
        setUserAnswer(newAnswer);
        
        if (currentProblem && shouldAutoConfirm(newAnswer, currentProblem.correctAnswer)) {
          setTimeout(() => checkAnswer(newAnswer), 300);
        }
      }
      
      if (e.key === 'Enter' && userAnswer) {
        e.preventDefault();
        checkAnswer(userAnswer);
      }
      
      if (e.key === 'Backspace') {
        e.preventDefault();
        setUserAnswer(prev => prev.slice(0, -1));
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setUserAnswer('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, userAnswer, showFeedback, currentProblem, sessionEnded]);

  const startGame = () => {
    setGameMode('playing');
    setUserAnswer('');
    setShowFeedback(false);
    setSessionStartTime(Date.now());
    setSessionEnded(false);
    setStats({ correct: 0, total: 0, averageTime: 0, streak: 0, sessionDuration: 0, errors: [] });
    const problem = generateProblem();
    setCurrentProblem(problem);
    setStartTime(Date.now());
  };

  const startTrickPractice = (trickId) => {
    setSelectedTrick(trickId);
    setGameMode('tricksPlay');
    setUserAnswer('');
    setShowFeedback(false);
    setSessionStartTime(Date.now());
    setSessionEnded(false);
    setStats({ correct: 0, total: 0, averageTime: 0, streak: 0, sessionDuration: 0, errors: [] });
    const problem = generateTrickProblem(trickId);
    setCurrentProblem(problem);
    setStartTime(Date.now());
  };

  const checkAnswer = (answer) => {
    if (!currentProblem || !answer || sessionEnded) return;
    
    const responseTime = Date.now() - startTime;
    const correct = parseInt(answer) === currentProblem.correctAnswer;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1000);
    }
    
    setStats(prev => {
      const newTotal = prev.total + 1;
      const newCorrect = prev.correct + (correct ? 1 : 0);
      const newStreak = correct ? prev.streak + 1 : 0;
      const newAvgTime = ((prev.averageTime * prev.total) + responseTime) / newTotal;
      const newErrors = correct ? prev.errors : [...prev.errors, {
        problem: currentProblem,
        userAnswer: answer,
        responseTime
      }];
      
      return {
        ...prev,
        correct: newCorrect,
        total: newTotal,
        averageTime: newAvgTime,
        streak: newStreak,
        errors: newErrors
      };
    });
    
    setTimeout(() => {
      if (!sessionEnded) {
        const newProblem = gameMode === 'tricksPlay' 
          ? generateTrickProblem(selectedTrick)
          : generateProblem();
        setCurrentProblem(newProblem);
        setUserAnswer('');
        setShowFeedback(false);
        setIsCorrect(null);
        setStartTime(Date.now());
      }
    }, correct ? 800 : 1200);
  };

  const getOperationSymbol = (op) => {
    switch(op) {
      case 'multiplication': return '×';
      case 'addition': return '+';
      case 'subtraction': return '−';
      default: return '×';
    }
  };

  const formatTime = (ms) => (ms / 1000).toFixed(1);
  const formatSessionTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Componente Sparkle
  const Sparkle = ({ show }) => (
    <div 
      className={`absolute top-4 right-4 pointer-events-none transition-all duration-500 ${
        show ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
    >
      <div className="text-4xl animate-bounce">✨</div>
    </div>
  );

  // Leaderboard Screen - Modern Landing Page
  const LeaderboardScreen = () => {
    const getRankEmoji = (rank) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      if (rank <= 10) return '🏆';
      if (rank <= 50) return '⭐';
      return '👤';
    };

    const getLevelName = (level) => {
      const levelData = levelSystem[level - 1];
      return levelData ? levelData.name : `Nivel ${level}`;
    };

    return (
      <div 
        className="min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${colors.background}dd, ${colors.surface}40), 
                      radial-gradient(circle at 20% 50%, ${colors.primaryLight}15 0%, transparent 50%), 
                      radial-gradient(circle at 80% 20%, ${colors.secondaryLight}15 0%, transparent 50%)`
        }}
      >
        {/* Navigation Bar */}
        <nav className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">🧮</div>
              <h1 
                className="text-2xl font-light tracking-wider bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent" 
                style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                mathboost
              </h1>
            </div>
            
            {/* Navigation Actions */}
            <div className="flex gap-3">
              {session ? (
                <button
                  onClick={() => setGameMode('welcome')}
                  className="group px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    ...liquidGlass,
                    color: colors.text,
                    fontFamily: 'Inter, -apple-system, sans-serif'
                  }}
                  onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
                >
                  👤 Mi Perfil
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setGameMode('auth')}
                    className="group px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105"
                    style={{
                      ...liquidGlass,
                      color: colors.text,
                      fontFamily: 'Inter, -apple-system, sans-serif'
                    }}
                    onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                    onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => setGameMode('auth')}
                    className="group px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      color: 'white',
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      border: 'none'
                    }}
                  >
                    Crear Cuenta
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-16 pb-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Main Headline */}
            <div className="mb-12">
              <h2 
                className={`${screenSize === 'mobile' ? 'text-4xl' : 'text-6xl'} font-light mb-6`}
                style={{ 
                  color: colors.text, 
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  lineHeight: '1.1'
                }}
              >
                Acelera tu <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">mente matemática</span>
              </h2>
              <p 
                className={`${screenSize === 'mobile' ? 'text-lg' : 'text-xl'} font-light max-w-3xl mx-auto`}
                style={{ 
                  color: colors.textSecondary, 
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  lineHeight: '1.6'
                }}
              >
                Entrena tu velocidad de cálculo mental y únete a miles de usuarios que mejoran su agilidad matemática cada día
              </p>
            </div>

            {/* CTA Button */}
            <div className="mb-20">
              {session ? (
                <button
                  onClick={() => setGameMode('setup')}
                  className="group px-8 py-4 text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    color: 'white',
                    fontFamily: 'Inter, -apple-system, sans-serif',
                    border: 'none'
                  }}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300 inline-block mr-2">🚀</span>
                  Comenzar Entrenamiento
                </button>
              ) : (
                <button
                  onClick={() => setGameMode('auth')}
                  className="group px-8 py-4 text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    color: 'white',
                    fontFamily: 'Inter, -apple-system, sans-serif',
                    border: 'none'
                  }}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300 inline-block mr-2">⚡</span>
                  Empezar Gratis
                </button>
              )}
            </div>

            {/* Leaderboard Section - Compact */}
            <div className="max-w-4xl mx-auto">
              <h3 
                className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} font-medium mb-8 text-center`}
                style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                🏆 Rankings de Genios
              </h3>
              <div 
                className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98 mb-6`}
                style={{
                  ...liquidGlass,
                  padding: r.cardPadding
                }}
                onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
              >
                {leaderboardLoading ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4 animate-spin">🧮</div>
                    <div className={`${getTypeSize('body', screenSize)}`} style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                      Cargando clasificación...
                    </div>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-4 animate-bounce">🚀</div>
                    <div className={`${getTypeSize('h3', screenSize)} font-medium mb-2`} style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                      ¡Sé el primer genio!
                    </div>
                    <div className={`${getTypeSize('body', screenSize)} mb-4`} style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                      Demuestra tu velocidad mental
                    </div>
                    <button
                      onClick={() => setGameMode('auth')}
                      className={`group w-full px-6 py-3 ${getTypeSize('button', screenSize)} font-medium rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98 min-h-[44px]`}
                      style={{
                        background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})`,
                        color: colors.text,
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        border: `2px solid ${colors.primary}20`,
                        ...liquidGlass
                      }}
                      onMouseEnter={(e) => Object.assign(e.target.style, { ...liquidGlassHover, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                      onMouseLeave={(e) => Object.assign(e.target.style, { ...liquidGlass, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300 inline-block">⚡</span>
                      <span className="ml-2">Ser el Primero</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 3).map((user, index) => (
                      <div 
                        key={user.profile_id}
                        className="p-4 rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98"
                        style={{
                          backgroundColor: index < 3 ? colors.accentActive : colors.surface,
                          border: `1px solid ${index < 3 ? colors.primary : colors.border}`,
                          ...liquidGlass,
                          animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                        }}
                        onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                        onMouseLeave={(e) => Object.assign(e.target.style, { ...liquidGlass, backgroundColor: index < 3 ? colors.accentActive : colors.surface })}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="text-2xl">
                                {getRankEmoji(user.global_ranking)}
                              </div>
                              <div className="text-lg font-bold" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                                #{user.global_ranking}
                              </div>
                            </div>
                            
                            <div className="text-2xl transition-transform duration-300 hover:scale-110">
                              {user.avatar_emoji}
                            </div>
                            
                            <div>
                              <div className={`${getTypeSize('cardTitle', screenSize)} font-medium capitalize`} style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                                {user.profile_name}
                              </div>
                              <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                                {getLevelName(user.current_level)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                              {user.total_problems_lifetime.toLocaleString()}
                            </div>
                            <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                              problemas
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Compact CTA */}
              <div className="text-center">
                <div className={`${getTypeSize('h3', screenSize)} font-medium mb-2`} style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                  ¡Únete a la élite!
                </div>
                <p 
                  className={`${getTypeSize('body', screenSize)} font-light mb-4`}
                  style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                >
                  Compite • Mejora • Domina
                </p>
                
                {session ? (
                  <button
                    onClick={() => setGameMode('setup')}
                    className="group w-full px-6 py-3 text-base font-medium rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98 min-h-[44px]"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})`,
                      color: colors.text,
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      border: `2px solid ${colors.primary}20`,
                      ...liquidGlass
                    }}
                    onMouseEnter={(e) => Object.assign(e.target.style, { ...liquidGlassHover, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                    onMouseLeave={(e) => Object.assign(e.target.style, { ...liquidGlass, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                  >
                    <span className="group-hover:scale-110 transition-transform duration-300 inline-block">🚀</span>
                    <span className="ml-2">Comenzar Entrenamiento</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setGameMode('auth')}
                    className="group w-full px-6 py-3 text-base font-medium rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98 min-h-[44px]"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})`,
                      color: colors.text,
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      border: `2px solid ${colors.primary}20`,
                      ...liquidGlass
                    }}
                    onMouseEnter={(e) => Object.assign(e.target.style, { ...liquidGlassHover, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                    onMouseLeave={(e) => Object.assign(e.target.style, { ...liquidGlass, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                  >
                    <span className="group-hover:scale-110 transition-transform duration-300 inline-block">🏆</span>
                    <span className="ml-2">Crear Cuenta</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Desktop/tablet layout (unchanged)
          <div className={`${r.padding} max-w-6xl mx-auto`}>
            {/* Professional Header with Liquid Glass Styling */}
            <div className="flex justify-between items-center mb-12">
              <h1 
                className={`${getTypeSize('h1', screenSize)} font-light tracking-wider bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`} 
                style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                mathboost
              </h1>
              
              <div className="flex gap-4">
                {session ? (
                  <button
                    onClick={() => setGameMode('welcome')}
                    className="group px-6 py-3 text-base font-medium rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98 min-h-[44px]"
                    style={{
                      ...liquidGlass,
                      color: colors.text,
                      fontFamily: 'Inter, -apple-system, sans-serif'
                    }}
                    onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                    onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
                  >
                    👤 Mi Perfil
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setGameMode('auth')}
                      className="group px-6 py-3 text-base font-medium rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98 min-h-[44px]"
                      style={{
                        ...liquidGlass,
                        color: colors.text,
                        fontFamily: 'Inter, -apple-system, sans-serif'
                      }}
                      onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                      onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
                    >
                      🔑 Login
                    </button>
                    <button
                      onClick={() => setGameMode('auth')}
                      className="group px-6 py-3 text-base font-medium rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98 min-h-[44px]"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})`,
                        color: colors.text,
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        border: `2px solid ${colors.primary}20`,
                        ...liquidGlass
                      }}
                      onMouseEnter={(e) => Object.assign(e.target.style, { ...liquidGlassHover, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                      onMouseLeave={(e) => Object.assign(e.target.style, { ...liquidGlass, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                    >
                      ⚡ Crear Cuenta
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Enhanced Subtitle with Proper Typography */}
            <div className="text-center mb-16">
              <p 
                className={`${getTypeSize('body', screenSize)} font-light`}
                style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                Clasificación global de genios matemáticos
              </p>
            </div>

            {/* Professional Leaderboard Section */}
            <div className="mb-16">
              <h2 
                className={`${getTypeSize('h2', screenSize)} font-medium mb-12 text-center`}
                style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                🧠 Math Genius Rankings
              </h2>

              <div 
                className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}
                style={{
                  ...liquidGlass,
                  padding: r.cardPadding
                }}
                onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
              >
                {leaderboardLoading ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-6 animate-spin">🧮</div>
                    <div className={`${getTypeSize('body', screenSize)}`} style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                      Cargando clasificación...
                    </div>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-6 animate-bounce">🚀</div>
                    <div className={`${getTypeSize('h3', screenSize)} font-medium mb-4`} style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                      ¡Sé el primer genio en aparecer aquí!
                    </div>
                    <div className={`${getTypeSize('body', screenSize)} mb-8`} style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                      Demuestra tu velocidad mental y alcanza la cima
                    </div>
                    <button
                      onClick={() => setGameMode('auth')}
                      className="group px-8 py-4 text-base font-medium rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98 min-h-[44px]"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})`,
                        color: colors.text,
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        border: `2px solid ${colors.primary}20`,
                        ...liquidGlass
                      }}
                      onMouseEnter={(e) => Object.assign(e.target.style, { ...liquidGlassHover, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                      onMouseLeave={(e) => Object.assign(e.target.style, { ...liquidGlass, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300 inline-block">⚡</span>
                      <span className="ml-2">Ser el Primero</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {leaderboard.map((user, index) => (
                      <div 
                        key={user.profile_id}
                        className="p-8 rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98"
                        style={{
                          backgroundColor: index < 3 ? colors.accentActive : colors.surface,
                          border: `1px solid ${index < 3 ? colors.primary : colors.border}`,
                          ...liquidGlass,
                          animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                        }}
                        onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                        onMouseLeave={(e) => Object.assign(e.target.style, { ...liquidGlass, backgroundColor: index < 3 ? colors.accentActive : colors.surface })}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl">
                                {getRankEmoji(user.global_ranking)}
                              </div>
                              <div className="text-2xl font-bold" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                                #{user.global_ranking}
                              </div>
                            </div>
                            
                            <div className="text-4xl transition-transform duration-300 hover:scale-110">
                              {user.avatar_emoji}
                            </div>
                            
                            <div>
                              <div className={`${getTypeSize('cardTitle', screenSize)} font-medium capitalize mb-1`} style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                                {user.profile_name}
                              </div>
                              <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                                {getLevelName(user.current_level)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold mb-1" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                              {user.total_problems_lifetime.toLocaleString()}
                            </div>
                            <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                              problemas
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Professional Call to Action */}
            <div className="text-center">
              <div className={`${getTypeSize('h3', screenSize)} font-medium mb-4`} style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                ¡Únete a la élite matemática!
              </div>
              <p 
                className={`${getTypeSize('body', screenSize)} font-light mb-8`}
                style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                Compite • Mejora • Domina
              </p>
              
              {session ? (
                <button
                  onClick={() => setGameMode('setup')}
                  className="group px-10 py-4 text-base font-medium rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98 min-h-[44px]"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})`,
                    color: colors.text,
                    fontFamily: 'Inter, -apple-system, sans-serif',
                    border: `2px solid ${colors.primary}20`,
                    ...liquidGlass
                  }}
                  onMouseEnter={(e) => Object.assign(e.target.style, { ...liquidGlassHover, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                  onMouseLeave={(e) => Object.assign(e.target.style, { ...liquidGlass, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300 inline-block">🚀</span>
                  <span className="ml-2">Comenzar Entrenamiento</span>
                </button>
              ) : (
                <button
                  onClick={() => setGameMode('auth')}
                  className="group px-10 py-4 text-base font-medium rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98 min-h-[44px]"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})`,
                    color: colors.text,
                    fontFamily: 'Inter, -apple-system, sans-serif',
                    border: `2px solid ${colors.primary}20`,
                    ...liquidGlass
                  }}
                  onMouseEnter={(e) => Object.assign(e.target.style, { ...liquidGlassHover, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                  onMouseLeave={(e) => Object.assign(e.target.style, { ...liquidGlass, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})` })}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300 inline-block">🏆</span>
                  <span className="ml-2">Crear Cuenta</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Authentication Screen
  const AuthScreen = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (e) => {
      e.preventDefault();
      setAuthError('');
      setIsLoading(true);

      console.log('handleAuth: Starting auth process', { isSignUp, email });

      const result = isSignUp 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (!result.success) {
        console.error('handleAuth: Auth failed', result.error);
        setAuthError(result.error);
      } else {
        console.log('handleAuth: Auth successful', { isSignUp });
        // After successful auth, check if user has profiles
        if (isSignUp) {
          // For new users, always show create profile screen
          console.log('handleAuth: New user, showing create profile');
          setShowCreateProfile(true);
          setShowUserSelection(false);
        } else {
          // For existing users, check if they have profiles
          console.log('handleAuth: Existing user, loading profiles');
          await loadUserProfiles();
          const profileCount = Object.keys(users).length;
          console.log('handleAuth: Profile count', { profileCount });
          
          if (profileCount === 0) {
            // No profiles found, show create profile
            console.log('handleAuth: No profiles found, showing create profile');
            setShowCreateProfile(true);
            setShowUserSelection(false);
          } else {
            // Has profiles, show user selection
            console.log('handleAuth: Profiles found, showing user selection');
            setShowUserSelection(true);
          }
        }
        setGameMode('welcome'); // This will be overridden by the show states
      }
      
      setIsLoading(false);
    };

    return (
      <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
        <div className={`${r.padding} max-w-md mx-auto`}>
          <div className="text-center mb-12">
            <h1 
              className={`${getTypeSize('h1', screenSize)} font-light tracking-wider mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`} 
              style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              mathboost
            </h1>
            <p 
              className={`${getTypeSize('body', screenSize)} font-light`}
              style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              {isSignUp ? 'Crea tu cuenta para comenzar' : 'Inicia sesión para continuar'}
            </p>
          </div>

          <div 
            className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}
            style={{
              ...liquidGlass,
              padding: r.cardPadding
            }}
          >
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className={`${getTypeSize('caption', screenSize)} font-medium mb-3 block`} style={{ color: colors.text }}>
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full p-4 pl-12 rounded-2xl border ${getTypeSize('body', screenSize)} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:scale-102`}
                    style={{ 
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                      fontFamily: 'Inter, -apple-system, sans-serif'
                    }}
                    placeholder="tu@email.com"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">
                    🧮
                  </div>
                </div>
                <div className={`${getTypeSize('caption', screenSize)} mt-2`} style={{ color: colors.textSecondary }}>
                  Usaremos este email para tu cuenta de MathBoost
                </div>
              </div>

              <div>
                <label className={`${getTypeSize('caption', screenSize)} font-medium mb-3 block`} style={{ color: colors.text }}>
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className={`w-full p-4 pl-12 rounded-2xl border ${getTypeSize('body', screenSize)} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:scale-102`}
                    style={{ 
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                      fontFamily: 'Inter, -apple-system, sans-serif'
                    }}
                    placeholder="••••••••"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">
                    🔒
                  </div>
                </div>
                <div className={`${getTypeSize('caption', screenSize)} mt-2`} style={{ color: colors.textSecondary }}>
                  Mínimo 6 caracteres para tu seguridad
                </div>
              </div>

              {authError && (
                <div className={`${getTypeSize('caption', screenSize)} p-4 rounded-2xl transition-all duration-300`} style={{ 
                  backgroundColor: colors.error,
                  color: colors.errorText,
                  border: `1px solid ${colors.errorText}20`,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`group w-full py-4 ${getTypeSize('button', screenSize)} font-medium rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98 disabled:opacity-50 shadow-lg hover:shadow-xl`}
                style={{
                  background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})`,
                  color: colors.text,
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  border: `2px solid ${colors.primary}20`,
                  ...liquidGlass
                }}
              >
                <span className="group-hover:scale-110 transition-transform duration-300 inline-block">
                  {isLoading ? '⏳' : (isSignUp ? '🚀' : '🔑')}
                </span>
                <span className="ml-2">
                  {isLoading ? 'Cargando...' : (isSignUp ? 'Crear cuenta' : 'Iniciar sesión')}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className={`${getTypeSize('caption', screenSize)} font-medium transition-all duration-300 hover:scale-105 hover:text-blue-600`}
                style={{ color: colors.primary }}
              >
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pantalla de selección de usuario
  const UserSelectionScreen = () => (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
      <div className={`${r.padding} max-w-4xl mx-auto`}>
        <div className={`text-center ${screenSize === 'mobile' ? 'mb-12' : 'mb-16'}`}>
          <h1 
            className={`${r.logoSize} font-light tracking-wider ${screenSize === 'mobile' ? 'mb-6' : 'mb-8'} bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`} 
            style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
          >
            mathboost
          </h1>
          <p 
            className={`${screenSize === 'mobile' ? 'text-base' : 'text-lg'} font-light ${screenSize === 'mobile' ? 'mb-8' : 'mb-12'}`}
            style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
          >
            Selecciona tu perfil o crea uno nuevo
          </p>
          
          <div className={`grid ${screenSize === 'mobile' ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-6'} mb-8`}>
            {Object.values(users).map((userData) => (
              <button
                key={userData.name}
                onClick={() => switchUser(userData.name)}
                className={`group ${screenSize === 'mobile' ? 'p-4' : 'p-8'} ${screenSize === 'mobile' ? 'text-left' : 'text-center'} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}
                style={{
                  color: colors.text
                }}
              >
                {screenSize === 'mobile' ? (
                  // Layout compacto horizontal para mobile
                  <div className="flex items-center gap-4">
                    <div className={`${screenSize === 'mobile' ? 'text-4xl' : 'text-6xl'} group-hover:scale-110 transition-transform duration-300`}>
                      {userData.avatar}
                    </div>
                    <div className="flex-1">
                      <div className={`${screenSize === 'mobile' ? 'text-lg' : 'text-xl'} font-medium mb-1 capitalize`} style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
                        {userData.name}
                      </div>
                      <div className={`${screenSize === 'mobile' ? 'text-sm' : 'text-sm'} mb-1`} style={{ color: colors.textSecondary }}>
                        {getUserLevelName(userData)} • Nivel {userData.currentLevel}
                      </div>
                      <div className={`${screenSize === 'mobile' ? 'text-sm' : 'text-sm'} font-light`} style={{ color: colors.textSecondary }}>
                        {userData.totalProblemsLifetime.toLocaleString()} problemas
                      </div>
                    </div>
                  </div>
                ) : (
                  // Layout vertical para desktop/tablet
                  <>
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {userData.avatar}
                    </div>
                    <div className="text-xl font-medium mb-2 capitalize" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
                      {userData.name}
                    </div>
                    <div className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                      {getUserLevelName(userData)} • Nivel {userData.currentLevel}
                    </div>
                    <div className="text-sm font-light" style={{ color: colors.textSecondary }}>
                      {userData.totalProblemsLifetime.toLocaleString()} problemas
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              setShowCreateProfile(true);
              setShowUserSelection(false);
            }}
            className={`group ${screenSize === 'mobile' ? 'px-6 py-4' : 'px-8 py-6'} ${screenSize === 'mobile' ? 'text-base' : 'text-lg'} font-medium rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}
            style={{
              color: colors.text,
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}
          >
            <div className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} mb-2`}>➕</div>
            <div>Crear nuevo perfil</div>
          </button>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setGameMode('leaderboard')}
              className={`${getTypeSize('caption', screenSize)} font-medium transition-all duration-300 hover:scale-105`}
              style={{ color: colors.primary }}
            >
              🏆 Ver Clasificación
            </button>
            <button
              onClick={signOut}
              className={`${getTypeSize('caption', screenSize)} font-medium transition-all duration-300 hover:scale-105`}
              style={{ color: colors.textSecondary }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Pantalla de creación de perfil
  const CreateProfileScreen = () => (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
      <div className={`fixed top-0 left-0 right-0 z-50 ${r.headerPadding}`}
        style={{ 
          backgroundColor: colors.background,
          borderBottom: `1px solid ${colors.border}`,
          backdropFilter: 'blur(20px) saturate(200%)'
        }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => {
              setShowCreateProfile(false);
              setShowUserSelection(true);
              setNewProfileName('');
              setNewProfileEmoji('👤');
            }}
            className="group p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            style={liquidGlass}
            onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
            onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
          >
            <ArrowLeft size={18} color={colors.text} />
          </button>
        </div>
      </div>
      <div className={`${r.padding} max-w-2xl mx-auto`}>
        <div className="text-center mb-16">
          <h1 
            className="text-4xl font-light mb-8" 
            style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
          >
            Crear nuevo perfil
          </h1>
          
          <div className={`${r.cardPadding} rounded-3xl`} style={liquidGlass}>
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4" style={{ color: colors.text }}>
                Elige tu avatar
              </h3>
              <div className="text-6xl mb-4">{newProfileEmoji}</div>
              <div className="grid grid-cols-6 md:grid-cols-10 gap-3 max-h-40 overflow-y-auto">
                {availableEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewProfileEmoji(emoji)}
                    className={`text-2xl p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                      newProfileEmoji === emoji ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4" style={{ color: colors.text }}>
                Tu nombre
              </h3>
              <input
                ref={nameInputRef}
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onFocus={() => {
                  // Ensure input stays focused
                  setTimeout(() => {
                    if (nameInputRef.current) {
                      nameInputRef.current.focus();
                    }
                  }, 100);
                }}
                placeholder="Escribe tu nombre..."
                className="w-full p-4 rounded-xl border text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ 
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
                maxLength={20}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCreateProfile(false);
                  setShowUserSelection(true);
                  setNewProfileName('');
                  setNewProfileEmoji('👤');
                }}
                className="flex-1 py-3 text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textSecondary,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  console.log('🔘 Create profile button clicked', { 
                    newProfileName, 
                    newProfileEmoji, 
                    session: !!session?.user,
                    sessionUserId: session?.user?.id,
                    isCreatingProfile
                  });
                  createNewProfile();
                }}
                disabled={!newProfileName.trim() || isCreatingProfile}
                className="flex-1 py-3 text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: isCreatingProfile ? colors.textSecondary : colors.primary,
                  color: 'white',
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
              >
                {isCreatingProfile ? '⏳ Creando perfil...' : 'Crear perfil'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Header de navegación actualizado
  const NavigationHeader = ({ showBack = false, onBack = null }) => (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 ${r.headerPadding}`}
      style={{ 
        backgroundColor: colors.background,
        borderBottom: `1px solid ${colors.border}`,
        backdropFilter: 'blur(20px) saturate(200%)'
      }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className={`group ${r.headerCompact ? 'p-4' : 'p-3'} rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px]`}
              style={liquidGlass}
              onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
            >
              <ArrowLeft size={r.headerCompact ? 22 : 18} color={colors.text} />
            </button>
          )}
          
          {/* Timer durante entrenamiento - optimizado para mobile */}
          {(gameMode === 'playing' || gameMode === 'tricksPlay') && !sessionEnded && (
            <div 
              className={`${r.headerCompact ? 'flex-col gap-1' : 'flex items-center gap-4'} px-4 py-3 rounded-2xl`}
              style={{
                ...liquidGlass,
                color: colors.text,
                fontFamily: 'Inter, -apple-system, sans-serif',
                boxShadow: r.headerCompact ? `0 4px 20px ${colors.shadowRich}` : liquidGlass.boxShadow
              }}
            >
              {/* Primera fila: Timer */}
              <div className="flex items-center gap-2">
                <Clock size={r.headerCompact ? 16 : 18} color={colors.primary} />
                <span className={`${r.headerCompact ? r.body : r.body} font-semibold`} style={{ fontFamily: 'Georgia, serif' }}>
                  {formatSessionTime(stats.sessionDuration)}
                </span>
                <span className={`${r.headerCompact ? 'text-xs' : 'text-sm'}`} style={{ color: colors.textTertiary }}>/ 5:00</span>
              </div>
              
              {/* Segunda fila: Stats (solo en mobile compacto) */}
              {r.headerCompact ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Target size={14} color={colors.secondary} />
                    <span className={`${r.body} font-semibold`} style={{ fontFamily: 'Georgia, serif' }}>
                      {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  {stats.streak > 0 && (
                    <div className="flex items-center gap-2">
                      <div className={r.body}>🔥</div>
                      <span className={`${r.body} font-semibold`} style={{ fontFamily: 'Georgia, serif' }}>
                        {stats.streak}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <Target size={18} color={colors.secondary} />
                    <span className={`${r.body} font-semibold`} style={{ fontFamily: 'Georgia, serif' }}>
                      {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  {stats.streak > 0 && (
                    <>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <div className="flex items-center gap-2">
                        <div className={r.body}>🔥</div>
                        <span className={`${r.body} font-semibold`} style={{ fontFamily: 'Georgia, serif' }}>
                          {stats.streak}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          {/* Usuario actual - siempre visible */}
          {user && (
            <button
              onClick={() => setShowUserSelection(true)}
              className={`group flex items-center gap-2 ${r.headerCompact ? 'p-3' : 'p-3'} rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px]`}
              style={liquidGlass}
              onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
              title="Cambiar usuario"
            >
              <div className={r.headerCompact ? 'text-lg' : 'text-lg'}>{user.avatar}</div>
              <span className={`${r.headerCompact ? r.caption : r.caption} capitalize`} style={{ color: colors.text }}>{user.name}</span>
              <div className={`${r.headerCompact ? 'text-xs' : 'text-xs'}`} style={{ color: colors.textTertiary }}>▼</div>
            </button>
          )}
          
          {/* Solo mostrar navegación cuando NO está en entrenamiento */}
          {gameMode !== 'playing' && gameMode !== 'tricksPlay' && (
            <>
              {gameMode !== 'stats' && (
                <button
                  onClick={() => setGameMode('stats')}
                  className={`group ${r.headerCompact ? 'p-3' : 'p-3'} rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px]`}
                  style={liquidGlass}
                  onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
                >
                  <BarChart3 size={r.headerCompact ? 20 : 18} color={colors.textSecondary} />
                </button>
              )}
              {gameMode !== 'tricks' && (
                <button
                  onClick={() => setGameMode('tricks')}
                  className={`group ${r.headerCompact ? 'p-3' : 'p-3'} rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px]`}
                  style={liquidGlass}
                  onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
                >
                  <Lightbulb size={r.headerCompact ? 20 : 18} color={colors.textSecondary} />
                </button>
              )}
              {gameMode !== 'welcome' && (
                <button
                  onClick={() => setGameMode('welcome')}
                  className={`group ${r.headerCompact ? 'p-3' : 'p-3'} rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px]`}
                  style={liquidGlass}
                  onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
                >
                  <User size={r.headerCompact ? 20 : 18} color={colors.textSecondary} />
                </button>
              )}
            </>
          )}
          
          {/* Botón de salir solo durante entrenamiento */}
          {(gameMode === 'playing' || gameMode === 'tricksPlay') && (
            <button
              onClick={() => setGameMode('welcome')}
              className={`group ${r.headerCompact ? 'p-4' : 'p-3'} rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px]`}
              style={liquidGlass}
              onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
              title="Salir del entrenamiento"
            >
              <X size={r.headerCompact ? 22 : 18} color={colors.textSecondary} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Teclado numérico para mobile
  const MobileKeyboard = () => {
    if (screenSize !== 'mobile' || (gameMode !== 'playing' && gameMode !== 'tricksPlay') || showFeedback || sessionEnded) {
      return null;
    }

    const handleNumberClick = (num) => {
      const newAnswer = userAnswer + num;
      setUserAnswer(newAnswer);
      
      if (currentProblem && shouldAutoConfirm(newAnswer, currentProblem.correctAnswer)) {
        setTimeout(() => checkAnswer(newAnswer), 300);
      }
    };

    const handleBackspace = () => {
      setUserAnswer(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
      setUserAnswer('');
    };

    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/5 p-4">
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="h-16 text-2xl font-semibold rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
              style={{ color: colors.text }}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          <button
            onClick={handleClear}
            className="h-16 text-lg font-semibold rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
            style={{ color: colors.textSecondary }}
          >
            C
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="h-16 text-2xl font-semibold rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
            style={{ color: colors.text }}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-16 text-lg font-semibold rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
            style={{ color: colors.textSecondary }}
          >
            ⌫
          </button>
        </div>
      </div>
    );
  };

  // Pantalla de bienvenida mejorada
  const WelcomeScreen = () => {
    if (!user) return null;
    
    return (
      <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
        <NavigationHeader />
        <div className={`${r.padding} max-w-6xl mx-auto`}>
          
          <div className="text-center mb-16">
            <h1 
              className={`${r.logoSize} font-light tracking-wider mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`} 
              style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              mathboost
            </h1>
            <div className={`${screenSize === 'mobile' ? 'mb-4' : 'mb-6'} ${screenSize === 'mobile' ? 'text-5xl' : 'text-6xl'} animate-bounce hover:scale-110 transition-transform duration-300`}>{user.avatar}</div>
            <p 
              className={`${getTypeSize('h2', screenSize)} font-light mb-8`}
              style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              {getUserLevelName(user)} • Nivel {user.currentLevel}
            </p>
            
            <button
              onClick={() => setGameMode('setup')}
              className={`group ${screenSize === 'mobile' ? 'px-8 py-4 text-xl' : 'px-12 py-6 text-2xl'} font-medium rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98 mb-4 shadow-2xl`}
              style={{
                background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})`,
                color: colors.text,
                fontFamily: 'Inter, -apple-system, sans-serif',
                border: `2px solid ${colors.primary}20`,
                ...liquidGlass
              }}
            >
              <span className="group-hover:scale-110 transition-transform duration-300 inline-block">🚀</span> comenzar entrenamiento
            </button>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setGameMode('leaderboard')}
                {...getButtonProps()}
                className={`group ${screenSize === 'mobile' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} font-medium rounded-2xl transition-all duration-300 hover:scale-102 active:scale-98`}
                style={{
                  ...liquidGlass,
                  color: colors.primary,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
              >
                🏆 Clasificación
              </button>
              <button
                onClick={() => setShowUserSelection(true)}
                {...getButtonProps()}
                className={`group ${screenSize === 'mobile' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} font-medium rounded-2xl transition-all duration-300 hover:scale-102 active:scale-98`}
                style={{
                  ...liquidGlass,
                  color: colors.textSecondary,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
              >
                👥 Cambiar usuario
              </button>
            </div>
          </div>

          <div className={`grid ${r.gridCols} ${r.gap} mb-12`}>
            <div 
              className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}
              style={cardStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, cardStyleHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, cardStyle)}
              onMouseDown={(e) => Object.assign(e.target.style, cardStyleActive)}
              onMouseUp={(e) => Object.assign(e.target.style, cardStyleHover)}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">📊</div>
                  <h3 className={`${getTypeSize('h3', screenSize)} font-medium`} style={{ color: colors.text }}>
                    Problemas semanales
                  </h3>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} font-light`} style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                    {user.totalProblemsThisWeek.toLocaleString()}
                  </span>
                  <span className={`${getTypeSize('body', screenSize)}`} style={{ color: colors.textSecondary }}>
                    / {getWeeklyProblemsGoal(user).toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (user.totalProblemsThisWeek / getWeeklyProblemsGoal(user)) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <p className={`${getTypeSize('caption', screenSize)} text-center`} style={{ color: colors.textSecondary }}>
                {getWeeklyProblemsGoal(user) - user.totalProblemsThisWeek > 0 
                  ? `${(getWeeklyProblemsGoal(user) - user.totalProblemsThisWeek).toLocaleString()} para completar meta`
                  : '¡Meta semanal completada! 🎉'
                }
              </p>
            </div>

            <div 
              className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}
              style={cardStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, cardStyleHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, cardStyle)}
              onMouseDown={(e) => Object.assign(e.target.style, cardStyleActive)}
              onMouseUp={(e) => Object.assign(e.target.style, cardStyleHover)}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">⚡</div>
                  <h3 className={`${getTypeSize('h3', screenSize)} font-medium`} style={{ color: colors.text }}>
                    Velocidad objetivo
                  </h3>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} font-light`} style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                    {user.averageResponseTime || 0}s
                  </span>
                  <span className={`${getTypeSize('body', screenSize)}`} style={{ color: colors.textSecondary }}>
                    / {getWeeklySpeedGoal(user)}s
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                    style={{ 
                      width: user.averageResponseTime > 0 
                        ? `${Math.min(100, Math.max(0, (getWeeklySpeedGoal(user) - user.averageResponseTime) / getWeeklySpeedGoal(user) * 100))}%`
                        : '0%'
                    }}
                  ></div>
                </div>
              </div>
              <p className={`${getTypeSize('caption', screenSize)} text-center`} style={{ color: colors.textSecondary }}>
                {user.averageResponseTime > 0 && user.averageResponseTime <= getWeeklySpeedGoal(user)
                  ? '¡Objetivo de velocidad alcanzado! 🎯'
                  : user.averageResponseTime > 0
                    ? `Mejora ${(user.averageResponseTime - getWeeklySpeedGoal(user)).toFixed(1)}s para meta`
                    : 'Comienza a entrenar para ver tu progreso'
                }
              </p>
            </div>
          </div>

          <div className={`grid ${r.gridCols} ${r.gap} mb-12`}>
            
            <div 
              className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}
              style={cardStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, cardStyleHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, cardStyle)}
              onMouseDown={(e) => Object.assign(e.target.style, cardStyleActive)}
              onMouseUp={(e) => Object.assign(e.target.style, cardStyleHover)}
            >
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔥</div>
                <h4 className={`${getTypeSize('h3', screenSize)} font-medium mb-2`} style={{ color: colors.text }}>
                  Rachas
                </h4>
                <div className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} font-light mb-1`} style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                  {user.currentStreak} días
                </div>
                <div className={`${getTypeSize('body', screenSize)} font-light mb-3`} style={{ color: colors.textSecondary }}>
                  actual
                </div>
                <div className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>
                  🏆 Mejor: {user.bestStreak} días
                </div>
              </div>
            </div>

            <div {...getCardProps()} className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💎</div>
                <h4 className={`${getTypeSize('h3', screenSize)} font-medium mb-2`} style={{ color: colors.text }}>
                  Tu velocidad
                </h4>
                <div className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} font-light mb-1`} style={{ color: colors.successText, fontFamily: 'Georgia, serif' }}>
                  {user.averageResponseTime || 0}s
                </div>
                <div className={`${getTypeSize('body', screenSize)} font-light mb-3`} style={{ color: colors.textSecondary }}>
                  promedio
                </div>
                <div className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>
                  📊 Global: {user.averageUserSpeed || 0}s
                </div>
              </div>
            </div>

            <div {...getCardProps()} className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{user.nextAchievement.emoji}</div>
                <h4 className={`${getTypeSize('h3', screenSize)} font-medium mb-2`} style={{ color: colors.text }}>
                  Próximo logro
                </h4>
                <div className={`${getTypeSize('body', screenSize)} font-medium mb-4`} style={{ color: colors.text }}>
                  {user.nextAchievement.name}
                </div>
                <div className="mb-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(user.nextAchievement.progress / user.nextAchievement.total) * 100}%` }}
                  ></div>
                </div>
                <div className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>
                  {user.nextAchievement.progress}/{user.nextAchievement.total}
                </div>
              </div>
            </div>

            <div {...getCardProps()} className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
                <h4 className={`${getTypeSize('h3', screenSize)} font-medium mb-2`} style={{ color: colors.text }}>
                  Total lifetime
                </h4>
                <div className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} font-light mb-1`} style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                  {user.totalProblemsLifetime.toLocaleString()}
                </div>
                <div className={`${getTypeSize('body', screenSize)} font-light mb-3`} style={{ color: colors.textSecondary }}>
                  problemas resueltos
                </div>
                <div className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>
                  ⏱️ {user.totalHoursInvested}h invertidas
                </div>
              </div>
            </div>

            <div {...getCardProps()} className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📈</div>
                <h4 className={`${getTypeSize('h3', screenSize)} font-medium mb-4`} style={{ color: colors.text }}>
                  Análisis de tablas
                </h4>
                <div className="space-y-3">
                  {user.bestTable && (
                    <div className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.successText }}>
                      💪 Dominas la del {user.bestTable}
                    </div>
                  )}
                  {user.weakestTable && (
                    <div className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>
                      🎯 Mejora la del {user.weakestTable}
                    </div>
                  )}
                  {!user.bestTable && !user.weakestTable && (
                    <div className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>
                      ¡Comienza a entrenar para ver tu análisis!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div {...getCardProps()} className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔮</div>
                <h4 className={`${getTypeSize('h3', screenSize)} font-medium mb-2`} style={{ color: colors.text }}>
                  Proyección
                </h4>
                <div className={`${getTypeSize('caption', screenSize)} font-light mb-2`} style={{ color: colors.text }}>
                  A este ritmo serás
                </div>
                <div className={`${getTypeSize('body', screenSize)} font-medium mb-2`} style={{ color: colors.text }}>
                  {user.projectionText}
                </div>
                <div className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>
                  en {user.projectionWeeks} semanas
                </div>
              </div>
            </div>
          </div>

          <div {...getCardProps()} className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 mb-8`}>
            <h3 className={`${getTypeSize('h3', screenSize)} font-medium mb-8 text-center`} style={{ color: colors.text }}>
              Patrones de actividad
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className={`${getTypeSize('h3', screenSize)} font-medium mb-4`} style={{ color: colors.text }}>Últimas 4 semanas</h4>
                <div className="flex justify-center mb-4">
                  <div className="grid grid-cols-7 gap-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                      <div key={index} className={`${getTypeSize('caption', screenSize)} text-center font-medium mb-2`} style={{ color: colors.textSecondary }}>
                        {day}
                      </div>
                    ))}
                    {user.practiceHeatmap.flat().map((intensity, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded transition-all duration-200 hover:scale-110"
                        style={{
                          backgroundColor: 
                            intensity === 0 ? colors.surface :
                            intensity === 1 ? `${colors.primary}40` :
                            intensity === 2 ? `${colors.primary}80` : colors.primary
                        }}
                        title={`${intensity} sesiones`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-center items-center gap-4">
                  <span className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>Menos</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(intensity => (
                      <div
                        key={intensity}
                        className="w-3 h-3 rounded"
                        style={{
                          backgroundColor: 
                            intensity === 0 ? colors.surface :
                            intensity === 1 ? `${colors.primary}40` :
                            intensity === 2 ? `${colors.primary}80` : colors.primary
                        }}
                      />
                    ))}
                  </div>
                  <span className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>Más</span>
                </div>
              </div>

              <div>
                <h4 className={`${getTypeSize('h3', screenSize)} font-medium mb-4`} style={{ color: colors.text }}>Insights de actividad</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} color={colors.primary} />
                    <div>
                      <div className={`${getTypeSize('body', screenSize)} font-medium`} style={{ color: colors.text }}>Mejores días</div>
                      <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary }}>
                        {user.activityPatterns.bestDays.length > 0 
                          ? user.activityPatterns.bestDays.join(', ')
                          : 'Por descubrir'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={20} color={colors.secondary} />
                    <div>
                      <div className={`${getTypeSize('body', screenSize)} font-medium`} style={{ color: colors.text }}>Horas preferidas</div>
                      <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary }}>
                        {user.activityPatterns.bestHours.length > 0 
                          ? user.activityPatterns.bestHours.join(', ')
                          : 'Por descubrir'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target size={20} color={colors.primary} />
                    <div>
                      <div className={`${getTypeSize('body', screenSize)} font-medium`} style={{ color: colors.text }}>Sesión promedio</div>
                      <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary }}>
                        {user.activityPatterns.avgSessionLength}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Setup mejorado con consistencia
  const SetupScreen = () => (
    <div style={{ backgroundColor: colors.background }} className={`${screenSize === 'mobile' ? 'h-screen flex flex-col' : 'min-h-screen pt-24'}`}>
      <NavigationHeader showBack={true} onBack={() => setGameMode('welcome')} />
      {screenSize === 'mobile' ? (
        // Layout compacto para mobile - sin scroll
        <div className="flex-1 flex flex-col justify-center px-4">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-6">
              <h1 
                className="text-2xl font-light mb-4"
                style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                configuración
              </h1>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={() => setSetupStep(1)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 ${
                    setupStep === 1 ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                    setupStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>1</div>
                  <span className={`text-xs ${setupStep === 1 ? 'text-gray-800' : 'text-gray-500'}`}>Operación</span>
                </button>
                <div className="w-6 h-px bg-gray-300"></div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${setupStep === 2 ? 'bg-gray-100' : 'bg-gray-50'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                    setupStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>2</div>
                  <span className={`text-xs ${setupStep === 2 ? 'text-gray-800' : 'text-gray-500'}`}>
                    {operation === 'multiplication' ? 'Tablas' : 'Rango'}
                  </span>
                </div>
              </div>
            </div>
            
            {setupStep === 1 && (
              <div className="space-y-4">
                <p 
                  className="text-center text-base font-light mb-4"
                  style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                >
                  ¿qué operación practicarás?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'multiplication', label: 'multiplicación', symbol: '×' },
                    { key: 'addition', label: 'suma', symbol: '+' },
                    { key: 'subtraction', label: 'resta', symbol: '−' }
                  ].map(op => (
                    <button
                      key={op.key}
                      onClick={() => {setOperation(op.key); setSetupStep(2);}}
                      className="group p-4 text-center rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                      style={{
                        backgroundColor: operation === op.key ? colors.accentActive : colors.surface,
                        color: colors.text
                      }}
                    >
                      <div 
                        className="text-3xl font-light mb-2 group-hover:scale-110 transition-transform duration-300"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {op.symbol}
                      </div>
                      <div 
                        className="text-sm font-medium"
                        style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
                      >
                        {op.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {setupStep === 2 && operation === 'multiplication' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p 
                    className="text-base font-light"
                    style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    selecciona las tablas
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[2, 3, 4, 5, 6, 7, 8, 9].map(table => (
                    <button
                      key={table}
                      onClick={() => {
                        setSelectedTables(prev => 
                          prev.includes(table) 
                            ? prev.filter(t => t !== table)
                            : [...prev, table]
                        );
                      }}
                      className="group p-3 text-center rounded-xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                      style={{
                        backgroundColor: selectedTables.includes(table) ? colors.accentActive : colors.surface,
                        color: colors.text
                      }}
                    >
                      <div 
                        className="text-lg font-medium group-hover:scale-110 transition-transform duration-300"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {table}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <button
                    onClick={startGame}
                    disabled={selectedTables.length === 0}
                    className="group px-6 py-2 text-sm font-medium rounded-xl transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                    style={{
                      color: colors.text,
                      fontFamily: 'Inter, -apple-system, sans-serif'
                    }}
                  >
                    comenzar entrenamiento
                  </button>
                </div>
              </div>
            )}

            {setupStep === 2 && (operation === 'addition' || operation === 'subtraction') && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p 
                    className="text-base font-light"
                    style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    rango de números
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: '1-9', label: '1 — 9' },
                    { key: '10-99', label: '10 — 99' },
                    { key: '100-999', label: '100 — 999' }
                  ].map(range => (
                    <button
                      key={range.key}
                      onClick={() => {setNumberRange(range.key); startGame();}}
                      className="group p-4 text-center rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                      style={{
                        backgroundColor: colors.surface,
                        color: colors.text
                      }}
                    >
                      <div 
                        className="text-lg font-medium group-hover:scale-110 transition-transform duration-300"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {range.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Layout para desktop/tablet (sin cambios)
        <div className={`flex items-center justify-center min-h-screen ${r.padding}`}>
          <div className="max-w-4xl w-full">
            <div className={`text-center ${screenSize === 'mobile' ? 'mb-16' : 'mb-20'}`}>
              <h1 
                className={`${screenSize === 'mobile' ? 'text-3xl' : 'text-4xl'} font-light ${screenSize === 'mobile' ? 'mb-6' : 'mb-8'}`}
                style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                configuración
              </h1>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => setSetupStep(1)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                    setupStep === 1 ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    setupStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>1</div>
                  <span className={`text-sm ${setupStep === 1 ? 'text-gray-800' : 'text-gray-500'}`}>Operación</span>
                </button>
                <div className="w-8 h-px bg-gray-300"></div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${setupStep === 2 ? 'bg-gray-100' : 'bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    setupStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>2</div>
                  <span className={`text-sm ${setupStep === 2 ? 'text-gray-800' : 'text-gray-500'}`}>
                    {operation === 'multiplication' ? 'Tablas' : 'Rango'}
                  </span>
                </div>
              </div>
            </div>
            
            {setupStep === 1 && (
              <div className="space-y-8">
                <p 
                  className={`text-center ${screenSize === 'mobile' ? 'text-xl' : 'text-lg'} font-light ${screenSize === 'mobile' ? 'mb-12' : 'mb-16'}`}
                  style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                >
                  ¿qué operación practicarás?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { key: 'multiplication', label: 'multiplicación', symbol: '×' },
                    { key: 'addition', label: 'suma', symbol: '+' },
                    { key: 'subtraction', label: 'resta', symbol: '−' }
                  ].map(op => (
                    <button
                      key={op.key}
                      onClick={() => {setOperation(op.key); setSetupStep(2);}}
                      className={`group ${screenSize === 'mobile' ? 'p-6' : 'p-12'} text-center rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}
                      style={{
                        backgroundColor: operation === op.key ? colors.accentActive : colors.surface,
                        color: colors.text
                      }}
                    >
                      <div 
                        className={`${screenSize === 'mobile' ? 'text-4xl' : 'text-6xl'} font-light ${screenSize === 'mobile' ? 'mb-4' : 'mb-6'} group-hover:scale-110 transition-transform duration-300`}
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {op.symbol}
                      </div>
                      <div 
                        className={`${screenSize === 'mobile' ? 'text-base' : 'text-lg'} font-medium`}
                        style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
                      >
                        {op.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {setupStep === 2 && operation === 'multiplication' && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <p 
                    className={`${screenSize === 'mobile' ? 'text-xl' : 'text-lg'} font-light`}
                    style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    selecciona las tablas
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[2, 3, 4, 5, 6, 7, 8, 9].map(table => (
                    <button
                      key={table}
                      onClick={() => {
                        setSelectedTables(prev => 
                          prev.includes(table) 
                            ? prev.filter(t => t !== table)
                            : [...prev, table]
                        );
                      }}
                      className={`group ${screenSize === 'mobile' ? 'p-6' : 'p-10'} text-center rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}
                      style={{
                        backgroundColor: selectedTables.includes(table) ? colors.accentActive : colors.surface,
                        color: colors.text
                      }}
                    >
                      <div 
                        className={`${screenSize === 'mobile' ? 'text-xl' : 'text-3xl'} font-medium group-hover:scale-110 transition-transform duration-300`}
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {table}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-center mt-12">
                  <button
                    onClick={startGame}
                    disabled={selectedTables.length === 0}
                    className={`group ${screenSize === 'mobile' ? 'px-8 py-3 text-base' : 'px-12 py-4 text-lg'} font-medium rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}
                    style={{
                      color: colors.text,
                      fontFamily: 'Inter, -apple-system, sans-serif'
                    }}
                  >
                    comenzar entrenamiento
                  </button>
                </div>
              </div>
            )}

            {setupStep === 2 && (operation === 'addition' || operation === 'subtraction') && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <p 
                    className={`${screenSize === 'mobile' ? 'text-xl' : 'text-lg'} font-light`}
                    style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    rango de números
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { key: '1-9', label: '1 — 9' },
                    { key: '10-99', label: '10 — 99' },
                    { key: '100-999', label: '100 — 999' }
                  ].map(range => (
                    <button
                      key={range.key}
                      onClick={() => {setNumberRange(range.key); startGame();}}
                      className={`group ${screenSize === 'mobile' ? 'p-6' : 'p-12'} text-center rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}
                      style={{
                        backgroundColor: colors.surface,
                        color: colors.text
                      }}
                    >
                      <div 
                        className={`${screenSize === 'mobile' ? 'text-xl' : 'text-3xl'} font-medium group-hover:scale-110 transition-transform duration-300`}
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {range.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Game Screen
  const GameScreen = () => (
    <div style={{ backgroundColor: colors.background }} className={`${screenSize === 'mobile' ? 'h-screen flex flex-col' : 'min-h-screen pt-24'}`}>
      <NavigationHeader />
      {screenSize === 'mobile' ? (
        // Layout optimizado para mobile
        <div className="flex-1 flex flex-col justify-center px-4 pb-32">
          <div className="max-w-3xl w-full text-center">
            {currentProblem && !sessionEnded && (
              <div className="space-y-8">
                <div className="mb-4">
                  <div 
                    className={`${r.problemSize} font-light mb-4 tracking-wider animate-pulse`}
                    style={{ 
                      color: colors.text, 
                      fontFamily: 'Georgia, serif',
                      animationDuration: '3s',
                      animationIterationCount: '1',
                      textShadow: `0 4px 20px ${colors.shadowRich}`
                    }}
                  >
                    {currentProblem.num1} {getOperationSymbol(currentProblem.operation)} {currentProblem.num2}
                  </div>
                  <div className="h-1 w-20 mx-auto bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                
                <div className="relative">
                  <Sparkle show={showSparkle} />
                  <div 
                    className={`relative ${r.answerSize} font-light min-h-[100px] flex items-center justify-center transition-all duration-500`}
                    style={{ 
                      color: showFeedback ? (isCorrect ? colors.successText : colors.errorText) : colors.text,
                      fontFamily: 'Georgia, serif',
                      textShadow: showFeedback ? `0 8px 32px ${isCorrect ? colors.success : colors.error}` : 'none'
                    }}
                  >
                    {showFeedback 
                      ? currentProblem.correctAnswer
                      : userAnswer || (
                        <span style={{ 
                          opacity: 0.3, 
                          borderBottom: `3px solid ${colors.border}`, 
                          paddingBottom: '6px',
                          animation: 'pulse 2s infinite'
                        }}>
                          {getExpectedDigits(currentProblem.correctAnswer) === 1 ? '_' : '__'}
                        </span>
                      )}
                  </div>
                  
                  {userAnswer && !showFeedback && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-1.5 overflow-hidden rounded-full" 
                         style={{ backgroundColor: colors.surface }}>
                      <div 
                        className="h-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-green-400"
                        style={{ 
                          width: `${(userAnswer.length / getExpectedDigits(currentProblem.correctAnswer)) * 100}%`
                        }}
                      ></div>
                    </div>
                  )}
                  
                  {showFeedback && !isCorrect && userAnswer && (
                    <div 
                      className="text-sm font-light mt-3 p-2 rounded-lg"
                      style={{ 
                        color: colors.textSecondary, 
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        backgroundColor: colors.error,
                        border: `1px solid ${colors.errorText}20`
                      }}
                    >
                      escribiste: <span style={{ fontFamily: 'Georgia, serif' }}>{userAnswer}</span>
                    </div>
                  )}
                </div>

                {/* No mostrar texto de instrucción en mobile - el teclado es obvio */}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Layout para desktop/tablet (sin cambios)
        <div className={`flex items-center justify-center ${r.gamePadding} min-h-screen`}>
          <div className="max-w-3xl w-full text-center">
            {currentProblem && !sessionEnded && (
              <div className={r.gameSpacing}>
                <div className="mb-20">
                  <div 
                    className={`${r.problemSize} font-light mb-12 tracking-wider animate-pulse`}
                    style={{ 
                      color: colors.text, 
                      fontFamily: 'Georgia, serif',
                      animationDuration: '3s',
                      animationIterationCount: '1',
                      textShadow: `0 4px 20px ${colors.shadowRich}`
                    }}
                  >
                    {currentProblem.num1} {getOperationSymbol(currentProblem.operation)} {currentProblem.num2}
                  </div>
                  <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                
                <div className="mb-20 relative">
                  <Sparkle show={showSparkle} />
                  <div 
                    className={`relative ${r.answerSize} font-light min-h-[160px] flex items-center justify-center transition-all duration-500 ${
                      showFeedback 
                        ? isCorrect ? 'scale-110' : 'scale-90'
                        : 'scale-100'
                    }`} 
                    style={{ 
                      color: showFeedback ? (isCorrect ? colors.successText : colors.errorText) : colors.text,
                      fontFamily: 'Georgia, serif',
                      textShadow: showFeedback ? `0 8px 32px ${isCorrect ? colors.success : colors.error}` : 'none'
                    }}
                  >
                    {showFeedback 
                      ? currentProblem.correctAnswer
                      : userAnswer || (
                        <span style={{ 
                          opacity: 0.3, 
                          borderBottom: `3px solid ${colors.border}`, 
                          paddingBottom: '12px',
                          animation: 'pulse 2s infinite'
                        }}>
                          {getExpectedDigits(currentProblem.correctAnswer) === 1 ? '_' : '__'}
                        </span>
                      )}
                  </div>
                  
                  {userAnswer && !showFeedback && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-2 overflow-hidden rounded-full" 
                         style={{ backgroundColor: colors.surface }}>
                      <div 
                        className="h-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-green-400"
                        style={{ 
                          width: `${(userAnswer.length / getExpectedDigits(currentProblem.correctAnswer)) * 100}%`
                        }}
                      ></div>
                    </div>
                  )}
                  
                  {showFeedback && !isCorrect && userAnswer && (
                    <div 
                      className="text-lg font-light mt-4 p-3 rounded-xl"
                      style={{ 
                        color: colors.textSecondary, 
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        backgroundColor: colors.error,
                        border: `1px solid ${colors.errorText}20`
                      }}
                    >
                      escribiste: <span style={{ fontFamily: 'Georgia, serif' }}>{userAnswer}</span>
                    </div>
                  )}
                </div>

                <div 
                  className="text-lg font-light"
                  style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                >
                  escribe tu respuesta
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <MobileKeyboard />
    </div>
  );

  // Session Complete Screen
  const SessionCompleteScreen = () => {
    // Save stats to Supabase when component mounts
    useEffect(() => {
      if (stats.total > 0 && user) {
        updateUserStats(stats);
        saveGameSession(stats);
      }
    }, []);

    return (
      <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
        <NavigationHeader />
        <div className={`flex items-center justify-center min-h-screen ${r.padding}`}>
          <div className="max-w-2xl w-full text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 
              className="text-3xl font-light mb-8" 
              style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              ¡Sesión completada!
            </h1>
            
            <div className={`${r.cardPadding} rounded-3xl mb-8 transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-light mb-2" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                    {stats.correct}
                  </div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>correctas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light mb-2" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                    {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                  </div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>precisión</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light mb-2" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                    {stats.total > 0 ? formatTime(stats.averageTime) : '0'}s
                  </div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>velocidad</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light mb-2" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                    5:00
                  </div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>duración</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setGameMode('setup')}
                {...getButtonProps()}
                className="px-8 py-3 text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-102 active:scale-98"
                style={{
                  ...liquidGlass,
                  color: colors.text,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
              >
                Otra sesión
              </button>
              <button
                onClick={() => setGameMode('welcome')}
                {...getButtonProps()}
                className="px-8 py-3 text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-102 active:scale-98"
                style={{
                  ...liquidGlass,
                  color: colors.text,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tricks Play Screen
  const TricksPlayScreen = () => {
    const trick = mathTricks.find(t => t.id === selectedTrick);
    
    return (
      <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
        <NavigationHeader showBack={true} onBack={() => setGameMode('tricks')} />
        <div className={`flex items-center justify-center ${r.gamePadding} ${screenSize === 'mobile' ? 'min-h-[calc(100vh-6rem)]' : 'min-h-screen'}`}>
          <div className="max-w-3xl w-full text-center">
            <div className={`${screenSize === 'mobile' ? 'mb-8' : 'mb-16'}`}>
              <div className={`${screenSize === 'mobile' ? 'text-4xl' : 'text-6xl'} mb-4`}>{trick?.emoji}</div>
              <h2 
                className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} font-light mb-4`}
                style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                {trick?.title}
              </h2>
              <p 
                className={`${screenSize === 'mobile' ? 'text-base' : 'text-lg'} font-light`}
                style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                {trick?.method}
              </p>
            </div>
            
            {currentProblem && !sessionEnded && (
              <div className={r.gameSpacing}>
                <div className={`${screenSize === 'mobile' ? 'mb-8' : 'mb-20'}`}>
                  <div 
                    className={`${r.problemSize} font-light ${screenSize === 'mobile' ? 'mb-6' : 'mb-12'} tracking-wider`}
                    style={{ color: colors.text, fontFamily: 'Georgia, serif' }}
                  >
                    {currentProblem.trick === 'square-ending-5' 
                      ? `${currentProblem.num1}²` 
                      : currentProblem.trick === 'percentage-10'
                      ? `10% de ${currentProblem.num1}`
                      : `${currentProblem.num1} ${getOperationSymbol(currentProblem.operation)} ${currentProblem.num2}`
                    }
                  </div>
                  <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                
                <div className={`${screenSize === 'mobile' ? 'mb-12' : 'mb-20'} relative`}>
                  <Sparkle show={showSparkle} />
                  <div 
                    className={`${r.answerSize} font-light ${screenSize === 'mobile' ? 'min-h-[120px]' : 'min-h-[160px]'} flex items-center justify-center transition-all duration-500 ${
                      showFeedback 
                        ? isCorrect ? 'scale-110' : 'scale-90'
                        : 'scale-100'
                    }`} 
                    style={{ 
                      color: showFeedback ? (isCorrect ? colors.successText : colors.errorText) : colors.text,
                      fontFamily: 'Georgia, serif'
                    }}
                  >
                    {showFeedback 
                      ? currentProblem.correctAnswer
                      : userAnswer || (
                        <span style={{ 
                          opacity: 0.3, 
                          borderBottom: `3px solid ${colors.border}`, 
                          paddingBottom: screenSize === 'mobile' ? '8px' : '12px'
                        }}>
                          aplica el método
                        </span>
                      )}
                  </div>
                  
                  {showFeedback && (
                    <div 
                      className={`${screenSize === 'mobile' ? 'text-base' : 'text-lg'} font-light mt-4`}
                      style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                    >
                      {isCorrect ? '✨ método aplicado correctamente' : '🤔 revisa el procedimiento'}
                    </div>
                  )}
                </div>

                <div 
                  className={`${screenSize === 'mobile' ? 'text-sm' : 'text-lg'} font-light p-4 rounded-2xl`}
                  style={{ 
                    color: colors.textSecondary, 
                    backgroundColor: colors.surface,
                    fontFamily: 'Georgia, serif',
                    border: `1px solid ${colors.border}`
                  }}
                >
                  {trick?.example}
                </div>
              </div>
            )}
          </div>
        </div>
        <MobileKeyboard />
      </div>
    );
  };

  // Stats Screen expandido
  const StatsScreen = () => {
    if (!user) return null;
    
    return (
      <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
        <NavigationHeader />
        <div className={`${screenSize === 'mobile' ? 'px-4 pb-8' : 'flex items-center justify-center min-h-screen'} ${r.padding}`}>
          <div className={`${screenSize === 'mobile' ? 'w-full' : 'max-w-6xl w-full'}`}>
            {/* Header - Compact on mobile */}
            <div className={`text-center ${screenSize === 'mobile' ? 'mb-8' : 'mb-20'}`}>
              <h1 
                className={`${getTypeSize('h1', screenSize)} font-light ${screenSize === 'mobile' ? 'mb-3' : 'mb-6'}`}
                style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                estadísticas avanzadas
              </h1>
              <p 
                className={`${getTypeSize('body', screenSize)} font-light`}
                style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                análisis profundo de tu evolución matemática
              </p>
            </div>

            {/* Profile Card - Compact on mobile */}
            <div {...getCardProps()} className={`${screenSize === 'mobile' ? 'p-4 mb-6' : r.cardPadding} rounded-3xl ${screenSize === 'mobile' ? 'mb-6' : 'mb-12'} transition-all duration-500 hover:scale-102 active:scale-98`}>
              <div className={`flex items-center ${screenSize === 'mobile' ? 'gap-3' : 'gap-4'} ${screenSize === 'mobile' ? 'mb-4' : 'mb-6'}`}>
                <div className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>{user.avatar}</div>
                <div>
                  <h3 className={`${getTypeSize('cardTitle', screenSize)} font-medium capitalize`} style={{ color: colors.text }}>
                    {user.name}
                  </h3>
                  <p className={`${getTypeSize('body', screenSize)}`} style={{ color: colors.textSecondary }}>
                    {getUserLevelName(user)} • Nivel {user.currentLevel}
                  </p>
                </div>
              </div>
              <div className={`${screenSize === 'mobile' ? 'p-3' : 'p-4'} rounded-xl`} style={{ backgroundColor: colors.accent }}>
                <h4 className={`${getTypeSize('h3', screenSize)} font-medium ${screenSize === 'mobile' ? 'mb-2' : 'mb-3'}`} style={{ color: colors.text }}>
                  Perfil de calculadora mental
                </h4>
                <p className={`${getTypeSize('body', screenSize)} leading-relaxed`} style={{ color: colors.textSecondary }}>
                  {user.personalProfile}
                </p>
              </div>
            </div>

            {/* Weekly Evolution - Restored from WelcomeScreen */}
            <div {...getCardProps()} className={`${screenSize === 'mobile' ? 'p-4 mb-6' : r.cardPadding} rounded-3xl ${screenSize === 'mobile' ? 'mb-6' : 'mb-12'} transition-all duration-500 hover:scale-102 active:scale-98`}>
              <div className={`grid ${screenSize === 'mobile' ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
                <div {...getCardProps()} className={`${screenSize === 'mobile' ? 'p-3' : 'p-4'} rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300">📊</div>
                      <h3 className={`${getTypeSize('h3', screenSize)} font-medium`} style={{ color: colors.text }}>
                        Problemas semanales
                      </h3>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} font-light`} style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                        {user.totalProblemsThisWeek.toLocaleString()}
                      </span>
                      <span className={`${getTypeSize('body', screenSize)}`} style={{ color: colors.textSecondary }}>
                        / {getWeeklyProblemsGoal(user).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (user.totalProblemsThisWeek / getWeeklyProblemsGoal(user)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className={`${getTypeSize('caption', screenSize)} text-center`} style={{ color: colors.textSecondary }}>
                    {getWeeklyProblemsGoal(user) - user.totalProblemsThisWeek > 0 
                      ? `${(getWeeklyProblemsGoal(user) - user.totalProblemsThisWeek).toLocaleString()} para completar meta`
                      : '¡Meta semanal completada! 🎉'
                    }
                  </p>
                </div>

                <div {...getCardProps()} className={`${screenSize === 'mobile' ? 'p-3' : 'p-4'} rounded-2xl transition-all duration-500 hover:scale-102 active:scale-98`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300">⚡</div>
                      <h3 className={`${getTypeSize('h3', screenSize)} font-medium`} style={{ color: colors.text }}>
                        Velocidad objetivo
                      </h3>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} font-light`} style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                        {user.averageResponseTime || 0}s
                      </span>
                      <span className={`${getTypeSize('body', screenSize)}`} style={{ color: colors.textSecondary }}>
                        / {getWeeklySpeedGoal(user)}s
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                        style={{ 
                          width: user.averageResponseTime > 0 
                            ? `${Math.min(100, Math.max(0, (getWeeklySpeedGoal(user) - user.averageResponseTime) / getWeeklySpeedGoal(user) * 100))}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className={`${getTypeSize('caption', screenSize)} text-center`} style={{ color: colors.textSecondary }}>
                    {user.averageResponseTime > 0 && user.averageResponseTime <= getWeeklySpeedGoal(user)
                      ? '¡Objetivo de velocidad alcanzado! 🎯'
                      : user.averageResponseTime > 0
                        ? `Mejora ${(user.averageResponseTime - getWeeklySpeedGoal(user)).toFixed(1)}s para meta`
                        : 'Comienza a entrenar para ver tu progreso'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Level System - Carousel on mobile with timeline */}
            <div {...getCardProps()} className={`${screenSize === 'mobile' ? 'p-4 mb-6' : r.cardPadding} rounded-3xl ${screenSize === 'mobile' ? 'mb-6' : 'mb-12'} transition-all duration-500 hover:scale-102 active:scale-98`}>
              <h3 className={`${getTypeSize('h3', screenSize)} font-medium ${screenSize === 'mobile' ? 'mb-4' : 'mb-8'} text-center`} style={{ color: colors.text }}>
                Sistema de progresión
              </h3>
              
              {!showFullLevelSystem ? (
                <div className="relative">
                  {/* Responsive carousel with consistent styling */}
                  <div className={`overflow-x-auto scrollbar-hide ${r.carouselPadding}`}>
                    <div className={`flex ${r.carouselGap} pb-6`} style={{ minWidth: 'max-content' }}>
                      {[1, 3, 6, 9, 12, 15].map((levelNum, index) => {
                        const level = levelSystem[levelNum - 1];
                        const isActive = levelNum === user.currentLevel;
                        const isCompleted = levelNum < user.currentLevel;
                        
                        return (
                          <div key={levelNum} className="flex flex-col items-center relative" style={{ minWidth: screenSize === 'mobile' ? '90px' : screenSize === 'tablet' ? '120px' : '140px' }}>
                            {/* Timeline connector */}
                            {index < 5 && (
                              <div 
                                className={`absolute ${screenSize === 'mobile' ? 'top-5' : 'top-6'} left-full w-full h-0.5 z-0`}
                                style={{ 
                                  backgroundColor: isCompleted ? colors.primary : colors.border,
                                  width: screenSize === 'mobile' ? 'calc(100% + 24px)' : 'calc(100% + 32px)'
                                }}
                              />
                            )}
                            <div 
                              className={`${screenSize === 'mobile' ? 'w-10 h-10' : screenSize === 'tablet' ? 'w-12 h-12' : 'w-14 h-14'} rounded-full flex items-center justify-center ${screenSize === 'mobile' ? 'text-sm' : 'text-lg'} transition-all duration-300 relative z-10 ${
                                isActive ? 'scale-110' : ''
                              }`}
                              style={{
                                backgroundColor: isActive 
                                  ? colors.primary 
                                  : isCompleted 
                                    ? colors.primaryLight 
                                    : colors.surface,
                                border: `2px solid ${isActive ? colors.primary : colors.border}`,
                                color: isActive ? 'white' : colors.text
                              }}
                            >
                              {level.emoji}
                            </div>
                            <div className="mt-2 text-center">
                              <div className={`${screenSize === 'mobile' ? getTypeSize('caption', screenSize) : getTypeSize('body', screenSize)} font-medium ${isActive ? 'font-bold' : ''}`} style={{ color: colors.text }}>
                                {screenSize === 'mobile' ? level.name.split(' ')[0] : level.name}
                              </div>
                              <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary }}>
                                {screenSize === 'mobile' ? level.level : `Nivel ${level.level}`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={() => setShowFullLevelSystem(true)}
                      {...getButtonProps()}
                      className={`${screenSize === 'mobile' ? 'px-4 py-2' : 'px-6 py-2'} ${getTypeSize('button', screenSize)} font-medium rounded-xl transition-all duration-300 hover:scale-102 active:scale-98`}
                      style={{
                        ...liquidGlass,
                        color: colors.text,
                        fontFamily: 'Inter, -apple-system, sans-serif'
                      }}
                    >
                      Ver sistema completo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {levelSystem.map((level, index) => {
                    const isActive = level.level === user.currentLevel;
                    const isCompleted = level.level < user.currentLevel;
                    
                    return (
                      <div 
                        key={level.level} 
                        className={`${screenSize === 'mobile' ? 'p-3' : 'p-4'} rounded-xl transition-all duration-300 ${
                          isActive ? 'scale-105' : 'hover:scale-102'
                        }`}
                        style={{
                          backgroundColor: isActive 
                            ? colors.accentActive 
                            : isCompleted 
                              ? colors.accent 
                              : colors.surface,
                          border: `1px solid ${isActive ? colors.primary : colors.border}`
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`${screenSize === 'mobile' ? 'text-xl' : 'text-2xl'} ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                            {level.emoji}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`${getTypeSize('cardTitle', screenSize)} font-medium ${isActive ? 'font-bold' : ''}`} style={{ color: colors.text }}>
                                {level.name}
                              </h4>
                              <span className={`${screenSize === 'mobile' ? 'text-xs px-1 py-0.5' : 'text-xs px-2 py-1'} rounded-full`} style={{ 
                                backgroundColor: colors.primaryLight, 
                                color: colors.primary 
                              }}>
                                {level.category}
                              </span>
                            </div>
                            <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary }}>
                              {level.weeklyProblemsMin}-{level.weeklyProblemsMax} problemas/semana • {level.speedTarget}s objetivo
                            </div>
                          </div>
                          {isActive && (
                            <div className={`${getTypeSize('caption', screenSize)} font-medium`} style={{ color: colors.primary }}>
                              Actual
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="text-center">
                    <button
                      onClick={() => setShowFullLevelSystem(false)}
                      className={`${screenSize === 'mobile' ? 'px-4 py-2' : 'px-6 py-2'} ${getTypeSize('button', screenSize)} font-medium rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}
                      style={{
                        color: colors.text,
                        fontFamily: 'Inter, -apple-system, sans-serif'
                      }}
                    >
                      Ver vista resumida
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Performance Analysis - Single column on mobile */}
            <div {...getCardProps()} className={`${screenSize === 'mobile' ? 'p-4 mb-6' : r.cardPadding} rounded-3xl ${screenSize === 'mobile' ? 'mb-6' : 'mb-12'} transition-all duration-500 hover:scale-102 active:scale-98`}>
              <h3 className={`${getTypeSize('h3', screenSize)} font-medium ${screenSize === 'mobile' ? 'mb-4' : 'mb-8'} text-center`} style={{ color: colors.text }}>
                Análisis de rendimiento
              </h3>
              
              <div className={`grid ${screenSize === 'mobile' ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
                <div>
                  <h4 className={`${getTypeSize('cardTitle', screenSize)} font-medium ${screenSize === 'mobile' ? 'mb-3' : 'mb-4'}`} style={{ color: colors.text }}>Fortalezas</h4>
                  <div className="space-y-2">
                    {user.strengths.length > 0 ? (
                      user.strengths.map((strength, index) => (
                        <div key={index} className={`flex items-center gap-2 ${screenSize === 'mobile' ? 'p-2' : 'p-2'} rounded-lg`} style={{ backgroundColor: colors.success }}>
                          <div className={`${getTypeSize('caption', screenSize)}`}>💪</div>
                          <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.successText }}>{strength}</div>
                        </div>
                      ))
                    ) : (
                      <div className={`${getTypeSize('caption', screenSize)} ${screenSize === 'mobile' ? 'p-2' : 'p-3'} rounded-lg text-center`} style={{ color: colors.textSecondary, backgroundColor: colors.surface }}>
                        ¡Comienza a entrenar para descubrir tus fortalezas!
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className={`${getTypeSize('cardTitle', screenSize)} font-medium ${screenSize === 'mobile' ? 'mb-3' : 'mb-4'}`} style={{ color: colors.text }}>Áreas de mejora</h4>
                  <div className="space-y-2">
                    {user.weaknesses.length > 0 ? (
                      user.weaknesses.map((weakness, index) => (
                        <div key={index} className={`flex items-center gap-2 ${screenSize === 'mobile' ? 'p-2' : 'p-2'} rounded-lg`} style={{ backgroundColor: colors.error }}>
                          <div className={`${getTypeSize('caption', screenSize)}`}>🎯</div>
                          <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.errorText }}>{weakness}</div>
                        </div>
                      ))
                    ) : (
                      <div className={`${getTypeSize('caption', screenSize)} ${screenSize === 'mobile' ? 'p-2' : 'p-3'} rounded-lg text-center`} style={{ color: colors.textSecondary, backgroundColor: colors.surface }}>
                        ¡Excelente! No hay áreas críticas de mejora
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Heatmap - Restored from WelcomeScreen */}
            <div {...getCardProps()} className={`${screenSize === 'mobile' ? 'p-4 mb-6' : r.cardPadding} rounded-3xl ${screenSize === 'mobile' ? 'mb-6' : 'mb-12'} transition-all duration-500 hover:scale-102 active:scale-98`}>
              <h3 className={`${getTypeSize('h3', screenSize)} font-medium ${screenSize === 'mobile' ? 'mb-4' : 'mb-8'} text-center`} style={{ color: colors.text }}>
                Patrones de actividad
              </h3>
              
              <div className={`grid ${screenSize === 'mobile' ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-2 gap-8'} mb-8`}>
                <div>
                  <h4 className={`${getTypeSize('cardTitle', screenSize)} font-medium ${screenSize === 'mobile' ? 'mb-3' : 'mb-4'}`} style={{ color: colors.text }}>Últimas 4 semanas</h4>
                  <div className="flex justify-center mb-4">
                    <div className="grid grid-cols-7 gap-2">
                      {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                        <div key={index} className={`${getTypeSize('caption', screenSize)} text-center font-medium mb-2`} style={{ color: colors.textSecondary }}>
                          {day}
                        </div>
                      ))}
                      {user.practiceHeatmap.flat().map((intensity, index) => (
                        <div
                          key={index}
                          className={`${screenSize === 'mobile' ? 'w-3 h-3' : 'w-4 h-4'} rounded transition-all duration-200 hover:scale-110`}
                          style={{
                            backgroundColor: 
                              intensity === 0 ? colors.surface :
                              intensity === 1 ? `${colors.primary}40` :
                              intensity === 2 ? `${colors.primary}80` : colors.primary
                          }}
                          title={`${intensity} sesiones`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-4">
                    <span className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>Menos</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(intensity => (
                        <div
                          key={intensity}
                          className={`${screenSize === 'mobile' ? 'w-2 h-2' : 'w-3 h-3'} rounded`}
                          style={{
                            backgroundColor: 
                              intensity === 0 ? colors.surface :
                              intensity === 1 ? `${colors.primary}40` :
                              intensity === 2 ? `${colors.primary}80` : colors.primary
                          }}
                        />
                      ))}
                    </div>
                    <span className={`${getTypeSize('caption', screenSize)} font-light`} style={{ color: colors.textSecondary }}>Más</span>
                  </div>
                </div>

                <div>
                  <h4 className={`${getTypeSize('cardTitle', screenSize)} font-medium ${screenSize === 'mobile' ? 'mb-3' : 'mb-4'}`} style={{ color: colors.text }}>Insights de actividad</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar size={screenSize === 'mobile' ? 16 : 20} color={colors.primary} />
                      <div>
                        <div className={`${getTypeSize('body', screenSize)} font-medium`} style={{ color: colors.text }}>Mejores días</div>
                        <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary }}>
                          {user.activityPatterns.bestDays.length > 0 
                            ? user.activityPatterns.bestDays.join(', ')
                            : 'Por descubrir'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={screenSize === 'mobile' ? 16 : 20} color={colors.secondary} />
                      <div>
                        <div className={`${getTypeSize('body', screenSize)} font-medium`} style={{ color: colors.text }}>Horas preferidas</div>
                        <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary }}>
                          {user.activityPatterns.bestHours.length > 0 
                            ? user.activityPatterns.bestHours.join(', ')
                            : 'Por descubrir'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target size={screenSize === 'mobile' ? 16 : 20} color={colors.primary} />
                      <div>
                        <div className={`${getTypeSize('body', screenSize)} font-medium`} style={{ color: colors.text }}>Sesión promedio</div>
                        <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary }}>
                          {user.activityPatterns.avgSessionLength}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Mistakes - Compact on mobile */}
            <div {...getCardProps()} className={`${screenSize === 'mobile' ? 'p-4 mb-6' : r.cardPadding} rounded-3xl ${screenSize === 'mobile' ? 'mb-6' : 'mb-12'} transition-all duration-500 hover:scale-102 active:scale-98`}>
              <h3 className={`${getTypeSize('h3', screenSize)} font-medium ${screenSize === 'mobile' ? 'mb-4' : 'mb-8'} text-center`} style={{ color: colors.text }}>
                Errores más comunes
              </h3>
              
              {Object.keys(user.commonMistakes).length > 0 ? (
                <div className={`space-y-${screenSize === 'mobile' ? '2' : '4'}`}>
                  {Object.entries(user.commonMistakes)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([mistake, count]) => (
                      <div key={mistake} className={`flex items-center justify-between ${screenSize === 'mobile' ? 'p-2' : 'p-3'} rounded-lg`} style={{ backgroundColor: colors.surface }}>
                        <div className={`${getTypeSize('caption', screenSize)} font-medium`} style={{ color: colors.text }}>
                          {mistake}
                        </div>
                        <div className={`${getTypeSize('caption', screenSize)}`} style={{ color: colors.textSecondary }}>
                          {count} veces
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className={`text-center ${screenSize === 'mobile' ? 'p-4' : 'p-6'}`} style={{ color: colors.textSecondary }}>
                  <div className={`${screenSize === 'mobile' ? 'text-xl' : 'text-2xl'} mb-2`}>🎉</div>
                  <div className={`${getTypeSize('caption', screenSize)}`}>¡Perfecto! No hay errores recurrentes</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tricks Screen
  const TricksScreen = () => (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
      <NavigationHeader />
      <div className={`${r.padding} max-w-6xl mx-auto`}>
        <div className="text-center mb-16">
          <h1 
            className={`${getTypeSize('h1', screenSize)} font-light mb-6`}
            style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
          >
            trucos matemáticos
          </h1>
          <p 
            className={`${getTypeSize('body', screenSize)} font-light`}
            style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
          >
            técnicas mentales para acelerar tus cálculos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mathTricks.map((trick) => (
            <div 
              key={trick.id}
              {...getCardProps()}
              className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 active:scale-98`}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{trick.emoji}</div>
                <h3 className={`${getTypeSize('cardTitle', screenSize)} font-medium mb-2`} style={{ color: colors.text }}>
                  {trick.title}
                </h3>
                <div className={`${getTypeSize('caption', screenSize)} px-3 py-1 rounded-full inline-block`} style={{ 
                  backgroundColor: colors.primaryLight, 
                  color: colors.primary 
                }}>
                  {trick.method}
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className={`${getTypeSize('body', screenSize)} font-medium mb-1`} style={{ color: colors.text }}>
                    Descripción
                  </div>
                  <div className={`${getTypeSize('body', screenSize)}`} style={{ color: colors.textSecondary }}>
                    {trick.description}
                  </div>
                </div>
                
                <div>
                  <div className={`${getTypeSize('body', screenSize)} font-medium mb-1`} style={{ color: colors.text }}>
                    Ejemplo
                  </div>
                  <div className={`${getTypeSize('body', screenSize)} p-2 rounded-lg`} style={{ 
                    backgroundColor: colors.accent,
                    color: colors.textSecondary,
                    fontFamily: 'Georgia, serif'
                  }}>
                    {trick.example}
                  </div>
                </div>
                
                <div>
                  <div className={`${getTypeSize('body', screenSize)} font-medium mb-1`} style={{ color: colors.text }}>
                    Cuándo usar
                  </div>
                  <div className={`${getTypeSize('body', screenSize)}`} style={{ color: colors.textSecondary }}>
                    {trick.useCase}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => startTrickPractice(trick.id)}
                className={`w-full py-3 ${getTypeSize('button', screenSize)} font-medium rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}
                style={{
                  color: colors.text,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
              >
                Practicar truco
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Renderizado principal
  if (loading) {
    return (
      <div style={{ backgroundColor: colors.background }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">🧮</div>
          <div className={`${getTypeSize('body', screenSize)}`} style={{ color: colors.textSecondary }}>
            Cargando MathBoost...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      {/* Public screens - no authentication required */}
      {gameMode === 'leaderboard' && <LeaderboardScreen />}
      {gameMode === 'auth' && <AuthScreen />}
      
      {/* Private screens - authentication required */}
      {session && (
        <>
          {showUserSelection && <UserSelectionScreen />}
          {showCreateProfile && <CreateProfileScreen />}
          {!showUserSelection && !showCreateProfile && (
            <>
              {gameMode === 'welcome' && <WelcomeScreen />}
              {gameMode === 'setup' && <SetupScreen />}
              {gameMode === 'playing' && <GameScreen />}
              {gameMode === 'sessionComplete' && <SessionCompleteScreen />}
              {gameMode === 'tricks' && <TricksScreen />}
              {gameMode === 'tricksPlay' && <TricksPlayScreen />}
              {gameMode === 'stats' && <StatsScreen />}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MathBoost;