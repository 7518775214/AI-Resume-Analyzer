import React from 'react';

const Card = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <div
      className={`bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl transition-all duration-300 ${
        hoverEffect ? 'hover:border-slate-700 hover:shadow-indigo-500/5 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '' }) => (
  <div className={`mb-4 flex items-center justify-between pb-3 border-b border-slate-800/60 ${className}`}>
    {children}
  </div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-slate-100 tracking-tight ${className}`}>
    {children}
  </h3>
);

Card.Description = ({ children, className = '' }) => (
  <p className={`text-xs text-slate-400 mt-1 ${className}`}>
    {children}
  </p>
);

Card.Content = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export default Card;
