import React, { useState, useEffect, useRef } from 'react';
import { theme, getTypeSize, getSpacing, getLayoutStyles, getInputStyles } from '../../styles/theme.js';
import { useGameEngine } from '../game/GameEngine.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { LEVEL_SYSTEM } from '../../utils/constants.js';

const GameScreen = ({ screenSize = 'desktop', onBack, user }) => {
  const {
    currentProblem,
    userAnswer,
    score,
    level,
    timeLeft,
    isPlaying,
    gameStats,
    isSaving,
    saveError,
    startGame,
    pauseGame,
    resumeGame,
    handleInput,
    handleSubmit,
    handleGameComplete
  } = useGameEngine();

  const [gameState, setGameState] = useState('setup'); // setup, playing, paused, completed
  const inputRef = useRef(null);

  // Focus en input cuando el juego inicia
  useEffect(() => {
    if (isPlaying && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isPlaying]);

  // Manejar inicio del juego
  const handleStartGame = () => {
    const userProfileId = user?.profile_id || null;
    startGame(userProfileId);
    setGameState('playing');
  };

  // Manejar pausa
  const handlePause = () => {
    pauseGame();
    setGameState('paused');
  };

  // Manejar reanudar
  const handleResume = () => {
    resumeGame();
    setGameState('playing');
  };

  // Manejar finalización
  const handleComplete = async () => {
    await handleGameComplete();
    setGameState('completed');
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Obtener información del nivel actual
  const currentLevelInfo = LEVEL_SYSTEM.find(l => l.level === level) || LEVEL_SYSTEM[0];

  const layoutStyles = getLayoutStyles(screenSize);

  // Pantalla de configuración
  if (gameState === 'setup') {
    return (
      <div 
        style={{ 
          backgroundColor: theme.colors.background,
          ...layoutStyles.screen
        }} 
        className="flex flex-col"
      >
        <main className="flex-1 flex items-center justify-center" style={{ padding: getSpacing('container', screenSize) }}>
          <div className="w-full max-w-md">
            <div className="text-center mb-12">
              <h1 
                className={`${getTypeSize('h1', screenSize)} font-light tracking-wider mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`} 
                style={{ fontFamily: theme.typography.fontFamily }}
              >
                mathboost
              </h1>
              <p 
                className={`${getTypeSize('body', screenSize)} font-light`}
                style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
              >
                Configura tu sesión de entrenamiento
              </p>
            </div>

            <Card variant="elevated" screenSize={screenSize} className="p-8">
              <div className="space-y-8">
                <div>
                  <h3 
                    className={`${getTypeSize('h3', screenSize)} font-medium mb-4`}
                    style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                  >
                    Nivel Actual: {currentLevelInfo.emoji} {currentLevelInfo.name}
                  </h3>
                  <p 
                    className={getTypeSize('body', screenSize)}
                    style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                  >
                    {currentLevelInfo.category} • Objetivo: {currentLevelInfo.speedTarget}s por problema
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: theme.colors.accent }}>
                    <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                      {currentLevelInfo.weeklyProblemsMin}-{currentLevelInfo.weeklyProblemsMax}
                    </div>
                    <div 
                      className={getTypeSize('caption', screenSize)}
                      style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                    >
                      Problemas/semana
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: theme.colors.accent }}>
                    <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                      {currentLevelInfo.speedTarget}s
                    </div>
                    <div 
                      className={getTypeSize('caption', screenSize)}
                      style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                    >
                      Objetivo velocidad
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartGame}
                    icon="🚀"
                    screenSize={screenSize}
                    className="w-full"
                    disabled={!user}
                  >
                    {user ? 'Comenzar Entrenamiento' : 'Inicia sesión para jugar'}
                  </Button>
                  
                  {!user && (
                    <div 
                      className={`${getTypeSize('caption', screenSize)} p-3 rounded-xl text-center`}
                      style={{ 
                        backgroundColor: theme.colors.warning,
                        color: theme.colors.warningText,
                        fontFamily: theme.typography.fontFamily
                      }}
                    >
                      💡 Necesitas iniciar sesión para guardar tu progreso
                    </div>
                  )}
                  
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={onBack}
                    icon="⬅️"
                    screenSize={screenSize}
                    className="w-full"
                  >
                    Volver
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de juego
  if (gameState === 'playing') {
    return (
      <div 
        style={{ 
          backgroundColor: theme.colors.background,
          ...layoutStyles.screen
        }} 
        className="flex flex-col"
      >
        {/* Header con información del juego */}
        <header className="flex-shrink-0 p-4" style={{ padding: getSpacing('container', screenSize) }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePause}
                icon="⏸️"
                screenSize={screenSize}
              >
                Pausar
              </Button>
              
              {isSaving && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                  <span 
                    className={getTypeSize('caption', screenSize)}
                    style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}
                  >
                    Guardando...
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div 
                  className={`${getTypeSize('h3', screenSize)} font-bold`}
                  style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}
                >
                  {score}
                </div>
                <div 
                  className={getTypeSize('caption', screenSize)}
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                >
                  Puntos
                </div>
              </div>
              
              <div className="text-center">
                <div 
                  className={`${getTypeSize('h3', screenSize)} font-bold`}
                  style={{ color: timeLeft < 10 ? theme.colors.errorText : theme.colors.text, fontFamily: theme.typography.fontFamily }}
                >
                  {formatTime(timeLeft)}
                </div>
                <div 
                  className={getTypeSize('caption', screenSize)}
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                >
                  Tiempo
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal del juego */}
        <main className="flex-1 flex items-center justify-center" style={{ padding: getSpacing('container', screenSize) }}>
          <div className="w-full max-w-2xl">
            {currentProblem && (
              <Card variant="elevated" screenSize={screenSize} className="p-12 text-center">
                <div className="mb-8">
                  <div 
                    className={`${getTypeSize('math', screenSize)} font-bold mb-4`}
                    style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                  >
                    {currentProblem.displayText}
                  </div>
                  
                  <div className="relative max-w-xs mx-auto">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => handleInput(e.target.value)}
                      className="w-full p-6 text-center rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:scale-102"
                      style={{
                        ...getInputStyles(screenSize),
                        fontSize: screenSize === 'mobile' ? '2rem' : screenSize === 'tablet' ? '2.5rem' : '3rem',
                        fontWeight: 'bold'
                      }}
                      placeholder="?"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div 
                      className={`${getTypeSize('body', screenSize)} font-bold`}
                      style={{ color: theme.colors.successText, fontFamily: theme.typography.fontFamily }}
                    >
                      {gameStats.correctAnswers}
                    </div>
                    <div 
                      className={getTypeSize('caption', screenSize)}
                      style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                    >
                      Correctas
                    </div>
                  </div>
                  
                  <div>
                    <div 
                      className={`${getTypeSize('body', screenSize)} font-bold`}
                      style={{ color: theme.colors.errorText, fontFamily: theme.typography.fontFamily }}
                    >
                      {gameStats.incorrectAnswers}
                    </div>
                    <div 
                      className={getTypeSize('caption', screenSize)}
                      style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                    >
                      Incorrectas
                    </div>
                  </div>
                  
                  <div>
                    <div 
                      className={`${getTypeSize('body', screenSize)} font-bold`}
                      style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}
                    >
                      {gameStats.totalProblems}
                    </div>
                    <div 
                      className={getTypeSize('caption', screenSize)}
                      style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                    >
                      Total
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de pausa
  if (gameState === 'paused') {
    return (
      <div 
        style={{ 
          backgroundColor: theme.colors.background,
          ...layoutStyles.screen
        }} 
        className="flex flex-col"
      >
        <main className="flex-1 flex items-center justify-center" style={{ padding: getSpacing('container', screenSize) }}>
          <div className="w-full max-w-md">
            <Card variant="elevated" screenSize={screenSize} className="p-8 text-center">
              <div className="space-y-8">
                <div>
                  <div className="text-6xl mb-4">⏸️</div>
                  <h2 
                    className={`${getTypeSize('h2', screenSize)} font-medium mb-4`}
                    style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                  >
                    Juego Pausado
                  </h2>
                  <p 
                    className={getTypeSize('body', screenSize)}
                    style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                  >
                    Tiempo restante: {formatTime(timeLeft)}
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleResume}
                    icon="▶️"
                    screenSize={screenSize}
                    className="w-full"
                  >
                    Continuar
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={onBack}
                    icon="🏠"
                    screenSize={screenSize}
                    className="w-full"
                  >
                    Salir
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de completado
  if (gameState === 'completed') {
    return (
      <div 
        style={{ 
          backgroundColor: theme.colors.background,
          ...layoutStyles.screen
        }} 
        className="flex flex-col"
      >
        <main className="flex-1 flex items-center justify-center" style={{ padding: getSpacing('container', screenSize) }}>
          <div className="w-full max-w-md">
            <Card variant="elevated" screenSize={screenSize} className="p-8 text-center">
              <div className="space-y-8">
                <div>
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 
                    className={`${getTypeSize('h2', screenSize)} font-medium mb-4`}
                    style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                  >
                    ¡Sesión Completada!
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: theme.colors.accent }}>
                      <div 
                        className={`${getTypeSize('h3', screenSize)} font-bold`}
                        style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}
                      >
                        {score} puntos
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div 
                          className={`${getTypeSize('body', screenSize)} font-bold`}
                          style={{ color: theme.colors.successText, fontFamily: theme.typography.fontFamily }}
                        >
                          {gameStats.correctAnswers}
                        </div>
                        <div 
                          className={getTypeSize('caption', screenSize)}
                          style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                        >
                          Correctas
                        </div>
                      </div>
                      
                      <div>
                        <div 
                          className={`${getTypeSize('body', screenSize)} font-bold`}
                          style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}
                        >
                          {gameStats.averageTime.toFixed(1)}s
                        </div>
                        <div 
                          className={getTypeSize('caption', screenSize)}
                          style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                        >
                          Promedio
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                                  <div className="space-y-4">
                    {saveError && (
                      <div 
                        className={`${getTypeSize('caption', screenSize)} p-3 rounded-xl text-center`}
                        style={{ 
                          backgroundColor: theme.colors.error,
                          color: theme.colors.errorText,
                          fontFamily: theme.typography.fontFamily
                        }}
                      >
                        ⚠️ Error al guardar progreso: {saveError}
                      </div>
                    )}
                    
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleStartGame}
                      icon="🔄"
                      screenSize={screenSize}
                      className="w-full"
                    >
                      Jugar Otra Vez
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={onBack}
                      icon="🏠"
                      screenSize={screenSize}
                      className="w-full"
                    >
                      Volver al Inicio
                    </Button>
                  </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default GameScreen; 