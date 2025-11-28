import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ 
  type = 'info', 
  message, 
  onClose, 
  duration = 3000,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      iconColor: 'text-green-600'
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      iconColor: 'text-blue-600'
    }
  };

  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div 
      className={`
        fixed ${positions[position]} z-50 
        flex items-start gap-3 p-4 rounded-xl border shadow-lg
        ${config.bg} ${config.border}
        max-w-md w-full animate-slideIn
      `}
    >
      <Icon className={`flex-shrink-0 ${config.iconColor}`} size={20} />
      <p className={`flex-1 text-sm font-medium ${config.text}`}>{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${config.text} opacity-50 hover:opacity-100 transition-opacity`}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;