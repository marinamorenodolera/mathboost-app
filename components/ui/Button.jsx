import React from 'react';
import { getButtonStyles } from '../../styles/theme.js';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  loading = false, 
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  screenSize = 'desktop',
  ...props 
}) => {
  const styles = getButtonStyles(variant, size, screenSize);
  
  const buttonClasses = [
    'inline-flex items-center justify-center gap-3 font-medium transition-all duration-300',
    'hover:scale-102 active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    className
  ].join(' ');

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      style={styles}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      {!loading && icon && (
        <span className="text-lg">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button; 