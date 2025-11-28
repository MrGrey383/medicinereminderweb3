import React from 'react';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="inline-block p-4 bg-gray-100 rounded-2xl mb-4">
          <Icon className="text-gray-400" size={48} />
        </div>
      )}
      
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;