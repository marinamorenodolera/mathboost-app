// Sistema de niveles completo (15 niveles)
export const LEVEL_SYSTEM = [
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

// Emojis disponibles para perfiles
export const AVAILABLE_EMOJIS = [
  '👤', '👩‍💻', '👨‍💼', '🧑‍🎓', '👩‍🏫', '👨‍🔬', '🧑‍💼', '👩‍🚀', 
  '👨‍🎨', '🧑‍🍳', '👩‍⚕️', '👨‍🏭', '🧑‍🎤', '👩‍🎯', '👨‍🏫', '🧑‍🔬',
  '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🧚‍♀️', '🧚‍♂️', '🥷', '🤖',
  '😀', '😃', '😄', '😁', '😊', '😍', '🤩', '😎', '🤓', '🧐',
  '🌟', '⚡', '🔥', '💎', '🚀', '🧠', '💪', '🎯', '🏆', '👑'
];

// Tipos de operaciones matemáticas
export const OPERATIONS = [
  { type: 'addition', symbol: '+', label: 'Suma' },
  { type: 'subtraction', symbol: '-', label: 'Resta' },
  { type: 'multiplication', symbol: '×', label: 'Multiplicación' },
  { type: 'division', symbol: '÷', label: 'División' }
];

// Configuración general del juego
export const GAME_CONFIG = {
  DEFAULT_SESSION_LENGTH: 60, // segundos
  MAX_PROBLEMS_PER_SESSION: 30,
  MIN_LEVEL: 1,
  MAX_LEVEL: 15
};

// Estados del juego
export const GAME_STATES = {
  LOADING: 'loading',
  WELCOME: 'welcome',
  AUTH: 'auth',
  LEADERBOARD: 'leaderboard',
  PROFILE_CREATION: 'profile_creation',
  PROFILE_SELECTION: 'profile_selection',
  SETUP: 'setup',
  PLAYING: 'playing',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  STATS: 'stats'
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DEFAULT_FREQUENCY: 'daily',
  DEFAULT_TIME: '18:00',
  DEFAULT_STYLE: 'encouraging',
  ENABLED: true
};

// Configuración de la base de datos
export const DB_CONFIG = {
  TABLES: {
    USER_PROFILES: 'user_profiles',
    GAME_SESSIONS: 'game_sessions',
    USER_STATS: 'user_stats'
  },
  RPC_FUNCTIONS: {
    GET_LEADERBOARD: 'get_leaderboard',
    UPDATE_USER_STATS: 'update_user_stats'
  }
};

// Mensajes de motivación
export const MOTIVATIONAL_MESSAGES = {
  BEGINNER: [
    "¡Cada problema resuelto te acerca a ser un genio matemático! 🌟",
    "La práctica hace al maestro. ¡Sigue así! 💪",
    "Tu cerebro se está volviendo más rápido cada día! 🧠"
  ],
  INTERMEDIATE: [
    "¡Impresionante velocidad! Estás mejorando constantemente! ⚡",
    "Tu dedicación está dando frutos. ¡Excelente trabajo! 🎯",
    "¡Eres un verdadero calculador mental! 🚀"
  ],
  ADVANCED: [
    "¡Velocidad de rayo! Eres un maestro de las matemáticas! 🌊",
    "Tu precisión y velocidad son extraordinarias! 💎",
    "¡Estás en el nivel de los genios matemáticos! ⚛️"
  ]
};

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
}; 