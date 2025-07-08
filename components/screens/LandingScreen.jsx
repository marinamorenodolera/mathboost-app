import React from 'react';
import { theme, getTypeSize, getSpacing, getLayoutStyles } from '../../styles/theme.js';
import { useLeaderboard } from '../../hooks/useLeaderboard.js';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

const LandingScreen = ({ session, setGameMode, screenSize = 'desktop' }) => {
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard();

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
            <div className="text-4xl">🧮</div>
            <h1 
              className={`${getTypeSize('h1', screenSize)} font-light tracking-wider bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`}
              style={{ fontFamily: theme.typography.fontFamily }}
            >
              mathboost
            </h1>
          </div>
          
          {session && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGameMode('auth')}
              icon="🔑"
              screenSize={screenSize}
            >
              {session.user?.email}
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col" style={{ padding: getSpacing('container', screenSize) }}>
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 
            className={`${getTypeSize('h2', screenSize)} font-medium mb-6`}
            style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
          >
            Domina las matemáticas con práctica inteligente
          </h2>
          <p 
            className={`${getTypeSize('body', screenSize)} max-w-2xl mx-auto mb-8`}
            style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
          >
            Entrena tu mente con ejercicios personalizados, sigue tu progreso y compite con otros estudiantes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setGameMode('welcome')}
              icon="🚀"
              screenSize={screenSize}
            >
              Comenzar Entrenamiento
            </Button>
            
            {!session && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setGameMode('auth')}
                icon="🔑"
                screenSize={screenSize}
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-12">
          <h3 
            className={`${getTypeSize('h3', screenSize)} font-medium mb-8 text-center`}
            style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
          >
            Características Principales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'Ejercicios Personalizados',
                description: 'Adaptados a tu nivel y ritmo de aprendizaje'
              },
              {
                icon: '📊',
                title: 'Seguimiento Detallado',
                description: 'Analiza tu progreso con estadísticas avanzadas'
              },
              {
                icon: '🏆',
                title: 'Sistema de Rankings',
                description: 'Compite y mejora con otros estudiantes'
              },
              {
                icon: '⚡',
                title: 'Entrenamiento Rápido',
                description: 'Sesiones cortas y efectivas para mejorar'
              },
              {
                icon: '🧠',
                title: 'Trucos Matemáticos',
                description: 'Aprende técnicas para cálculos mentales'
              },
              {
                icon: '📈',
                title: 'Progreso Constante',
                description: 'Sistema de niveles para mantener la motivación'
              }
            ].map((feature, index) => (
              <Card
                key={index}
                variant="interactive"
                screenSize={screenSize}
                className="text-center p-6"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 
                  className={`${getTypeSize('cardTitle', screenSize)} font-medium mb-2`}
                  style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                >
                  {feature.title}
                </h4>
                <p 
                  className={getTypeSize('caption', screenSize)}
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                >
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h3 
              className={`${getTypeSize('h3', screenSize)} font-medium`}
              style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
            >
              🏆 Rankings Globales
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGameMode('welcome')}
              screenSize={screenSize}
            >
              Ver Todos
            </Button>
          </div>

          <Card variant="elevated" screenSize={screenSize} className="p-6">
            {leaderboardLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-2xl mb-4">⏳</div>
                <p 
                  className={getTypeSize('body', screenSize)}
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                >
                  Cargando rankings...
                </p>
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.profile_id}
                    className="flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{entry.avatar_emoji}</span>
                          <h4 
                            className={`${getTypeSize('body', screenSize)} font-medium`}
                            style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                          >
                            {entry.profile_name}
                          </h4>
                        </div>
                        <p 
                          className={getTypeSize('caption', screenSize)}
                          style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                        >
                          Nivel {entry.current_level}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div 
                        className={`${getTypeSize('body', screenSize)} font-bold`}
                        style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}
                      >
                        {entry.total_problems_solved}
                      </div>
                      <p 
                        className={getTypeSize('caption', screenSize)}
                        style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                      >
                        problemas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🏆</div>
                <p 
                  className={getTypeSize('body', screenSize)}
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                >
                  Sé el primero en aparecer en el ranking
                </p>
              </div>
            )}
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 text-center py-6" style={{ padding: getSpacing('container', screenSize) }}>
        <p 
          className={getTypeSize('caption', screenSize)}
          style={{ color: theme.colors.textTertiary, fontFamily: theme.typography.fontFamily }}
        >
          © 2024 MathBoost - Entrenamiento matemático inteligente
        </p>
      </footer>
    </div>
  );
};

export default LandingScreen; 