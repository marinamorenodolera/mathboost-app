// Sistema de temas y diseño centralizado - Basado en el branding original
export const theme = {
  colors: {
    // Colores principales (branding original)
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
    secondaryLight: '#EDE9FE',
    
    // Colores adicionales para mejor contraste
    warning: '#FFFBEB',
    warningText: '#D97706',
    info: '#EFF6FF',
    infoText: '#2563EB'
  },

  // Sistema tipográfico consistente (branding original mejorado)
  typography: {
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
    },

    // Fuentes
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilySerif: 'Georgia, serif',
    fontFamilyMono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
  },

  // Espaciado mejorado para mejor jerarquía visual
  spacing: {
    // Espaciado base
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
    
    // Espaciado responsivo para contenedores
    container: {
      mobile: '1rem',     // 16px
      tablet: '2rem',     // 32px
      desktop: '3rem'     // 48px
    },
    
    // Espaciado para secciones
    section: {
      mobile: '2rem',     // 32px
      tablet: '3rem',     // 48px
      desktop: '4rem'     // 64px
    },
    
    // Espaciado para tarjetas
    card: {
      mobile: '1.5rem',   // 24px
      tablet: '2rem',     // 32px
      desktop: '2.5rem'   // 40px
    }
  },

  // Efectos de glassmorphism mejorados (branding original)
  effects: {
    liquidGlass: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px) saturate(200%)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
      borderRadius: '24px'
    },
    
    liquidGlassHover: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(16px) saturate(220%)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12), 0 1px 0 rgba(255, 255, 255, 0.7) inset',
      borderRadius: '24px'
    },

    // Efectos para botones
    buttonPrimary: {
      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
      border: 'none'
    },

    buttonSecondary: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px) saturate(200%)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)'
    }
  },

  // Breakpoints mejorados
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
    wide: '1536px'
  },

  // Configuración de layout
  layout: {
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    
    // Alturas de pantalla para evitar scroll innecesario
    screenHeight: {
      mobile: '100vh',
      tablet: '100vh',
      desktop: '100vh'
    }
  }
};

// Función para obtener tamaños de texto responsivos
export const getTypeSize = (scale, screenSize) => {
  return theme.typography[scale]?.[screenSize] || theme.typography[scale]?.mobile || 'text-base';
};

// Función para obtener espaciado responsivo
export const getSpacing = (scale, screenSize) => {
  if (typeof scale === 'string' && theme.spacing[scale]) {
    return theme.spacing[scale][screenSize] || theme.spacing[scale].mobile || theme.spacing[scale];
  }
  return theme.spacing[scale] || '1rem';
};

// Función para obtener estilos de botón mejorados
export const getButtonStyles = (variant = 'primary', size = 'md', screenSize = 'desktop') => {
  const baseStyles = {
    fontFamily: theme.typography.fontFamily,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '16px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    textDecoration: 'none'
  };

  const variants = {
    primary: {
      ...theme.effects.buttonPrimary,
      color: 'white',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)'
      },
      '&:active': {
        transform: 'scale(0.98)'
      }
    },
    secondary: {
      ...theme.effects.buttonSecondary,
      color: theme.colors.text,
      '&:hover': {
        transform: 'scale(1.02)',
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)'
      },
      '&:active': {
        transform: 'scale(0.98)'
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
      border: `2px solid ${theme.colors.primary}`,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: theme.colors.primary,
        color: 'white',
        transform: 'scale(1.02)'
      },
      '&:active': {
        transform: 'scale(0.98)'
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.text,
      border: 'none',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: theme.colors.surfaceHover,
        transform: 'scale(1.02)'
      },
      '&:active': {
        transform: 'scale(0.98)'
      }
    }
  };

  const sizes = {
    sm: { 
      padding: '0.5rem 1rem', 
      fontSize: getTypeSize('button', screenSize),
      minHeight: '40px'
    },
    md: { 
      padding: '0.75rem 1.5rem', 
      fontSize: getTypeSize('button', screenSize),
      minHeight: '48px'
    },
    lg: { 
      padding: '1rem 2rem', 
      fontSize: getTypeSize('button', screenSize),
      minHeight: '56px'
    },
    xl: { 
      padding: '1.25rem 2.5rem', 
      fontSize: getTypeSize('button', screenSize),
      minHeight: '64px'
    }
  };

  return {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size]
  };
};

// Función para obtener estilos de tarjeta mejorados
export const getCardStyles = (variant = 'default', screenSize = 'desktop') => {
  const baseStyles = {
    borderRadius: '24px',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: theme.typography.fontFamily,
    padding: getSpacing('card', screenSize)
  };

  const variants = {
    default: {
      ...theme.effects.liquidGlass
    },
    elevated: {
      ...theme.effects.liquidGlass,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
    },
    interactive: {
      ...theme.effects.liquidGlass,
      cursor: 'pointer',
      '&:hover': {
        transform: 'scale(1.02)',
        ...theme.effects.liquidGlassHover
      },
      '&:active': {
        transform: 'scale(0.98)'
      }
    },
    compact: {
      ...theme.effects.liquidGlass,
      padding: getSpacing('sm', screenSize),
      borderRadius: '16px'
    }
  };

  return {
    ...baseStyles,
    ...variants[variant]
  };
};

// Función para obtener estilos de input mejorados
export const getInputStyles = (screenSize = 'desktop') => ({
  width: '100%',
  padding: '1rem 1rem 1rem 3rem',
  fontSize: getTypeSize('body', screenSize),
  fontFamily: theme.typography.fontFamily,
  backgroundColor: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  color: theme.colors.text,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  outline: 'none',
  '&:focus': {
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 3px ${theme.colors.primary}20`,
    transform: 'scale(1.01)'
  },
  '&::placeholder': {
    color: theme.colors.textTertiary
  }
});

// Función para obtener estilos de layout responsivo
export const getLayoutStyles = (screenSize = 'desktop') => ({
  container: {
    maxWidth: theme.layout.maxWidth.xl,
    margin: '0 auto',
    padding: `0 ${getSpacing('container', screenSize)}`
  },
  section: {
    padding: `${getSpacing('section', screenSize)} 0`
  },
  screen: {
    minHeight: theme.layout.screenHeight[screenSize] || '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }
}); 