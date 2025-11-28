import React from 'react';
import { User } from 'lucide-react';

const Avatar = ({ 
  src, 
  alt, 
  name,
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`
          ${sizes[size]} rounded-full object-cover
          bg-gradient-to-br from-indigo-400 to-purple-400
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        ${sizes[size]} rounded-full
        bg-gradient-to-br from-indigo-400 to-purple-400
        flex items-center justify-center
        text-white font-semibold
        ${className}
      `}
    >
      {name ? getInitials(name) : <User size={size === 'sm' ? 16 : 20} />}
    </div>
  );
};

export default Avatar;