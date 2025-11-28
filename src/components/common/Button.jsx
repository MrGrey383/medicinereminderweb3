import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  icon: Icon,
  type = 'button',
  fullWidth = false,
  size = 'md'
}) => {
  const baseClasses = 'font-medium rounded-xl transition-all duration-300 flex items-center gap-2 justify-center';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  };
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:scale-105',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg',
    success: 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg',
    outline: 'border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50',
    ghost: 'text-indigo-600 hover:bg-indigo-50'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${sizeClasses[size]}
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
        ${className}
      `}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

export default Button;