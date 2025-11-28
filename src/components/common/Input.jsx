import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error = '',
  disabled = false,
  icon: Icon,
  helperText = '',
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="text-gray-400" size={20} />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-colors
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none
          `}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;