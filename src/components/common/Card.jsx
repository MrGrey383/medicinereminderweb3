import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false,
  padding = 'md',
  shadow = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl transition-all duration-300
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${hoverable || onClick ? 'hover:shadow-xl cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;