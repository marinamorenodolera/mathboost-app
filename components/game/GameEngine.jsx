import React, { useState, useEffect, useCallback } from 'react';
import { OPERATIONS, GAME_CONFIG, LEVEL_SYSTEM } from '../../utils/constants.js';
import { saveGameProgress, verifyProgressSaved } from '../../services/supabase/gameProgress.js';

export const useGameEngine = () => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.DEFAULT_SESSION_LENGTH);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStats, setGameStats] = useState({
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalProblems: 0,
    averageTime: 0,
    fastestAnswer: Infinity,
    slowestAnswer: 0
  });
  const [profileId, setProfileId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Generar problema matemático
  const generateProblem = useCallback((currentLevel = 1) => {
    const levelConfig = LEVEL_SYSTEM.find(l => l.level === currentLevel) || LEVEL_SYSTEM[0];
    
    let num1, num2, operation, answer;
    
    // Generar números según el nivel
    const maxNumber = Math.min(10 + (currentLevel * 5), 100);
    const minNumber = Math.max(1, Math.floor(maxNumber / 4));
    
    num1 = Math.floor(Math.random() * maxNumber) + minNumber;
    num2 = Math.floor(Math.random() * maxNumber) + minNumber;
    
    // Seleccionar operación según nivel
    const operations = [];
    if (currentLevel >= 1) operations.push(OPERATIONS.ADDITION);
    if (currentLevel >= 2) operations.push(OPERATIONS.SUBTRACTION);
    if (currentLevel >= 3) operations.push(OPERATIONS.MULTIPLICATION);
    if (currentLevel >= 5) operations.push(OPERATIONS.DIVISION);
    
    operation = operations[Math.floor(Math.random() * operations.length)];
    
    // Calcular respuesta
    switch (operation) {
      case OPERATIONS.ADDITION:
        answer = num1 + num2;
        break;
      case OPERATIONS.SUBTRACTION:
        // Asegurar resultado positivo
        if (num1 < num2) [num1, num2] = [num2, num1];
        answer = num1 - num2;
        break;
      case OPERATIONS.MULTIPLICATION:
        // Limitar números para multiplicación
        num1 = Math.floor(Math.random() * Math.min(12, maxNumber)) + 1;
        num2 = Math.floor(Math.random() * Math.min(12, maxNumber)) + 1;
        answer = num1 * num2;
        break;
      case OPERATIONS.DIVISION:
        // Generar división exacta
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer;
        break;
      default:
        answer = num1 + num2;
    }
    
    return {
      num1,
      num2,
      operation,
      answer,
      displayText: `${num1} ${operation} ${num2} = ?`,
      level: currentLevel,
      timestamp: Date.now()
    };
  }, []);

  // Iniciar juego
  const startGame = useCallback((userProfileId = null) => {
    setIsPlaying(true);
    setTimeLeft(GAME_CONFIG.DEFAULT_SESSION_LENGTH);
    setScore(0);
    setGameStats({
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalProblems: 0,
      averageTime: 0,
      fastestAnswer: Infinity,
      slowestAnswer: 0
    });
    setCurrentProblem(generateProblem(level));
    setProfileId(userProfileId);
    setSaveError(null);
  }, [generateProblem, level]);

  // Pausar juego
  const pauseGame = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Reanudar juego
  const resumeGame = useCallback(() => {
    setIsPlaying(true);
  }, []);

  // Verificar respuesta
  const checkAnswer = useCallback((answer) => {
    if (!currentProblem || !isPlaying) return false;
    
    const userAnswerNum = parseInt(answer);
    const isCorrect = userAnswerNum === currentProblem.answer;
    const answerTime = (Date.now() - currentProblem.timestamp) / 1000;
    
    // Actualizar estadísticas
    setGameStats(prev => {
      const newStats = { ...prev };
      newStats.totalProblems++;
      
      if (isCorrect) {
        newStats.correctAnswers++;
        newStats.averageTime = (newStats.averageTime * (newStats.correctAnswers - 1) + answerTime) / newStats.correctAnswers;
        newStats.fastestAnswer = Math.min(newStats.fastestAnswer, answerTime);
        newStats.slowestAnswer = Math.max(newStats.slowestAnswer, answerTime);
      } else {
        newStats.incorrectAnswers++;
      }
      
      return newStats;
    });
    
    // Calcular puntuación
    let points = 0;
    if (isCorrect) {
      points = GAME_CONFIG.POINTS_PER_CORRECT;
      
      // Bonus por velocidad
      if (answerTime <= level * 0.5) {
        points += GAME_CONFIG.BONUS_POINTS_FAST;
      }
      
      // Penalización por lentitud
      if (answerTime > level * 2) {
        points += GAME_CONFIG.PENALTY_POINTS_SLOW;
      }
    }
    
    setScore(prev => prev + points);
    
    // Generar nuevo problema
    setCurrentProblem(generateProblem(level));
    setUserAnswer('');
    
    return isCorrect;
  }, [currentProblem, isPlaying, level, generateProblem]);

  // Manejar entrada del usuario
  const handleInput = useCallback((value) => {
    if (!isPlaying) return;
    
    // Solo permitir números
    if (/^\d*$/.test(value)) {
      setUserAnswer(value);
    }
  }, [isPlaying]);

  // Manejar envío de respuesta
  const handleSubmit = useCallback(() => {
    if (userAnswer.trim()) {
      checkAnswer(userAnswer);
    }
  }, [userAnswer, checkAnswer]);

  // Timer del juego
  useEffect(() => {
    let interval;
    
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            // Guardar progreso automáticamente cuando termina el tiempo
            handleGameComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeLeft]);

  // Guardar progreso del juego
  const handleGameComplete = useCallback(async () => {
    if (!profileId || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const gameData = {
        profileId,
        duration: GAME_CONFIG.DEFAULT_SESSION_LENGTH - timeLeft,
        totalProblems: gameStats.totalProblems,
        correctAnswers: gameStats.correctAnswers,
        incorrectAnswers: gameStats.incorrectAnswers,
        totalScore: score,
        averageTime: gameStats.averageTime,
        fastestAnswer: gameStats.fastestAnswer === Infinity ? 0 : gameStats.fastestAnswer,
        slowestAnswer: gameStats.slowestAnswer,
        level,
        problemsSolved: [] // Array de problemas resueltos (opcional)
      };

      console.log('💾 Saving game progress:', gameData);
      
      const result = await saveGameProgress(gameData);
      
      if (result.success) {
        console.log('✅ Game progress saved successfully');
        // Verificar que se guardó correctamente
        const verification = await verifyProgressSaved(profileId, result.session.id);
        if (verification.success) {
          console.log('✅ Progress verification successful');
        } else {
          console.warn('⚠️ Progress verification failed:', verification.error);
        }
      } else {
        console.error('❌ Failed to save game progress:', result.error);
        setSaveError(result.error);
      }
    } catch (error) {
      console.error('❌ Error saving game progress:', error);
      setSaveError('Error inesperado al guardar progreso');
    } finally {
      setIsSaving(false);
    }
  }, [profileId, timeLeft, gameStats, score, level, isSaving]);

  // Auto-submit con Enter
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && isPlaying) {
        handleSubmit();
      }
    };
    
    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [handleSubmit, isPlaying]);

  return {
    // Estado del juego
    currentProblem,
    userAnswer,
    score,
    level,
    timeLeft,
    isPlaying,
    gameStats,
    isSaving,
    saveError,
    
    // Acciones del juego
    startGame,
    pauseGame,
    resumeGame,
    checkAnswer,
    handleInput,
    handleSubmit,
    handleGameComplete,
    
    // Utilidades
    generateProblem
  };
}; 