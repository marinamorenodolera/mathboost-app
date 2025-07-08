import React from 'react';
import { theme, getTypeSize, getSpacing, getLayoutStyles } from '../../styles/theme.js';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { LEVEL_SYSTEM } from '../../utils/constants.js';
import { useGameStats } from '../../hooks/useGameStats.js';

const StatsScreen = ({ screenSize = 'desktop', onBack, user }) => {
  const { stats, gameHistory, loading, error, refreshStats } = useGameStats(user?.profile_id);

  // Datos por defecto si no hay estadísticas
  const defaultStats = {
    total_problems_solved: 0,
    total_correct_answers: 0,
    total_incorrect_answers: 0,
    total_score: 0,
    total_play_time: 0,
    average_response_time: 0,
    fastest_response_time: 0,
    current_streak: 0,
    longest_streak: 0,
    current_level: 1,
    accuracy: 0
  };

  const currentStats = stats || defaultStats;

  const currentLevelInfo = LEVEL_SYSTEM.find(l => l.level === currentStats.current_level) || LEVEL_SYSTEM[0];
  const nextLevelInfo = LEVEL_SYSTEM.find(l => l.level === currentStats.current_level + 1);
  const progressToNextLevel = 65; // Porcentaje - esto se calcularía basado en el progreso real

  const layoutStyles = getLayoutStyles(screenSize);

  return (
    <div 
      style={{ 
        backgroundColor: theme.colors.background,
        ...layoutStyles.screen
      }} 
      className="flex flex-col"
    >
      {/* Header */}
      <header className="flex-shrink-0" style={{ padding: getSpacing('container', screenSize) }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              icon="⬅️"
              screenSize={screenSize}
            >
              Volver
            </Button>
            <h1 
              className={`${getTypeSize('h1', screenSize)} font-light tracking-wider bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`}
              style={{ fontFamily: theme.typography.fontFamily }}
            >
              Estadísticas
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1" style={{ padding: getSpacing('container', screenSize) }}>
        <div className="max-w-4xl mx-auto space-y-8">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p 
                className={getTypeSize('body', screenSize)}
                style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
              >
                Cargando estadísticas...
              </p>
            </div>
          )}

          {error && (
            <Card variant="elevated" screenSize={screenSize} className="p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 
                  className={`${getTypeSize('h3', screenSize)} font-medium mb-2`}
                  style={{ color: theme.colors.errorText, fontFamily: theme.typography.fontFamily }}
                >
                  Error al cargar estadísticas
                </h3>
                <p 
                  className={getTypeSize('body', screenSize)}
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                >
                  {error}
                </p>
              </div>
            </Card>
          )}

                    {!loading && !error && (
                      <>
                        {/* Nivel Actual */}
                        <Card variant="elevated" screenSize={screenSize} className="p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{currentLevelInfo.emoji}</div>
              <h2 
                className={`${getTypeSize('h2', screenSize)} font-medium mb-2`}
                style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
              >
                {currentLevelInfo.name}
              </h2>
              <p 
                className={getTypeSize('body', screenSize)}
                style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
              >
                Nivel {stats.level} • {currentLevelInfo.category}
              </p>
            </div>

            {/* Progreso al siguiente nivel */}
            {nextLevelInfo && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span 
                    className={getTypeSize('caption', screenSize)}
                    style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                  >
                    Progreso al siguiente nivel
                  </span>
                  <span 
                    className={`${getTypeSize('caption', screenSize)} font-medium`}
                    style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}
                  >
                    {progressToNextLevel}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${progressToNextLevel}%`,
                      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
                    }}
                  />
                </div>
                <p 
                  className={`${getTypeSize('caption', screenSize)} mt-2`}
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                >
                  Siguiente: {nextLevelInfo.name}
                </p>
              </div>
            )}

            {/* Objetivo semanal */}
            <div className="p-4 rounded-2xl" style={{ backgroundColor: theme.colors.accent }}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 
                    className={`${getTypeSize('body', screenSize)} font-medium mb-1`}
                    style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                  >
                    Objetivo Semanal
                  </h3>
                  <p 
                    className={getTypeSize('caption', screenSize)}
                    style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                  >
                    {currentStats.total_problems_solved} problemas resueltos
                  </p>
                </div>
                <div className="text-right">
                  <div 
                    className={`${getTypeSize('h3', screenSize)} font-bold`}
                    style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}
                  >
                    {currentStats.accuracy}%
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Problemas Resueltos',
                value: currentStats.total_problems_solved.toLocaleString(),
                icon: '🧮',
                color: theme.colors.primary
              },
              {
                title: 'Precisión',
                value: `${currentStats.accuracy}%`,
                icon: '🎯',
                color: theme.colors.successText
              },
              {
                title: 'Puntuación Total',
                value: currentStats.total_score.toLocaleString(),
                icon: '🏆',
                color: theme.colors.secondary
              },
              {
                title: 'Racha Actual',
                value: `${currentStats.current_streak} días`,
                icon: '🔥',
                color: theme.colors.warningText
              }
            ].map((stat, index) => (
              <Card
                key={index}
                variant="interactive"
                screenSize={screenSize}
                className="p-6 text-center"
              >
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div 
                  className={`${getTypeSize('h3', screenSize)} font-bold mb-2`}
                  style={{ color: stat.color, fontFamily: theme.typography.fontFamily }}
                >
                  {stat.value}
                </div>
                <div 
                  className={getTypeSize('caption', screenSize)}
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                >
                  {stat.title}
                </div>
              </Card>
            ))}
          </div>

          {/* Estadísticas de Rendimiento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tiempos */}
            <Card variant="elevated" screenSize={screenSize} className="p-6">
              <h3 
                className={`${getTypeSize('h3', screenSize)} font-medium mb-6`}
                style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
              >
                ⏱️ Tiempos de Respuesta
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Promedio', value: `${currentStats.average_response_time.toFixed(1)}s`, color: theme.colors.primary },
                  { label: 'Más Rápido', value: `${currentStats.fastest_response_time.toFixed(1)}s`, color: theme.colors.successText },
                  { label: 'Objetivo', value: `${currentLevelInfo.speedTarget}s`, color: theme.colors.textSecondary }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span 
                      className={getTypeSize('body', screenSize)}
                      style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                    >
                      {item.label}
                    </span>
                    <span 
                      className={`${getTypeSize('body', screenSize)} font-bold`}
                      style={{ color: item.color, fontFamily: theme.typography.fontFamily }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Logros */}
            <Card variant="elevated" screenSize={screenSize} className="p-6">
              <h3 
                className={`${getTypeSize('h3', screenSize)} font-medium mb-6`}
                style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
              >
                🏅 Logros
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Racha Más Larga', value: `${currentStats.longest_streak} días`, icon: '🔥' },
                  { label: 'Problemas Correctos', value: currentStats.total_correct_answers.toLocaleString(), icon: '✅' },
                  { label: 'Nivel Alcanzado', value: `Nivel ${currentStats.current_level}`, icon: '⭐' }
                ].map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div 
                        className={getTypeSize('body', screenSize)}
                        style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                      >
                        {achievement.label}
                      </div>
                      <div 
                        className={`${getTypeSize('caption', screenSize)} font-medium`}
                        style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}
                      >
                        {achievement.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onBack()}
              icon="🚀"
              screenSize={screenSize}
            >
              Continuar Entrenando
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onBack()}
              icon="🏆"
              screenSize={screenSize}
            >
              Ver Rankings
            </Button>
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StatsScreen; 