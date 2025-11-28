import React from 'react';

const Spinner = ({ 
  size = 'md', 
  color = 'indigo',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  const colors = {
    indigo: 'border-indigo-200 border-t-indigo-600',
    white: 'border-white border-opacity-20 border-t-white',
    gray: 'border-gray-200 border-t-gray-600'
  };

  return (
    <div
      className={`
        ${sizes[size]} 
        ${colors[color]}
        border-solid rounded-full animate-spin
        ${className}
      `}
    />
  );
};

export default Spinner;