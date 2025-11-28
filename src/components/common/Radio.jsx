import React from 'react';

const Radio = ({ 
  checked, 
  onChange, 
  label, 
  name,
  value,
  disabled = false,
  className = '' 
}) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            w-5 h-5 rounded-full border-2 transition-all
            ${checked
              ? 'border-indigo-600'
              : 'border-gray-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {checked && (
            <div className="absolute inset-0 m-1 bg-indigo-600 rounded-full" />
          )}
        </div>
      </div>
      {label && (
        <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Radio;