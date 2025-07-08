import React from 'react';
import { getCardStyles } from '../../styles/theme.js';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick,
  screenSize = 'desktop',
  ...props 
}) => {
  const styles = getCardStyles(variant, screenSize);
  
  const cardClasses = [
    'transition-all duration-500',
    variant === 'interactive' ? 'cursor-pointer hover:scale-102 active:scale-98' : '',
    'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
    className
  ].join(' ');

  const handleClick = (e) => {
    if (onClick && variant === 'interactive') {
      onClick(e);
    }
  };

  return (
    <div
      className={cardClasses}
      style={styles}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 