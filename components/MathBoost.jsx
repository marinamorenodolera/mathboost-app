import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Settings, BarChart3, Lightbulb, User, X, ArrowLeft, Clock, RotateCcw, Trophy, Target, Zap, Calendar } from 'lucide-react';

const MathBoost = () => {
  // Estados principales
  const [gameMode, setGameMode] = useState('welcome');
  const [setupStep, setSetupStep] = useState(1);
  const [operation, setOperation] = useState('multiplication');
  const [selectedTables, setSelectedTables] = useState([2, 3, 4, 5]);
  const [numberRange, setNumberRange] = useState('1-9');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedTrick, setSelectedTrick] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [showSparkle, setShowSparkle] = useState(false);
  const [sessionTimeLimit, setSessionTimeLimit] = useState(300);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showFullLevelSystem, setShowFullLevelSystem] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserSelection, setShowUserSelection] = useState(true);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmoji, setNewProfileEmoji] = useState('👤');
  
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

  // Sistema de usuarios mejorado
  const [users, setUsers] = useState({
    marina: {
      name: 'marina',
      avatar: '👩‍💻',
      currentLevel: 1,
      sessionsThisWeek: 0,
      sessionsLastWeek: 0,
      averageResponseTime: 0,
      lastWeekResponseTime: 0,
      totalProblemsThisWeek: 0,
      totalProblemsLastWeek: 0,
      totalProblemsLifetime: 0,
      totalHoursInvested: 0,
      nextLevelProblems: 50,
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
      personalProfile: `Marina está comenzando su viaje en el cálculo mental. Como nueva usuaria, tiene un gran potencial de crecimiento y mejora. ¡Es el momento perfecto para establecer buenos hábitos de práctica y descubrir sus fortalezas naturales en matemáticas!`,
      lastNotification: null,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      notificationPreferences: {
        enabled: true,
        frequency: 'daily', // daily, weekly, never
        bestTime: '18:00',
        motivationStyle: 'encouraging' // encouraging, challenging, casual
      }
    },
    pieter: {
      name: 'pieter',
      avatar: '👨‍💼',
      currentLevel: 1,
      sessionsThisWeek: 0,
      sessionsLastWeek: 0,
      averageResponseTime: 0,
      lastWeekResponseTime: 0,
      totalProblemsThisWeek: 0,
      totalProblemsLastWeek: 0,
      totalProblemsLifetime: 0,
      totalHoursInvested: 0,
      nextLevelProblems: 50,
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
      personalProfile: `Pieter está comenzando su viaje en el cálculo mental. Como nuevo usuario, tiene un gran potencial de crecimiento y mejora. ¡Es el momento perfecto para establecer buenos hábitos de práctica y descubrir sus fortalezas naturales en matemáticas!`,
      lastNotification: null,
      createdAt: Date.now(),
      notificationPreferences: {
        enabled: true,
        frequency: 'daily',
        bestTime: '19:00',
        motivationStyle: 'professional' // encouraging, challenging, casual, professional
      }
    }
  });

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

  // Estilo liquid glass
  const liquidGlass = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px) saturate(200%)',
    border: `1px solid ${colors.border}`,
    boxShadow: `0 8px 32px ${colors.shadow}, 0 1px 0 rgba(255, 255, 255, 0.5) inset`,
    borderRadius: '16px'
  };

  const liquidGlassHover = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px) saturate(220%)',
    border: `1px solid ${colors.primary}20`,
    boxShadow: `0 12px 48px ${colors.shadowRich}, 0 1px 0 rgba(255, 255, 255, 0.7) inset`,
    borderRadius: '18px'
  };

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
      logoSize: 'text-5xl',
      padding: 'p-4',
      headerPadding: 'p-4',
      gridCols: 'grid-cols-2',
      cardPadding: 'p-4',
      gap: 'gap-4'
    },
    tablet: {
      logoSize: 'text-6xl',
      padding: 'p-6',
      headerPadding: 'p-5',
      gridCols: 'grid-cols-2',
      cardPadding: 'p-6',
      gap: 'gap-6'
    },
    desktop: {
      logoSize: 'text-7xl',
      padding: 'p-8',
      headerPadding: 'p-6',
      gridCols: 'grid-cols-2',
      cardPadding: 'p-8',
      gap: 'gap-8'
    }
  };

  const r = responsive[screenSize];

  // Propiedades calculadas del usuario
  const getUserLevelData = (user) => user ? levelSystem[user.currentLevel - 1] : null;
  const getUserLevelName = (user) => getUserLevelData(user)?.name || '';
  const getWeeklyProblemsGoal = (user) => getUserLevelData(user)?.weeklyProblemsMax || 0;
  const getWeeklySpeedGoal = (user) => getUserLevelData(user)?.speedTarget || 0;

  // Gestión de usuarios actualizada
  const createNewProfile = () => {
    if (!newProfileName.trim()) return;
    
    const userId = newProfileName.toLowerCase().trim();
    const newUser = {
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

    setUsers(prev => ({ ...prev, [userId]: newUser }));
    setCurrentUser(userId);
    setShowCreateProfile(false);
    setShowUserSelection(false);
    setNewProfileName('');
    setNewProfileEmoji('👤');
    
    scheduleUserNotifications(newUser);
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

  // Emojis para selección
  const availableEmojis = [
    '👤', '👩‍💻', '👨‍💼', '👩‍🎓', '👨‍🎓', '👩‍🔬', '👨‍🔬', '👩‍🏫', '👨‍🏫', '👩‍💼',
    '🧑‍💻', '👩‍🎨', '👨‍🎨', '👩‍🍳', '👨‍🍳', '👩‍⚕️', '👨‍⚕️', '👩‍🚀', '👨‍🚀', '🤓',
    '😊', '😎', '🤗', '😄', '😃', '🥳', '🤩', '😇', '🙂', '😉'
  ];

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

  // Pantalla de selección de usuario
  const UserSelectionScreen = () => (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
      <div className={`${r.padding} max-w-4xl mx-auto`}>
        <div className="text-center mb-16">
          <h1 
            className={`${r.logoSize} font-light tracking-wider mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`} 
            style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
          >
            mathboost
          </h1>
          <p 
            className="text-lg font-light mb-12" 
            style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
          >
            Selecciona tu perfil o crea uno nuevo
          </p>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            {Object.values(users).map((userData) => (
              <button
                key={userData.name}
                onClick={() => switchUser(userData.name)}
                className="group p-8 text-center rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                style={{
                  color: colors.text
                }}
              >
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
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              setShowCreateProfile(true);
              setShowUserSelection(false);
            }}
            className="group px-8 py-6 text-lg font-medium rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
            style={{
              color: colors.text,
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}
          >
            <div className="text-3xl mb-2">➕</div>
            <div>Crear nuevo perfil</div>
          </button>
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
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Escribe tu nombre..."
                className="w-full p-4 rounded-xl border text-lg"
                style={{ 
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
                maxLength={20}
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
                onClick={createNewProfile}
                disabled={!newProfileName.trim()}
                className="flex-1 py-3 text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
              >
                Crear perfil
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
              className="group p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              style={liquidGlass}
              onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
            >
              <ArrowLeft size={18} color={colors.text} />
            </button>
          )}
          
          {/* Timer durante entrenamiento - mejor posicionado */}
          {(gameMode === 'playing' || gameMode === 'tricksPlay') && !sessionEnded && (
            <div 
              className="flex items-center gap-4 px-4 py-2 rounded-2xl"
              style={{
                ...liquidGlass,
                color: colors.text,
                fontFamily: 'Inter, -apple-system, sans-serif'
              }}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} color={colors.primary} />
                <span className="text-lg font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                  {formatSessionTime(stats.sessionDuration)}
                </span>
                <span className="text-sm" style={{ color: colors.textTertiary }}>/ 5:00</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Target size={16} color={colors.secondary} />
                <span className="text-lg font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                  {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                </span>
              </div>
              {stats.streak > 0 && (
                <>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg">🔥</div>
                    <span className="text-lg font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                      {stats.streak}
                    </span>
                  </div>
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
              className="group flex items-center gap-2 p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              style={liquidGlass}
              onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
              title="Cambiar usuario"
            >
              <div className="text-lg">{user.avatar}</div>
              <span className="text-sm capitalize" style={{ color: colors.text }}>{user.name}</span>
              <div className="text-xs" style={{ color: colors.textTertiary }}>▼</div>
            </button>
          )}
          
          {/* Solo mostrar navegación cuando NO está en entrenamiento */}
          {gameMode !== 'playing' && gameMode !== 'tricksPlay' && (
            <>
              {gameMode !== 'stats' && (
                <button
                  onClick={() => setGameMode('stats')}
                  className="group p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={liquidGlass}
                  onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
                >
                  <BarChart3 size={18} color={colors.textSecondary} />
                </button>
              )}
              {gameMode !== 'tricks' && (
                <button
                  onClick={() => setGameMode('tricks')}
                  className="group p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={liquidGlass}
                  onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
                >
                  <Lightbulb size={18} color={colors.textSecondary} />
                </button>
              )}
              {gameMode !== 'welcome' && (
                <button
                  onClick={() => setGameMode('welcome')}
                  className="group p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={liquidGlass}
                  onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
                >
                  <User size={18} color={colors.textSecondary} />
                </button>
              )}
            </>
          )}
          
          {/* Botón de salir solo durante entrenamiento */}
          {(gameMode === 'playing' || gameMode === 'tricksPlay') && (
            <button
              onClick={() => setGameMode('welcome')}
              className="group p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              style={liquidGlass}
              onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
              title="Salir del entrenamiento"
            >
              <X size={18} color={colors.textSecondary} />
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
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/5 p-4">
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="h-12 text-xl font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
              style={{ color: colors.text }}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          <button
            onClick={handleClear}
            className="h-12 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
            style={{ color: colors.textSecondary }}
          >
            C
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="h-12 text-xl font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
            style={{ color: colors.text }}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-12 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
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
            <div className="mb-6 text-6xl animate-bounce hover:scale-110 transition-transform duration-300">{user.avatar}</div>
            <p 
              className="text-xl font-light mb-8" 
              style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              {getUserLevelName(user)} • Nivel {user.currentLevel}
            </p>
            
            <button
              onClick={() => setGameMode('setup')}
              className="group px-12 py-6 text-2xl font-medium rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 mb-4 shadow-2xl bg-white/85 backdrop-blur-xl border border-black/5 hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
              style={{
                background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.secondaryLight})`,
                color: colors.text,
                fontFamily: 'Inter, -apple-system, sans-serif',
                border: `2px solid ${colors.primary}20`
              }}
            >
              <span className="group-hover:scale-110 transition-transform duration-300 inline-block">🚀</span> comenzar entrenamiento
            </button>
            
            <div className="flex justify-center">
              <button
                onClick={() => setShowUserSelection(true)}
                className="group px-6 py-3 text-base font-medium rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                style={{
                  color: colors.textSecondary,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
              >
                👥 Cambiar usuario
              </button>
            </div>
          </div>

          <div className={`grid ${r.gridCols} ${r.gap} mb-12`}>
            <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">📊</div>
                  <h3 className="text-lg font-medium" style={{ color: colors.text }}>
                    Problemas semanales
                  </h3>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-light" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                    {user.totalProblemsThisWeek.toLocaleString()}
                  </span>
                  <span className="text-lg" style={{ color: colors.textSecondary }}>
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
              <p className="text-sm text-center" style={{ color: colors.textSecondary }}>
                {getWeeklyProblemsGoal(user) - user.totalProblemsThisWeek > 0 
                  ? `${(getWeeklyProblemsGoal(user) - user.totalProblemsThisWeek).toLocaleString()} para completar meta`
                  : '¡Meta semanal completada! 🎉'
                }
              </p>
            </div>

            <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">⚡</div>
                  <h3 className="text-lg font-medium" style={{ color: colors.text }}>
                    Velocidad objetivo
                  </h3>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-light" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                    {user.averageResponseTime || 0}s
                  </span>
                  <span className="text-lg" style={{ color: colors.textSecondary }}>
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
              <p className="text-sm text-center" style={{ color: colors.textSecondary }}>
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
            
            <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔥</div>
                <h4 className="text-lg font-medium mb-2" style={{ color: colors.text }}>
                  Rachas
                </h4>
                <div className="text-3xl font-light mb-1" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                  {user.currentStreak} días
                </div>
                <div className="text-base font-light mb-3" style={{ color: colors.textSecondary }}>
                  actual
                </div>
                <div className="text-sm font-light" style={{ color: colors.textSecondary }}>
                  🏆 Mejor: {user.bestStreak} días
                </div>
              </div>
            </div>

            <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💎</div>
                <h4 className="text-lg font-medium mb-2" style={{ color: colors.text }}>
                  Tu velocidad
                </h4>
                <div className="text-3xl font-light mb-1" style={{ color: colors.successText, fontFamily: 'Georgia, serif' }}>
                  {user.averageResponseTime || 0}s
                </div>
                <div className="text-base font-light mb-3" style={{ color: colors.textSecondary }}>
                  promedio
                </div>
                <div className="text-sm font-light" style={{ color: colors.textSecondary }}>
                  📊 Global: {user.averageUserSpeed || 0}s
                </div>
              </div>
            </div>

            <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{user.nextAchievement.emoji}</div>
                <h4 className="text-lg font-medium mb-2" style={{ color: colors.text }}>
                  Próximo logro
                </h4>
                <div className="text-base font-medium mb-4" style={{ color: colors.text }}>
                  {user.nextAchievement.name}
                </div>
                <div className="mb-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(user.nextAchievement.progress / user.nextAchievement.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm font-light" style={{ color: colors.textSecondary }}>
                  {user.nextAchievement.progress}/{user.nextAchievement.total}
                </div>
              </div>
            </div>

            <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
                <h4 className="text-lg font-medium mb-2" style={{ color: colors.text }}>
                  Total lifetime
                </h4>
                <div className="text-3xl font-light mb-1" style={{ color: colors.text, fontFamily: 'Georgia, serif' }}>
                  {user.totalProblemsLifetime.toLocaleString()}
                </div>
                <div className="text-base font-light mb-3" style={{ color: colors.textSecondary }}>
                  problemas resueltos
                </div>
                <div className="text-sm font-light" style={{ color: colors.textSecondary }}>
                  ⏱️ {user.totalHoursInvested}h invertidas
                </div>
              </div>
            </div>

            <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📈</div>
                <h4 className="text-lg font-medium mb-4" style={{ color: colors.text }}>
                  Análisis de tablas
                </h4>
                <div className="space-y-3">
                  {user.bestTable && (
                    <div className="text-sm font-light" style={{ color: colors.successText }}>
                      💪 Dominas la del {user.bestTable}
                    </div>
                  )}
                  {user.weakestTable && (
                    <div className="text-sm font-light" style={{ color: colors.textSecondary }}>
                      🎯 Mejora la del {user.weakestTable}
                    </div>
                  )}
                  {!user.bestTable && !user.weakestTable && (
                    <div className="text-sm font-light" style={{ color: colors.textSecondary }}>
                      ¡Comienza a entrenar para ver tu análisis!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔮</div>
                <h4 className="text-lg font-medium mb-2" style={{ color: colors.text }}>
                  Proyección
                </h4>
                <div className="text-sm font-light mb-2" style={{ color: colors.text }}>
                  A este ritmo serás
                </div>
                <div className="text-base font-medium mb-2" style={{ color: colors.text }}>
                  {user.projectionText}
                </div>
                <div className="text-sm font-light" style={{ color: colors.textSecondary }}>
                  en {user.projectionWeeks} semanas
                </div>
              </div>
            </div>
          </div>

          <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-102 mb-8 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
            <h3 className="text-lg font-medium mb-8 text-center" style={{ color: colors.text }}>
              Patrones de actividad
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-medium mb-4" style={{ color: colors.text }}>Últimas 4 semanas</h4>
                <div className="flex justify-center mb-4">
                  <div className="grid grid-cols-7 gap-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                      <div key={index} className="text-xs text-center font-medium mb-2" style={{ color: colors.textSecondary }}>
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
                  <span className="text-sm font-light" style={{ color: colors.textSecondary }}>Menos</span>
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
                  <span className="text-sm font-light" style={{ color: colors.textSecondary }}>Más</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4" style={{ color: colors.text }}>Insights de actividad</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} color={colors.primary} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: colors.text }}>Mejores días</div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
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
                      <div className="text-sm font-medium" style={{ color: colors.text }}>Horas preferidas</div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
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
                      <div className="text-sm font-medium" style={{ color: colors.text }}>Sesión promedio</div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
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
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
      <NavigationHeader showBack={true} onBack={() => setGameMode('welcome')} />
      <div className={`flex items-center justify-center min-h-screen ${r.padding}`}>
        <div className="max-w-4xl w-full">
          <div className="text-center mb-20">
            <h1 
              className="text-4xl font-light mb-8" 
              style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              configuración
            </h1>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${setupStep === 1 ? 'bg-gray-100' : 'bg-gray-50'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  setupStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>1</div>
                <span className={`text-sm ${setupStep === 1 ? 'text-gray-800' : 'text-gray-500'}`}>Operación</span>
              </div>
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
            <div className="space-y-12">
              <p 
                className="text-center text-lg font-light mb-16" 
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
                    className="group p-12 text-center rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                    style={{
                      backgroundColor: operation === op.key ? colors.accentActive : colors.surface,
                      color: colors.text
                    }}
                  >
                    <div 
                      className="text-6xl font-light mb-6 group-hover:scale-110 transition-transform duration-300" 
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {op.symbol}
                    </div>
                    <div 
                      className="text-lg font-medium" 
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
            <div className="space-y-12">
              <div className="flex items-center justify-between mb-16">
                <p 
                  className="text-lg font-light" 
                  style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                >
                  selecciona las tablas
                </p>
                <button
                  onClick={() => setSetupStep(1)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 text-base bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                  style={{
                    color: colors.text,
                    fontFamily: 'Inter, -apple-system, sans-serif'
                  }}
                >
                  <RotateCcw size={16} />
                  cambiar operación
                </button>
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
                    className="group p-10 text-center rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                    style={{
                      backgroundColor: selectedTables.includes(table) ? colors.accentActive : colors.surface,
                      color: colors.text
                    }}
                  >
                    <div 
                      className="text-3xl font-medium group-hover:scale-110 transition-transform duration-300" 
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {table}
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-center mt-16">
                <button
                  onClick={startGame}
                  disabled={selectedTables.length === 0}
                  className="group px-12 py-4 text-lg font-medium rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
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
            <div className="space-y-12">
              <div className="flex items-center justify-between mb-16">
                <p 
                  className="text-lg font-light" 
                  style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                >
                  rango de números
                </p>
                <button
                  onClick={() => setSetupStep(1)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 text-base bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                  style={{
                    color: colors.text,
                    fontFamily: 'Inter, -apple-system, sans-serif'
                  }}
                >
                  <RotateCcw size={16} />
                  cambiar operación
                </button>
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
                    className="group p-12 text-center rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                    style={{
                      backgroundColor: colors.surface,
                      color: colors.text
                    }}
                  >
                    <div 
                      className="text-3xl font-medium group-hover:scale-110 transition-transform duration-300" 
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
    </div>
  );

  // Game Screen
  const GameScreen = () => (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
      <NavigationHeader />
      <div className={`flex items-center justify-center min-h-screen ${r.padding} ${screenSize === 'mobile' ? 'pb-32' : ''}`}>
        <div className="max-w-3xl w-full text-center">
          {currentProblem && !sessionEnded && (
            <>
              <div className="mb-20">
                <div 
                  className="text-9xl font-light mb-12 tracking-wider animate-pulse" 
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
                  className={`relative text-9xl font-light min-h-[160px] flex items-center justify-center transition-all duration-500 ${
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
                    className="text-lg font-light mt-6 p-4 rounded-xl" 
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
                {screenSize === 'mobile' ? 'usa el teclado abajo' : 'escribe tu respuesta'}
              </div>
            </>
          )}
        </div>
      </div>
      <MobileKeyboard />
    </div>
  );

  // Session Complete Screen
  const SessionCompleteScreen = () => (
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
              className="px-8 py-3 text-lg font-medium rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
              style={{
                color: colors.text,
                fontFamily: 'Inter, -apple-system, sans-serif'
              }}
            >
              Otra sesión
            </button>
            <button
              onClick={() => setGameMode('welcome')}
              className="px-8 py-3 text-lg font-medium rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
              style={{
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

  // Tricks Play Screen
  const TricksPlayScreen = () => {
    const trick = mathTricks.find(t => t.id === selectedTrick);
    
    return (
      <div style={{ backgroundColor: colors.background }} className="min-h-screen pt-24">
        <NavigationHeader showBack={true} onBack={() => setGameMode('tricks')} />
        <div className={`flex items-center justify-center min-h-screen ${r.padding} ${screenSize === 'mobile' ? 'pb-32' : ''}`}>
          <div className="max-w-3xl w-full text-center">
            <div className="mb-16">
              <div className="text-6xl mb-4">{trick?.emoji}</div>
              <h2 
                className="text-3xl font-light mb-4" 
                style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                {trick?.title}
              </h2>
              <p 
                className="text-lg font-light" 
                style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                {trick?.method}
              </p>
            </div>
            
            {currentProblem && !sessionEnded && (
              <>
                <div className="mb-20">
                  <div 
                    className="text-9xl font-light mb-12 tracking-wider" 
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
                
                <div className="mb-20 relative">
                  <Sparkle show={showSparkle} />
                  <div 
                    className={`text-9xl font-light min-h-[160px] flex items-center justify-center transition-all duration-500 ${
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
                        <span style={{ opacity: 0.3, borderBottom: `3px solid ${colors.border}`, paddingBottom: '12px' }}>
                          aplica el método
                        </span>
                      )}
                  </div>
                  
                  {showFeedback && (
                    <div 
                      className="text-lg font-light mt-6" 
                      style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                    >
                      {isCorrect ? '✨ método aplicado correctamente' : '🤔 revisa el procedimiento'}
                    </div>
                  )}
                </div>

                <div 
                  className="text-lg font-light p-6 rounded-2xl" 
                  style={{ 
                    color: colors.textSecondary, 
                    backgroundColor: colors.surface,
                    fontFamily: 'Georgia, serif',
                    border: `1px solid ${colors.border}`
                  }}
                >
                  {trick?.example}
                </div>
              </>
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
        <div className={`flex items-center justify-center min-h-screen ${r.padding}`}>
          <div className="max-w-6xl w-full">
            <div className="text-center mb-20">
              <h1 
                className="text-4xl font-light mb-6" 
                style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                estadísticas avanzadas
              </h1>
              <p 
                className="text-lg font-light" 
                style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
              >
                análisis profundo de tu evolución matemática
              </p>
            </div>

            <div className={`${r.cardPadding} rounded-3xl mb-12 transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl">{user.avatar}</div>
                <div>
                  <h3 className="text-lg font-medium capitalize" style={{ color: colors.text }}>
                    {user.name}
                  </h3>
                  <p className="text-base" style={{ color: colors.textSecondary }}>
                    {getUserLevelName(user)} • Nivel {user.currentLevel}
                  </p>
                </div>
              </div>
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.accent }}>
                <h4 className="text-base font-medium mb-3" style={{ color: colors.text }}>
                  Perfil de calculadora mental
                </h4>
                <p className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                  {user.personalProfile}
                </p>
              </div>
            </div>

            <div className={`${r.cardPadding} rounded-3xl mb-12 transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <h3 className="text-lg font-medium mb-8 text-center" style={{ color: colors.text }}>
                Sistema de progresión
              </h3>
              
              {!showFullLevelSystem ? (
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    {[1, 3, 6, 9, 12, 15].map((levelNum, index) => {
                      const level = levelSystem[levelNum - 1];
                      const isActive = levelNum === user.currentLevel;
                      const isCompleted = levelNum < user.currentLevel;
                      
                      return (
                        <div key={levelNum} className="flex flex-col items-center relative">
                          {index < 5 && (
                            <div 
                              className="absolute top-6 left-full w-full h-0.5"
                              style={{ 
                                backgroundColor: isCompleted ? colors.primary : colors.border,
                                width: 'calc(100vw / 6)'
                              }}
                            />
                          )}
                          <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
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
                            <div className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`} style={{ color: colors.text }}>
                              Nivel {levelNum}
                            </div>
                            <div className="text-xs" style={{ color: colors.textSecondary }}>
                              {level.category}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-8 p-4 rounded-xl" style={{ backgroundColor: colors.accent }}>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="text-lg font-medium" style={{ color: colors.text }}>
                          {getUserLevelName(user)}
                        </h4>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          Nivel {user.currentLevel} • {user.nextLevelProblems} problemas para siguiente nivel
                        </p>
                      </div>
                      <div className="text-2xl">{getUserLevelData(user)?.emoji}</div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, ((user.totalProblemsLifetime % 1000) / 1000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setShowFullLevelSystem(true)}
                      className="text-sm px-4 py-2 rounded-lg transition-all duration-500 hover:scale-105"
                      style={{
                        color: colors.primary,
                        backgroundColor: colors.primaryLight,
                        fontFamily: 'Inter, -apple-system, sans-serif'
                      }}
                    >
                      Ver todos los niveles
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {levelSystem.map((level, index) => (
                      <div 
                        key={level.level}
                        className={`p-3 rounded-xl text-center transition-all duration-500 ${
                          level.level === user.currentLevel ? 'scale-105' : 'hover:scale-102'
                        } bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}
                        style={{
                          backgroundColor: level.level === user.currentLevel 
                            ? colors.accentActive 
                            : level.level < user.currentLevel 
                              ? colors.surface 
                              : colors.accent,
                          border: level.level === user.currentLevel 
                            ? `2px solid ${colors.primary}` 
                            : `1px solid ${colors.border}`
                        }}
                      >
                        <div className="text-xl mb-1">{level.emoji}</div>
                        <div className="text-xs font-medium mb-1" style={{ color: colors.text }}>
                          Nivel {level.level}
                        </div>
                        <div className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                          {level.category}
                        </div>
                        <div className="text-xs" style={{ color: colors.textTertiary }}>
                          {level.weeklyProblemsMin}-{level.weeklyProblemsMax}
                        </div>
                        <div className="text-xs" style={{ color: colors.textTertiary }}>
                          ⚡ {level.speedTarget}s
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={() => setShowFullLevelSystem(false)}
                      className="text-sm px-4 py-2 rounded-lg transition-all duration-500 hover:scale-105"
                      style={{
                        color: colors.textSecondary,
                        backgroundColor: colors.surface,
                        fontFamily: 'Inter, -apple-system, sans-serif'
                      }}
                    >
                      Ocultar detalles
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={`grid ${r.gridCols} ${r.gap} mb-12`}>
              <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
                <h3 className="text-lg font-medium mb-6 flex items-center gap-3" style={{ color: colors.text }}>
                  <div className="text-2xl">💪</div>
                  Fortalezas
                </h3>
                <div className="space-y-3">
                  {user.strengths && user.strengths.length > 0 ? user.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: colors.surface }}>
                      <div className="text-green-500">✅</div>
                      <span className="text-base" style={{ color: colors.text }}>{strength}</span>
                    </div>
                  )) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: colors.surface }}>
                      <div className="text-gray-400">📈</div>
                      <span className="text-base" style={{ color: colors.textSecondary }}>¡Entrena para descubrir tus fortalezas!</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
                <h3 className="text-lg font-medium mb-6 flex items-center gap-3" style={{ color: colors.text }}>
                  <div className="text-2xl">🎯</div>
                  Áreas de mejora
                </h3>
                <div className="space-y-3">
                  {user.weaknesses && user.weaknesses.length > 0 ? user.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: colors.surface }}>
                      <div className="text-orange-500">⚠️</div>
                      <span className="text-base" style={{ color: colors.text }}>{weakness}</span>
                    </div>
                  )) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: colors.surface }}>
                      <div className="text-gray-400">🎯</div>
                      <span className="text-base" style={{ color: colors.textSecondary }}>¡Entrena para identificar áreas de mejora!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`${r.cardPadding} rounded-3xl mb-12 transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <h3 className="text-xl font-medium mb-6" style={{ color: colors.text }}>
                Análisis de errores comunes
              </h3>
              {Object.keys(user.commonMistakes).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(user.commonMistakes).map(([key, mistake]) => (
                    <div key={key} className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                      <div className="text-2xl font-light mb-2" style={{ color: colors.errorText, fontFamily: 'Georgia, serif' }}>
                        {mistake.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm mb-1" style={{ color: colors.text }}>
                        {key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        {mistake.errors} de {mistake.total} intentos
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-lg" style={{ color: colors.textSecondary }}>
                    ¡Comienza a entrenar para ver tu análisis de errores!
                  </p>
                </div>
              )}
            </div>

            <div className={`${r.cardPadding} rounded-3xl mb-8 transition-all duration-500 hover:scale-102 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}>
              <h3 className="text-lg font-medium mb-8 text-center" style={{ color: colors.text }}>
                Evolución semanal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                <div>
                  <p className="text-base text-center mb-6" style={{ color: colors.textSecondary }}>esta semana</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="group text-center">
                      <div 
                        className="text-4xl font-light mb-2 transition-all duration-300 group-hover:scale-110" 
                        style={{ color: colors.text, fontFamily: 'Georgia, serif' }}
                      >
                        {user.sessionsThisWeek}
                      </div>
                      <div 
                        className="text-sm tracking-wide uppercase" 
                        style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                      >
                        sesiones
                      </div>
                    </div>
                    <div className="group text-center">
                      <div 
                        className="text-4xl font-light mb-2 transition-all duration-300 group-hover:scale-110" 
                        style={{ color: colors.text, fontFamily: 'Georgia, serif' }}
                      >
                        {user.totalProblemsThisWeek}
                      </div>
                      <div 
                        className="text-sm tracking-wide uppercase" 
                        style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                      >
                        problemas
                      </div>
                    </div>
                    <div className="group text-center">
                      <div 
                        className="text-4xl font-light mb-2 transition-all duration-300 group-hover:scale-110" 
                        style={{ color: colors.text, fontFamily: 'Georgia, serif' }}
                      >
                        {user.averageResponseTime || 0}s
                      </div>
                      <div 
                        className="text-sm tracking-wide uppercase" 
                        style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                      >
                        velocidad
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-base text-center mb-6" style={{ color: colors.textSecondary }}>semana pasada</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div 
                        className="text-3xl font-light mb-2 opacity-60" 
                        style={{ color: colors.text, fontFamily: 'Georgia, serif' }}
                      >
                        {user.sessionsLastWeek}
                      </div>
                      <div 
                        className="text-sm tracking-wide uppercase opacity-60" 
                        style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                      >
                        sesiones
                      </div>
                    </div>
                    <div className="text-center">
                      <div 
                        className="text-3xl font-light mb-2 opacity-60" 
                        style={{ color: colors.text, fontFamily: 'Georgia, serif' }}
                      >
                        {user.totalProblemsLastWeek}
                      </div>
                      <div 
                        className="text-sm tracking-wide uppercase opacity-60" 
                        style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                      >
                        problemas
                      </div>
                    </div>
                    <div className="text-center">
                      <div 
                        className="text-3xl font-light mb-2 opacity-60" 
                        style={{ color: colors.text, fontFamily: 'Georgia, serif' }}
                      >
                        {user.lastWeekResponseTime || 0}s
                      </div>
                      <div 
                        className="text-sm tracking-wide uppercase opacity-60" 
                        style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                      >
                        velocidad
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {user.sessionsLastWeek > 0 && (
                <div className="pt-6 border-t border-gray-200 flex justify-center gap-8">
                  <div className="text-center">
                    <div className="text-base font-light" style={{ color: colors.successText }}>
                      +{((user.sessionsThisWeek - user.sessionsLastWeek) / user.sessionsLastWeek * 100).toFixed(0)}% sesiones
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-light" style={{ color: colors.successText }}>
                      +{((user.totalProblemsThisWeek - user.totalProblemsLastWeek) / Math.max(user.totalProblemsLastWeek, 1) * 100).toFixed(0)}% problemas
                    </div>
                  </div>
                  {user.lastWeekResponseTime > 0 && user.averageResponseTime > 0 && (
                    <div className="text-center">
                      <div className="text-base font-light" style={{ color: colors.successText }}>
                        {user.averageResponseTime < user.lastWeekResponseTime ? '-' : '+'}
                        {Math.abs((user.lastWeekResponseTime - user.averageResponseTime) / user.lastWeekResponseTime * 100).toFixed(0)}% tiempo
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="h-px bg-gray-200 my-8"></div>
              
              <div className="text-center mb-6">
                <p className="text-base font-light mb-6" style={{ color: colors.textSecondary }}>
                  sesión actual
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                {[
                  { label: 'correctas', value: stats.correct, suffix: '', emoji: '✅' },
                  { label: 'precisión', value: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0, suffix: '%', emoji: '🎯' },
                  { label: 'racha', value: stats.streak, suffix: '', emoji: '🔥' },
                  { label: 'velocidad', value: stats.total > 0 ? formatTime(stats.averageTime) : '0', suffix: 's', emoji: '⚡' }
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="text-4xl mb-4">{stat.emoji}</div>
                    <div 
                      className="text-6xl font-light mb-4 group-hover:scale-110 transition-transform duration-300" 
                      style={{ color: colors.text, fontFamily: 'Georgia, serif' }}
                    >
                      {stat.value}{stat.suffix}
                    </div>
                    <div 
                      className="text-sm font-medium uppercase tracking-widest" 
                      style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setGameMode('setup')}
                className="group px-12 py-4 text-lg font-medium rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                style={{
                  color: colors.text,
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}
              >
                continuar entrenando
              </button>
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
      <div className={`flex items-center justify-center min-h-screen ${r.padding}`}>
        <div className="max-w-7xl w-full">
          <div className="text-center mb-20">
            <h1 
              className="text-4xl font-light mb-6" 
              style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              métodos de cálculo
            </h1>
            <p 
              className="text-lg font-light" 
              style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              técnicas para acelerar tu pensamiento matemático
            </p>
          </div>
          
          <div className={`grid ${r.gridCols} ${r.gap}`}>
            {mathTricks.map((trick, index) => (
              <div 
                key={trick.id} 
                className={`group ${r.cardPadding} rounded-3xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div 
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{ backgroundColor: colors.accentActive, color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    {trick.difficulty === 1 ? 'básico' : trick.difficulty === 2 ? 'intermedio' : 'avanzado'}
                  </div>
                  <div 
                    className="text-sm font-light" 
                    style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    {index + 1}
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{trick.emoji}</div>
                  <h3 
                    className="text-xl font-light mb-3" 
                    style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    {trick.title}
                  </h3>
                  <p 
                    className="text-base font-light mb-4" 
                    style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    {trick.method}
                  </p>
                  <p 
                    className="text-sm font-light mb-6" 
                    style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    {trick.description}
                  </p>
                  <div 
                    className="text-sm font-light mb-6 p-4 rounded-xl border-l-4" 
                    style={{ 
                      backgroundColor: colors.accent, 
                      color: colors.textSecondary,
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      borderColor: colors.accentActive
                    }}
                  >
                    <strong>Cuándo usar:</strong> {trick.useCase}
                  </div>
                </div>
                
                <div 
                  className="text-sm mb-8 p-4 rounded-2xl" 
                  style={{ 
                    color: colors.textSecondary, 
                    backgroundColor: colors.surface,
                    fontFamily: 'Georgia, serif',
                    border: `1px solid ${colors.border}`
                  }}
                >
                  {trick.example}
                </div>
                <button
                  onClick={() => startTrickPractice(trick.id)}
                  className="w-full py-3 text-lg font-medium rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
                  style={{
                    color: colors.text,
                    fontFamily: 'Inter, -apple-system, sans-serif'
                  }}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300 inline-block">{trick.emoji}</span> practicar método
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-20">
            <button
              onClick={() => setGameMode('setup')}
              className="group px-12 py-4 text-lg font-medium rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-xl hover:border-blue-500/20"
              style={{
                color: colors.text,
                fontFamily: 'Inter, -apple-system, sans-serif'
              }}
            >
              práctica libre
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizado principal con sistema de usuarios
  return (
    <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {showCreateProfile ? <CreateProfileScreen /> :
       showUserSelection ? <UserSelectionScreen /> :
       user ? (
        <>
          {gameMode === 'welcome' && <WelcomeScreen />}
          {gameMode === 'setup' && <SetupScreen />}
          {gameMode === 'playing' && <GameScreen />}
          {gameMode === 'sessionComplete' && <SessionCompleteScreen />}
          {gameMode === 'tricksPlay' && <TricksPlayScreen />}
          {gameMode === 'stats' && <StatsScreen />}
          {gameMode === 'tricks' && <TricksScreen />}
        </>
       ) : null}
    </div>
  );
};

export default MathBoost;
