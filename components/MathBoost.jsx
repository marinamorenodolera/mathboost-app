import React, { useState, useEffect, useRef } from 'react';
import { theme, getTypeSize, getSpacing, getLayoutStyles, getInputStyles } from '../styles/theme.js';
import { useAuth } from '../hooks/useAuth.js';
import { useLeaderboard } from '../hooks/useLeaderboard.js';
import { AVAILABLE_EMOJIS, LEVEL_SYSTEM, OPERATIONS, GAME_CONFIG } from '../utils/constants.js';
import LandingScreen from './screens/LandingScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import StatsScreen from './screens/StatsScreen.jsx';
import Button from './ui/Button.jsx';
import Card from './ui/Card.jsx';


const MathBoost = () => {
  // Hooks personalizados
  const {
    session,
    loading,
    users,
    currentUser,
    user,
    showUserSelection,
    showCreateProfile,
    signIn,
    signUp,
    signOut,
    createProfile,
    switchUser,
    setShowUserSelection,
    setShowCreateProfile,
    setCurrentUser
  } = useAuth();

  // Estados locales
  const [gameMode, setGameMode] = useState('loading');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmoji, setNewProfileEmoji] = useState('👤');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [createProfileError, setCreateProfileError] = useState('');
  const [screenSize, setScreenSize] = useState('desktop');
  // 1. Cambia el estado inicial para el modo de registro
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const nameInputRef = useRef(null);

  // Detectar tamaño de pantalla
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

  // Focus en input de nombre cuando se muestra la pantalla de creación
  useEffect(() => {
    if (showCreateProfile && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [showCreateProfile]);

  // Crear nuevo perfil (versión original)
  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;
    setIsCreatingProfile(true);
    setCreateProfileError('');
    
    try {
      const result = await createProfile({
        name: newProfileName.trim(),
        avatar: newProfileEmoji
      });
      
      if (result && result.success) {
        setNewProfileName('');
        setNewProfileEmoji('👤');
        setCreateProfileError('');
        setGameMode('game'); // Solo navegar si success
      } else {
        setCreateProfileError(result?.error || 'Error creando perfil');
      }
    } catch (error) {
      setCreateProfileError('Error inesperado');
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // Manejar autenticación
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      const result = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (!result.success) {
        setAuthError(result.error);
    } else {
        // La navegación se maneja automáticamente en el hook useAuth
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setAuthError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Nueva función para el registro completo
  const handleFullSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setCreateProfileError('');
    setIsLoading(true);

    try {
      // 1. Registro de usuario
      const result = await signUp(email, password);
      if (!result.success) {
        setAuthError(result.error);
        setIsLoading(false);
        return;
      }

      // 2. Crear perfil (usa el user.id y user.email del resultado o de supabase.auth.getUser())
      const profileResult = await createProfile({
        name: newProfileName.trim(),    // Se mapea a display_name
        avatar: newProfileEmoji         // Se mapea a avatar_emoji
      });

      if (!profileResult.success) {
        setCreateProfileError(profileResult.error || 'Error creando perfil');
        setIsLoading(false);
        return;
      }

      // 3. Ir al juego
      setNewProfileName('');
      setNewProfileEmoji('👤');
      setEmail('');
      setPassword('');
      setGameMode('game');
    } catch (error) {
      setAuthError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const layoutStyles = getLayoutStyles(screenSize);

  // Loading screen
  if (loading) {
    return (
      <div 
        style={{ 
          backgroundColor: theme.colors.background,
          ...layoutStyles.screen
        }} 
        className="flex items-center justify-center"
      >
        <div className="text-center">
          <div className="text-6xl mb-6 animate-spin">🧮</div>
          <div 
            className={getTypeSize('h3', screenSize)}
            style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
          >
            Cargando MathBoost...
          </div>
        </div>
    </div>
  );
  }

  // 3. Unifica el formulario de registro y creación de perfil en una sola pantalla
  if (gameMode === 'auth' && isSignUp) {
    return (
      <div style={{ backgroundColor: theme.colors.background, ...layoutStyles.screen }} className="flex flex-col">
        <main className="flex-1 flex items-center justify-center" style={{ padding: getSpacing('container', screenSize) }}>
          <div className="w-full max-w-md">
            {/* Logo y título */}
            <div className="text-center mb-8">
              <h1 
                className={`${getTypeSize('h1', screenSize)} font-light tracking-wider mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`} 
                style={{ fontFamily: theme.typography.fontFamily, marginTop: '2.5rem' }}
              >
                mathboost
              </h1>
              <p 
                className={`${getTypeSize('body', screenSize)} font-light`}
                style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
              >
                Crea tu cuenta y perfil para comenzar
              </p>
            </div>
            {/* Formulario */}
            <Card variant="elevated" screenSize={screenSize} className="p-6">
              <form className="space-y-5" onSubmit={handleFullSignUp}>
                {/* Email */}
                <div>
                  <label className={`${getTypeSize('caption', screenSize)} font-medium mb-2 block`} style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}>
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={50}
                      className="w-full h-10 p-2 pl-8 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:scale-102"
                      style={getInputStyles(screenSize)}
                      placeholder="tu@email.com"
                      disabled={isLoading}
                    />
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-lg">✉️</div>
                  </div>
                </div>
                {/* Password */}
                <div>
                  <label className={`${getTypeSize('caption', screenSize)} font-medium mb-2 block`} style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}>
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      maxLength={50}
                      className="w-full h-10 p-2 pl-8 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:scale-102"
                      style={getInputStyles(screenSize)}
                      placeholder="Tu contraseña"
                      disabled={isLoading}
                    />
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-lg">🔑</div>
                  </div>
                </div>
                {/* Display Name */}
                <div>
                  <label className={`${getTypeSize('caption', screenSize)} font-medium mb-2 block`} style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}>
                    Nombre de Perfil
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      required
                      maxLength={20}
                      className="w-full h-10 p-2 pl-8 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:scale-102"
                      style={getInputStyles(screenSize)}
                      placeholder="Mi Perfil"
                      disabled={isLoading}
                    />
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-lg">👤</div>
                  </div>
                </div>
                {/* Emoji Avatar */}
                <div>
                  <label className={`${getTypeSize('caption', screenSize)} font-medium mb-2 block`} style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}>
                    Avatar
                  </label>
                  <div
                    className="grid grid-cols-5 md:grid-cols-7 gap-x-2 gap-y-3 justify-center"
                    style={{ margin: '0 auto', maxWidth: '380px' }}
                  >
                    {AVAILABLE_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewProfileEmoji(emoji)}
                        className={`flex items-center justify-center p-2 md:p-3 rounded-xl border-2 transition-all duration-150
                          text-2xl md:text-3xl
                          bg-white
                          hover:scale-104
                          focus:outline-none
                          ${
                            newProfileEmoji === emoji
                              ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 shadow-md scale-104'
                              : 'border-gray-200'
                          }
                        `}
                        style={{
                          minWidth: '44px',
                          minHeight: '44px',
                          maxWidth: '52px',
                          maxHeight: '52px',
                          margin: '0 auto',
                          fontSize: '2rem',
                          lineHeight: 1.1
                        }}
                        aria-label={`Seleccionar avatar ${emoji}`}
                        type="button"
                        disabled={isLoading}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Errores */}
                {authError && (
                  <div className="mt-4 text-red-600 text-center text-base font-medium bg-red-50 rounded-xl p-3 border border-red-200">
                    {authError}
                  </div>
                )}
                {createProfileError && (
                  <div className="mt-4 text-red-600 text-center text-base font-medium bg-red-50 rounded-xl p-3 border border-red-200">
                    {createProfileError}
                  </div>
                )}
                {/* Botón de submit */}
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={!email.trim() || !password.trim() || !newProfileName.trim() || isLoading}
                  loading={isLoading}
                  icon="🚀"
                  screenSize={screenSize}
                  className="w-full"
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear cuenta y perfil'}
                </Button>
              </form>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de selección de usuario
  if (showUserSelection) {
    return (
      <div 
                    style={{
          backgroundColor: theme.colors.background,
          ...layoutStyles.screen
        }} 
        className="flex flex-col"
      >
        <main className="flex-1" style={{ padding: getSpacing('container', screenSize) }}>
          <div className="max-w-4xl mx-auto">
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
                Selecciona tu perfil
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(users).map((profile) => (
                <Card
                  key={profile.profile_id}
                  variant="interactive"
                  screenSize={screenSize}
                  className="p-8 text-center"
                  onClick={() => switchUser(profile.profile_id)}
                >
                  <div className="text-6xl mb-6">{profile.avatar}</div>
                  <h3 
                    className={`${getTypeSize('h3', screenSize)} font-medium mb-3`}
                    style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                  >
                    {profile.name}
                  </h3>
                  <p 
                    className={getTypeSize('body', screenSize)}
                    style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                  >
                    Nivel {profile.currentLevel}
                  </p>
                </Card>
              ))}

              <Card
                variant="interactive"
                screenSize={screenSize}
                className="p-8 text-center border-2 border-dashed"
                style={{ borderColor: theme.colors.border }}
                onClick={() => {
                  setShowCreateProfile(true);
                  setShowUserSelection(false);
                }}
              >
                <div className="text-6xl mb-6">➕</div>
                <h3 
                  className={`${getTypeSize('h3', screenSize)} font-medium mb-3`}
                  style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                >
                  Nuevo Perfil
                </h3>
                <p 
                  className={getTypeSize('body', screenSize)}
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                >
                  Crear otro perfil
                </p>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de juego
  if (gameMode === 'game') {
    return (
      <GameScreen 
        currentUser={currentUser}
        switchUser={switchUser}
        screenSize={screenSize}
      />
    );
  }

  // Pantalla de estadísticas
  if (gameMode === 'stats') {
    return (
      <StatsScreen 
        currentUser={currentUser}
        switchUser={switchUser}
        screenSize={screenSize}
      />
    );
  }

  // Pantalla de inicio (si no se ha cargado el modo de juego)
  return (
    <div style={{ backgroundColor: theme.colors.background, ...layoutStyles.screen }} className="flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center" style={{ padding: getSpacing('container', screenSize) }}>
        <div className="text-center mb-12">
          <h1 className={`${getTypeSize('h1', screenSize)} font-light tracking-wider mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`} style={{ fontFamily: theme.typography.fontFamily }}>
            mathboost
          </h1>
          <p className={`${getTypeSize('body', screenSize)} font-light`} style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}>
            Domina las matemáticas con práctica inteligente
          </p>
          <p className={`${getTypeSize('body', screenSize)} font-light mt-2`} style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}>
            Entrena tu mente con ejercicios personalizados, sigue tu progreso y compite con otros estudiantes
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            variant="primary"
            onClick={() => { console.log('Crear Cuenta'); setGameMode('auth'); setIsSignUp(true); }}
            icon="🚀"
          >
            Crear Cuenta
          </Button>
          <Button
            variant="secondary"
            onClick={() => { console.log('Iniciar Sesión'); setGameMode('auth'); setIsSignUp(false); }}
            icon="🔑"
          >
            Iniciar Sesión
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MathBoost;