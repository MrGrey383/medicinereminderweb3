import React from 'react';

const ProgressRing = ({ 
  percentage, 
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  color = 'indigo'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    indigo: { gradient: ['#6366f1', '#a855f7'], bg: '#e5e7eb' },
    green: { gradient: ['#10b981', '#34d399'], bg: '#d1fae5' },
    orange: { gradient: ['#f97316', '#fb923c'], bg: '#fed7aa' },
    red: { gradient: ['#ef4444', '#f87171'], bg: '#fecaca' },
    blue: { gradient: ['#3b82f6', '#60a5fa'], bg: '#bfdbfe' }
  };

  const selectedColor = colors[color] || colors.indigo;

  return (
    <div 
      className="relative inline-flex items-center justify-center" 
      style={{ width: size, height: size }}
    >
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size}
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={selectedColor.gradient[0]} />
            <stop offset="100%" stopColor={selectedColor.gradient[1]} />
          </linearGradient>
        </defs>
        
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={selectedColor.bg}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Label */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">
            {Math.round(percentage)}%
          </span>
          <span className="text-xs text-gray-500 mt-1">Complete</span>
        </div>
      )}
    </div>
  );
};

export default ProgressRing;