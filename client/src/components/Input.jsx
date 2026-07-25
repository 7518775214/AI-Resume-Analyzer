import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon,
  required = false,
  options = [],
  rows = 4,
  className = '',
  disabled = false,
  ...props
}) => {
  const isSelect = type === 'select';
  const isTextarea = type === 'textarea';

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
          {label} {required && <span className="text-indigo-400">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        {icon && !isTextarea && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}

        {isSelect ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full bg-slate-900 border ${
              error ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
            } text-slate-100 text-sm rounded-xl py-2.5 ${
              icon ? 'pl-10' : 'pl-3.5'
            } pr-8 focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 appearance-none`}
            {...props}
          >
            {options.map((opt, i) => (
              <option key={i} value={opt.value || opt} className="bg-slate-900 text-slate-100">
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : isTextarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={`w-full bg-slate-900 border ${
              error ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
            } text-slate-100 text-sm rounded-xl p-3.5 focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 placeholder:text-slate-500 resize-y`}
            {...props}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full bg-slate-900 border ${
              error ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
            } text-slate-100 text-sm rounded-xl py-2.5 ${
              icon ? 'pl-10' : 'pl-3.5'
            } pr-3.5 focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 placeholder:text-slate-500`}
            {...props}
          />
        )}
      </div>

      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-400 mt-1">{helperText}</p>}
    </div>
  );
};

export default Input;
