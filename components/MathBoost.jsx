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

  // Pantalla de creación de perfil
  if (showCreateProfile) {
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
                Crea tu perfil para comenzar
              </p>
            </div>

            <Card variant="elevated" screenSize={screenSize} className="p-8">
              <div className="space-y-8">
                <div>
                  <label 
                    className={`${getTypeSize('caption', screenSize)} font-medium mb-4 block`} 
                    style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                  >
                    Nombre del Perfil
                  </label>
                  <div className="relative">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      required
                      maxLength={20}
                      className="w-full p-4 pl-12 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:scale-102"
                      style={getInputStyles(screenSize)}
                      placeholder="Mi Perfil"
                      disabled={isCreatingProfile}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">
                      👤
                    </div>
                  </div>
                  <div 
                    className={`${getTypeSize('caption', screenSize)} mt-3`} 
                    style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                  >
                    Elige un nombre para tu perfil de entrenamiento
                  </div>
                </div>

                <div>
                  <label 
                    className={`${getTypeSize('caption', screenSize)} font-medium mb-4 block`} 
                    style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                  >
                    Avatar
                  </label>
                  <div className="grid grid-cols-8 gap-3">
                    {AVAILABLE_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewProfileEmoji(emoji)}
                        className={`p-3 rounded-xl text-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                          newProfileEmoji === emoji ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                        }`}
                        style={{
                          border: `2px solid ${newProfileEmoji === emoji ? theme.colors.primary : theme.colors.border}`,
                          fontSize: '2rem',
                          lineHeight: 1.2
                        }}
                        aria-label={`Seleccionar avatar ${emoji}`}
                        type="button"
                        disabled={isCreatingProfile}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                {createProfileError && (
                  <div className="mt-4 text-red-600 text-center text-base font-medium bg-red-50 rounded-xl p-3 border border-red-200">
                    {createProfileError}
                  </div>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim() || isCreatingProfile}
                  loading={isCreatingProfile}
                  icon="🚀"
                  screenSize={screenSize}
                  className="w-full"
                >
                  {isCreatingProfile ? 'Creando...' : 'Crear Perfil'}
                </Button>
              </div>
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

  // Pantalla de autenticación
  if (gameMode === 'auth') {
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
                {isSignUp ? 'Crea tu cuenta para comenzar' : 'Inicia sesión para continuar'}
              </p>
            </div>
            <Card variant="elevated" screenSize={screenSize} className="p-8">
              <div className="space-y-8">
                <div>
                  <label 
                    className={`${getTypeSize('caption', screenSize)} font-medium mb-4 block`} 
                    style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={50}
                      className="w-full p-4 pl-12 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:scale-102"
                      style={getInputStyles(screenSize)}
                      placeholder="tu@email.com"
                      disabled={isLoading}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">
                      ✉️
                    </div>
                  </div>
                </div>

                <div>
                  <label 
                    className={`${getTypeSize('caption', screenSize)} font-medium mb-4 block`} 
                    style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily }}
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      maxLength={50}
                      className="w-full p-4 pl-12 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:scale-102"
                      style={getInputStyles(screenSize)}
                      placeholder="Tu contraseña"
                      disabled={isLoading}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">
                      🔑
                    </div>
                  </div>
                </div>
                {authError && (
                  <div className="mt-4 text-red-600 text-center text-base font-medium bg-red-50 rounded-xl p-3 border border-red-200">
                    {authError}
                  </div>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAuth}
                  disabled={!email.trim() || !password.trim() || isLoading}
                  loading={isLoading}
                  icon={isSignUp ? '🚀' : '🔑'}
                  screenSize={screenSize}
                  className="w-full"
                >
                  {isLoading ? 'Autenticando...' : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')}
                </Button>
                <div className="text-center mt-6">
                  <p 
                    className={`${getTypeSize('caption', screenSize)} font-medium`}
                    style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}
                  >
                    {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <span 
                      className={`ml-2 cursor-pointer ${getTypeSize('caption', screenSize)} font-medium text-blue-500 hover:underline`}
                      style={{ fontFamily: theme.typography.fontFamily }}
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
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
    <LandingScreen 
      screenSize={screenSize}
      setGameMode={setGameMode}
    />
  );
};

export default MathBoost;