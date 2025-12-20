import React from 'react';

const Input = ({ 
  label, 
  error, 
  type = 'text',
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold mb-2 text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
          error 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 focus:border-indigo-500'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
