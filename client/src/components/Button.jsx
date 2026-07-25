import React from 'react';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 border border-indigo-500/30',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-sm',
  outline: 'bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-600',
  ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white',
  danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 border border-rose-500/30',
  emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 border border-emerald-500/30'
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5 font-semibold'
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
