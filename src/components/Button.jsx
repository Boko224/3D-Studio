import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
