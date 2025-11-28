import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({ 
  checked, 
  onChange, 
  label, 
  disabled = false,
  className = '' 
}) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            w-5 h-5 rounded border-2 transition-all
            ${checked
              ? 'bg-indigo-600 border-indigo-600'
              : 'bg-white border-gray-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {checked && (
            <Check className="text-white" size={16} strokeWidth={3} />
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

export default Checkbox;