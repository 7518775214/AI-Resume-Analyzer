import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-solid border-indigo-500 border-t-transparent ${sizes[size]} ${className}`} />
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse ${className}`}>
      <div className="h-5 bg-slate-800 rounded-md w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-800/60 rounded-md w-full" />
        <div className="h-4 bg-slate-800/60 rounded-md w-5/6" />
        <div className="h-4 bg-slate-800/60 rounded-md w-2/3" />
      </div>
      <div className="h-10 bg-slate-800/80 rounded-xl w-full pt-4" />
    </div>
  );
};

export const FullScreenLoader = ({ text = 'Analyzing resume metrics...' }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-slate-300 tracking-wide animate-pulse">{text}</p>
    </div>
  );
};

const Loader = ({ type = 'spinner', ...props }) => {
  if (type === 'skeleton') return <SkeletonCard {...props} />;
  if (type === 'fullscreen') return <FullScreenLoader {...props} />;
  return <Spinner {...props} />;
};

export default Loader;
