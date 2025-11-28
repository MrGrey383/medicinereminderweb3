import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md',
  showCloseButton = true
}) => {
  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`
          relative bg-white rounded-3xl ${sizeClasses[size]} w-full 
          max-h-[90vh] overflow-hidden flex flex-col
          animate-slideUp shadow-2xl
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-3xl z-10">
            {title && (
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;