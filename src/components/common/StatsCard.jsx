import React from 'react';

const StatsCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color = 'indigo',
  trend,
  trendValue,
  onClick
}) => {
  const colors = {
    indigo: {
      gradient: 'from-indigo-500 to-purple-500',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      text: 'text-green-600'
    },
    orange: {
      gradient: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-50',
      text: 'text-orange-600'
    },
    pink: {
      gradient: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-50',
      text: 'text-pink-600'
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    red: {
      gradient: 'from-red-500 to-rose-500',
      bg: 'bg-red-50',
      text: 'text-red-600'
    }
  };

  const selectedColor = colors[color] || colors.indigo;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-md p-6 transition-all duration-300
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:scale-105' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
          
          {/* Trend Indicator */}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedColor.gradient}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;