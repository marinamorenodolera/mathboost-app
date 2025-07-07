import React from 'react';

const LandingPage = ({ 
  colors, 
  liquidGlass, 
  liquidGlassHover, 
  screenSize, 
  session, 
  setGameMode, 
  leaderboard, 
  leaderboardLoading 
}) => {
  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    if (rank <= 50) return '⭐';
    return '👤';
  };

  const levelSystem = [
    { level: 1, name: 'Aprendiz Numérico' },
    { level: 2, name: 'Explorador Matemático' },
    { level: 3, name: 'Estudiante Dedicado' },
    { level: 4, name: 'Calculador Emergente' },
    { level: 5, name: 'Procesador Rápido' },
    { level: 6, name: 'Computador Mental' },
    { level: 7, name: 'Matemático Líquido' },
    { level: 8, name: 'Artista Numérico' },
    { level: 9, name: 'Maestro de Patrones' },
    { level: 10, name: 'Experto Intuitivo' },
    { level: 11, name: 'Virtuoso del Cálculo' },
    { level: 12, name: 'Ninja Matemático' },
    { level: 13, name: 'Maestro Cuántico' },
    { level: 14, name: 'Genio Computacional' },
    { level: 15, name: 'Dios Matemático' }
  ];

  const getLevelName = (level) => {
    const levelData = levelSystem[level - 1];
    return levelData ? levelData.name : `Nivel ${level}`;
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors.background}f0, ${colors.surface}80), 
                    radial-gradient(circle at 25% 50%, ${colors.primaryLight}20 0%, transparent 50%), 
                    radial-gradient(circle at 75% 20%, ${colors.secondaryLight}20 0%, transparent 50%)`
      }}
    >
      {/* Modern Navigation */}
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
      <div className="pt-12 pb-20 px-6">
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

          {/* Leaderboard Section - Compact & Elegant */}
          <div className="max-w-4xl mx-auto">
            <h3 
              className={`${screenSize === 'mobile' ? 'text-2xl' : 'text-3xl'} font-medium mb-8`}
              style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              🏆 Rankings de Genios
            </h3>

            <div 
              className="p-8 rounded-3xl transition-all duration-300 hover:scale-102"
              style={{
                ...liquidGlass,
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
              onMouseEnter={(e) => Object.assign(e.target.style, liquidGlassHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, liquidGlass)}
            >
              {leaderboardLoading ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4 animate-spin">🧮</div>
                  <div className="text-lg" style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                    Cargando rankings...
                  </div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6 animate-bounce">🚀</div>
                  <h4 
                    className="text-2xl font-medium mb-3" 
                    style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    ¡Sé el primer genio!
                  </h4>
                  <p 
                    className="text-lg mb-6" 
                    style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                  >
                    Demuestra tu velocidad mental y alcanza la cima
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.slice(0, 5).map((user, index) => (
                    <div 
                      key={user.profile_id || index}
                      className="flex items-center justify-between p-6 rounded-2xl transition-all duration-300 hover:scale-102"
                      style={{
                        backgroundColor: index < 3 ? `${colors.primary}15` : colors.surface,
                        border: `1px solid ${index < 3 ? colors.primary : colors.border}`,
                        ...liquidGlass
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">
                            {getRankEmoji(index + 1)}
                          </div>
                          <div 
                            className="text-xl font-bold" 
                            style={{ color: colors.text, fontFamily: 'Georgia, serif' }}
                          >
                            #{index + 1}
                          </div>
                        </div>
                        
                        <div className="text-3xl">
                          {user.avatar_emoji || '👤'}
                        </div>
                        
                        <div>
                          <div 
                            className="text-lg font-medium capitalize" 
                            style={{ color: colors.text, fontFamily: 'Inter, -apple-system, sans-serif' }}
                          >
                            {user.profile_name || 'Usuario'}
                          </div>
                          <div 
                            className="text-sm" 
                            style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                          >
                            {getLevelName(user.current_level || 1)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div 
                          className="text-xl font-bold" 
                          style={{ color: colors.text, fontFamily: 'Georgia, serif' }}
                        >
                          {(user.total_problems_lifetime || 0).toLocaleString()}
                        </div>
                        <div 
                          className="text-sm" 
                          style={{ color: colors.textSecondary, fontFamily: 'Inter, -apple-system, sans-serif' }}
                        >
                          problemas resueltos
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 